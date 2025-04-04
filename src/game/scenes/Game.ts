import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { GameConfig, GameManager } from '../managers/GameManager';
import { MapType } from '../map/MapManager';
import { TankClassType } from '../entities/TankClass';
import { makeAudioPath } from '../../app/utils/asset-utils';

interface GameSceneData {
    mapType?: MapType;
    tankClass?: TankClassType;
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

    constructor ()
    {
        super('Game');
    }

    init(data: GameSceneData) {
        this.selectedMapType = data.mapType || MapType.GRASS;
        this.selectedTankClass = data.tankClass || TankClassType.VERSATILE;
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
        const config = {
            ...gameDefaultConfig,
            mapType: this.selectedMapType,
            tankClass: this.selectedTankClass
        }
        this.gameManager = new GameManager(this, config);

        this.gameManager.startGame();

        EventBus.emit('current-scene-ready', this);
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
