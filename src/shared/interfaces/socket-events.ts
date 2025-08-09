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
  'game-countdown': (data: { countdown: number }) => void;
  'playerMoved': (data: { playerId: string; position: any; rotation: number; shooting: boolean; timestamp: number }) => void;
  'bulletFired': (data: { bulletId: string; playerId: string; position: any; angle: number; speed: number; damage: number; timestamp: number }) => void;
  'playerHit': (data: { targetId: string; shooterId: string; damage: number; newHP: number; bulletId: string; position: any; killed?: boolean; shooterStats?: any; timestamp: number }) => void;
  'playerRespawned': (data: { playerId: string; position: any; timestamp: number }) => void;
  'skillUsed': (data: { playerId: string; skillType: string; targetPosition: any; result: any; timestamp: number }) => void;
  'gameEnded': (data: { winner?: any; players: any[]; duration: number; timestamp: number }) => void;
  'gameState': (data: { sessionId: string; gameMode: string; mapType: string; status: string; players: any[]; startTime: any; timestamp: number }) => void;
  'playerReadyStatusChanged': (data: { playerId: string; ready: boolean; allReady: boolean }) => void;
  'gameTransition': (data: { lobby: any }) => void;
  
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
  'playerUpdate': (data: { x: number; y: number; rotation: number; shooting?: boolean }) => void;
  'bulletFired': (data: { bulletId?: string; position?: any; angle: number; speed?: number }) => void;
  'playerHit': (data: { targetId: string; damage: number; bulletId: string; position: any }) => void;
  'useSkill': (data: { skillType: string; targetPosition?: any }) => void;
  'requestRespawn': (data?: any) => void;
  'requestGameState': () => void;
  'playerReady': (data: { ready: boolean }) => void;
  
  // System events
  'ping': () => void;
  'heartbeat': () => void;
}

export interface InterServerEvents {
  // For scaling across multiple servers
  'server-status': (data: { serverId: string; playerCount: number; lobbyCount: number }) => void;
}