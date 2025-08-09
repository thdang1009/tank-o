// Game controller for handling in-game events
class GameController {
    constructor(io, lobbyService) {
        this.io = io;
        this.lobbyService = lobbyService;
        this.gameStates = new Map(); // Store game states by lobby ID
        this.playerUpdates = new Map(); // Store pending player updates
    }
    
    handleConnection(socket) {
        // Player movement and state updates
        socket.on('playerUpdate', (data) => {
            this.handlePlayerUpdate(socket, data);
        });
        
        // Bullet firing
        socket.on('bulletFired', (data) => {
            this.handleBulletFired(socket, data);
        });
        
        // Player hit events
        socket.on('playerHit', (data) => {
            this.handlePlayerHit(socket, data);
        });
        
        // Player skill/ability usage
        socket.on('useSkill', (data) => {
            this.handleUseSkill(socket, data);
        });
        
        // Player respawn request
        socket.on('requestRespawn', (data) => {
            this.handleRespawnRequest(socket, data);
        });
        
        // Game state sync request
        socket.on('requestGameState', () => {
            this.handleGameStateRequest(socket);
        });
        
        // Player ready for next round
        socket.on('playerReady', (data) => {
            this.handlePlayerReady(socket, data);
        });
    }
    
    handlePlayerUpdate(socket, data) {
        try {
            const lobby = this.lobbyService.getPlayerLobby(socket.id);
            if (!lobby || lobby.status !== 'in_progress') {
                return;
            }
            
            const player = lobby.getPlayer(socket.id);
            if (!player || !player.gameState.isAlive) {
                return;
            }
            
            // Validate the update
            if (!this.validatePlayerUpdate(data)) {
                socket.emit('error', { message: 'Invalid player update' });
                return;
            }
            
            // Update player state
            player.updateGameState({
                position: { x: data.x, y: data.y },
                rotation: data.rotation,
                shooting: data.shooting || false
            });
            
            // Broadcast to other players in the lobby
            socket.to(lobby.id).emit('playerMoved', {
                playerId: socket.id,
                position: player.gameState.position,
                rotation: player.gameState.rotation,
                shooting: player.gameState.shooting,
                timestamp: Date.now()
            });
            
        } catch (error) {
            console.error('Error handling player update:', error);
            socket.emit('error', { message: 'Failed to update player state' });
        }
    }
    
    handleBulletFired(socket, data) {
        try {
            const lobby = this.lobbyService.getPlayerLobby(socket.id);
            if (!lobby || lobby.status !== 'in_progress') {
                return;
            }
            
            const player = lobby.getPlayer(socket.id);
            if (!player || !player.gameState.isAlive) {
                return;
            }
            
            // Validate bullet data
            if (!this.validateBulletData(data)) {
                socket.emit('error', { message: 'Invalid bullet data' });
                return;
            }
            
            // Create bullet object
            const bullet = {
                bulletId: data.bulletId || this.generateBulletId(),
                playerId: socket.id,
                position: data.position || player.gameState.position,
                angle: data.angle,
                speed: data.speed || 300,
                damage: this.calculateBulletDamage(player.tankClass),
                timestamp: Date.now()
            };
            
            // Broadcast bullet to all players in lobby
            this.io.to(lobby.id).emit('bulletFired', bullet);
            
        } catch (error) {
            console.error('Error handling bullet fired:', error);
            socket.emit('error', { message: 'Failed to fire bullet' });
        }
    }
    
