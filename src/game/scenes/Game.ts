import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { GameManager } from '../managers/GameManager';
import { MapType } from '../map/MapManager';

interface GameSceneData {
    mapType?: MapType;
}

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    gameManager: GameManager;
    selectedMapType: MapType = MapType.GRASS;

    constructor ()
    {
        super('Game');
    }

    init(data: GameSceneData) {
        this.selectedMapType = data.mapType || MapType.GRASS;
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

        this.gameManager = new GameManager(this, {
            initialWave: 1,
            maxWaves: 10,
            enemiesPerWave: 5,
            waveDelay: 5000,
            mapType: this.selectedMapType
        });

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
