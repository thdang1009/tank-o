import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { ClassSelection } from './scenes/ClassSelection';
import { MapSelection } from './scenes/MapSelection';
import { ModeSelection } from './scenes/ModeSelection';
import { MultiplayerLobby } from './scenes/MultiplayerLobby';
import { StageLobby } from './scenes/StageLobby';
import { LobbyScene } from './scenes/LobbyScene';
import { JoinLobby } from './scenes/JoinLobby';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#028af8',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 }, // No gravity for top-down game
            debug: false
        }
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        ModeSelection,
        MapSelection,
        ClassSelection,
        MainGame,
        MultiplayerLobby,
        StageLobby,
        LobbyScene,
        JoinLobby,
        GameOver
    ]
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
