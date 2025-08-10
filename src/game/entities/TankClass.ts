import { AssetsAudioEnum, AssetsEnum } from '../../app/constants/assets-enum';
import { TankStats } from './TankStats';

// Import shared enum instead of defining locally
import { TankClassType } from '../../shared/enums/game-enums';

// Re-export the TankClassType enum for backward compatibility
export { TankClassType } from '../../shared/enums/game-enums';

export interface TankClassDefinition {
    type: TankClassType;
    name: string;
    description: string;
    stats: TankStats;
    // Skill 1 (Q key)
    skill1Name: string;
    skill1Description: string;
    skill1Sound: string;
    // Skill 2 (E key)
    skill2Name: string;
    skill2Description: string;
    skill2Sound: string;
    // Ultimate (R key)
    ultimateName: string;
    ultimateDescription: string;
    ultimateSound: string;
    tankBodyAsset: string;
    tankBarrelAsset: string;
    bulletAsset: string;
    // Backward compatibility (will be removed)
    skillName?: string;
    skillDescription?: string; 
    skillSound?: string;
}

// Function to get cooldown time in ms for each skill type
export function getSkillCooldown(classType: TankClassType, skillSlot: 'skill1' | 'skill2' | 'ultimate' = 'skill1'): number {
    const cooldowns = {
        [TankClassType.BRUISER]: { skill1: 8000, skill2: 15000, ultimate: 45000 },
        [TankClassType.DEALER]: { skill1: 6000, skill2: 10000, ultimate: 35000 },
        [TankClassType.SUPPORTER]: { skill1: 10000, skill2: 12000, ultimate: 40000 },
        [TankClassType.VERSATILE]: { skill1: 5000, skill2: 8000, ultimate: 30000 },
        [TankClassType.MAGE]: { skill1: 6000, skill2: 6000, ultimate: 50000 },
        [TankClassType.SPY]: { skill1: 10000, skill2: 8000, ultimate: 25000 },
        [TankClassType.DEMOLITION]: { skill1: 15000, skill2: 18000, ultimate: 60000 },
        [TankClassType.RADAR_SCOUT]: { skill1: 5000, skill2: 7000, ultimate: 30000 },
        [TankClassType.ICE_TANK]: { skill1: 8000, skill2: 12000, ultimate: 40000 }
    };
    
    return cooldowns[classType]?.[skillSlot] || 10000;
}

