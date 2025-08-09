// Main server application
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const config = require('./config/server');
const LobbyController = require('./controllers/LobbyController');
const RateLimiter = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

class GameServer {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new Server(this.server, config.SOCKET_CONFIG);
        this.rateLimiter = new RateLimiter();
        this.lobbyController = new LobbyController(this.io);
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupSocketHandlers();
        this.setupErrorHandling();
    }
    
    setupMiddleware() {
        // CORS
        if (config.ENABLE_CORS) {
            this.app.use(cors({
                origin: config.SOCKET_CONFIG.cors.origin,
                methods: config.SOCKET_CONFIG.cors.methods
            }));
        }
        
        // JSON parsing
        this.app.use(express.json({ limit: '1mb' }));
        
        // Trust proxy if configured
        if (config.TRUST_PROXY) {
            this.app.set('trust proxy', 1);
        }
        
        // Request logging
        this.app.use((req, res, next) => {
            logger.info(`HTTP ${req.method} ${req.path}`, {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            next();
        });
    }
    
    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            const stats = this.lobbyController.lobbyService.getLobbyStats();
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                ...stats
            });
        });
        
        // Server info endpoint
        this.app.get('/info', (req, res) => {
            res.json({
                name: 'Tank-O Game Server',
                version: '1.0.0',
                environment: config.NODE_ENV,
                features: ['lobbies', 'real-time-multiplayer']
            });
        });
        
        // Lobby list endpoint (for public lobbies)
        this.app.get('/api/lobbies', (req, res) => {
            try {
                const publicLobbies = this.lobbyController.lobbyService.getAllLobbies();
                res.json({
                    lobbies: publicLobbies,
                    count: publicLobbies.length
                });
            } catch (error) {
                logger.error('Error fetching lobbies', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
        
        // Root endpoint
        this.app.get('/', (req, res) => {
            res.json({
                message: 'Tank-O Game Server is running',
                endpoints: [
                    'GET /health - Server health status',
                    'GET /info - Server information',
                    'GET /api/lobbies - Public lobby list'
                ]
            });
        });
        
        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({ error: 'Not found' });
        });
    }
    
    setupSocketHandlers() {
        // Connection event
        this.io.on('connection', (socket) => {
            logger.connectionEvent('connect', socket.id, {
                address: socket.handshake.address
            });
            
            // Set up rate limiting for this socket
            this.setupSocketRateLimiting(socket);
            
            // Handle lobby events through controller
            this.lobbyController.handleConnection(socket);
            
            // Handle disconnection
            socket.on('disconnect', (reason) => {
                logger.connectionEvent('disconnect', socket.id, { reason });
                this.rateLimiter.removeClient(socket.id);
            });
            
            // Error handling
            socket.on('error', (error) => {
                logger.errorWithStack('Socket error', error);
            });
        });
        
        // Server-level error handling
        this.io.engine.on('connection_error', (error) => {
            logger.error('Connection error', {
                code: error.code,
                message: error.message,
                context: error.context
            });
        });
    }
    
    setupSocketRateLimiting(socket) {
        // Apply rate limiting to specific events
        socket.use((packet, next) => {
            const [eventName] = packet;
            
            // Apply specific rate limits based on event type
            let rateLimitMiddleware;
            
            switch (eventName) {
                case 'create-lobby':
                    rateLimitMiddleware = this.rateLimiter.lobbyCreation();
                    break;
                case 'join-lobby':
                    rateLimitMiddleware = this.rateLimiter.lobbyJoin();
                    break;
                case 'player-action':
                case 'player-move':
                case 'player-shoot':
                    rateLimitMiddleware = this.rateLimiter.playerAction();
                    break;
                case 'chat-message':
                    rateLimitMiddleware = this.rateLimiter.chatMessage();
                    break;
                default:
                    // Generic rate limit for other events
                    rateLimitMiddleware = this.rateLimiter.generic(eventName, 30, 60000);
            }
            
            if (rateLimitMiddleware) {
                rateLimitMiddleware(socket, (error) => {
                    if (error) {
                        logger.warn('Rate limit exceeded', {
                            socketId: socket.id,
                            eventName,
                            error: error.message
                        });
                        
                        socket.emit('error', {
                            message: 'Rate limit exceeded. Please slow down.',
                            code: 'RATE_LIMIT_EXCEEDED'
                        });
                        return;
                    }
                    next();
                });
            } else {
                next();
            }
        });
    }
    
    setupErrorHandling() {
        // Express error handler
        this.app.use((error, req, res, next) => {
            logger.errorWithStack('Express error', error);
            res.status(500).json({ error: 'Internal server error' });
        });
        
        // Process error handlers
        process.on('uncaughtException', (error) => {
            logger.errorWithStack('Uncaught exception', error);
            process.exit(1);
        });
        
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled rejection', {
                reason: reason.toString(),
                promise
            });
        });
        
        // Graceful shutdown
        process.on('SIGTERM', () => {
            logger.info('SIGTERM received, shutting down gracefully');
            this.shutdown();
        });
        
        process.on('SIGINT', () => {
            logger.info('SIGINT received, shutting down gracefully');
            this.shutdown();
        });
    }
    
    start() {
        this.server.listen(config.PORT, config.HOST, () => {
            logger.info(`Server started`, {
                host: config.HOST,
                port: config.PORT,
                environment: config.NODE_ENV
            });
        });
        
        return this.server;
    }
    
    shutdown() {
        logger.info('Server shutting down...');
        
        // Close socket connections
        this.io.close(() => {
            logger.info('Socket.IO server closed');
        });
        
        // Close HTTP server
        this.server.close(() => {
            logger.info('HTTP server closed');
            process.exit(0);
        });
        
        // Force close after timeout
        setTimeout(() => {
            logger.error('Could not close connections in time, forcefully shutting down');
            process.exit(1);
        }, 10000);
    }
}

module.exports = GameServer;