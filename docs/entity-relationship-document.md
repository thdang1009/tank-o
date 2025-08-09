# Tank O - Entity Relationship Diagram (ERD)

## Overview
This document defines the data models and relationships for the Tank O game system, covering both client-side game entities and backend data structures required for the full implementation.

---

## Core Game Entities

### 1. **User**
```typescript
interface User {
  id: string              // Primary Key - UUID
  username: string        // Unique username
  email?: string          // Optional email
  passwordHash?: string   // For registered accounts
  createdAt: Date         // Account creation timestamp
  lastLoginAt: Date       // Last login timestamp
  isGuest: boolean        // Guest vs registered account
  localStorageKey?: string // For guest account persistence
  
  // Profile Information
  level: number           // Player level
  totalXP: number         // Total experience points  
  currentXP: number       // Current level XP
  profileAvatar: string   // Selected avatar asset
  
  // Statistics
  gamesPlayed: number
  gamesWon: number
  totalDamageDealt: number
  totalDamageTaken: number
  totalPlayTime: number   // in seconds
}
```

**Relationships:**
- One-to-Many with `UserTankMastery`
- One-to-Many with `UserAchievement`
- One-to-Many with `Friendship`
- One-to-Many with `GameSession`

---

### 2. **Tank Class**
```typescript
interface TankClass {
  id: string              // Primary Key - Tank class identifier
  name: string           // Display name
  category: TankCategory // Tank category enum
  description: string    // Tank description
  
  // Base Statistics
  baseHp: number
  baseDef: number
  baseAtk: number
  baseSpellPower: number
  baseSpeed: number
  baseFireRate: number
  baseRotationSpeed: number
  
  // Skill Information
  skillName: string
  skillDescription: string
  skillCooldown: number  // in milliseconds
  ultimateSkillName?: string
  ultimateSkillDescription?: string
  
  // Asset References
  tankBodyAsset: string
  tankBarrelAsset: string
  bulletAsset: string
  skillSoundAsset: string
  
  // Meta Information
  unlockLevel: number    // Level required to unlock
  rarity: TankRarity    // Common, Rare, Epic, Legendary
  isActive: boolean     // Can be selected
}

enum TankCategory {
  BRUISER = 'bruiser',
  DAMAGE_DEALER = 'dealer', 
  SUPPORTER = 'supporter',
  VERSATILE = 'versatile',
  MAGE = 'mage',
  SPY = 'spy',
  DEMOLITION = 'demolition',
  RADAR_SCOUT = 'scout'
}

enum TankRarity {
  COMMON = 'common',
  RARE = 'rare', 
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}
```

**Relationships:**
- One-to-Many with `UserTankMastery`
- One-to-Many with `GameSessionPlayer`

---

### 3. **Game Session**
```typescript
interface GameSession {
  id: string              // Primary Key - Session UUID
  lobbyCode?: string      // 6-character lobby code for multiplayer
  hostUserId: string      // Foreign Key to User
  
  // Game Configuration
  gameMode: GameMode
  mapType: MapType
  maxPlayers: number
  difficulty: string
  stageLevel?: number     // For stage mode
  
  // Session State
  status: SessionStatus
  createdAt: Date
  startedAt?: Date
  endedAt?: Date
  duration?: number       // in seconds
  
  // Results
  winnerUserId?: string   // Foreign Key to User
  winnerTeam?: string     // For team-based games
  
  // Settings
  isPrivate: boolean
  allowSpectators: boolean
  teamBalancing: boolean
}

enum GameMode {
  SOLO = 'solo',
  CHAOS = 'chaos',           // Team Deathmatch
  BATTLE_ROYALE = 'br',
  CAPTURE_FLAG = 'ctf', 
  TEAM_PVE = 'team_pve',     // Adventure Mode
  TEAM_PVP = 'team_pvp',     // 5v5
  TRAINING = 'training'
}

enum MapType {
  GRASS = 'grass',
  SAND = 'sand', 
  MIXED = 'mixed',
  CUSTOM = 'custom'
}

enum SessionStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress', 
  COMPLETED = 'completed',
  ABANDONED = 'abandoned'
}
```