// Import will need to be updated with actual asset enums
export const TankClasses: Record<TankClassType, TankClassDefinition> = {
    [TankClassType.BRUISER]: {
        type: TankClassType.BRUISER,
        name: 'Bruiser',
        description: 'High HP and defense. Excels at absorbing damage and protecting allies.',
        stats: {
            hp: 1500,
            maxHp: 1500,
            def: 20,
            atk: 15,
            spellPower: 0,
            speed: 120,
            fireRate: 800,
            rotationSpeed: 0.0025
        },
        skill1Name: 'Shield Wall',
        skill1Description: 'Activates a defensive barrier that reduces incoming damage by 75% for 8 seconds.',
        skill1Sound: AssetsAudioEnum.DEF_BUFF,
        skill2Name: 'Shockwave Slam',
        skill2Description: 'Slams the ground creating a shockwave that damages and slows all nearby enemies.',
        skill2Sound: AssetsAudioEnum.EXPLOSION,
        ultimateName: 'Fortress Mode',
        ultimateDescription: 'Become immobile but gain 90% damage resistance and reflect 50% damage back to attackers.',
        ultimateSound: AssetsAudioEnum.DEF_BUFF,
        tankBodyAsset: AssetsEnum.TANK_BODY_SAND,
        tankBarrelAsset: AssetsEnum.TANK_SAND_BARREL_2,
        bulletAsset: AssetsEnum.BULLET_SAND_1,
        // Backward compatibility
        skillName: 'Shield Wall',
        skillDescription: 'Activates a defensive barrier that reduces incoming damage by 75% for 8 seconds.',
        skillSound: AssetsAudioEnum.DEF_BUFF
    },
    
    [TankClassType.DEALER]: {
        type: TankClassType.DEALER,
        name: 'Damage Dealer',
        description: 'High attack and speed. Specializes in quickly eliminating enemies.',
        stats: {
            hp: 700,
            maxHp: 700,
            def: 4,
            atk: 40,
            spellPower: 0,
            speed: 180,
            fireRate: 350,
            rotationSpeed: 0.004
        },
        skill1Name: 'Rapid Fire',
        skill1Description: 'Temporarily doubles fire rate for 3 seconds.',
        skill1Sound: AssetsAudioEnum.ATK_BUFF,
        skill2Name: 'Precision Shot',
        skill2Description: 'Fires a high-damage piercing bullet that ignores armor.',
        skill2Sound: AssetsAudioEnum.SHOOT,
        ultimateName: 'Bullet Storm',
        ultimateDescription: 'Unleashes a devastating barrage of bullets in all directions.',
        ultimateSound: AssetsAudioEnum.EXPLOSION,
        tankBodyAsset: AssetsEnum.TANK_BODY_RED,
        tankBarrelAsset: AssetsEnum.TANK_RED_BARREL_2,
        bulletAsset: AssetsEnum.BULLET_RED_1,
        // Backward compatibility
        skillName: 'Rapid Fire',
        skillDescription: 'Temporarily doubles fire rate for 3 seconds.',
        skillSound: AssetsAudioEnum.ATK_BUFF
    },
    
    [TankClassType.SUPPORTER]: {
        type: TankClassType.SUPPORTER,
        name: 'Supporter',
        description: 'Fast and versatile. Provides healing and buffs to teammates.',
        stats: {
            hp: 850,
            maxHp: 850,
            def: 5,
            atk: 10,
            spellPower: 50,
            speed: 170,
            fireRate: 600,
            rotationSpeed: 0.0035
        },
        skill1Name: 'Repair Pulse',
        skill1Description: 'Emits a pulse that heals the player and repairs allied tanks in range.',
        skill1Sound: AssetsAudioEnum.HEAL,
        skill2Name: 'Energy Shield',
        skill2Description: 'Creates a protective barrier around nearby allies.',
        skill2Sound: AssetsAudioEnum.DEF_BUFF,
        ultimateName: 'Mass Restoration',
        ultimateDescription: 'Fully heals all allies and removes debuffs in a large area.',
        ultimateSound: AssetsAudioEnum.REVIVE,
        tankBodyAsset: AssetsEnum.TANK_BODY_GREEN,
        tankBarrelAsset: AssetsEnum.TANK_GREEN_BARREL_2,
        bulletAsset: AssetsEnum.BULLET_GREEN_1,
        // Backward compatibility
        skillName: 'Repair Pulse',
        skillDescription: 'Emits a pulse that heals the player and repairs allied tanks in range.',
        skillSound: AssetsAudioEnum.HEAL
    },
    
    [TankClassType.VERSATILE]: {
        type: TankClassType.VERSATILE,
        name: 'Versatile',
        description: 'Balanced stats with stealth capabilities. Can detect hidden items.',
        stats: {
            hp: 1000,
            maxHp: 1000,
            def: 8,
            atk: 30,
            spellPower: 0,
            speed: 150,
            fireRate: 500,
            rotationSpeed: 0.003
        },
        skill1Name: 'Triple Rocket Barrage',
        skill1Description: 'Launches 3 homing rockets that auto-target the nearest enemies, each dealing 50 damage.',
        skill1Sound: AssetsAudioEnum.SHOOT,
        skill2Name: 'Self Repair',
        skill2Description: 'Heals the tank for a moderate amount of HP instantly.',
        skill2Sound: AssetsAudioEnum.HEAL,
        ultimateName: 'Devastation Strike',
        ultimateDescription: 'Deals 50-150 random damage and stuns all enemies for 3 seconds.',
        ultimateSound: AssetsAudioEnum.EXPLOSION,
        tankBodyAsset: AssetsEnum.TANK_BODY_BLUE,
        tankBarrelAsset: AssetsEnum.TANK_BLUE_BARREL_2,
        bulletAsset: AssetsEnum.BULLET_BLUE_1,
        // Backward compatibility
        skillName: 'Triple Rocket Barrage',
        skillDescription: 'Launches 3 homing rockets that auto-target the nearest enemies, each dealing 50 damage.',
        skillSound: AssetsAudioEnum.SHOOT
    },
    
    [TankClassType.MAGE]: {
        type: TankClassType.MAGE,
        name: 'Mage',
        description: 'Master of elemental magic with powerful spell abilities. Normal atk is so weak',
        stats: {
            hp: 600,
            maxHp: 600,
            def: 0,
            atk: 1,
            spellPower: 200,
            speed: 140,
            fireRate: 700,
            rotationSpeed: 0.0025
        },
        skill1Name: 'Fireball',
        skill1Description: 'Launches a devastating fireball that deals massive area damage.',
        skill1Sound: AssetsAudioEnum.EXPLOSION,
        skill2Name: 'Lightning Bolt',
        skill2Description: 'Strikes enemies with instant chain lightning damage.',
        skill2Sound: AssetsAudioEnum.SPEED_UP,
        ultimateName: 'Meteor',
        ultimateDescription: 'Calls down a massive meteor that devastates a large area.',
        ultimateSound: AssetsAudioEnum.EXPLOSION,
        tankBodyAsset: AssetsEnum.TANK_BODY_DARK,
        tankBarrelAsset: AssetsEnum.TANK_DARK_BARREL_3,
        bulletAsset: AssetsEnum.BULLET_DARK_2,
        // Backward compatibility
        skillName: 'Fireball',
        skillDescription: 'Launches a devastating fireball that deals massive area damage.',
        skillSound: AssetsAudioEnum.EXPLOSION
    },
    
    [TankClassType.SPY]: {
        type: TankClassType.SPY,
        name: 'Spy',
        description: 'Fast and sneaky with enhanced reconnaissance abilities.',
        stats: {
            hp: 550,
            maxHp: 550,
            def: 1,
            atk: 25,
            spellPower: 0,
            speed: 220,
            fireRate: 300,
            rotationSpeed: 0.005
        },
        skill1Name: 'Cloak',
        skill1Description: 'Briefly enters stealth, becoming invisible to enemies. Moving or attacking breaks stealth.',
        skill1Sound: AssetsAudioEnum.DISAPPEAR,
        skill2Name: 'Smoke Bomb',
        skill2Description: 'Throws a smoke bomb that creates a cloud, obscuring vision for enemies and breaking projectile targeting.',
        skill2Sound: AssetsAudioEnum.STEALTH_ACTIVATE,
        ultimateName: 'Assassination',
        ultimateDescription: 'Teleports behind target enemy and deals massive backstab damage.',
        ultimateSound: AssetsAudioEnum.DISAPPEAR,
        tankBodyAsset: AssetsEnum.TANK_BODY_DARK,
        tankBarrelAsset: AssetsEnum.TANK_DARK_BARREL_1,
        bulletAsset: AssetsEnum.BULLET_DARK_1,
        // Backward compatibility
        skillName: 'Cloak',
        skillDescription: 'Briefly enters stealth, becoming invisible to enemies. Moving or attacking breaks stealth.',
        skillSound: AssetsAudioEnum.DISAPPEAR
    },
    
    [TankClassType.DEMOLITION]: {
        type: TankClassType.DEMOLITION,
        name: 'Demolition',
        description: 'Heavy artillery specialist with explosive ordnance.',
        stats: {
            hp: 1200,
            maxHp: 1200,
            def: 10,
            atk: 60,
            spellPower: 0,
            speed: 100,
            fireRate: 1200,
            rotationSpeed: 0.002
        },
        skill1Name: 'Carpet Bomb',
        skill1Description: 'Calls in an artillery strike over a large area.',
        skill1Sound: AssetsAudioEnum.EXPLOSION,
        skill2Name: 'Mine Field',
        skill2Description: 'Deploys explosive mines that detonate when enemies approach.',
        skill2Sound: AssetsAudioEnum.ARTILLERY_WHISTLE,
        ultimateName: 'Nuclear Strike',
        ultimateDescription: 'Unleashes a devastating nuclear explosion with massive range.',
        ultimateSound: AssetsAudioEnum.EXPLOSION,
        tankBodyAsset: AssetsEnum.TANK_BODY_HUGE,
        tankBarrelAsset: AssetsEnum.BARREL_BLACK_TOP,
        bulletAsset: AssetsEnum.BULLET_RED_3,
        // Backward compatibility
        skillName: 'Carpet Bomb',
        skillDescription: 'Calls in an artillery strike over a large area.',
        skillSound: AssetsAudioEnum.EXPLOSION
    },
    
    [TankClassType.RADAR_SCOUT]: {
        type: TankClassType.RADAR_SCOUT,
        name: 'Radar Scout',
        description: 'Fast reconnaissance tank with enhanced detection capabilities.',
        stats: {
            hp: 650,
            maxHp: 650,
            def: 4,
            atk: 35,
            spellPower: 0,
            speed: 200,
            fireRate: 400,
            rotationSpeed: 0.004
        },
        skill1Name: 'Radar Sweep',
        skill1Description: 'Reveals all enemies and items on the map for 10 seconds.',
        skill1Sound: AssetsAudioEnum.RADAR_PING,
        skill2Name: 'EMP Blast',
        skill2Description: 'Disables enemy electronics and slows their movement.',
        skill2Sound: AssetsAudioEnum.SPEED_UP,
        ultimateName: 'Orbital Strike',
        ultimateDescription: 'Calls in precise satellite bombardment on marked targets.',
        ultimateSound: AssetsAudioEnum.ARTILLERY_WHISTLE,
        tankBodyAsset: AssetsEnum.TANK_BODY_GREEN,
        tankBarrelAsset: AssetsEnum.TANK_GREEN_BARREL_1,
        bulletAsset: AssetsEnum.BULLET_GREEN_2,
        // Backward compatibility
        skillName: 'Radar Sweep',
        skillDescription: 'Reveals all enemies and items on the map for 10 seconds.',
        skillSound: AssetsAudioEnum.SPEED_UP
    },
    
    [TankClassType.ICE_TANK]: {
        type: TankClassType.ICE_TANK,
        name: 'Ice Tank (Blizzard)',
        description: 'Master of ice magic with slowing attacks and area control abilities.',
        stats: {
            hp: 900,
            maxHp: 900,
            def: 9,
            atk: 30,
            spellPower: 130,
            speed: 130,
            fireRate: 650,
            rotationSpeed: 0.0028
        },
        skill1Name: 'Frost Nova',
        skill1Description: 'Emits a burst of icy energy that damages and heavily slows all nearby enemies.',
        skill1Sound: AssetsAudioEnum.ICE_FREEZE,
        skill2Name: 'Ice Wall',
        skill2Description: 'Creates a barrier of ice that blocks projectiles and slows enemies.',
        skill2Sound: AssetsAudioEnum.ICE_FREEZE,
        ultimateName: 'Absolute Zero',
        ultimateDescription: 'Freezes the entire battlefield, dealing massive damage and stunning all enemies.',
        ultimateSound: AssetsAudioEnum.ICE_FREEZE,
        tankBodyAsset: AssetsEnum.TANK_BODY_BLUE, // Will be tinted white for ice theme
        tankBarrelAsset: AssetsEnum.TANK_BLUE_BARREL_3, // Will be tinted white
        bulletAsset: AssetsEnum.BULLET_BLUE_3,
        // Backward compatibility
        skillName: 'Frost Nova',
        skillDescription: 'Emits a burst of icy energy that damages and heavily slows all nearby enemies.',
        skillSound: AssetsAudioEnum.ICE_FREEZE
    }
};

// Helper function to get class definition by type
export function getTankClassDefinition(classType: TankClassType): TankClassDefinition {
    return TankClasses[classType];
} 