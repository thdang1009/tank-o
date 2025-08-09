// Socket event interfaces for client-server communication
import { GameConfiguration, LobbyPlayerInfo, PlayerState, PlayerAction } from '../types/game-types';

export interface ServerToClientEvents {
  // Lobby events
  'lobby-created': (data: { lobbyId: string; lobbyCode: string }) => void;
  'lobby-joined': (data: { lobbyId: string; players: LobbyPlayerInfo[] }) => void;
  'lobby-updated': (data: { players: LobbyPlayerInfo[] }) => void;
  'player-joined': (data: { player: LobbyPlayerInfo }) => void;
  'player-left': (data: { playerId: string }) => void;
  'game-starting': (data: { countdown: number }) => void;
  
  // Game events
  'game-started': (data: { gameState: any }) => void;
  'player-spawned': (data: { player: PlayerState }) => void;
  'player-moved': (data: { playerId: string; position: any; rotation: number }) => void;
  'player-shot': (data: { playerId: string; bulletData: any }) => void;
  'player-hit': (data: { playerId: string; damage: number; newHp: number }) => void;
  'player-died': (data: { playerId: string; killerId?: string }) => void;
  'player-respawned': (data: { player: PlayerState }) => void;
  'game-ended': (data: { winner?: string; results: any }) => void;
  
  // System events
  'error': (data: { message: string; code?: string }) => void;
  'disconnect': () => void;
  'notification': (data: { message: string; type: string }) => void;
}

export interface ClientToServerEvents {
  // Lobby events
  'create-lobby': (data: { username: string; gameConfig: GameConfiguration }) => void;
  'join-lobby': (data: { username: string; lobbyCode: string }) => void;
  'leave-lobby': () => void;
  'update-ready-status': (data: { isReady: boolean }) => void;
  'select-tank-class': (data: { tankClass: string }) => void;
  'start-game': () => void;
  
  // Game events
  'player-action': (data: PlayerAction) => void;
  'player-move': (data: { position: any; rotation: number }) => void;
  'player-shoot': (data: { position: any; rotation: number; bulletData: any }) => void;
  'use-skill': (data: { skillType: string; targetData?: any }) => void;
  'pickup-item': (data: { itemId: string }) => void;
  
  // System events
  'ping': () => void;
  'heartbeat': () => void;
}

export interface InterServerEvents {
  // For scaling across multiple servers
  'server-status': (data: { serverId: string; playerCount: number; lobbyCount: number }) => void;
}