// Shared enums used across client and server

export enum GameMode {
  SOLO = 'solo',
  CHAOS = 'chaos',           // Team Deathmatch  
  STAGE = 'stage',
  BATTLE_ROYALE = 'br',
  CAPTURE_FLAG = 'ctf',
  TEAM_PVE = 'team_pve',     // Adventure Mode
  TEAM_PVP = 'team_pvp',     // 5v5
  TRAINING = 'training'
}

export enum TankClassType {
  BRUISER = 'bruiser',
  DEALER = 'dealer',
  SUPPORTER = 'supporter',
  VERSATILE = 'versatile',
  MAGE = 'mage',
  SPY = 'spy',
  DEMOLITION = 'demolition',
  BOMBER = 'bomber',
  ICE_TANK = 'ice_tank'
}

export enum TankRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export enum MapType {
  GRASS = 'grass',
  SAND = 'sand',
  MIXED = 'mixed',
  CUSTOM = 'custom'
}

export enum ItemCategory {
  WEAPON_UPGRADE = 'weapon',
  ARMOR_UPGRADE = 'armor',
  CONSUMABLE = 'consumable',
  SPECIAL = 'special'
}

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon', 
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export enum PlayerActionType {
  MOVE = 'move',
  SHOOT = 'shoot',
  USE_SKILL = 'use_skill',
  PICKUP_ITEM = 'pickup_item',
  CHAT_MESSAGE = 'chat_message'
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}

export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting', 
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}