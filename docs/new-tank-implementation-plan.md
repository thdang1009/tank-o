# New Tank Implementation Plan

## Overview
This document outlines the implementation approach for the New Tank Brainstorming Ideas from the PRD. These tanks represent advanced concepts that can be implemented once the core customizable skill system is in place.

---

## Implementation Priority & Phases

### Phase 1: Foundation Tanks (High Priority)
*These can be implemented with current system architecture*

#### 1. **Flamethrower Tank (The "Inferno")**
**Concept:** Close-range, sustained area damage with burning effects.

**Implementation Approach:**
```typescript
// New TankClassType addition
ICE_TANK = 'ice_tank', // ✅ Already implemented
FLAMETHROWER = 'flamethrower' // 🆕 New

// Stats Design
stats: {
    hp: 1000,     // Medium tankiness
    def: 15,      // Moderate defense
    atk: 45,      // Moderate base damage
    spellPower: 140, // High for fire abilities
    speed: 110,   // Slow movement (close-range specialist)
    fireRate: 400, // Fast fire rate for continuous damage
    rotationSpeed: 0.003
}

// Skills Implementation
- Skill 1: Napalm Spray - Continuous cone-shaped damage area
- Skill 2: Fuel Burst - Explosion around tank with knockback
- Ultimate: Firestorm - Large persistent fire zone
```

**Technical Requirements:**
- **Area Effect System**: Cone-shaped damage zones
- **Burn DoT Mechanic**: Damage over time effects
- **Persistent Areas**: Fire zones that last over time
- **Proximity Detection**: Range-based damage calculation

---

#### 2. **Juggernaut Tank (The "Wall")**
**Concept:** Immobile but incredibly tough area control tank.

**Implementation Approach:**
```typescript
// Enhanced TankClassType
JUGGERNAUT = 'juggernaut' // 🆕 New

// Stats Design - Extreme tankiness, low mobility
stats: {
    hp: 2000,     // Highest HP in game
    def: 40,      // Extremely high defense
    atk: 30,      // Low damage output
    spellPower: 60, // Low spell power
    speed: 80,    // Very slow base speed
    fireRate: 1000, // Slow fire rate
    rotationSpeed: 0.0015 // Slow turning
}

// Skills Implementation
- Skill 1: Entrench - Root in place, massive defense boost
- Skill 2: Taunt Protocol - Force enemy targeting
- Ultimate: Immovable Object - Complete invulnerability
```

**Technical Requirements:**
- **Movement Lock System**: Ability to disable player movement
- **Taunt/Aggro System**: Force AI targeting specific players
- **Invulnerability Mechanic**: Temporary damage immunity
- **Defense Scaling**: Dynamic stat modification system

---

### Phase 2: Advanced Mechanics Tanks (Medium Priority)
*Require new game systems to be implemented*

#### 3. **Gravity Tank (The "Vortex")**
**Concept:** Manipulates gravity to control enemy movement and projectiles.

**Implementation Approach:**
```typescript
GRAVITY = 'gravity' // 🆕 New

// New Game Systems Required:
interface GravityField {
    center: {x: number, y: number};
    radius: number;
    strength: number; // Pull/push force
    affectedTypes: ('players' | 'bullets' | 'enemies')[];
    duration: number;
}

class GravitySystem {
    private activeFields: GravityField[] = [];
    
    createGravityField(config: GravityField): void;
    applyGravityForces(deltaTime: number): void;
    deflectProjectiles(bullet: Bullet): void;
}
```

**Technical Requirements:**
- **Physics Force System**: Apply forces to entities
- **Projectile Deflection**: Modify bullet trajectories
- **Area-based Effects**: Multi-target force application
- **Visual Distortion**: Screen effects for gravity fields

---

#### 4. **Swarm Tank (The "Hive")**
**Concept:** Summons smaller robotic drones to assist in combat.

**Implementation Approach:**
```typescript
SWARM = 'swarm' // 🆕 New

// New Entity Types Required:
class Drone extends GameObjects.Sprite {
    owner: Player;
    hp: number;
    damage: number;
    lifespan: number;
    aiTarget: Player | null;
    
    update(): void; // AI behavior
    attack(target: Player): void;
    followOwner(): void;
}

class SwarmManager {
    private activeDrones: Map<string, Drone[]> = new Map();
    
    spawnDrone(owner: Player, config: DroneConfig): Drone;
    manageDroneAI(): void;
    cleanupExpiredDrones(): void;
}
```

**Technical Requirements:**
- **AI Companion System**: Independent entity AI
- **Multi-entity Management**: Handle multiple active entities per player
- **Targeting System**: Drone target acquisition
- **Lifespan Management**: Auto-cleanup of temporary entities

---

### Phase 3: Complex System Tanks (Lower Priority)
*Require major new game features*

#### 5. **Harvester Tank (The "Scavenger")**
**Concept:** Gains strength by collecting resources, becoming more powerful over time.

**Implementation Approach:**
```typescript
HARVESTER = 'harvester' // 🆕 New

// New Systems Required:
interface ResourceSystem {
    itemDrops: Map<string, ItemDrop>;
    playerResources: Map<string, ResourceCollection>;
}

interface StatScaling {
    baseStats: TankStats;
    currentMultipliers: Record<string, number>;
    resourceThresholds: ResourceThreshold[];
}

class ProgressionSystem {
    applyResourceBoosts(player: Player): void;
    calculateStatMultipliers(resources: ResourceCollection): Record<string, number>;
    handleResourceCollection(player: Player, item: ItemDrop): void;
}
```

