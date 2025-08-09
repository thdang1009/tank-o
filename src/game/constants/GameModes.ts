// Import shared enum instead of defining locally
import { GameMode } from '../../shared/enums/game-enums';

// Re-export the GameMode enum for backward compatibility
export { GameMode } from '../../shared/enums/game-enums';

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
    [GameMode.BATTLE_ROYALE]: {
        type: GameMode.BATTLE_ROYALE,
        name: 'Battle Royale',
        description: 'Fight to be the last tank standing in an ever-shrinking battlefield.',
        minPlayers: 4,
        maxPlayers: 20,
        hasTeams: false
    },
    [GameMode.CAPTURE_FLAG]: {
        type: GameMode.CAPTURE_FLAG,
        name: 'Capture the Flag',
        description: 'Work with your team to capture the enemy flag while defending your own.',
        minPlayers: 4,
        maxPlayers: 12,
        hasTeams: true
    },
    [GameMode.TEAM_PVE]: {
        type: GameMode.TEAM_PVE,
        name: 'Adventure Mode',
        description: 'Team up with friends to explore the map, collect items, and defeat the final boss together.',
        minPlayers: 1,
        maxPlayers: 4,
        hasTeams: true
    },
    [GameMode.TEAM_PVP]: {
        type: GameMode.TEAM_PVP,
        name: 'Team Deathmatch',
        description: '5v5 competitive team battles. Coordinate with your team to dominate the battlefield.',
        minPlayers: 2,
        maxPlayers: 10,
        hasTeams: true
    },
    [GameMode.TRAINING]: {
        type: GameMode.TRAINING,
        name: 'Training Mode',
        description: 'Practice your skills against training dummies and learn the basics.',
        minPlayers: 1,
        maxPlayers: 1,
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