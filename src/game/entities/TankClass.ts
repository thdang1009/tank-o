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
    skillName: string;
    skillDescription: string;
    skillSound: string;
    tankBodyAsset: string;
    tankBarrelAsset: string;
    bulletAsset: string;
}

// Function to get cooldown time in ms for each class's special ability
export function getSkillCooldown(classType: TankClassType): number {
    switch(classType) {
        case TankClassType.BRUISER:
            return 15000; // 15 seconds
        case TankClassType.DEALER:
            return 10000; // 10 seconds
        case TankClassType.SUPPORTER:
            return 12000; // 12 seconds
        case TankClassType.VERSATILE:
            return 8000;  // 8 seconds
        case TankClassType.MAGE:
            return 14000; // 14 seconds
        case TankClassType.SPY:
            return 6000;  // 6 seconds
        case TankClassType.DEMOLITION:
            return 18000; // 18 seconds
        case TankClassType.RADAR_SCOUT:
            return 7000;  // 7 seconds
        default:
            return 10000; // Default 10 seconds
    }
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
            def: 25,
            atk: 40,
            spellPower: 80,
            speed: 120,
            fireRate: 800,
            rotationSpeed: 0.0025
        },
        skillName: 'Shield Wall',
        skillDescription: 'Activates a defensive barrier that reduces incoming damage by 75% for 5 seconds.',
        skillSound: AssetsAudioEnum.DEF_BUFF,
        tankBodyAsset: AssetsEnum.TANK_BODY_SAND,
        tankBarrelAsset: AssetsEnum.TANK_SAND_BARREL_2,
        bulletAsset: AssetsEnum.BULLET_SAND_1
    },
    
    [TankClassType.DEALER]: {
        type: TankClassType.DEALER,
        name: 'Damage Dealer',
        description: 'High attack and speed. Specializes in quickly eliminating enemies.',
        stats: {
            hp: 700,
            maxHp: 700,
            def: 8,
            atk: 80,
            spellPower: 120,
            speed: 180,
            fireRate: 350,
            rotationSpeed: 0.004
        },
        skillName: 'Rapid Fire',
        skillDescription: 'Temporarily increases damage by 200% for 3 seconds.',
        skillSound: AssetsAudioEnum.ATK_BUFF,
        tankBodyAsset: AssetsEnum.TANK_BODY_RED,
        tankBarrelAsset: AssetsEnum.TANK_RED_BARREL_2,
        bulletAsset: AssetsEnum.BULLET_RED_1
    },
    
    [TankClassType.SUPPORTER]: {
        type: TankClassType.SUPPORTER,
        name: 'Supporter',
        description: 'Fast and versatile. Provides healing and buffs to teammates.',
        stats: {
            hp: 850,
            maxHp: 850,
            def: 10,
            atk: 35,
            spellPower: 150,
            speed: 170,
            fireRate: 600,
            rotationSpeed: 0.0035
        },
        skillName: 'Repair Pulse',
        skillDescription: 'Emits a pulse that heals the player and repairs allied tanks in range.',
        skillSound: AssetsAudioEnum.HEAL,
        tankBodyAsset: AssetsEnum.TANK_BODY_GREEN,
        tankBarrelAsset: AssetsEnum.TANK_GREEN_BARREL_2,
        bulletAsset: AssetsEnum.BULLET_GREEN_1
    },
    
    [TankClassType.VERSATILE]: {
        type: TankClassType.VERSATILE,
        name: 'Versatile',
        description: 'Balanced stats with stealth capabilities. Can detect hidden items.',
        stats: {
            hp: 1000,
            maxHp: 1000,
            def: 15,
            atk: 50,
            spellPower: 100,
            speed: 150,
            fireRate: 500,
            rotationSpeed: 0.003
        },
        skillName: 'Stealth Mode',
        skillDescription: 'Becomes temporarily invisible to enemies and reveals hidden items.',
        skillSound: AssetsAudioEnum.DISAPPEAR,
        tankBodyAsset: AssetsEnum.TANK_BODY_BLUE,
        tankBarrelAsset: AssetsEnum.TANK_BLUE_BARREL_2,
        bulletAsset: AssetsEnum.BULLET_BLUE_1
    },
    
    [TankClassType.MAGE]: {
        type: TankClassType.MAGE,
        name: 'Mage',
        description: 'Master of elemental magic with powerful spell abilities.',
        stats: {
            hp: 600,
            maxHp: 600,
            def: 5,
            atk: 30,
            spellPower: 200,
            speed: 140,
            fireRate: 700,
            rotationSpeed: 0.0025
        },
        skillName: 'Fireball',
        skillDescription: 'Launches a devastating fireball that deals massive area damage.',
        skillSound: AssetsAudioEnum.EXPLOSION,
        tankBodyAsset: AssetsEnum.TANK_BODY_DARK,
        tankBarrelAsset: AssetsEnum.TANK_DARK_BARREL_3,
        bulletAsset: AssetsEnum.BULLET_DARK_2
    },
    
    [TankClassType.SPY]: {
        type: TankClassType.SPY,
        name: 'Spy',
        description: 'Fast and sneaky with enhanced reconnaissance abilities.',
        stats: {
            hp: 550,
            maxHp: 550,
            def: 3,
            atk: 45,
            spellPower: 80,
            speed: 220,
            fireRate: 300,
            rotationSpeed: 0.005
        },
        skillName: 'Shadow Clone',
        skillDescription: 'Creates decoy clones that confuse enemies.',
        skillSound: AssetsAudioEnum.DISAPPEAR,
        tankBodyAsset: AssetsEnum.TANK_BODY_DARK,
        tankBarrelAsset: AssetsEnum.TANK_DARK_BARREL_1,
        bulletAsset: AssetsEnum.BULLET_DARK_1
    },
    
    [TankClassType.DEMOLITION]: {
        type: TankClassType.DEMOLITION,
        name: 'Demolition',
        description: 'Heavy artillery specialist with explosive ordnance.',
        stats: {
            hp: 1200,
            maxHp: 1200,
            def: 20,
            atk: 100,
            spellPower: 180,
            speed: 100,
            fireRate: 1200,
            rotationSpeed: 0.002
        },
        skillName: 'Carpet Bomb',
        skillDescription: 'Calls in an artillery strike over a large area.',
        skillSound: AssetsAudioEnum.EXPLOSION,
        tankBodyAsset: AssetsEnum.TANK_BODY_HUGE,
        tankBarrelAsset: AssetsEnum.BARREL_BLACK_TOP,
        bulletAsset: AssetsEnum.BULLET_RED_3
    },
    
    [TankClassType.RADAR_SCOUT]: {
        type: TankClassType.RADAR_SCOUT,
        name: 'Radar Scout',
        description: 'Fast reconnaissance tank with enhanced detection capabilities.',
        stats: {
            hp: 650,
            maxHp: 650,
            def: 8,
            atk: 55,
            spellPower: 90,
            speed: 200,
            fireRate: 400,
            rotationSpeed: 0.004
        },
        skillName: 'Radar Sweep',
        skillDescription: 'Reveals all enemies and items on the map for 10 seconds.',
        skillSound: AssetsAudioEnum.SPEED_UP,
        tankBodyAsset: AssetsEnum.TANK_BODY_GREEN,
        tankBarrelAsset: AssetsEnum.TANK_GREEN_BARREL_1,
        bulletAsset: AssetsEnum.BULLET_GREEN_2
    }
};

// Helper function to get class definition by type
export function getTankClassDefinition(classType: TankClassType): TankClassDefinition {
    return TankClasses[classType];
} 