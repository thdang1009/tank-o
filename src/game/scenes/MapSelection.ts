import { Scene, GameObjects } from 'phaser';
import { AssetsEnum } from '../../app/constants/assets-enum';
import { MapType } from '../map/MapManager';
import { GameMode } from '../constants/GameModes';
import { SocketEventBus } from '../utils/SocketEventBus';
import { PhaserAngularEventBus } from '../PhaserAngularEventBus';

interface MapSelectionSceneData {
    gameMode: GameMode;
}

export class MapSelection extends Scene {
    selectedMap: MapType = MapType.GRASS;
    selectedGameMode: GameMode = GameMode.SOLO;
    mapButtons: {[key in MapType]?: Phaser.GameObjects.Container} = {};
    continueButton: Phaser.GameObjects.Container;
    
    mapLabels: { [key in MapType]: string } = {
        [MapType.GRASS]: 'Grass Land',
        [MapType.SAND]: 'Desert',
        [MapType.MIXED]: 'Mixed'
    };
    
    mapDescriptions: { [key in MapType]: string } = {
        [MapType.GRASS]: 'A grassy battlefield with trees for cover. Standard visibility and mobility.',
        [MapType.SAND]: 'Desert terrain with dunes and minimal cover. High visibility but reduced mobility.',
        [MapType.MIXED]: 'Varied terrain combining dirt paths, grass, and water. Tactical variety and interesting obstacles.'
    };
    
    constructor() {
        super('MapSelection');
    }
    
    init(data: MapSelectionSceneData) {
        this.selectedGameMode = data.gameMode || GameMode.SOLO;
    }
    
