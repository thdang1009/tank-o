import { SocketEventBus } from '../utils/SocketEventBus';
import { SocketService } from '../services/SocketService';

export interface RemotePlayer {
  id: string;
  username: string;
  position: { x: number; y: number };
  rotation: number;
  shooting: boolean;
  hp: number;
  maxHp: number;
  isAlive: boolean;
  kills: number;
  deaths: number;
  score: number;
  tankClass: string;
  lastUpdate: number;
}

export interface GameState {
  sessionId: string;
  gameMode: string;
  mapType: string;
  status: 'waiting' | 'starting' | 'in_progress' | 'completed';
  localPlayerId: string;
  players: Map<string, RemotePlayer>;
  bullets: Map<string, any>;
  gameStartTime?: number;
  timestamp: number;
}

export class GameStateManager {
  private static instance: GameStateManager;
  private gameState: GameState | null = null;
  private socketService: SocketService;
  private eventBus: SocketEventBus;
  private syncInterval: number | null = null;
  private lastSyncTime: number = 0;
  private interpolationDelay: number = 100; // ms
  
  public static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }
  
  constructor() {
    this.socketService = SocketService.getInstance();
    this.eventBus = SocketEventBus.getInstance();
    this.setupEventListeners();
  }
  
  private setupEventListeners() {
    // Game initialization events
    this.eventBus.on('game-started', (data: any) => {
      this.handleGameStarted(data);
    });
    
    this.eventBus.on('game-state', (data: any) => {
      this.handleGameStateUpdate(data);
    });
    
    // Player movement events
    this.eventBus.on('player-moved', (data: any) => {
      this.handlePlayerMoved(data);
    });
    
    // Combat events
    this.eventBus.on('bullet-fired', (data: any) => {
      this.handleBulletFired(data);
    });
    
    this.eventBus.on('player-hit', (data: any) => {
      this.handlePlayerHit(data);
    });
    
    this.eventBus.on('player-respawned', (data: any) => {
      this.handlePlayerRespawned(data);
    });
    
    // Skill events
    this.eventBus.on('skill-used', (data: any) => {
      this.handleSkillUsed(data);
    });
    
    // Game end events
    this.eventBus.on('game-ended', (data: any) => {
      this.handleGameEnded(data);
    });
    
    this.eventBus.on('game-transition', (data: any) => {
      this.handleGameTransition(data);
    });
    
    // Connection events
    this.eventBus.on('socket-disconnected', () => {
      this.stopSyncLoop();
      this.gameState = null;
    });
  }
  
  // Initialize game state
  initializeGameState(sessionId: string, gameMode: string, mapType: string) {
    this.gameState = {
      sessionId,
      gameMode,
      mapType,
      status: 'starting',
      localPlayerId: this.socketService.getPlayerId() || '',
      players: new Map(),
      bullets: new Map(),
      timestamp: Date.now()
    };
    
    // Request initial game state from server
    this.socketService.requestGameState();
    
    // Start sync loop
    this.startSyncLoop();
  }
  
  // Handle game started event
  private handleGameStarted(data: any) {
    if (data.gameState) {
      this.handleGameStateUpdate(data.gameState);
    }
    
    if (this.gameState) {
      this.gameState.status = 'in_progress';
      this.gameState.gameStartTime = data.gameState?.startTime || Date.now();
    }
    
    console.log('Game started:', data);
  }
  
  // Handle game state update from server
  private handleGameStateUpdate(data: any) {
    if (!this.gameState) {
      this.gameState = {
        sessionId: data.sessionId,
        gameMode: data.gameMode,
        mapType: data.mapType,
        status: data.status,
        localPlayerId: this.socketService.getPlayerId() || '',
        players: new Map(),
        bullets: new Map(),
        gameStartTime: data.startTime,
        timestamp: Date.now()
      };
    }
    
    // Update players
    if (data.players) {
      data.players.forEach((playerData: any) => {
        if (playerData.id !== this.gameState?.localPlayerId) {
          this.updateRemotePlayer(playerData);
        }
      });
    }
    
    this.gameState.status = data.status;
    this.gameState.timestamp = Date.now();
    
    console.log('Game state updated:', this.gameState);
  }
  
  // Handle player movement
  private handlePlayerMoved(data: any) {
    if (!this.gameState || data.playerId === this.gameState.localPlayerId) {
      return;
    }
    
    const player = this.gameState.players.get(data.playerId);
    if (player) {
      player.position = data.position;
      player.rotation = data.rotation;
      player.shooting = data.shooting || false;
      player.lastUpdate = data.timestamp || Date.now();
    }
  }
  
  // Handle bullet fired
  private handleBulletFired(data: any) {
    if (!this.gameState) return;
    
    this.gameState.bullets.set(data.bulletId, {
      ...data,
      startTime: Date.now()
    });
    
    // Remove bullet after timeout (bullets have limited lifetime)
    setTimeout(() => {
      this.gameState?.bullets.delete(data.bulletId);
    }, 3000); // 3 seconds bullet lifetime
  }
  
  // Handle player hit
  private handlePlayerHit(data: any) {
    if (!this.gameState) return;
    
    // Update target player HP
    const targetPlayer = this.gameState.players.get(data.targetId);
    if (targetPlayer) {
      targetPlayer.hp = data.newHP;
      targetPlayer.isAlive = data.newHP > 0;
      
      if (!targetPlayer.isAlive) {
        targetPlayer.deaths++;
      }
    }
    
    // Update shooter stats
    if (data.shooterStats && data.shooterId !== this.gameState.localPlayerId) {
      const shooterPlayer = this.gameState.players.get(data.shooterId);
      if (shooterPlayer) {
        shooterPlayer.kills = data.shooterStats.kills || shooterPlayer.kills;
        shooterPlayer.score = data.shooterStats.score || shooterPlayer.score;
      }
    }
    
    // Remove the bullet
    if (data.bulletId) {
      this.gameState.bullets.delete(data.bulletId);
    }
    
    console.log('Player hit:', data);
  }
  
  // Handle player respawn
  private handlePlayerRespawned(data: any) {
    if (!this.gameState) return;
    
    const player = this.gameState.players.get(data.playerId);
    if (player) {
      player.position = data.position;
      player.isAlive = true;
      player.hp = player.maxHp;
    }
    
    console.log('Player respawned:', data);
  }
  
  // Handle skill usage
  private handleSkillUsed(data: any) {
    if (!this.gameState) return;
    
    // Process skill effects based on skill type
    console.log('Skill used:', data);
  }
  
  // Handle game ended
  private handleGameEnded(data: any) {
    if (!this.gameState) return;
    
    this.gameState.status = 'completed';
    this.stopSyncLoop();
    
    console.log('Game ended:', data);
  }
  
  // Handle game transition
  private handleGameTransition(data: any) {
    if (!this.gameState) return;
    
    // Reset game state for next round
    this.gameState.players.clear();
    this.gameState.bullets.clear();
    this.gameState.status = 'waiting';
    
    console.log('Game transition:', data);
  }
  
  // Update remote player data
  private updateRemotePlayer(playerData: any) {
    if (!this.gameState) return;
    
    const existingPlayer = this.gameState.players.get(playerData.id);
    
    if (existingPlayer) {
      // Update existing player
      Object.assign(existingPlayer, {
        username: playerData.username || existingPlayer.username,
        position: playerData.position || existingPlayer.position,
        rotation: playerData.rotation !== undefined ? playerData.rotation : existingPlayer.rotation,
        hp: playerData.hp !== undefined ? playerData.hp : existingPlayer.hp,
        maxHp: playerData.maxHp !== undefined ? playerData.maxHp : existingPlayer.maxHp,
        isAlive: playerData.isAlive !== undefined ? playerData.isAlive : existingPlayer.isAlive,
        kills: playerData.kills !== undefined ? playerData.kills : existingPlayer.kills,
        deaths: playerData.deaths !== undefined ? playerData.deaths : existingPlayer.deaths,
        score: playerData.score !== undefined ? playerData.score : existingPlayer.score,
        tankClass: playerData.tankClass || existingPlayer.tankClass,
        lastUpdate: Date.now()
      });
    } else {
      // Add new remote player
      const newPlayer: RemotePlayer = {
        id: playerData.id,
        username: playerData.username || 'Unknown',
        position: playerData.position || { x: 0, y: 0 },
        rotation: playerData.rotation || 0,
        shooting: false,
        hp: playerData.hp || 100,
        maxHp: playerData.maxHp || 100,
        isAlive: playerData.isAlive !== undefined ? playerData.isAlive : true,
        kills: playerData.kills || 0,
        deaths: playerData.deaths || 0,
        score: playerData.score || 0,
        tankClass: playerData.tankClass || 'versatile',
        lastUpdate: Date.now()
      };
      
      this.gameState.players.set(playerData.id, newPlayer);
    }
  }
  
  // Sync local player state with server
  updateLocalPlayer(position: { x: number; y: number }, rotation: number, shooting: boolean = false) {
    if (!this.gameState || this.gameState.status !== 'in_progress') {
      return;
    }
    
    const now = Date.now();
    if (now - this.lastSyncTime > 16) { // ~60 FPS update rate
      this.socketService.sendPlayerUpdate({
        x: position.x,
        y: position.y,
        rotation,
        shooting
      });
      this.lastSyncTime = now;
    }
  }
  
  // Fire bullet
  fireBullet(position: { x: number; y: number }, angle: number, speed: number = 300) {
    if (!this.gameState || this.gameState.status !== 'in_progress') {
      return null;
    }
    
    const bulletId = this.generateBulletId();
    
    this.socketService.sendBulletFired({
      bulletId,
      x: position.x,
      y: position.y,
      angle,
      speed,
      position
    });
    
    return bulletId;
  }
  
  // Report hit
  reportHit(targetId: string, damage: number, bulletId: string, position: { x: number; y: number }) {
    if (!this.gameState || this.gameState.status !== 'in_progress') {
      return;
    }
    
    this.socketService.sendPlayerHit(targetId, damage, bulletId, position);
  }
  
  // Use skill
  useSkill(skillType: string, targetPosition?: { x: number; y: number }) {
    if (!this.gameState || this.gameState.status !== 'in_progress') {
      return;
    }
    
    this.socketService.sendUseSkill(skillType, targetPosition);
  }
  
  // Request respawn
  requestRespawn() {
    if (!this.gameState) return;
    
    this.socketService.sendRespawnRequest();
  }
  
  // Start sync loop for interpolation and prediction
  private startSyncLoop() {
    if (this.syncInterval) return;
    
    this.syncInterval = window.setInterval(() => {
      this.updateInterpolation();
    }, 16); // 60 FPS
  }
  
  // Stop sync loop
  private stopSyncLoop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
  
  // Update interpolation for smooth movement
  private updateInterpolation() {
    if (!this.gameState) return;
    
    const now = Date.now();
    
    // Interpolate player positions
    this.gameState.players.forEach((player, playerId) => {
      const timeSinceUpdate = now - player.lastUpdate;
      
      // If update is too old, don't interpolate
      if (timeSinceUpdate > 1000) {
        return;
      }
      
      // Simple prediction based on last known state
      // In a full implementation, you'd use velocity and acceleration
    });
    
    // Clean up old bullets
    this.gameState.bullets.forEach((bullet, bulletId) => {
      if (now - bullet.startTime > 5000) { // 5 seconds max bullet life
        this.gameState?.bullets.delete(bulletId);
      }
    });
  }
  
  // Generate unique bullet ID
  private generateBulletId(): string {
    return `${this.gameState?.localPlayerId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }
  
  // Getters
  getGameState(): GameState | null {
    return this.gameState;
  }
  
  getRemotePlayers(): RemotePlayer[] {
    return this.gameState ? Array.from(this.gameState.players.values()) : [];
  }
  
  getPlayer(playerId: string): RemotePlayer | undefined {
    return this.gameState?.players.get(playerId);
  }
  
  getBullets(): any[] {
    return this.gameState ? Array.from(this.gameState.bullets.values()) : [];
  }
  
  isGameActive(): boolean {
    return this.gameState?.status === 'in_progress';
  }
  
  getLocalPlayerId(): string | null {
    return this.gameState?.localPlayerId || null;
  }
  
  // Clean up
  cleanup() {
    this.stopSyncLoop();
    this.gameState = null;
  }
}

export const gameStateManager = GameStateManager.getInstance();