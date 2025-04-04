import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { GameConfig, GameManager } from '../managers/GameManager';
import { MapType } from '../map/MapManager';
import { TankClassType } from '../entities/TankClass';
import { makeAudioPath } from '../../app/utils/asset-utils';
import { GameMode } from '../constants/GameModes';

interface GameSceneData {
    mapType?: MapType;
    tankClass?: TankClassType;
    gameMode?: GameMode;
    stageLevel?: number;
    difficulty?: string;
}

const gameDefaultConfig: GameConfig = {
    initialWave: 1,
    maxWaves: 10,
    enemiesPerWave: 5,
    waveDelay: 1000,
    mapType: MapType.GRASS
}

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    gameManager: GameManager;
    selectedMapType: MapType = MapType.GRASS;
    selectedTankClass: TankClassType = TankClassType.VERSATILE;
    selectedGameMode: GameMode = GameMode.SOLO;
    stageLevel: number = 1;
    difficulty: string = 'Normal';
    
    // HUD elements
    gameModeText: Phaser.GameObjects.Text;

    constructor ()
    {
        super('Game');
    }

    init(data: GameSceneData) {
        this.selectedMapType = data.mapType || MapType.GRASS;
        this.selectedTankClass = data.tankClass || TankClassType.VERSATILE;
        this.selectedGameMode = data.gameMode || GameMode.SOLO;
        
        if (data.stageLevel) {
            this.stageLevel = data.stageLevel;
        }
        
        if (data.difficulty) {
            this.difficulty = data.difficulty;
        }
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        // Ensure physics is initialized before creating GameManager
        if (!this.physics || !this.physics.add) {
            console.error('Physics system not initialized properly');
            return;
        }
        
        // Adjust game configuration based on game mode
        let config = {
            ...gameDefaultConfig,
            mapType: this.selectedMapType,
            tankClass: this.selectedTankClass,
            gameMode: this.selectedGameMode
        };
        
        // Customize config based on game mode
        switch (this.selectedGameMode) {
            case GameMode.SOLO:
                // Default solo configuration is fine
                break;
                
            case GameMode.CHAOS:
                // Chaos mode - fewer enemies, but players fight each other
                config = {
                    ...config,
                    maxWaves: 5,
                    enemiesPerWave: 3,
                    isMultiplayer: true,
                    friendlyFire: true
                };
                break;
                
            case GameMode.STAGE:
                // Stage mode - cooperative with boss at the end
                config = {
                    ...config,
                    maxWaves: this.stageLevel * 2,
                    enemiesPerWave: 4 + Math.floor(this.stageLevel / 2),
                    isMultiplayer: true,
                    hasBoss: true,
                    friendlyFire: false,
                    stageLevel: this.stageLevel,
                    difficulty: this.difficulty
                };
                break;
        }
        
        this.gameManager = new GameManager(this, config);
        this.gameManager.startGame();

        // Add game mode indicator to HUD
        this.createModeHUD();

        EventBus.emit('current-scene-ready', this);
    }
    
    createModeHUD() {
        // Add mode indicator to the top-right corner
        let modeText = 'SOLO MODE';
        let modeColor = '#ffffff';
        
        switch (this.selectedGameMode) {
            case GameMode.SOLO:
                modeText = 'SOLO MODE';
                modeColor = '#88ff88';
                break;
                
            case GameMode.CHAOS:
                modeText = 'CHAOS MODE';
                modeColor = '#ff8888';
                break;
                
            case GameMode.STAGE:
                modeText = `STAGE MODE - LVL ${this.stageLevel}`;
                modeColor = '#88ccff';
                break;
        }
        
        this.gameModeText = this.add.text(
            this.cameras.main.width - 20,
            20,
            modeText,
            {
                fontSize: '18px',
                fontStyle: 'bold',
                color: modeColor,
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(1, 0);
        
        // Make this fixed to the camera
        this.gameModeText.setScrollFactor(0);
        this.gameModeText.setDepth(100);
    }

    override update(time: number, delta: number) {
        if (this.gameManager) {
            this.gameManager.update(time, delta);
        }
    }

    changeScene ()
    {
        this.scene.start('GameOver');
    }
}
