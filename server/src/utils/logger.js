// Logging utility
const config = require('../config/server');

class Logger {
    constructor() {
        this.logLevel = this.getLogLevel(config.LOG_LEVEL);
    }
    
    getLogLevel(level) {
        const levels = {
            'error': 0,
            'warn': 1,
            'info': 2,
            'debug': 3
        };
        return levels[level.toLowerCase()] || levels['info'];
    }
    
    log(level, message, data = null) {
        const levelNum = this.getLogLevel(level);
        
        if (levelNum <= this.logLevel) {
            const timestamp = new Date().toISOString();
            const logData = {
                timestamp,
                level: level.toUpperCase(),
                message,
                ...(data && { data })
            };
            
            // In production, you might want to use a proper logging library
            // like Winston or send logs to a logging service
            if (config.NODE_ENV === 'production') {
                console.log(JSON.stringify(logData));
            } else {
                console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, data ? data : '');
            }
        }
    }
    
    error(message, data = null) {
        this.log('error', message, data);
    }
    
    warn(message, data = null) {
        this.log('warn', message, data);
    }
    
    info(message, data = null) {
        this.log('info', message, data);
    }
    
    debug(message, data = null) {
        this.log('debug', message, data);
    }
    
    // Specialized logging methods
    lobbyEvent(event, lobbyId, playerId, data = null) {
        this.info(`Lobby Event: ${event}`, {
            event,
            lobbyId,
            playerId,
            ...data
        });
    }
    
    gameEvent(event, sessionId, playerId, data = null) {
        this.info(`Game Event: ${event}`, {
            event,
            sessionId,
            playerId,
            ...data
        });
    }
    
    connectionEvent(event, socketId, data = null) {
        this.info(`Connection Event: ${event}`, {
            event,
            socketId,
            ...data
        });
    }
    
    errorWithStack(message, error) {
        this.error(message, {
            error: error.message,
            stack: error.stack
        });
    }
    
    performance(operation, duration, data = null) {
        this.debug(`Performance: ${operation}`, {
            operation,
            duration: `${duration}ms`,
            ...data
        });
    }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;