import { io, Socket } from 'socket.io-client';
import { SocketEventBus } from '../utils/SocketEventBus';
import { TankClassType } from '../../shared/enums/game-enums';
import { MapType } from '../map/MapManager';
import { 
  ServerToClientEvents, 
  ClientToServerEvents,
  InterServerEvents 
} from '../../shared/interfaces/socket-events';
import { GameConfiguration, LobbyPlayerInfo } from '../../shared/types/game-types';

// Define the server URL (adjust for production)
const SERVER_URL = 'http://localhost:3000';

// Define types
export interface PlayerData {
  id: string;
  name: string;
  isHost: boolean;
  ready: boolean;
  tankClass: string;
  avatar: string;
}

export interface LobbyData {
  id: string;
  players: PlayerData[];
  settings: {
    gameMode: string;
    mapType: string;
  };
  started: boolean;
}

export interface GameStateUpdate {
  x: number;
  y: number;
  rotation: number;
  shooting?: boolean;
}

export interface BulletData {
  bulletId: string;
  x: number;
  y: number;
  angle: number;
  speed: number;
  position?: { x: number; y: number };
}

export interface LobbyPlayer {
    id: string;
    username: string;
    isHost: boolean;
    isReady: boolean;
    tankClass?: TankClassType;
}

export interface Lobby {
    id: string;
    host: string;
    gameMode: string;
    mapType: MapType;
    players: LobbyPlayer[];
    maxPlayers: number;
    isPrivate: boolean;
}

/**
 * Socket events for the lobby system
 */
export enum SocketEvents {
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
    CONNECT_ERROR = 'connect_error',
    CREATE_LOBBY = 'create-lobby',
    JOIN_LOBBY = 'join-lobby',
    LEAVE_LOBBY = 'leave-lobby',
    LOBBY_CREATED = 'lobby-created',
    LOBBY_JOINED = 'lobby-joined',
    LOBBY_UPDATED = 'lobby-updated',
    PLAYER_JOINED = 'player-joined',
    PLAYER_LEFT = 'player-left',
    CHANGE_GAME_MODE = 'change-game-mode',
    CHANGE_MAP_TYPE = 'change-map-type',
    SELECT_TANK_CLASS = 'select-tank-class',
    TOGGLE_READY = 'toggle-ready',
    START_GAME = 'start-game',
    GAME_STARTING = 'game-starting',
    ERROR = 'socket-error'
}

// Main Socket Service
export class SocketService {
  private static instance: SocketService;
  public socket: Socket | null = null;
  private connected: boolean = false;
  private lobbyId: string | null = null;
  private playerId: string | null = null;
  private isHost: boolean = false;
  private serverUrl = SERVER_URL; // Default server URL
  