    handlePlayerHit(socket, data) {
        try {
            const lobby = this.lobbyService.getPlayerLobby(socket.id);
            if (!lobby || lobby.status !== 'in_progress') {
                return;
            }
            
            const { targetId, damage, bulletId, position } = data;
            const targetPlayer = lobby.getPlayer(targetId);
            const shooterPlayer = lobby.getPlayer(socket.id);
            
            if (!targetPlayer || !shooterPlayer || !targetPlayer.gameState.isAlive) {
                return;
            }
            
            // Validate hit
            if (!this.validateHit(data, targetPlayer, shooterPlayer)) {
                return;
            }
            
            // Apply damage
            const newHP = targetPlayer.takeDamage(damage);
            
            // Create hit event
            const hitEvent = {
                targetId: targetId,
                shooterId: socket.id,
                damage: damage,
                newHP: newHP,
                bulletId: bulletId,
                position: position,
                timestamp: Date.now()
            };
            
            // If player died
            if (newHP <= 0) {
                shooterPlayer.addKill();
                shooterPlayer.addScore(100);
                
                hitEvent.killed = true;
                hitEvent.shooterStats = {
                    kills: shooterPlayer.gameState.kills,
                    score: shooterPlayer.gameState.score
                };
                
                // Schedule respawn
                this.scheduleRespawn(lobby, targetPlayer);
            }
            
            // Broadcast hit event to all players
            this.io.to(lobby.id).emit('playerHit', hitEvent);
            
            // Check for game end conditions
            this.checkGameEndConditions(lobby);
            
        } catch (error) {
            console.error('Error handling player hit:', error);
            socket.emit('error', { message: 'Failed to process hit' });
        }
    }
    
    handleUseSkill(socket, data) {
        try {
            const lobby = this.lobbyService.getPlayerLobby(socket.id);
            if (!lobby || lobby.status !== 'in_progress') {
                return;
            }
            
            const player = lobby.getPlayer(socket.id);
            if (!player || !player.gameState.isAlive) {
                return;
            }
            
            const { skillType, targetPosition } = data;
            
            // Validate skill usage (cooldowns, etc.)
            if (!this.validateSkillUsage(player, skillType)) {
                socket.emit('error', { message: 'Skill not available' });
                return;
            }
            
            // Process skill effect
            const skillResult = this.processSkill(player, skillType, targetPosition, lobby);
            
            // Broadcast skill usage to all players
            this.io.to(lobby.id).emit('skillUsed', {
                playerId: socket.id,
                skillType: skillType,
                targetPosition: targetPosition,
                result: skillResult,
                timestamp: Date.now()
            });
            
        } catch (error) {
            console.error('Error handling skill usage:', error);
            socket.emit('error', { message: 'Failed to use skill' });
        }
    }
    
    handleRespawnRequest(socket, data) {
        try {
            const lobby = this.lobbyService.getPlayerLobby(socket.id);
            if (!lobby || lobby.status !== 'in_progress') {
                return;
            }
            
            const player = lobby.getPlayer(socket.id);
            if (!player || player.gameState.isAlive) {
                return;
            }
            
            // Find safe respawn position
            const respawnPosition = this.findRespawnPosition(lobby);
            
            // Respawn player
            player.respawn(respawnPosition);
            
            // Notify all players
            this.io.to(lobby.id).emit('playerRespawned', {
                playerId: socket.id,
                position: respawnPosition,
                timestamp: Date.now()
            });
            
        } catch (error) {
            console.error('Error handling respawn request:', error);
            socket.emit('error', { message: 'Failed to respawn' });
        }
    }
    
    handleGameStateRequest(socket) {
        try {
            const lobby = this.lobbyService.getPlayerLobby(socket.id);
            if (!lobby) {
                return;
            }
            
            const gameState = this.getGameState(lobby);
            socket.emit('gameState', gameState);
            
        } catch (error) {
            console.error('Error handling game state request:', error);
        }
    }
    
    handlePlayerReady(socket, data) {
        try {
            const lobby = this.lobbyService.getPlayerLobby(socket.id);
            if (!lobby) {
                return;
            }
            
            const player = lobby.getPlayer(socket.id);
            if (!player) {
                return;
            }
            
            player.isReady = data.ready || true;
            
            // Check if all players are ready for next round
            const allReady = lobby.players.every(p => p.isReady);
            
            if (allReady && lobby.status === 'completed') {
                // Start next round or end game
                this.handleGameTransition(lobby);
            }
            
            // Notify other players
            socket.to(lobby.id).emit('playerReadyStatusChanged', {
                playerId: socket.id,
                ready: player.isReady,
                allReady: allReady
            });
            
        } catch (error) {
            console.error('Error handling player ready:', error);
        }
    }
    
