const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

// Create Express app and HTTP server
const app = express();
app.use(cors());
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Store active lobbies
const lobbies = new Map();

/**
 * Generate a unique 6-character lobby code
 */
function generateLobbyCode() {
    // Generate a 6-character alphanumeric code
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Socket connection handler
 */
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Player data
    let currentLobbyId = null;
    
    /**
     * Create a new lobby
     */
    socket.on('create-lobby', ({ username, gameMode, mapType, isPrivate }) => {
        try {
            // Generate a unique lobby ID
            const lobbyId = generateLobbyCode();
            
            // Create player object
            const player = {
                id: socket.id,
                username,
                isHost: true,
                isReady: true,  // Host is always ready
                tankClass: null
            };
            
            // Create lobby
            const lobby = {
                id: lobbyId,
                host: socket.id,
                gameMode,
                mapType,
                players: [player],
                maxPlayers: 4,
                isPrivate
            };
            
            // Store lobby
            lobbies.set(lobbyId, lobby);
            
            // Join socket room for this lobby
            socket.join(lobbyId);
            currentLobbyId = lobbyId;
            
            // Send created lobby to client
            socket.emit('lobby-created', lobby);
            console.log(`Lobby created: ${lobbyId}`);
        } catch (error) {
            console.error('Error creating lobby:', error);
            socket.emit('socket-error', { message: 'Failed to create lobby' });
        }
    });
    
    /**
     * Join an existing lobby
     */
    socket.on('join-lobby', ({ lobbyId, username }) => {
        try {
            // Check if lobby exists
            if (!lobbies.has(lobbyId)) {
                socket.emit('socket-error', { message: 'Lobby not found' });
                return;
            }
            
            const lobby = lobbies.get(lobbyId);
            
            // Check if lobby is full
            if (lobby.players.length >= lobby.maxPlayers) {
                socket.emit('socket-error', { message: 'Lobby is full' });
                return;
            }
            
            // Create player object
            const player = {
                id: socket.id,
                username,
                isHost: false,
                isReady: false,
                tankClass: null
            };
            
            // Add player to lobby
            lobby.players.push(player);
            
            // Join socket room for this lobby
            socket.join(lobbyId);
            currentLobbyId = lobbyId;
            
            // Send joined lobby to client
            socket.emit('lobby-joined', lobby);
            
            // Notify other players in lobby
            socket.to(lobbyId).emit('player-joined', player);
            
            // Update lobby for all players
            io.to(lobbyId).emit('lobby-updated', lobby);
            console.log(`Player ${socket.id} joined lobby: ${lobbyId}`);
        } catch (error) {
            console.error('Error joining lobby:', error);
            socket.emit('socket-error', { message: 'Failed to join lobby' });
        }
    });
    
    /**
     * Leave the current lobby
     */
    socket.on('leave-lobby', () => {
        try {
            if (!currentLobbyId || !lobbies.has(currentLobbyId)) {
                return;
            }
            
            const lobby = lobbies.get(currentLobbyId);
            const playerIndex = lobby.players.findIndex(p => p.id === socket.id);
            
            if (playerIndex === -1) {
                return;
            }
            
            // Remove player from lobby
            lobby.players.splice(playerIndex, 1);
            
            // Leave socket room
            socket.leave(currentLobbyId);
            
            // Check if lobby is empty
            if (lobby.players.length === 0) {
                // Delete empty lobby
                lobbies.delete(currentLobbyId);
                console.log(`Lobby deleted: ${currentLobbyId}`);
            } else if (socket.id === lobby.host) {
                // If host left, assign new host
                lobby.host = lobby.players[0].id;
                lobby.players[0].isHost = true;
                
                // Update lobby for remaining players
                io.to(currentLobbyId).emit('lobby-updated', lobby);
            } else {
                // Notify other players
                io.to(currentLobbyId).emit('player-left', socket.id);
                io.to(currentLobbyId).emit('lobby-updated', lobby);
            }
            
            currentLobbyId = null;
            console.log(`Player ${socket.id} left lobby`);
        } catch (error) {
            console.error('Error leaving lobby:', error);
        }
    });
    
    /**
     * Change game mode (host only)
     */
    socket.on('change-game-mode', ({ gameMode }) => {
        try {
            if (!currentLobbyId || !lobbies.has(currentLobbyId)) {
                return;
            }
            
            const lobby = lobbies.get(currentLobbyId);
            
            // Check if player is host
            if (socket.id !== lobby.host) {
                socket.emit('socket-error', { message: 'Only host can change game mode' });
                return;
            }
            
            // Update game mode
            lobby.gameMode = gameMode;
            
            // Update lobby for all players
            io.to(currentLobbyId).emit('lobby-updated', lobby);
        } catch (error) {
            console.error('Error changing game mode:', error);
        }
    });
    
    /**
     * Change map type (host only)
     */
    socket.on('change-map-type', ({ mapType }) => {
        try {
            if (!currentLobbyId || !lobbies.has(currentLobbyId)) {
                return;
            }
            
            const lobby = lobbies.get(currentLobbyId);
            
            // Check if player is host
            if (socket.id !== lobby.host) {
                socket.emit('socket-error', { message: 'Only host can change map type' });
                return;
            }
            
            // Update map type
            lobby.mapType = mapType;
            
            // Update lobby for all players
            io.to(currentLobbyId).emit('lobby-updated', lobby);
        } catch (error) {
            console.error('Error changing map type:', error);
        }
    });
    
    /**
     * Select tank class
     */
    socket.on('select-tank-class', ({ tankClass }) => {
        try {
            if (!currentLobbyId || !lobbies.has(currentLobbyId)) {
                return;
            }
            
            const lobby = lobbies.get(currentLobbyId);
            const player = lobby.players.find(p => p.id === socket.id);
            
            if (!player) {
                return;
            }
            
            // Update tank class
            player.tankClass = tankClass;
            
            // Update lobby for all players
            io.to(currentLobbyId).emit('lobby-updated', lobby);
        } catch (error) {
            console.error('Error selecting tank class:', error);
        }
    });
    
    /**
     * Toggle ready status (non-host only)
     */
    socket.on('toggle-ready', () => {
        try {
            if (!currentLobbyId || !lobbies.has(currentLobbyId)) {
                return;
            }
            
            const lobby = lobbies.get(currentLobbyId);
            const player = lobby.players.find(p => p.id === socket.id);
            
            if (!player || player.isHost) {
                return;
            }
            
            // Toggle ready status
            player.isReady = !player.isReady;
            
            // Update lobby for all players
            io.to(currentLobbyId).emit('lobby-updated', lobby);
        } catch (error) {
            console.error('Error toggling ready status:', error);
        }
    });
    
    /**
     * Start game (host only)
     */
    socket.on('start-game', () => {
        try {
            if (!currentLobbyId || !lobbies.has(currentLobbyId)) {
                return;
            }
            
            const lobby = lobbies.get(currentLobbyId);
            
            // Check if player is host
            if (socket.id !== lobby.host) {
                socket.emit('socket-error', { message: 'Only host can start the game' });
                return;
            }
            
            // Check if all players are ready
            const allReady = lobby.players.every(p => p.isHost || p.isReady);
            
            if (!allReady) {
                socket.emit('socket-error', { message: 'Not all players are ready' });
                return;
            }
            
            // Check if all players have selected a tank class
            const allSelectedClass = lobby.players.every(p => p.tankClass);
            
            if (!allSelectedClass) {
                socket.emit('socket-error', { message: 'Not all players have selected a tank class' });
                return;
            }
            
            // Notify all players that the game is starting
            io.to(currentLobbyId).emit('game-starting', lobby);
        } catch (error) {
            console.error('Error starting game:', error);
        }
    });
    
    /**
     * Disconnect handler
     */
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        
        // Handle player leaving any lobby they were in
        if (currentLobbyId) {
            socket.emit('leave-lobby');
        }
    });
});

// Home route
app.get('/', (req, res) => {
    res.send('Tank-O Game Server is running');
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
}); 