  /**
   * Get the singleton instance of SocketService
   */
  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }
  
  constructor() {
    // Setup event listeners
    this.setupSocketListeners();
  }
  
  /**
   * Connect to the socket server
   * @param url Optional server URL, defaults to localhost:3000
   * @returns Promise that resolves when connected
   */
  public connect(url?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // If already connected, resolve immediately
      if (this.socket?.connected) {
        resolve();
        return;
      }
      
      // If socket exists but not connected, try to reconnect
      if (this.socket) {
        this.socket.connect();
        this.socket.once(SocketEvents.CONNECT, () => resolve());
        this.socket.once(SocketEvents.CONNECT_ERROR, (error) => reject(error));
        return;
      }
      
      // Connect to the server
      if (url) {
        this.serverUrl = url;
      }
      
      this.socket = io(this.serverUrl, {
        transports: ['websocket'],
        autoConnect: true
      });
      
      // Setup event listeners for connection
      this.socket.once(SocketEvents.CONNECT, () => {
        console.log('Connected to server!');
        this.connected = true;
        this.playerId = this.socket?.id ?? null;
        SocketEventBus.getInstance().emit('socket-connected', { id: this.socket?.id ?? null });
        resolve();
      });
      
      this.socket.once(SocketEvents.CONNECT_ERROR, (error) => {
        console.error('Connection failed:', error);
        reject(error);
      });
    });
  }
  
  /**
   * Disconnect from the socket server
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.lobbyId = null;
      this.playerId = null;
      this.isHost = false;
      SocketEventBus.getInstance().emit('socket-disconnected');
    }
  }
  
  /**
   * Check if the socket is connected
   */
  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
  
  // Set up event listeners for the socket
  private setupSocketListeners() {
    // Handle connection events
    this.socket?.on(SocketEvents.CONNECT, () => {
      this.connected = true;
      this.playerId = this.socket?.id ?? null;
      SocketEventBus.getInstance().emit('socket-connected', { id: this.socket?.id ?? null });
    });
    
    this.socket?.on(SocketEvents.DISCONNECT, () => {
      this.connected = false;
      SocketEventBus.getInstance().emit('socket-disconnected');
    });
    
    // Handle lobby events
    this.socket?.on(SocketEvents.LOBBY_CREATED, (data) => {
      this.lobbyId = data.lobbyId;
      this.playerId = data.playerId;
      this.isHost = data.isHost;
      SocketEventBus.getInstance().emit('lobby-created', data);
    });
    
    this.socket?.on(SocketEvents.LOBBY_JOINED, (data) => {
      this.lobbyId = data.lobbyId;
      this.playerId = data.playerId;
      this.isHost = false;
      SocketEventBus.getInstance().emit('lobby-joined', data);
    });
    
    this.socket?.on(SocketEvents.LOBBY_UPDATED, (data) => {
      SocketEventBus.getInstance().emit('lobby-updated', data);
    });
    
    this.socket?.on(SocketEvents.PLAYER_LEFT, (data) => {
      SocketEventBus.getInstance().emit('player-left', data);
    });
    
    this.socket?.on(SocketEvents.CHANGE_GAME_MODE, (data) => {
      SocketEventBus.getInstance().emit('game-mode-changed', data);
    });
    
    this.socket?.on(SocketEvents.CHANGE_MAP_TYPE, (data) => {
      SocketEventBus.getInstance().emit('map-type-changed', data);
    });
    
    this.socket?.on(SocketEvents.SELECT_TANK_CLASS, (data) => {
      SocketEventBus.getInstance().emit('tank-class-selected', data);
    });
    
    this.socket?.on('update-ready-status', (data) => {
      SocketEventBus.getInstance().emit('ready-status-changed', data);
    });
    
    this.socket?.on(SocketEvents.START_GAME, (data) => {
      SocketEventBus.getInstance().emit('game-starting', data);
    });
    
    // Handle game events
    this.socket?.on('game-started', (data) => {
      SocketEventBus.getInstance().emit('game-started', data);
    });
    
    this.socket?.on('game-countdown', (data) => {
      SocketEventBus.getInstance().emit('game-countdown', data);
    });
    
    this.socket?.on('playerMoved', (data) => {
      SocketEventBus.getInstance().emit('player-moved', data);
    });
    
    this.socket?.on('bulletFired', (data) => {
      SocketEventBus.getInstance().emit('bullet-fired', data);
    });
    
    this.socket?.on('playerHit', (data) => {
      SocketEventBus.getInstance().emit('player-hit', data);
    });
    
    this.socket?.on('playerRespawned', (data) => {
      SocketEventBus.getInstance().emit('player-respawned', data);
    });
    
    this.socket?.on('skillUsed', (data) => {
      SocketEventBus.getInstance().emit('skill-used', data);
    });
    
    this.socket?.on('gameEnded', (data) => {
      SocketEventBus.getInstance().emit('game-ended', data);
    });
    
    this.socket?.on('gameState', (data) => {
      SocketEventBus.getInstance().emit('game-state', data);
    });
    
    this.socket?.on('playerReadyStatusChanged', (data) => {
      SocketEventBus.getInstance().emit('player-ready-status-changed', data);
    });
    
    this.socket?.on('gameTransition', (data) => {
      SocketEventBus.getInstance().emit('game-transition', data);
    });
    
    // Handle errors
    this.socket?.on(SocketEvents.ERROR, (data) => {
      console.error('Socket error:', data);
      SocketEventBus.getInstance().emit('socket-error', data);
    });
  }
  
  // -------------------------
  // Lobby Management Methods
  // -------------------------
  
  /**
   * Create a new lobby
   * @param username The player's username
   * @param gameMode The initial game mode
   * @param mapType The initial map type
   * @param isPrivate Whether the lobby is private
   * @returns Promise that resolves with the created lobby
   */
  public createLobby(username: string, gameMode: string, mapType: string, isPrivate = false): Promise<Lobby> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }
      
      this.socket.emit(SocketEvents.CREATE_LOBBY, {
        username,
        gameMode,
        mapType,
        isPrivate
      });
      
      this.socket.once(SocketEvents.LOBBY_CREATED, (lobby: Lobby) => {
        resolve(lobby);
      });
      
      this.socket.once(SocketEvents.ERROR, (error: any) => {
        reject(error);
      });
    });
  }
  
  /**
   * Join an existing lobby
   * @param lobbyId The ID of the lobby to join
   * @param username The player's username
   * @returns Promise that resolves with the joined lobby
   */
  public joinLobby(lobbyId: string, username: string): Promise<Lobby> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }
      
      this.socket.emit(SocketEvents.JOIN_LOBBY, {
        lobbyId,
        username
      });
      
      this.socket.once(SocketEvents.LOBBY_JOINED, (lobby: Lobby) => {
        resolve(lobby);
      });
      
      this.socket.once(SocketEvents.ERROR, (error: any) => {
        reject(error);
      });
    });
  }
  
  /**
   * Leave the current lobby
   */
  public leaveLobby(): void {
    if (this.socket) {
      this.socket.emit(SocketEvents.LEAVE_LOBBY);
    }
  }
  
  /**
   * Change the game mode
   * @param gameMode The new game mode
   */
  public changeGameMode(gameMode: string): void {
    if (this.socket) {
      this.socket.emit(SocketEvents.CHANGE_GAME_MODE, { gameMode });
    }
  }
  
  /**
   * Change the map type
   * @param mapType The new map type
   */
  public changeMapType(mapType: string): void {
    if (this.socket) {
      this.socket.emit(SocketEvents.CHANGE_MAP_TYPE, { mapType });
    }
  }
  
  /**
   * Select a tank class
   * @param tankClass The selected tank class
   */
  public selectTankClass(tankClass: string): void {
    if (this.socket) {
      this.socket.emit(SocketEvents.SELECT_TANK_CLASS, { tankClass });
    }
  }
  
  /**
   * Toggle the ready status
   */
  public toggleReady(isReady: boolean = true): void {
    if (this.socket) {
      this.socket.emit('update-ready-status', { isReady });
    }
  }
  
  /**
   * Start the game (host only)
   */
  public startGame(): void {
    if (this.socket) {
      this.socket.emit(SocketEvents.START_GAME);
    }
  }
  
  // -------------------------
  // In-Game Methods
  // -------------------------
  
  // Send player position update
  sendPlayerUpdate(data: GameStateUpdate) {
    if (!this.connected || !this.lobbyId) return;
    
    this.socket?.emit('playerUpdate', data);
  }
  
  // Send bullet fired event
  sendBulletFired(data: BulletData) {
    if (!this.connected || !this.lobbyId) return;
    
    this.socket?.emit('bulletFired', {
      bulletId: data.bulletId,
      position: data.position,
      angle: data.angle,
      speed: data.speed
    });
  }
  
  // Send player hit event
  sendPlayerHit(targetId: string, damage: number, bulletId: string, position: any) {
    if (!this.connected || !this.lobbyId) return;
    
    this.socket?.emit('playerHit', {
      targetId,
      damage,
      bulletId,
      position
    });
  }
  
  // Send skill usage
  sendUseSkill(skillType: string, targetPosition?: any) {
    if (!this.connected || !this.lobbyId) return;
    
    this.socket?.emit('useSkill', {
      skillType,
      targetPosition
    });
  }
  
  // Request respawn
  sendRespawnRequest() {
    if (!this.connected || !this.lobbyId) return;
    
    this.socket?.emit('requestRespawn');
  }
  
  // Request current game state
  requestGameState() {
    if (!this.connected || !this.lobbyId) return;
    
    this.socket?.emit('requestGameState');
  }
  
  // Send player ready status
  sendPlayerReady(ready: boolean = true) {
    if (!this.connected || !this.lobbyId) return;
    
    this.socket?.emit('playerReady', { ready });
  }
  
  // -------------------------
  // Getters
  // -------------------------
  
  getLobbyId(): string | null {
    return this.lobbyId;
  }
  
  getPlayerId(): string | null {
    return this.playerId;
  }
  
  isPlayerHost(): boolean {
    return this.isHost;
  }
  
  // Add a one-time event listener
  public once(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.once(event, callback);
    }
  }

  /**
   * Emit an event to the server
   * @param event Event name
   * @param data Event data
   */
  public emit(event: string, data?: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    } else {
      console.warn(`Socket not connected, can't emit ${event}`);
    }
  }

  /**
   * Listen for an event from the server
   * @param event Event name
   * @param callback Callback function
   */
  public on(event: string, callback: Function): void {
    if (this.socket) {
      this.socket.on(event, callback as any);
    } else {
      console.warn(`Socket not connected, can't listen for ${event}`);
    }
  }

  /**
   * Remove event listener
   * @param event Event name
   * @param callback Optional callback to remove specific listener
   */
  public off(event: string, callback?: Function): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback as any);
      } else {
        this.socket.off(event);
      }
    } else {
      console.warn(`Socket not connected, can't remove listener for ${event}`);
    }
  }
}

// Create a singleton instance
export const socketService = SocketService.getInstance(); 