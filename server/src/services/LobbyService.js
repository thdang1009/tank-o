// Lobby management service
const Lobby = require('../models/Lobby');
const Player = require('../models/Player');
const { ValidationUtils } = require('../../../shared/utils/validation');

class LobbyService {
    constructor() {
        this.lobbies = new Map();
        this.playerToLobby = new Map(); // Track which lobby each player is in
        this.setupCleanupInterval();
    }
    
    createLobby(hostSocketId, username, gameConfig, options = {}) {
        // Validate inputs
        if (!ValidationUtils.isValidUsername(username)) {
            throw new Error('Invalid username');
        }
        
        // Check if player is already in a lobby
        if (this.playerToLobby.has(hostSocketId)) {
            throw new Error('Player is already in a lobby');
        }
        
        // Generate unique lobby ID
        let lobbyId;
        do {
            lobbyId = this.generateLobbyId();
        } while (this.lobbies.has(lobbyId));
        
        // Create lobby
        const lobby = new Lobby(lobbyId, hostSocketId, gameConfig, options);
        
        // Create host player
        const hostPlayer = new Player(hostSocketId, username, { 
            isHost: true, 
            isReady: true 
        });
        
        // Add host to lobby
        lobby.addPlayer(hostPlayer);
        
        // Store lobby and player mapping
        this.lobbies.set(lobbyId, lobby);
        this.playerToLobby.set(hostSocketId, lobbyId);
        
        return lobby;
    }
    
    joinLobby(lobbyCode, playerId, username) {
        // Validate inputs
        if (!ValidationUtils.isValidLobbyCode(lobbyCode)) {
            throw new Error('Invalid lobby code');
        }
        
        if (!ValidationUtils.isValidUsername(username)) {
            throw new Error('Invalid username');
        }
        
        // Check if player is already in a lobby
        if (this.playerToLobby.has(playerId)) {
            throw new Error('Player is already in a lobby');
        }
        
        // Find lobby by code
        const lobby = this.findLobbyByCode(lobbyCode);
        if (!lobby) {
            throw new Error('Lobby not found');
        }
        
        if (lobby.isFull()) {
            throw new Error('Lobby is full');
        }
        
        if (lobby.status !== 'waiting') {
            throw new Error('Game already in progress');
        }
        
        // Create player
        const player = new Player(playerId, username);
        
        // Add player to lobby
        lobby.addPlayer(player);
        this.playerToLobby.set(playerId, lobby.id);
        
        return lobby;
    }
    
    leaveLobby(playerId) {
        const lobbyId = this.playerToLobby.get(playerId);
        if (!lobbyId) {
            return null;
        }
        
        const lobby = this.lobbies.get(lobbyId);
        if (!lobby) {
            this.playerToLobby.delete(playerId);
            return null;
        }
        
        // Remove player from lobby
        const removedPlayer = lobby.removePlayer(playerId);
        this.playerToLobby.delete(playerId);
        
        // Clean up empty lobby
        if (lobby.isEmpty()) {
            this.lobbies.delete(lobbyId);
        }
        
        return {
            lobby: lobby.isEmpty() ? null : lobby,
            removedPlayer,
            wasHost: removedPlayer && removedPlayer.isHost
        };
    }
    
    updatePlayerReady(playerId, isReady) {
        const lobby = this.getPlayerLobby(playerId);
        if (!lobby) {
            throw new Error('Player not in lobby');
        }
        
        return lobby.updatePlayerReady(playerId, isReady);
    }
    
    updatePlayerTankClass(playerId, tankClass) {
        const lobby = this.getPlayerLobby(playerId);
        if (!lobby) {
            throw new Error('Player not in lobby');
        }
        
        return lobby.updatePlayerTankClass(playerId, tankClass);
    }
    
    startGame(hostId) {
        const lobby = this.getPlayerLobby(hostId);
        if (!lobby) {
            throw new Error('Player not in lobby');
        }
        
        if (lobby.hostSocketId !== hostId) {
            throw new Error('Only host can start game');
        }
        
        return lobby.startGame();
    }
    
    getPlayerLobby(playerId) {
        const lobbyId = this.playerToLobby.get(playerId);
        return lobbyId ? this.lobbies.get(lobbyId) : null;
    }
    
    findLobbyByCode(lobbyCode) {
        for (const lobby of this.lobbies.values()) {
            if (lobby.lobbyCode === lobbyCode) {
                return lobby;
            }
        }
        return null;
    }
    
    getAllLobbies() {
        return Array.from(this.lobbies.values())
            .filter(lobby => !lobby.isPrivate)
            .map(lobby => lobby.toClientData());
    }
    
    getLobbyStats() {
        return {
            totalLobbies: this.lobbies.size,
            totalPlayers: this.playerToLobby.size,
            waitingLobbies: Array.from(this.lobbies.values())
                .filter(lobby => lobby.status === 'waiting').length,
            activeGames: Array.from(this.lobbies.values())
                .filter(lobby => lobby.status === 'in_progress').length
        };
    }
    
    generateLobbyId() {
        return Math.random().toString(36).substring(2, 15);
    }
    
    setupCleanupInterval() {
        // Clean up old/abandoned lobbies every 5 minutes
        setInterval(() => {
            this.cleanupOldLobbies();
        }, 5 * 60 * 1000);
    }
    
    cleanupOldLobbies() {
        const now = new Date();
        const maxAge = 30 * 60 * 1000; // 30 minutes
        
        for (const [lobbyId, lobby] of this.lobbies.entries()) {
            const age = now - lobby.createdAt;
            
            // Remove lobbies that are too old and not in progress
            if (age > maxAge && lobby.status !== 'in_progress') {
                console.log(`Cleaning up old lobby: ${lobbyId}`);
                
                // Remove player mappings
                lobby.players.forEach(player => {
                    this.playerToLobby.delete(player.id);
                });
                
                this.lobbies.delete(lobbyId);
            }
        }
    }
    
    handlePlayerDisconnect(playerId) {
        const result = this.leaveLobby(playerId);
        
        if (result && result.lobby) {
            // Mark player as disconnected instead of removing immediately
            const player = result.lobby.getPlayer(playerId);
            if (player) {
                player.setDisconnected();
            }
            
            // Give player 30 seconds to reconnect before removing
            setTimeout(() => {
                if (!result.lobby.getPlayer(playerId)?.isConnected) {
                    this.leaveLobby(playerId);
                }
            }, 30000);
        }
        
        return result;
    }
}

module.exports = LobbyService;