import { AssetsAudioEnum, AssetsEnum } from '../../app/constants/assets-enum';
import { TankStats } from './TankStats';

export enum TankClassType {
    BRUISER = 'bruiser',
    DEALER = 'dealer',
    SUPPORTER = 'supporter',
    VERSATILE = 'versatile'
}

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
    }
};

// Helper function to get class definition by type
export function getTankClassDefinition(classType: TankClassType): TankClassDefinition {
    return TankClasses[classType];
} 