    // Helper methods
    validatePlayerUpdate(data) {
        return data && 
               typeof data.x === 'number' && 
               typeof data.y === 'number' && 
               typeof data.rotation === 'number' &&
               isFinite(data.x) && 
               isFinite(data.y) && 
               isFinite(data.rotation);
    }
    
    validateBulletData(data) {
        return data && 
               typeof data.angle === 'number' &&
               isFinite(data.angle) &&
               (!data.speed || (typeof data.speed === 'number' && data.speed > 0));
    }
    
    validateHit(hitData, targetPlayer, shooterPlayer) {
        // Basic validation - in a real game you'd want more sophisticated hit validation
        return targetPlayer && 
               shooterPlayer && 
               targetPlayer.gameState.isAlive &&
               shooterPlayer.gameState.isAlive &&
               typeof hitData.damage === 'number' &&
               hitData.damage > 0;
    }
    
    validateSkillUsage(player, skillType) {
        // Check if player has this skill and if it's off cooldown
        // This would need to be implemented based on your skill system
        return true; // Simplified for now
    }
    
    calculateBulletDamage(tankClass) {
        // Calculate damage based on tank class
        const baseDamage = {
            'bruiser': 40,
            'dealer': 80,
            'supporter': 35,
            'versatile': 50,
            'mage': 30,
            'spy': 45,
            'demolition': 100,
            'scout': 55
        };
        
        return baseDamage[tankClass] || 50;
    }
    
    processSkill(player, skillType, targetPosition, lobby) {
        // Process skill effects based on skill type
        // This would need to be implemented based on your skill system
        return { success: true };
    }
    
    findRespawnPosition(lobby) {
        // Find a safe respawn position
        // This is simplified - in a real game you'd check for obstacles and other players
        return {
            x: Math.random() * 800 + 100,
            y: Math.random() * 600 + 100
        };
    }
    
    scheduleRespawn(lobby, player) {
        // Schedule respawn after delay
        setTimeout(() => {
            if (lobby.status === 'in_progress' && !player.gameState.isAlive) {
                const respawnPosition = this.findRespawnPosition(lobby);
                player.respawn(respawnPosition);
                
                this.io.to(lobby.id).emit('playerRespawned', {
                    playerId: player.id,
                    position: respawnPosition,
                    timestamp: Date.now()
                });
            }
        }, 5000); // 5 second respawn delay
    }
    
    checkGameEndConditions(lobby) {
        // Check various game end conditions based on game mode
        const gameMode = lobby.gameConfig.gameMode;
        
        switch(gameMode) {
            case 'solo':
                // Solo mode - check if player died
                break;
            case 'chaos':
                // Last man standing
                const alivePlayers = lobby.players.filter(p => p.gameState.isAlive);
                if (alivePlayers.length <= 1) {
                    this.endGame(lobby, alivePlayers[0]);
                }
                break;
            // Add other game modes
        }
    }
    
    endGame(lobby, winner = null) {
        lobby.status = 'completed';
        
        const gameResults = {
            winner: winner ? winner.toClientData(true) : null,
            players: lobby.players.map(p => p.toClientData(true)),
            duration: Date.now() - (lobby.gameStartTime?.getTime() || Date.now()),
            timestamp: Date.now()
        };
        
        this.io.to(lobby.id).emit('gameEnded', gameResults);
    }
    
    handleGameTransition(lobby) {
        // Handle transition between rounds or end of game
        // Reset player states for next round or clean up
        lobby.players.forEach(player => {
            player.resetGameState();
            player.isReady = false;
        });
        
        lobby.status = 'waiting';
        
        this.io.to(lobby.id).emit('gameTransition', {
            lobby: lobby.toClientData()
        });
    }
    
    getGameState(lobby) {
        return {
            sessionId: lobby.id,
            gameMode: lobby.gameConfig.gameMode,
            mapType: lobby.gameConfig.mapType,
            status: lobby.status,
            players: lobby.players.map(p => p.toGameState()),
            startTime: lobby.gameStartTime,
            timestamp: Date.now()
        };
    }
    
    generateBulletId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

module.exports = GameController;