**Relationships:**
- Many-to-One with `User` (host)
- One-to-Many with `GameSessionPlayer`
- One-to-Many with `GameEvent`

---

### 4. **Game Session Player**
```typescript
interface GameSessionPlayer {
  id: string              // Primary Key
  sessionId: string       // Foreign Key to GameSession
  userId: string          // Foreign Key to User
  
  // Player Setup
  tankClassId: string     // Foreign Key to TankClass
  team?: string          // Team identifier for team games
  isSpectator: boolean
  
  // In-Game Stats
  position: {x: number, y: number}
  rotation: number
  currentHp: number
  
  // Match Statistics  
  kills: number
  deaths: number
  damageDealt: number
  damageTaken: number
  healingDone: number
  itemsCollected: number
  score: number
  
  // Status
  isAlive: boolean
  isConnected: boolean
  joinedAt: Date
  leftAt?: Date
  
  // Upgrades (in-match progression)
  temporaryStatBoosts: Record<string, number>
  activeEffects: string[] // Active status effects
}
```

**Relationships:**
- Many-to-One with `GameSession`
- Many-to-One with `User`
- Many-to-One with `TankClass`
- One-to-Many with `PlayerAction`

---

### 5. **User Tank Mastery**
```typescript
interface UserTankMastery {
  id: string              // Primary Key
  userId: string          // Foreign Key to User
  tankClassId: string     // Foreign Key to TankClass
  
  // Mastery Statistics
  gamesPlayed: number
  gamesWon: number
  winRate: number         // Calculated field
  
  // Performance Metrics
  bestScore: number
  bestKillStreak: number
  totalKills: number
  totalDeaths: number
  avgDamagePerGame: number
  avgHealingPerGame: number  // For support tanks
  avgDamageTakenPerGame: number // For tank tanks
  
  // Progression
  masteryLevel: number    // 1-10 mastery level
  masteryXP: number       // XP for this specific tank
  
  // Timestamps
  firstPlayedAt: Date
  lastPlayedAt: Date
  
  // Unlocks
  isUnlocked: boolean
  unlockedAt?: Date
}
```

**Relationships:**
- Many-to-One with `User`
- Many-to-One with `TankClass`

---

### 6. **Item**
```typescript
interface Item {
  id: string              // Primary Key
  name: string           // Item name
  description: string    // Item description
  category: ItemCategory // Item category
  rarity: ItemRarity    // Item rarity
  
  // Effects
  statModifiers: Record<string, number> // e.g., {"atk": 10, "def": 5}
  specialEffects: string[]             // Special abilities
  
  // Targeting
  recommendedForCategories: TankCategory[]
  incompatibleWithCategories: TankCategory[]
  
  // Visual
  iconAsset: string
  effectAsset?: string   // Visual effect when used
  
  // Spawn Configuration
  spawnWeight: number    // Probability weight for map spawning
  mapTypes: MapType[]    // Which maps this item can spawn on
  
  isActive: boolean
}

enum ItemCategory {
  WEAPON_UPGRADE = 'weapon',
  ARMOR_UPGRADE = 'armor', 
  CONSUMABLE = 'consumable',
  SPECIAL = 'special'
}

enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}
```

**Relationships:**
- Many-to-Many with `MapTemplate` (spawn locations)
- One-to-Many with `PlayerItemCollection`

---

### 7. **Map Template**
```typescript
interface MapTemplate {
  id: string              // Primary Key
  name: string           // Map name
  description: string    // Map description
  mapType: MapType       // Terrain type
  
  // Map Configuration
  width: number          // Map width in pixels
  height: number         // Map height in pixels
  maxPlayers: number     // Maximum players
  recommendedGameModes: GameMode[]
  
  // Spawn Points
  playerSpawnPoints: Array<{x: number, y: number}>
  enemySpawnPoints: Array<{x: number, y: number}>
  itemSpawnPoints: Array<{x: number, y: number, itemCategories: ItemCategory[]}>
  bossRoomLocation?: {x: number, y: number, width: number, height: number}
  
  // Map Data
  tileMapData: string    // JSON string of tilemap
  backgroundAsset: string
  
  // Meta
  createdBy?: string     // User ID for custom maps
  isOfficial: boolean    // Official vs community created
  difficulty: number     // 1-5 difficulty rating
  
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}
```

