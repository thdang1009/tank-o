export enum GameMode {
    SOLO = 'solo',
    CHAOS = 'chaos',
    STAGE = 'stage'
}

export interface GameModeDefinition {
    type: GameMode;
    name: string;
    description: string;
    minPlayers: number;
    maxPlayers: number;
    hasTeams: boolean;
}

export const GameModes: Record<GameMode, GameModeDefinition> = {
    [GameMode.SOLO]: {
        type: GameMode.SOLO,
        name: 'Solo Mode',
        description: 'Single player combat against AI enemies. Survive as long as possible and score high!',
        minPlayers: 1,
        maxPlayers: 1,
        hasTeams: false
    },
    [GameMode.CHAOS]: {
        type: GameMode.CHAOS,
        name: 'Chaos Mode',
        description: 'Multiplayer free-for-all on a large map. Last tank standing wins!',
        minPlayers: 2,
        maxPlayers: 8,
        hasTeams: false
    },
    [GameMode.STAGE]: {
        type: GameMode.STAGE,
        name: 'Stage Mode',
        description: 'Team up with friends to explore the map, collect items, and defeat the final boss together.',
        minPlayers: 1,
        maxPlayers: 4,
        hasTeams: true
    }
};

// Helper function to get mode definition by type
export function getGameModeDefinition(modeType: GameMode): GameModeDefinition {
    return GameModes[modeType];
} 