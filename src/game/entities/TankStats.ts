export interface TankStats {
    // Basic stats
    hp: number;      // Health points
    maxHp: number;   // Maximum health points
    def: number;     // Defense, reduces damage taken
    atk: number;     // Attack power, increases bullet damage
    spellPower: number; // Special ability power
    speed: number;   // Movement speed
    
    // Additional stats that depend on basic stats
    fireRate: number;     // Fire rate in ms between shots
    rotationSpeed: number; // How quickly the tank can turn
}

// Default stats for player tank
export const defaultPlayerStats: TankStats = {
    hp: 1000,
    maxHp: 1000,
    def: 10,
    atk: 50,
    spellPower: 100,
    speed: 150,
    fireRate: 500,
    rotationSpeed: 0.003
};

// Default stats for enemy tanks by type
export const defaultEnemyStats = {
    easy: {
        hp: 50,
        maxHp: 50,
        def: 5,
        atk: 20,
        spellPower: 0,
        speed: 80,
        fireRate: 2500,
        rotationSpeed: 0.015
    },
    medium: {
        hp: 100,
        maxHp: 100,
        def: 10,
        atk: 40,
        spellPower: 30,
        speed: 100,
        fireRate: 2000,
        rotationSpeed: 0.02
    },
    hard: {
        hp: 150,
        maxHp: 150,
        def: 15,
        atk: 100,
        spellPower: 75,
        speed: 120,
        fireRate: 1500,
        rotationSpeed: 0.025
    }
};

// Function to calculate actual damage based on attack and defense
export function calculateDamage(attackerAtk: number, defenderDef: number): number {
    // Simple formula: damage = attack - (defense * 0.5)
    // Ensures minimum damage of 1
    return Math.max(1, attackerAtk - (defenderDef * 0.5));
} 