**Relationships:**
- Many-to-Many with `Item` (spawn points)
- One-to-Many with `GameSession` (via mapType)

---

### 8. **Achievement**
```typescript
interface Achievement {
  id: string              // Primary Key
  name: string           // Achievement name
  description: string    // Achievement description
  category: AchievementCategory
  
  // Requirements
  requirements: {
    type: string         // kill_count, win_games, damage_dealt, etc.
    value: number        // Target value
    tankClassId?: string // Specific to tank class
    gameMode?: GameMode  // Specific to game mode
  }[]
  
  // Rewards
  xpReward: number
  titleUnlock?: string   // Title text
  avatarUnlock?: string  // Avatar asset
  tankUnlock?: string    // Tank class ID
  
  // Visual
  iconAsset: string
  
  // Meta
  rarity: AchievementRarity
  isHidden: boolean      // Hidden until unlocked
  isActive: boolean
}

enum AchievementCategory {
  COMBAT = 'combat',
  TEAMWORK = 'teamwork',
  SURVIVAL = 'survival', 
  COLLECTION = 'collection',
  MASTERY = 'mastery',
  SPECIAL = 'special'
}

enum AchievementRarity {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum'
}
```

**Relationships:**
- One-to-Many with `UserAchievement`

---

### 9. **User Achievement**
```typescript
interface UserAchievement {
  id: string              // Primary Key
  userId: string          // Foreign Key to User
  achievementId: string   // Foreign Key to Achievement
  
  // Progress
  currentProgress: number // Current progress value
  isCompleted: boolean
  completedAt?: Date
  
  // Context
  completedInSessionId?: string // Session where completed
  
  createdAt: Date
}
```

**Relationships:**
- Many-to-One with `User`
- Many-to-One with `Achievement`

---

### 10. **Friendship**
```typescript
interface Friendship {
  id: string              // Primary Key
  requesterId: string     // Foreign Key to User (who sent request)
  addresseeId: string     // Foreign Key to User (who received request)
  
  status: FriendshipStatus
  createdAt: Date         // Friend request sent
  acceptedAt?: Date       // Friend request accepted
  
  // Settings
  allowGameInvites: boolean
  showOnlineStatus: boolean
}

enum FriendshipStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  BLOCKED = 'blocked'
}
```

**Relationships:**
- Many-to-One with `User` (requester)
- Many-to-One with `User` (addressee)

---

### 11. **Game Event** (For Analytics)
```typescript
interface GameEvent {
  id: string              // Primary Key
  sessionId: string       // Foreign Key to GameSession
  userId?: string         // Foreign Key to User (null for system events)
  
  // Event Information
  eventType: string       // kill, death, item_pickup, skill_used, etc.
  eventData: Record<string, any> // JSON data specific to event type
  timestamp: Date
  gameTime: number        // Time in game (milliseconds)
  
  // Position
  positionX?: number
  positionY?: number
}
```

**Relationships:**
- Many-to-One with `GameSession`
- Many-to-One with `User`

---

### 12. **Custom Skill** 🆕
```typescript
interface CustomSkill {
  id: string              // Primary Key
  name: string           // Skill name
  description: string    // Skill description
  category: SkillCategory // Skill category
  
  // Point System
  pointCost: number      // Customization points required
  maxLevel: number       // Maximum skill level (1-5)
  
  // Effects per level
  effects: SkillEffect[] // Array of effects, indexed by level
  
  // Requirements & Restrictions
  requiredLevel: number  // Player level required
  tankClassRestrictions: TankCategory[] // Which classes can use this
  prerequisites: string[] // Other skill IDs required
  mutualExclusions: string[] // Cannot be equipped together
  
  // Unlock Conditions
  unlockType: SkillUnlockType
  unlockConditions: UnlockCondition[]
  
  // Visual & Audio
  iconAsset: string
  effectAssets: VisualEffectConfig
  soundEffects: AudioEffectConfig
  
  // Meta
  rarity: SkillRarity
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

enum SkillCategory {
  OFFENSIVE = 'offensive',
  DEFENSIVE = 'defensive', 
  UTILITY = 'utility',
  SUPPORT = 'support',
  MOBILITY = 'mobility',
  PASSIVE = 'passive'
}

enum SkillUnlockType {
  ACHIEVEMENT = 'achievement',
  RANDOM_DROP = 'drop',
  LEVEL_UNLOCK = 'level',
  MASTERY_UNLOCK = 'mastery'
}

enum SkillRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare', 
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

interface SkillEffect {
  type: string           // damage, heal, buff, debuff, etc.
  value: number         // Effect magnitude
  duration?: number     // Effect duration (ms)
  range?: number        // Effect range
  cooldown?: number     // Cooldown override
}

interface UnlockCondition {
  type: string          // kill_count, win_games, use_skill, etc.
  value: number         // Required value
  context?: any         // Additional context (tank class, game mode, etc.)
}

interface VisualEffectConfig {
  particles?: string
  animation?: string
  tint?: number
  scale?: number
}

interface AudioEffectConfig {
  activation?: string
  impact?: string
  ambient?: string
}
```

