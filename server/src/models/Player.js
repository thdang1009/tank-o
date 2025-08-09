// Player model
class Player {
    constructor(socketId, username, options = {}) {
        this.id = socketId;
        this.username = username;
        this.isHost = options.isHost || false;
        this.isReady = options.isReady || false;
        this.tankClass = options.tankClass || null;
        this.joinedAt = new Date();
        
        // In-game state (only during active game)
        this.gameState = {
            position: { x: 0, y: 0 },
            rotation: 0,
            hp: 100,
            maxHp: 100,
            isAlive: true,
            kills: 0,
            deaths: 0,
            score: 0,
            team: null
        };
        
        // Connection state
        this.isConnected = true;
        this.lastSeen = new Date();
        this.ping = 0;
    }
    
    updateGameState(newState) {
        this.gameState = { ...this.gameState, ...newState };
        this.lastSeen = new Date();
    }
    
    resetGameState() {
        this.gameState = {
            position: { x: 0, y: 0 },
            rotation: 0,
            hp: 100,
            maxHp: 100,
            isAlive: true,
            kills: 0,
            deaths: 0,
            score: 0,
            team: null
        };
    }
    
    takeDamage(damage) {
        this.gameState.hp = Math.max(0, this.gameState.hp - damage);
        if (this.gameState.hp === 0) {
            this.gameState.isAlive = false;
            this.gameState.deaths++;
        }
        return this.gameState.hp;
    }
    
    heal(amount) {
        this.gameState.hp = Math.min(this.gameState.maxHp, this.gameState.hp + amount);
        return this.gameState.hp;
    }
    
    addKill() {
        this.gameState.kills++;
    }
    
    addScore(points) {
        this.gameState.score += points;
    }
    
    respawn(position) {
        this.gameState.isAlive = true;
        this.gameState.hp = this.gameState.maxHp;
        this.gameState.position = position;
    }
    
    setDisconnected() {
        this.isConnected = false;
        this.lastSeen = new Date();
    }
    
    setConnected() {
        this.isConnected = true;
        this.lastSeen = new Date();
    }
    
    updatePing(ping) {
        this.ping = ping;
        this.lastSeen = new Date();
    }
    
    toClientData(includeGameState = false) {
        const data = {
            id: this.id,
            username: this.username,
            isHost: this.isHost,
            isReady: this.isReady,
            tankClass: this.tankClass,
            isConnected: this.isConnected,
            ping: this.ping
        };
        
        if (includeGameState) {
            data.gameState = this.gameState;
        }
        
        return data;
    }
    
    toGameState() {
        return {
            id: this.id,
            username: this.username,
            ...this.gameState
        };
    }
}

module.exports = Player;