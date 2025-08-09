// Core game types shared between client and server
export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  sessionId: string;
  status: GameSessionStatus;
  players: PlayerState[];
  currentWave?: number;
  timeRemaining?: number;
}

export interface PlayerState {
  id: string;
  username: string;
  position: Position;
  rotation: number;
  hp: number;
  maxHp: number;
  isAlive: boolean;
  kills: number;
  deaths: number;
  score: number;
  tankClass: string;
  team?: string;
}

export interface BulletState {
  id: string;
  ownerId: string;
  position: Position;
  velocity: Position;
  damage: number;
  rotation: number;
}

export interface LobbyState {
  lobbyId: string;
  lobbyCode: string;
  hostId: string;
  players: LobbyPlayerInfo[];
  gameConfig: GameConfiguration;
  status: LobbyStatus;
  maxPlayers: number;
}

export interface LobbyPlayerInfo {
  id: string;
  username: string;
  tankClass?: string;
  isReady: boolean;
  isHost: boolean;
}

export interface GameConfiguration {
  gameMode: string;
  mapType: string;
  maxPlayers: number;
  difficulty?: string;
  stageLevel?: number;
}

export enum GameSessionStatus {
  WAITING = 'waiting',
  STARTING = 'starting',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned'
}

export enum LobbyStatus {
  OPEN = 'open',
  STARTING = 'starting',
  IN_GAME = 'in_game',
  CLOSED = 'closed'
}

export interface NetworkMessage {
  type: string;
  timestamp: number;
  data: any;
}

export interface PlayerAction {
  playerId: string;
  actionType: string;
  data: any;
  timestamp: number;
}