**Relationships:**
- One-to-Many with `UserSkillUnlock`
- Many-to-Many with `PlayerSkillLoadout`

---

### 13. **User Skill Unlock** 🆕
```typescript
interface UserSkillUnlock {
  id: string              // Primary Key
  userId: string          // Foreign Key to User
  skillId: string         // Foreign Key to CustomSkill
  
  // Unlock Information
  unlockedAt: Date
  unlockMethod: SkillUnlockType
  unlockContext?: string  // Achievement ID, session ID, etc.
  
  // Progression
  currentLevel: number    // Current skill level (1-maxLevel)
  usageCount: number      // Times this skill has been used
  lastUsedAt?: Date       // Last time skill was used
  
  // Mastery
  masteryPoints: number   // Points toward mastery
  isMastered: boolean     // Has reached mastery level
  masteredAt?: Date
}
```

**Relationships:**
- Many-to-One with `User`
- Many-to-One with `CustomSkill`

---

### 14. **Player Skill Loadout** 🆕  
```typescript
interface PlayerSkillLoadout {
  id: string              // Primary Key
  userId: string          // Foreign Key to User
  name: string           // Loadout name (e.g., "Tank Killer", "Support Build")
  
  // Loadout Configuration
  tankClassId: string     // Foreign Key to TankClass
  equippedSkills: SkillSlot[] // Array of equipped skills
  totalPointsUsed: number // Sum of all skill point costs
  maxPoints: number       // Maximum points allowed
  
  // Validation
  isValid: boolean        // Passes all restriction checks
  validationErrors: string[] // List of validation issues
  
  // Usage
  isDefault: boolean      // Default loadout for this tank class
  isFavorite: boolean     // User marked as favorite
  usageCount: number      // Times this loadout was used
  lastUsedAt?: Date
  
  // Meta
  createdAt: Date
  updatedAt: Date
  isActive: boolean       // Can be selected
}

interface SkillSlot {
  slotNumber: number      // 1-3 (or configurable max slots)
  skillId: string         // Foreign Key to CustomSkill
  skillLevel: number      // Level of this skill in loadout
  pointsAllocated: number // Points used for this skill
}
```

**Relationships:**
- Many-to-One with `User`
- Many-to-One with `TankClass`
- Many-to-Many with `CustomSkill` (through SkillSlot array)

---

### 15. **Skill Achievement** 🆕
```typescript  
interface SkillAchievement extends Achievement {
  // Inherits from Achievement base class
  
  // Skill-Specific Properties
  rewardSkillIds: string[]    // Skills unlocked by this achievement
  rewardCustomizationPoints: number // Bonus points awarded
  
  // Requirements can include:
  // - Use specific skills X times
  // - Achieve skill mastery
  // - Win games with custom loadouts
  // - Create and share loadouts
}
```

**Relationships:**
- Extends `Achievement`
- Many-to-Many with `CustomSkill` (rewards)

---

