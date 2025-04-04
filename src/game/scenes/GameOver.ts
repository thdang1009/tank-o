import { PhaserAngularEventBus } from '../PhaserAngularEventBus';
import { Scene } from 'phaser';
import { AssetsEnum } from '../../app/constants/assets-enum';

interface GameOverSceneData {
    victory?: boolean;
    score?: number;
}

export class GameOver extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    title: Phaser.GameObjects.Text;
    scoreText: Phaser.GameObjects.Text;
    restartText: Phaser.GameObjects.Text;
    isVictory: boolean = false;
    finalScore: number = 0;

    constructor ()
    {
        super('GameOver');
    }

    init(data: GameOverSceneData) {
        // Initialize with data from the previous scene
        this.isVictory = data.victory || false;
        this.finalScore = data.score || 0;
    }

    create ()
    {
        this.camera = this.cameras.main
        this.camera.setBackgroundColor(0x000000);

        this.background = this.add.image(512, 384, AssetsEnum.BACKGROUND);
        this.background.setAlpha(0.3);

        // Game over title - different based on victory or defeat
        const titleText = this.isVictory ? 'VICTORY!' : 'GAME OVER';
        const titleColor = this.isVictory ? '#ffff00' : '#ff0000';
        
        this.title = this.add.text(512, 250, titleText, {
            fontFamily: 'Arial Black', fontSize: 64, color: titleColor,
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Display the final score
        this.scoreText = this.add.text(512, 350, `Your Score: ${this.finalScore}`, {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Add restart button
        this.restartText = this.add.text(512, 450, 'Click to Play Again', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#00ff00',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        
        // Make the restart text interactive
        this.restartText.setInteractive({ useHandCursor: true });
        this.restartText.on('pointerdown', () => {
            this.scene.start('Game');
        });
        
        // Add a hover effect to the restart text
        this.restartText.on('pointerover', () => {
            this.restartText.setStyle({ color: '#88ff88' });
        });
        
        this.restartText.on('pointerout', () => {
            this.restartText.setStyle({ color: '#00ff00' });
        });

        PhaserAngularEventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        this.scene.start('MainMenu');
    }
}
