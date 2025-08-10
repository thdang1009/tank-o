// Lobby model
class Lobby {
    constructor(id, hostSocketId, gameConfig, options = {}) {
        this.id = id;
        this.lobbyCode = this.generateLobbyCode();
        this.hostSocketId = hostSocketId;
        this.gameConfig = gameConfig;
        this.players = [];
        this.status = 'waiting'; // waiting, starting, in_progress, completed
        this.createdAt = new Date();
        this.maxPlayers = options.maxPlayers || 4;
        this.isPrivate = options.isPrivate || false;
        this.gameStartTime = null;
    }
    
    generateLobbyCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    
    addPlayer(player) {
        if (this.players.length >= this.maxPlayers) {
            throw new Error('Lobby is full');
        }
        
        if (this.players.find(p => p.id === player.id)) {
            throw new Error('Player already in lobby');
        }
        
        this.players.push(player);
        return true;
    }
    
    removePlayer(playerId) {
        const playerIndex = this.players.findIndex(p => p.id === playerId);
        if (playerIndex === -1) {
            return false;
        }
        
        const removedPlayer = this.players[playerIndex];
        this.players.splice(playerIndex, 1);
        
        // If host left, assign new host
        if (removedPlayer.id === this.hostSocketId && this.players.length > 0) {
            this.hostSocketId = this.players[0].id;
            this.players[0].isHost = true;
        }
        
        return removedPlayer;
    }
    
    getPlayer(playerId) {
        return this.players.find(p => p.id === playerId);
    }
    
    updatePlayerReady(playerId, isReady) {
        const player = this.getPlayer(playerId);
        if (!player || player.isHost) {
            return false;
        }
        
        player.isReady = isReady;
        return true;
    }
    
    updatePlayerTankClass(playerId, tankClass) {
        const player = this.getPlayer(playerId);
        if (!player) {
            return false;
        }
        
        player.tankClass = tankClass;
        return true;
    }
    
    canStartGame() {
        if (this.players.length < 1) {
            return { canStart: false, reason: 'Not enough players' };
        }
        
        // Check if all players are ready (host is always ready)
        const allReady = this.players.every(p => p.isHost || p.isReady);
        if (!allReady) {
            return { canStart: false, reason: 'Not all players are ready' };
        }
        
        // Check if all players have selected a tank class
        const allSelectedClass = this.players.every(p => p.tankClass);
        if (!allSelectedClass) {
            return { canStart: false, reason: 'Not all players have selected a tank class' };
        }
        
        return { canStart: true };
    }
    
    startGame() {
        const canStart = this.canStartGame();
        if (!canStart.canStart) {
            throw new Error(canStart.reason);
        }
        
        this.status = 'starting';
        this.gameStartTime = new Date();
        return true;
    }
    
    isEmpty() {
        return this.players.length === 0;
    }
    
    isFull() {
        return this.players.length >= this.maxPlayers;
    }
    
    toClientData() {
        return {
            id: this.id,
            lobbyCode: this.lobbyCode,
            host: this.hostSocketId,
            hostSocketId: this.hostSocketId,
            gameConfig: this.gameConfig,
            gameMode: this.gameConfig.gameMode,
            mapType: this.gameConfig.mapType,
            players: this.players.map(p => ({
                id: p.id,
                username: p.username,
                isHost: p.isHost,
                isReady: p.isReady,
                tankClass: p.tankClass
            })),
            status: this.status,
            maxPlayers: this.maxPlayers,
            isPrivate: this.isPrivate,
            createdAt: this.createdAt
        };
    }
}

module.exports = Lobby;