// Shared constants used across client and server

export const GAME_CONFIG = {
  // Lobby settings
  MAX_LOBBY_SIZE: 8,
  LOBBY_CODE_LENGTH: 6,
  LOBBY_TIMEOUT: 300000, // 5 minutes
  
  // Game settings
  TICK_RATE: 60, // Server tick rate (Hz)
  MAX_BULLETS_PER_PLAYER: 10,
  PLAYER_SPAWN_PROTECTION_MS: 3000,
  
  // Map dimensions
  DEFAULT_MAP_WIDTH: 2048,
  DEFAULT_MAP_HEIGHT: 2048,
  
  // Network settings
  MAX_PACKET_SIZE: 1024,
  HEARTBEAT_INTERVAL: 5000,
  CONNECTION_TIMEOUT: 30000,
  
  // Performance limits
  MAX_ENTITIES_PER_PLAYER: 50,
  MAX_EVENTS_PER_SECOND: 100,
  
  // Validation limits
  MAX_USERNAME_LENGTH: 20,
  MIN_USERNAME_LENGTH: 3,
  MAX_CHAT_MESSAGE_LENGTH: 255,
  
  // Game balance
  DEFAULT_PLAYER_SPEED: 150,
  DEFAULT_BULLET_SPEED: 400,
  DEFAULT_FIRE_RATE: 500, // milliseconds
  
  // Tank class limits
  MAX_TANK_HP: 2000,
  MIN_TANK_HP: 100,
  MAX_TANK_DAMAGE: 200,
  MIN_TANK_DAMAGE: 10,
} as const;

export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  RECONNECT: 'reconnect',
  
  // Lobby events
  CREATE_LOBBY: 'create-lobby',
  JOIN_LOBBY: 'join-lobby', 
  LEAVE_LOBBY: 'leave-lobby',
  LOBBY_UPDATED: 'lobby-updated',
  
  // Game events
  GAME_START: 'game-start',
  GAME_END: 'game-end',
  PLAYER_ACTION: 'player-action',
  GAME_STATE_UPDATE: 'game-state-update',
  
  // System events
  ERROR: 'error',
  PING: 'ping',
  PONG: 'pong',
} as const;

export const ASSET_PATHS = {
  TANK_SPRITES: '/assets/tank/',
  AUDIO_FILES: '/assets/audio/',
  MAP_BACKGROUNDS: '/assets/maps/',
  UI_ELEMENTS: '/assets/ui/',
} as const;

export const ERROR_CODES = {
  // Authentication errors
  INVALID_USERNAME: 'INVALID_USERNAME',
  USERNAME_TAKEN: 'USERNAME_TAKEN',
  
  // Lobby errors  
  LOBBY_NOT_FOUND: 'LOBBY_NOT_FOUND',
  LOBBY_FULL: 'LOBBY_FULL',
  INVALID_LOBBY_CODE: 'INVALID_LOBBY_CODE',
  NOT_HOST: 'NOT_HOST',
  
  // Game errors
  GAME_IN_PROGRESS: 'GAME_IN_PROGRESS',
  PLAYER_NOT_READY: 'PLAYER_NOT_READY',
  INVALID_ACTION: 'INVALID_ACTION',
  
  // Network errors
  CONNECTION_LOST: 'CONNECTION_LOST',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INVALID_DATA: 'INVALID_DATA',
} as const;

export const GAME_MODES_CONFIG = {
  [GameMode.SOLO]: {
    minPlayers: 1,
    maxPlayers: 1,
    hasTeams: false,
    allowSpectators: false,
  },
  [GameMode.CHAOS]: {
    minPlayers: 2,
    maxPlayers: 8,
    hasTeams: false, 
    allowSpectators: true,
  },
  [GameMode.TEAM_PVE]: {
    minPlayers: 1,
    maxPlayers: 4,
    hasTeams: true,
    allowSpectators: true,
  },
  [GameMode.TEAM_PVP]: {
    minPlayers: 2,
    maxPlayers: 10,
    hasTeams: true,
    allowSpectators: true,
  },
} as const;

// Import GameMode enum
import { GameMode } from '../enums/game-enums';