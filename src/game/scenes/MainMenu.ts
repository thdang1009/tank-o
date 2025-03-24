import { GameObjects, Scene } from 'phaser';
import { AssetsEnum } from '../../app/constants/assets-enum';
import { EventBus } from '../EventBus';
import { MapType } from '../map/MapManager';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    title: GameObjects.Text;
    startButton: GameObjects.Text;
    mapOptions: GameObjects.Text[] = [];
    selectedMap: MapType = MapType.GRASS;
    
    mapLabels: { [key in MapType]: string } = {
        [MapType.GRASS]: 'Grass Land',
        [MapType.SAND]: 'Desert',
        [MapType.MIXED]: 'Mixed Terrain'
    };

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        // Set up background
        this.background = this.add.image(512, 384, AssetsEnum.BACKGROUND);
        this.background.setAlpha(0.7);
        
        // Add tank decorations
        this.addTankDecorations();
        
        // Add title
        this.title = this.add.text(512, 120, 'TANK-O', {
            fontFamily: 'Arial Black',
            fontSize: 78,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        
        // Add subtitle
        this.add.text(512, 190, 'The Ultimate Tank Battle', {
            fontFamily: 'Arial Black',
            fontSize: 32,
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        
        // Add map selection title
        this.add.text(512, 280, 'Select Battlefield:', {
            fontFamily: 'Arial Black',
            fontSize: 28,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        
        // Add map options
        this.createMapOptions();
        
        // Add start button
        this.startButton = this.add.text(512, 520, 'START BATTLE', {
            fontFamily: 'Arial Black',
            fontSize: 48,
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        
        // Make the start button interactive
        this.startButton.setInteractive({ useHandCursor: true });
        this.startButton.on('pointerdown', () => {
            this.changeScene();
        });
        
        // Add hover effects to the start button
        this.startButton.on('pointerover', () => {
            this.startButton.setStyle({ color: '#88ff88' });
        });
        
        this.startButton.on('pointerout', () => {
            this.startButton.setStyle({ color: '#00ff00' });
        });

        // Emit event for Angular component
        EventBus.emit('current-scene-ready', this);
    }
    
    createMapOptions() {
        const mapTypes = [MapType.GRASS, MapType.SAND, MapType.MIXED];
        const yStart = 330;
        const ySpacing = 50;
        
        mapTypes.forEach((mapType, index) => {
            const y = yStart + (index * ySpacing);
            const text = this.add.text(512, y, this.mapLabels[mapType], {
                fontFamily: 'Arial Black',
                fontSize: 24,
                color: mapType === this.selectedMap ? '#ffff00' : '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
                align: 'center'
            }).setOrigin(0.5).setDepth(100);
            
            // Make the text interactive
            text.setInteractive({ useHandCursor: true });
            text.on('pointerdown', () => {
                this.selectMap(mapType);
            });
            
            this.mapOptions.push(text);
        });
    }
    
    selectMap(mapType: MapType) {
        this.selectedMap = mapType;
        
        // Update the colors to show the selection
        this.mapOptions.forEach((option, index) => {
            const currentMapType = [MapType.GRASS, MapType.SAND, MapType.MIXED][index];
            option.setStyle({
                color: currentMapType === this.selectedMap ? '#ffff00' : '#ffffff'
            });
        });
    }
    
    addTankDecorations() {
        // Add decorative tanks on the menu screen
        const tankSprites = [
            {
                body: AssetsEnum.TANK_BODY_BLUE,
                barrel: AssetsEnum.TANK_BLUE_BARREL_2,
                x: 150,
                y: 500,
                rotation: -0.2
            },
            {
                body: AssetsEnum.TANK_BODY_GREEN,
                barrel: AssetsEnum.TANK_GREEN_BARREL_2,
                x: 850,
                y: 480,
                rotation: 0.2
            },
            {
                body: AssetsEnum.TANK_BODY_RED,
                barrel: AssetsEnum.TANK_RED_BARREL_3,
                x: 250,
                y: 650,
                rotation: 0.1
            }
        ];
        
        tankSprites.forEach(tank => {
            // Create tank body
            const body = this.add.image(tank.x, tank.y, tank.body);
            body.setRotation(tank.rotation);
            body.setDepth(5);
            
            // Create tank barrel
            const barrel = this.add.image(tank.x, tank.y, tank.barrel);
            barrel.setRotation(tank.rotation);
            barrel.setOrigin(0.5, 0.8);
            barrel.setDepth(6);
            
            // Animate the tanks slightly
            this.tweens.add({
                targets: [body, barrel],
                y: tank.y - 10,
                duration: 2000 + Math.random() * 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
    }
    
    changeScene ()
    {
        // Pass the selected map type to the game scene
        this.scene.start('Game', { mapType: this.selectedMap });
    }
}
