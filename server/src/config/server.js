// Server configuration
const config = {
    // Server settings
    PORT: process.env.PORT || 3000,
    HOST: process.env.HOST || '0.0.0.0',
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Socket.IO settings
    SOCKET_CONFIG: {
        cors: {
            origin: process.env.CLIENT_URL || '*',
            methods: ['GET', 'POST']
        },
        pingTimeout: 60000,
        pingInterval: 25000
    },
    
    // Game settings
    GAME_CONFIG: {
        MAX_LOBBIES: 1000,
        LOBBY_CLEANUP_INTERVAL: 300000, // 5 minutes
        MAX_PLAYERS_PER_LOBBY: 8,
        LOBBY_CODE_LENGTH: 6
    },
    
    // Rate limiting
    RATE_LIMITS: {
        CREATE_LOBBY: 5,        // per minute
        JOIN_LOBBY: 10,         // per minute
        MESSAGE: 30,            // per minute
        ACTION: 100             // per minute
    },
    
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    
    // Security
    ENABLE_CORS: process.env.ENABLE_CORS !== 'false',
    TRUST_PROXY: process.env.TRUST_PROXY === 'true'
};

module.exports = config;