// Lobby socket event handlers
const LobbyService = require('../services/LobbyService');

class LobbyController {
    constructor(io, lobbyService) {
        this.io = io;
        this.lobbyService = lobbyService || new LobbyService();
    }
    
    handleConnection(socket) {
        console.log(`User connected: ${socket.id}`);
        
        // Create lobby
        socket.on('create-lobby', (data) => {
            this.handleCreateLobby(socket, data);
        });
        
        // Join lobby
        socket.on('join-lobby', (data) => {
            this.handleJoinLobby(socket, data);
        });
        
        // Leave lobby
        socket.on('leave-lobby', () => {
            this.handleLeaveLobby(socket);
        });
        
        // Update ready status
        socket.on('update-ready-status', (data) => {
            this.handleUpdateReadyStatus(socket, data);
        });
        
        // Select tank class
        socket.on('select-tank-class', (data) => {
            this.handleSelectTankClass(socket, data);
        });
        
        // Start game
        socket.on('start-game', () => {
            this.handleStartGame(socket);
        });
        
        // Change game settings (host only)
        socket.on('change-game-mode', (data) => {
            this.handleChangeGameMode(socket, data);
        });
        
        socket.on('change-map-type', (data) => {
            this.handleChangeMapType(socket, data);
        });
        
        // Ping/pong for connection monitoring
        socket.on('ping', () => {
            socket.emit('pong', { timestamp: Date.now() });
        });
        
        // Handle disconnection
        socket.on('disconnect', () => {
            this.handleDisconnect(socket);
        });
    }
    
    handleCreateLobby(socket, data) {
        try {
            const { username, gameMode, mapType, maxPlayers, isPrivate } = data;
            
            const gameConfig = {
                gameMode: gameMode || 'solo',
                mapType: mapType || 'grass'
            };
            
            const options = {
                maxPlayers: maxPlayers || 4,
                isPrivate: isPrivate || false
            };
            
            const lobby = this.lobbyService.createLobby(
                socket.id, 
                username, 
                gameConfig, 
                options
            );
            
            // Join socket room
            socket.join(lobby.id);
            
            // Send success response
            socket.emit('lobby-created', {
                lobbyId: lobby.id,
                lobbyCode: lobby.lobbyCode,
                lobby: lobby.toClientData()
            });
            
            console.log(`Lobby created: ${lobby.lobbyCode} by ${username}`);
            
        } catch (error) {
            console.error('Error creating lobby:', error);
            socket.emit('socket-error', { message: error.message });
        }
    }
    
    handleJoinLobby(socket, data) {
        try {
            const { lobbyId, lobbyCode, username } = data;
            
            // Support both lobbyId and lobbyCode for joining
            const codeToJoin = lobbyCode || lobbyId;
            
            const lobby = this.lobbyService.joinLobby(
                codeToJoin,
                socket.id,
                username
            );
            
            // Join socket room
            socket.join(lobby.id);
            
            // Send success response to joiner
            socket.emit('lobby-joined', {
                lobbyId: lobby.id,
                lobby: lobby.toClientData()
            });
            
            // Notify other players
            socket.to(lobby.id).emit('player-joined', {
                player: lobby.getPlayer(socket.id).toClientData()
            });
            
            // Update all players
            this.io.to(lobby.id).emit('lobby-updated', {
                lobby: lobby.toClientData()
            });
            
            console.log(`Player ${username} joined lobby: ${lobby.lobbyCode}`);
            
        } catch (error) {
            console.error('Error joining lobby:', error);
            socket.emit('socket-error', { message: error.message });
        }
    }
    
    handleLeaveLobby(socket) {
        try {
            const result = this.lobbyService.leaveLobby(socket.id);
            
            if (!result) {
                return;
            }
            
            const { lobby, removedPlayer } = result;
            
            // Leave socket room
            socket.leave(lobby?.id || '');
            
            if (lobby) {
                // Notify remaining players
                socket.to(lobby.id).emit('player-left', {
                    playerId: socket.id,
                    playerName: removedPlayer?.username
                });
                
                // Update lobby for remaining players
                this.io.to(lobby.id).emit('lobby-updated', {
                    lobby: lobby.toClientData()
                });
            }
            
            console.log(`Player ${socket.id} left lobby`);
            
        } catch (error) {
            console.error('Error leaving lobby:', error);
        }
    }
    