**Technical Requirements:**
- **Resource Drop System**: Items that drop from enemies
- **Dynamic Stat Scaling**: Stats that change during match
- **Resource Collection UI**: Visual feedback for progression
- **Persistent Match Data**: Track progression within match

---

#### 6. **Teleport Tank (The "Blink")**
**Concept:** High mobility with instant teleportation abilities.

**Implementation Approach:**
```typescript
TELEPORT = 'teleport' // 🆕 New

// New Mechanics Required:
interface TeleportSystem {
    validateTeleportPosition(from: Position, to: Position): boolean;
    executeInstantTeleport(player: Player, targetPos: Position): void;
    createDecoy(player: Player, duration: number): DecoyEntity;
    handleGroupTeleport(players: Player[], targetPos: Position): void;
}

class DecoyEntity extends GameObjects.Sprite {
    explosionDamage: number;
    explosionRadius: number;
    duration: number;
    
    explode(): void;
}
```

**Technical Requirements:**
- **Instant Position Change**: Collision-safe teleportation
- **Pathfinding Validation**: Ensure teleport targets are valid
- **Decoy Entity System**: Temporary fake player entities  
- **Group Movement**: Multi-player teleportation for ultimate

---

## Implementation Strategy

### Technical Architecture Requirements

#### 1. **Enhanced Entity System**
```typescript
// Base entity class expansion
abstract class GameEntity {
    // Current properties...
    
    // New properties for advanced tanks
    temporaryEffects: TemporaryEffect[] = [];
    companions: GameEntity[] = [];
    resourceInventory: ResourceCollection = {};
    
    // New methods
    abstract applyTemporaryEffect(effect: TemporaryEffect): void;
    abstract manageCompanions(): void;
    abstract updateResources(): void;
}
```

#### 2. **Advanced Physics Integration**
```typescript
interface AdvancedPhysicsConfig {
    gravityFields: GravityField[];
    forceApplications: ForceEffect[];
    projectileDeflection: boolean;
    areaEffectTracking: boolean;
}

class AdvancedPhysicsSystem extends PhysicsSystem {
    applyGravityEffects(): void;
    handleProjectileDeflection(): void;
    manageAreaEffects(): void;
    calculateComplexCollisions(): void;
}
```

#### 3. **AI Companion Framework**
```typescript
interface AIBehavior {
    target: GameEntity | null;
    state: AIState;
    priorities: AIAction[];
}

class CompanionAI {
    behavior: AIBehavior;
    
    updateAI(deltaTime: number): void;
    findBestTarget(): GameEntity | null;
    executeAction(action: AIAction): void;
}
```

### Implementation Phases

#### Phase 1: Foundation (Weeks 1-3)
1. **Enhanced Entity System** - Extend base classes
2. **Temporary Effects Framework** - DoT, buffs, debuffs system
3. **Advanced Collision Detection** - Area effects and complex shapes
4. **Resource Management** - Item drops and collection system

#### Phase 2: Advanced Mechanics (Weeks 4-7)  
1. **Gravity Physics System** - Force application framework
2. **AI Companion System** - Independent entity AI
3. **Teleportation System** - Instant movement with validation
4. **Dynamic Stat Scaling** - Runtime stat modifications

#### Phase 3: Complex Features (Weeks 8-12)
1. **Multi-entity Management** - Handle swarms and companions
2. **Advanced Visual Effects** - Gravity distortion, teleport effects
3. **Persistence Systems** - Match-long progression tracking
4. **Balance & Testing** - Extensive playtesting and adjustment

---

## Integration with Existing Systems

### Skill System Integration
```typescript
// Enhanced SkillSystem to support advanced tank abilities
class AdvancedSkillSystem extends SkillSystem {
    private gravitySystem: GravitySystem;
    private companionManager: CompanionManager;
    private teleportValidator: TeleportValidator;
    
    // New skill activation methods
    private activateGravitySkill(player: Player, config: GravityConfig): ActiveSkill;
    private activateSwarmSkill(player: Player, droneConfig: DroneConfig): ActiveSkill;
    private activateTeleportSkill(player: Player, targetPos: Position): ActiveSkill;
}
```

### Game Mode Compatibility
- **Solo Mode**: All tanks functional with AI enemies
- **PvP Modes**: Balanced for competitive play
- **Cooperative Modes**: Enhanced team synergies
- **Boss Battles**: Ultimate abilities designed for big encounters

### Performance Considerations
- **Entity Limits**: Max companions/effects per player
- **Physics Optimization**: Efficient area effect calculations  
- **Memory Management**: Proper cleanup of temporary entities
- **Network Optimization**: Minimal data for complex abilities

---

## Conclusion

The new tank concepts represent significant expansions to the game's mechanical complexity. Implementation should be phased to allow for proper testing and balance refinement. Priority should be given to tanks that enhance the current gameplay experience while gradually introducing more complex mechanics.

**Recommended Implementation Order:**
1. Flamethrower Tank (immediate - extends current fire mechanics)
2. Juggernaut Tank (short-term - adds defensive gameplay variety)
3. Gravity Tank (medium-term - introduces physics manipulation)
4. Swarm Tank (medium-term - adds companion mechanics)
5. Harvester Tank (long-term - requires resource systems)
6. Teleport Tank (long-term - complex mobility mechanics)

Each implementation phase should include comprehensive testing, balance adjustments, and performance optimization before proceeding to the next phase.

---

*Document Version: 1.0*  
*Created: 2025-08-09*  
*Status: Planning Phase*