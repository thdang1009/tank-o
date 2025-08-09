// Shared validation utilities for client and server

class ValidationUtils {
  
  static isValidUsername(username) {
    if (!username || typeof username !== 'string') {
      return false;
    }
    
    // Username must be 3-20 characters, alphanumeric and underscore only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  }
  
  static isValidLobbyCode(lobbyCode) {
    if (!lobbyCode || typeof lobbyCode !== 'string') {
      return false;
    }
    
    // Lobby code must be exactly 6 characters, alphanumeric
    const lobbyCodeRegex = /^[A-Z0-9]{6}$/;
    return lobbyCodeRegex.test(lobbyCode);
  }
  
  static isValidPosition(position) {
    if (!position || typeof position !== 'object') {
      return false;
    }
    
    return typeof position.x === 'number' && 
           typeof position.y === 'number' && 
           isFinite(position.x) && 
           isFinite(position.y);
  }
  
  static isValidRotation(rotation) {
    return typeof rotation === 'number' && isFinite(rotation);
  }
  
  static sanitizeString(str, maxLength = 255) {
    if (!str || typeof str !== 'string') {
      return '';
    }
    
    return str.trim().substring(0, maxLength);
  }
  
  static clampNumber(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  
  static isInBounds(position, bounds) {
    return position.x >= 0 && 
           position.x <= bounds.width && 
           position.y >= 0 && 
           position.y <= bounds.height;
  }
}

class GameDataValidator {
  
  static validatePlayerAction(action) {
    const errors = [];
    
    if (!action.playerId || typeof action.playerId !== 'string') {
      errors.push('Invalid player ID');
    }
    
    if (!action.actionType || typeof action.actionType !== 'string') {
      errors.push('Invalid action type');
    }
    
    if (!action.timestamp || typeof action.timestamp !== 'number') {
      errors.push('Invalid timestamp');
    }
    
    // Check if timestamp is recent (within last 5 seconds)
    const now = Date.now();
    if (Math.abs(now - action.timestamp) > 5000) {
      errors.push('Action timestamp too old');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static validateGameConfiguration(config) {
    const errors = [];
    
    if (!config.gameMode || typeof config.gameMode !== 'string') {
      errors.push('Invalid game mode');
    }
    
    if (!config.mapType || typeof config.mapType !== 'string') {
      errors.push('Invalid map type');
    }
    
    if (!config.maxPlayers || 
        typeof config.maxPlayers !== 'number' || 
        config.maxPlayers < 1 || 
        config.maxPlayers > 10) {
      errors.push('Invalid max players (must be 1-10)');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = {
  ValidationUtils,
  GameDataValidator
};