    handleUpdateReadyStatus(socket, data) {
        try {
            const { isReady } = data;
            
            this.lobbyService.updatePlayerReady(socket.id, isReady);
            
            const lobby = this.lobbyService.getPlayerLobby(socket.id);
            if (lobby) {
                this.io.to(lobby.id).emit('lobby-updated', {
                    lobby: lobby.toClientData()
                });
            }
            
        } catch (error) {
            console.error('Error updating ready status:', error);
            socket.emit('socket-error', { message: error.message });
        }
    }
    
    handleSelectTankClass(socket, data) {
        try {
            const { tankClass } = data;
            
            this.lobbyService.updatePlayerTankClass(socket.id, tankClass);
            
            const lobby = this.lobbyService.getPlayerLobby(socket.id);
            if (lobby) {
                this.io.to(lobby.id).emit('lobby-updated', {
                    lobby: lobby.toClientData()
                });
            }
            
        } catch (error) {
            console.error('Error selecting tank class:', error);
            socket.emit('socket-error', { message: error.message });
        }
    }
    
    handleStartGame(socket) {
        try {
            this.lobbyService.startGame(socket.id);
            
            const lobby = this.lobbyService.getPlayerLobby(socket.id);
            if (lobby) {
                // Notify all players that game is starting
                this.io.to(lobby.id).emit('game-starting', {
                    lobby: lobby.toClientData(),
                    countdown: 3
                });
                
                // Start countdown
                this.startGameCountdown(lobby);
            }
            
        } catch (error) {
            console.error('Error starting game:', error);
            socket.emit('socket-error', { message: error.message });
        }
    }
    
    handleChangeGameMode(socket, data) {
        try {
            const { gameMode } = data;
            
            const lobby = this.lobbyService.getPlayerLobby(socket.id);
            if (!lobby || lobby.hostSocketId !== socket.id) {
                throw new Error('Only host can change game mode');
            }
            
            lobby.gameConfig.gameMode = gameMode;
            
            this.io.to(lobby.id).emit('lobby-updated', {
                lobby: lobby.toClientData()
            });
            
        } catch (error) {
            console.error('Error changing game mode:', error);
            socket.emit('socket-error', { message: error.message });
        }
    }
    
    handleChangeMapType(socket, data) {
        try {
            const { mapType } = data;
            
            const lobby = this.lobbyService.getPlayerLobby(socket.id);
            if (!lobby || lobby.hostSocketId !== socket.id) {
                throw new Error('Only host can change map type');
            }
            
            lobby.gameConfig.mapType = mapType;
            
            this.io.to(lobby.id).emit('lobby-updated', {
                lobby: lobby.toClientData()
            });
            
        } catch (error) {
            console.error('Error changing map type:', error);
            socket.emit('socket-error', { message: error.message });
        }
    }
    
    handleDisconnect(socket) {
        console.log(`User disconnected: ${socket.id}`);
        
        const result = this.lobbyService.handlePlayerDisconnect(socket.id);
        
        if (result && result.lobby) {
            this.io.to(result.lobby.id).emit('player-disconnected', {
                playerId: socket.id,
                playerName: result.removedPlayer?.username
            });
            
            this.io.to(result.lobby.id).emit('lobby-updated', {
                lobby: result.lobby.toClientData()
            });
        }
    }
    
    startGameCountdown(lobby) {
        let countdown = 3;
        
        const countdownInterval = setInterval(() => {
            if (countdown > 0) {
                this.io.to(lobby.id).emit('game-countdown', {
                    countdown: countdown
                });
                countdown--;
            } else {
                clearInterval(countdownInterval);
                
                // Actually start the game
                this.io.to(lobby.id).emit('game-started', {
                    lobby: lobby.toClientData(),
                    gameState: this.createInitialGameState(lobby)
                });
                
                lobby.status = 'in_progress';
            }
        }, 1000);
    }
    
    createInitialGameState(lobby) {
        // Create initial game state based on lobby configuration
        return {
            sessionId: lobby.id,
            gameMode: lobby.gameConfig.gameMode,
            mapType: lobby.gameConfig.mapType,
            players: lobby.players.map(player => player.toGameState()),
            startTime: Date.now(),
            status: 'active'
        };
    }
}

module.exports = LobbyController;