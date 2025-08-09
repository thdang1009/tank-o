// Rate limiting middleware for socket events
const { RATE_LIMITS } = require('../config/server');

class RateLimiter {
    constructor() {
        this.clients = new Map();
        this.setupCleanup();
    }
    
    createMiddleware(eventType, limit = 10, windowMs = 60000) {
        return (socket, next) => {
            const clientId = socket.id;
            const now = Date.now();
            
            if (!this.clients.has(clientId)) {
                this.clients.set(clientId, new Map());
            }
            
            const clientLimits = this.clients.get(clientId);
            
            if (!clientLimits.has(eventType)) {
                clientLimits.set(eventType, {
                    count: 0,
                    resetTime: now + windowMs
                });
            }
            
            const limitData = clientLimits.get(eventType);
            
            // Reset counter if window has passed
            if (now >= limitData.resetTime) {
                limitData.count = 0;
                limitData.resetTime = now + windowMs;
            }
            
            // Check if limit exceeded
            if (limitData.count >= limit) {
                const error = new Error(`Rate limit exceeded for ${eventType}`);
                error.type = 'rate_limit_exceeded';
                return next(error);
            }
            
            // Increment counter
            limitData.count++;
            next();
        };
    }
    
    // Create specific middleware for different event types
    lobbyCreation() {
        return this.createMiddleware('create_lobby', RATE_LIMITS.CREATE_LOBBY, 60000);
    }
    
    lobbyJoin() {
        return this.createMiddleware('join_lobby', RATE_LIMITS.JOIN_LOBBY, 60000);
    }
    
    playerAction() {
        return this.createMiddleware('player_action', RATE_LIMITS.ACTION, 60000);
    }
    
    chatMessage() {
        return this.createMiddleware('chat_message', RATE_LIMITS.MESSAGE, 60000);
    }
    
    // Generic rate limiter
    generic(eventType, limit, windowMs) {
        return this.createMiddleware(eventType, limit, windowMs);
    }
    
    // Clean up old client data
    setupCleanup() {
        setInterval(() => {
            const now = Date.now();
            
            for (const [clientId, clientLimits] of this.clients.entries()) {
                // Remove expired limit data
                for (const [eventType, limitData] of clientLimits.entries()) {
                    if (now >= limitData.resetTime && limitData.count === 0) {
                        clientLimits.delete(eventType);
                    }
                }
                
                // Remove client if no limits are tracked
                if (clientLimits.size === 0) {
                    this.clients.delete(clientId);
                }
            }
        }, 5 * 60 * 1000); // Clean up every 5 minutes
    }
    
    // Remove client data on disconnect
    removeClient(clientId) {
        this.clients.delete(clientId);
    }
    
    // Get current rate limit status for a client
    getClientStatus(clientId, eventType) {
        const clientLimits = this.clients.get(clientId);
        if (!clientLimits || !clientLimits.has(eventType)) {
            return null;
        }
        
        const limitData = clientLimits.get(eventType);
        const now = Date.now();
        
        return {
            count: limitData.count,
            resetTime: limitData.resetTime,
            remaining: Math.max(0, limitData.resetTime - now)
        };
    }
}

module.exports = RateLimiter;