    create() {
        // Add background
        const background = this.add.image(512, 384, AssetsEnum.BACKGROUND);
        background.setAlpha(0.7);
        
        // Add title
        const title = this.add.text(
            this.cameras.main.width / 2,
            50,
            'SELECT BATTLEFIELD',
            {
                fontSize: '36px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5, 0.5);
        
        // Add subtitle based on game mode
        const subtitle = this.add.text(
            this.cameras.main.width / 2,
            90,
            `${this.selectedGameMode === GameMode.SOLO ? 'Solo Mode' : 'Custom Mode'}`,
            {
                fontSize: '20px',
                color: '#ffcc00',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5, 0.5);
        
        // Create map selection buttons
        this.createMapButtons();
        
        // Create continue button
        this.createContinueButton();
        
        // Create back button
        this.createBackButton();
        
        // Notify that scene is ready
        PhaserAngularEventBus.emit('current-scene-ready', this);
    }
    
    createMapButtons() {
        const mapTypes = Object.values(MapType);
        const buttonWidth = 280;
        const buttonHeight = 400;
        const buttonSpacing = 40;
        const totalWidth = (buttonWidth * mapTypes.length) + (buttonSpacing * (mapTypes.length - 1));
        const startX = (this.cameras.main.width - totalWidth) / 2;
        const startY = 300;
        
        mapTypes.forEach((mapType, index) => {
            const x = startX + (buttonWidth + buttonSpacing) * index + buttonWidth / 2;
            const y = startY;
            
            // Create container for the button and its contents
            const container = this.add.container(x, y);
            
            // Button background
            const background = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x333333, 0.8)
                .setStrokeStyle(2, 0xffffff);
            container.add(background);
            
            // Map preview image
            let mapImage;
            switch(mapType) {
                case MapType.GRASS:
                    mapImage = this.add.image(0, -100, AssetsEnum.TILE_GRASS_1).setScale(2);
                    break;
                case MapType.SAND:
                    mapImage = this.add.image(0, -100, AssetsEnum.TILE_SAND_1).setScale(2);
                    break;
                case MapType.MIXED:
                    // For mixed, we'll create a composite image
                    mapImage = this.add.container(0, -100);
                    const grassTile = this.add.image(-40, -40, AssetsEnum.TILE_GRASS_1).setScale(1.2);
                    const sandTile = this.add.image(40, -40, AssetsEnum.TILE_SAND_1).setScale(1.2);
                    const roadTile = this.add.image(0, 40, AssetsEnum.TILE_GRASS_ROAD_CROSSING).setScale(1.2);
                    mapImage.add(grassTile);
                    mapImage.add(sandTile);
                    mapImage.add(roadTile);
                    break;
            }
            container.add(mapImage);
            
            // Map name
            const nameText = this.add.text(0, 0, this.mapLabels[mapType], {
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5, 0.5);
            container.add(nameText);
            
            // Map description
            const descText = this.add.text(0, 40, this.mapDescriptions[mapType], {
                fontSize: '14px',
                color: '#cccccc',
                align: 'center',
                wordWrap: { width: buttonWidth - 20 }
            }).setOrigin(0.5, 0);
            container.add(descText);
            
            // Difficulty indicator
            let difficulty = '';
            let difficultyColor = '#ffffff';
            
            switch(mapType) {
                case MapType.GRASS:
                    difficulty = 'Difficulty: ★★☆';
                    difficultyColor = '#88ff88';
                    break;
                case MapType.SAND:
                    difficulty = 'Difficulty: ★★★';
                    difficultyColor = '#ff8888';
                    break;
                case MapType.MIXED:
                    difficulty = 'Difficulty: ★★★';
                    difficultyColor = '#ff8888';
                    break;
            }
            
            const difficultyText = this.add.text(0, 120, difficulty, {
                fontSize: '16px',
                color: difficultyColor,
                align: 'center'
            }).setOrigin(0.5, 0);
            container.add(difficultyText);
            
            // Add decorative elements based on map type
            switch(mapType) {
                case MapType.GRASS:
                    // Add trees
                    const tree1 = this.add.image(-80, -170, AssetsEnum.TREE_GREEN_LARGE).setScale(0.7);
                    const tree2 = this.add.image(80, -170, AssetsEnum.TREE_GREEN_SMALL).setScale(0.7);
                    container.add(tree1);
                    container.add(tree2);
                    break;
                    
                case MapType.SAND:
                    // Add barrels
                    const barrel1 = this.add.image(-70, -170, AssetsEnum.BARREL_RUST_SIDE).setScale(0.7);
                    const barrel2 = this.add.image(70, -170, AssetsEnum.BARREL_RUST_SIDE).setScale(0.7);
                    container.add(barrel1);
                    container.add(barrel2);
                    break;
                    
                case MapType.MIXED:
                    // Add mixed elements
                    const tree = this.add.image(-80, -170, AssetsEnum.TREE_BROWN_SMALL).setScale(0.7);
                    const barrel = this.add.image(80, -170, AssetsEnum.BARREL_GREEN_SIDE).setScale(0.7);
                    container.add(tree);
                    container.add(barrel);
                    break;
            }
            
            // Make button interactive
            background.setInteractive({ useHandCursor: true })
                .on('pointerover', () => {
                    background.setFillStyle(0x666666, 0.8);
                })
                .on('pointerout', () => {
                    if (this.selectedMap !== mapType) {
                        background.setFillStyle(0x333333, 0.8);
                    }
                })
                .on('pointerdown', () => {
                    this.selectMap(mapType);
                });
            
            this.mapButtons[mapType] = container;
        });
        
        // Set initial selection
        this.selectMap(this.selectedMap);
    }
    
    createContinueButton() {
        const x = this.cameras.main.width / 2;
        const y = this.cameras.main.height - 80;
        
        // Create container
        this.continueButton = this.add.container(x, y);
        
        // Button background
        const background = this.add.rectangle(0, 0, 200, 50, 0x006600, 0.8)
            .setStrokeStyle(2, 0xffffff);
        this.continueButton.add(background);
        
        // Button text
        const text = this.add.text(0, 0, 'CONTINUE', {
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5, 0.5);
        this.continueButton.add(text);
        
        // Make button interactive
        background.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                background.setFillStyle(0x008800, 0.8);
                this.tweens.add({
                    targets: this.continueButton,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 100
                });
            })
            .on('pointerout', () => {
                background.setFillStyle(0x006600, 0.8);
                this.tweens.add({
                    targets: this.continueButton,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100
                });
            })
            .on('pointerdown', () => {
                this.continue();
            });
    }
    
    createBackButton() {
        // Create back button
        const backButton = this.add.container(100, 40);
        
        const backBg = this.add.rectangle(0, 0, 80, 40, 0x444444, 0.8)
            .setStrokeStyle(2, 0xffffff);
        
        const backText = this.add.text(0, 0, 'BACK', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);
        
        backButton.add(backBg);
        backButton.add(backText);
        
        backBg.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                backBg.setFillStyle(0x666666, 0.8);
            })
            .on('pointerout', () => {
                backBg.setFillStyle(0x444444, 0.8);
            })
            .on('pointerdown', () => {
                this.goBack();
            });
    }
    
    selectMap(mapType: MapType) {
        // Deselect previous selection
        if (this.selectedMap && this.mapButtons[this.selectedMap]) {
            const container = this.mapButtons[this.selectedMap];
            if (container) {
                const background = container.getAt(0) as Phaser.GameObjects.Rectangle;
                background.setFillStyle(0x333333, 0.8);
            }
        }
        
        // Set new selection
        this.selectedMap = mapType;
        
        // Highlight new selection
        const container = this.mapButtons[mapType];
        if (container) {
            const background = container.getAt(0) as Phaser.GameObjects.Rectangle;
            background.setFillStyle(0x006600, 0.8);
        }
    }
    
    continue() {
        if (this.selectedGameMode === GameMode.SOLO) {
            // Go to class selection for solo mode
            this.scene.start('ClassSelection', { 
                mapType: this.selectedMap,
                gameMode: this.selectedGameMode 
            });
        } else {
            // If coming from a different flow, might go somewhere else
            this.scene.start('ClassSelection', { 
                mapType: this.selectedMap,
                gameMode: this.selectedGameMode 
            });
        }
    }
    
    goBack() {
        // Go back to the main menu
        this.scene.start('MainMenu');
    }
} 