### 16. **Skill Usage Analytics** 🆕
```typescript
interface SkillUsageEvent extends GameEvent {
  // Inherits from GameEvent base class
  
  // Skill-Specific Data
  skillId: string           // Foreign Key to CustomSkill
  skillLevel: number        // Skill level used
  loadoutId: string         // Foreign Key to PlayerSkillLoadout
  
  // Usage Context
  targetPosition?: {x: number, y: number}
  targetPlayerId?: string   // If skill targeted another player
  effectiveRange?: number   // Actual range/area affected
  damage?: number          // Damage dealt (if applicable)
  healing?: number         // Healing done (if applicable)
  
  // Outcome
  wasSuccessful: boolean   // Did skill execute successfully
  wasCancelled: boolean    // Was skill interrupted/cancelled
  cooldownStart: Date      // When cooldown began
}
```

**Relationships:**
- Extends `GameEvent`
- Many-to-One with `CustomSkill`
- Many-to-One with `PlayerSkillLoadout`

---

## Data Relationships Summary

### Primary Relationships
```
User (1) ←→ (M) GameSession [host]
User (1) ←→ (M) UserTankMastery
User (1) ←→ (M) UserAchievement  
User (1) ←→ (M) Friendship [both directions]
User (1) ←→ (M) UserSkillUnlock ✨ NEW
User (1) ←→ (M) PlayerSkillLoadout ✨ NEW

GameSession (1) ←→ (M) GameSessionPlayer
GameSession (1) ←→ (M) GameEvent
GameSession (1) ←→ (M) SkillUsageEvent ✨ NEW

TankClass (1) ←→ (M) UserTankMastery
TankClass (1) ←→ (M) GameSessionPlayer
TankClass (1) ←→ (M) PlayerSkillLoadout ✨ NEW

Achievement (1) ←→ (M) UserAchievement
SkillAchievement (1) ←→ (M) CustomSkill [rewards] ✨ NEW

CustomSkill (1) ←→ (M) UserSkillUnlock ✨ NEW
CustomSkill (M) ←→ (M) PlayerSkillLoadout ✨ NEW

GameSessionPlayer (1) ←→ (M) PlayerAction
PlayerSkillLoadout (1) ←→ (M) SkillUsageEvent ✨ NEW
```

### Secondary Relationships
```
MapTemplate (M) ←→ (M) Item [spawn points]
Item (M) ←→ (M) PlayerItemCollection
```

---

## Database Considerations

### Indexes Required
- `User.username` (UNIQUE)
- `User.email` (UNIQUE, SPARSE)
- `GameSession.lobbyCode` (UNIQUE, SPARSE)
- `GameSession.status` + `createdAt`
- `UserTankMastery.userId` + `tankClassId`
- `GameSessionPlayer.sessionId`
- `GameEvent.sessionId` + `timestamp`
- `CustomSkill.category` + `rarity` ✨ NEW
- `UserSkillUnlock.userId` + `skillId` ✨ NEW
- `PlayerSkillLoadout.userId` + `tankClassId` ✨ NEW
- `SkillUsageEvent.skillId` + `timestamp` ✨ NEW

### Performance Optimizations
- Denormalize frequently accessed data (e.g., win rates)
- Use read replicas for analytics queries
- Implement caching for tank class definitions and map templates
- Cache frequently accessed skill loadouts and unlock data ✨ NEW
- Precompute skill usage statistics for balance monitoring ✨ NEW
- Archive completed game sessions after 30 days

### Data Retention Policies
- Game events: Keep for 90 days for analytics
- Game sessions: Archive after 30 days, delete after 1 year
- User data: Retain indefinitely for registered users, 30 days for guests
- Achievements and mastery: Permanent retention
- Skill usage events: Keep for 180 days for balance analysis ✨ NEW
- Skill unlocks and loadouts: Permanent retention ✨ NEW

---

## Future Expansions

### Creative Mode Entities
- `CustomMap` - User-created maps
- `CustomTank` - User-created tank designs
- `MapRating` - Community ratings for custom content

### Monetization Entities  
- `DonationGoal` - Server expansion goals
- `DonationTransaction` - Donation tracking
- `ServerInstance` - Multiple server management

### Tournament System
- `Tournament` - Tournament definitions
- `TournamentParticipant` - Tournament entries
- `TournamentMatch` - Tournament bracket matches

---

*Last Updated: 2025-08-09*
*Version: 1.0*