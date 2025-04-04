import { Scene, GameObjects } from 'phaser';
import { AssetsEnum } from '../../app/constants/assets-enum';
import { EventBus } from '../EventBus';
import { MapType } from '../map/MapManager';
import { GameMode, GameModes } from '../constants/GameModes';

interface ModeSelectionSceneData {
    mapType: MapType;
}

export class ModeSelection extends Scene {
    selectedMapType: MapType = MapType.GRASS;
    selectedMode: GameMode = GameMode.SOLO;
    modeButtons: {[key in GameMode]?: Phaser.GameObjects.Container} = {};
    continueButton: Phaser.GameObjects.Container;
    
    constructor() {
        super('ModeSelection');
    }
    
    init(data: ModeSelectionSceneData) {
        this.selectedMapType = data.mapType || MapType.GRASS;
    }
    
    create() {
        // Add background
        const background = this.add.image(512, 384, AssetsEnum.BACKGROUND);
        background.setAlpha(0.7);
        
        // Add title
        const title = this.add.text(
            this.cameras.main.width / 2,
            50,
            'SELECT GAME MODE',
            {
                fontSize: '36px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5, 0.5);
        
        // Create mode selection buttons
        this.createModeButtons();
        
        // Create continue button (initially disabled)
        this.createContinueButton();
        
        // Emit event for Angular component
        EventBus.emit('current-scene-ready', this);
    }
    
    createModeButtons() {
        const modeTypes = Object.values(GameMode);
        const buttonWidth = 280;
        const buttonHeight = 350;
        const buttonSpacing = 40;
        const totalWidth = (buttonWidth * modeTypes.length) + (buttonSpacing * (modeTypes.length - 1));
        const startX = (this.cameras.main.width - totalWidth) / 2;
        const startY = 150;
        
        modeTypes.forEach((modeType, index) => {
            const modeDefinition = GameModes[modeType];
            const x = startX + (buttonWidth + buttonSpacing) * index + buttonWidth / 2;
            const y = startY + buttonHeight / 2;
            
            // Create container for the button and its contents
            const container = this.add.container(x, y);
            
            // Button background
            const background = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x333333, 0.8)
                .setStrokeStyle(2, 0xffffff);
            container.add(background);
            
            // Mode icon/image based on mode type
            let iconAsset: string;
            switch(modeType) {
                case GameMode.SOLO:
                    iconAsset = AssetsEnum.TANK_BLUE;
                    break;
                case GameMode.CHAOS:
                    iconAsset = AssetsEnum.TANK_RED;
                    break;
                case GameMode.STAGE:
                    iconAsset = AssetsEnum.TANK_GREEN;
                    break;
                default:
                    iconAsset = AssetsEnum.TANK_BLUE;
            }
            
            // Add mode icon
            try {
                const modeIcon = this.add.image(0, -80, iconAsset).setScale(0.8);
                container.add(modeIcon);
                
                // Add decoration based on mode
                if (modeType === GameMode.CHAOS) {
                    // Add multiple small tanks for chaos mode
                    const miniTank1 = this.add.image(-60, -100, AssetsEnum.TANK_DARK).setScale(0.4);
                    const miniTank2 = this.add.image(60, -100, AssetsEnum.TANK_SAND).setScale(0.4);
                    container.add(miniTank1);
                    container.add(miniTank2);
                } else if (modeType === GameMode.STAGE) {
                    // Add a boss-like tank for stage mode
                    const bossIcon = this.add.image(60, -60, AssetsEnum.TANK_BIG_RED).setScale(0.5);
                    container.add(bossIcon);
                }
            } catch (e) {
                console.error(`Could not load mode assets for ${modeType}`, e);
                // Fallback: just show a placeholder
                const iconPlaceholder = this.add.rectangle(0, -80, 50, 50, 0xffffff);
                container.add(iconPlaceholder);
            }
            
            // Mode name
            const nameText = this.add.text(0, -20, modeDefinition.name, {
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5, 0.5);
            container.add(nameText);
            
            // Description
            const descText = this.add.text(0, 20, modeDefinition.description, {
                fontSize: '14px',
                color: '#cccccc',
                align: 'center',
                wordWrap: { width: buttonWidth - 20 }
            }).setOrigin(0.5, 0);
            container.add(descText);
            
            // Player count
            const playerText = this.add.text(0, 120, 
                `Players: ${modeDefinition.minPlayers}-${modeDefinition.maxPlayers}`, {
                fontSize: '16px',
                color: '#ffcc00',
                align: 'center'
            }).setOrigin(0.5, 0);
            container.add(playerText);
            
            // Teams info if applicable
            if (modeDefinition.hasTeams) {
                const teamsText = this.add.text(0, 145, 'Cooperative Team Play', {
                    fontSize: '14px',
                    color: '#88ff88',
                    align: 'center'
                }).setOrigin(0.5, 0);
                container.add(teamsText);
            }
            
            // Make button interactive
            background.setInteractive({ useHandCursor: true })
                .on('pointerover', () => {
                    background.setFillStyle(0x666666, 0.8);
                })
                .on('pointerout', () => {
                    if (this.selectedMode !== modeType) {
                        background.setFillStyle(0x333333, 0.8);
                    }
                })
                .on('pointerdown', () => {
                    this.selectMode(modeType);
                });
            
            this.modeButtons[modeType] = container;
        });
    }
    
    createContinueButton() {
        const x = this.cameras.main.width / 2;
        const y = this.cameras.main.height - 80;
        
        // Create container
        this.continueButton = this.add.container(x, y);
        
        // Button background
        const background = this.add.rectangle(0, 0, 200, 50, 0x666666, 0.8)
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
                background.setFillStyle(0x888888, 0.8);
            })
            .on('pointerout', () => {
                background.setFillStyle(0x666666, 0.8);
            })
            .on('pointerdown', () => {
                this.continueToNextScene();
            });
    }
    
    selectMode(modeType: GameMode) {
        // Deselect previous selection
        if (this.selectedMode && this.modeButtons[this.selectedMode]) {
            const container = this.modeButtons[this.selectedMode];
            if (container) {
                const background = container.getAt(0) as Phaser.GameObjects.Rectangle;
                background.setFillStyle(0x333333, 0.8);
            }
        }
        
        // Set new selection
        this.selectedMode = modeType;
        
        // Highlight new selection
        const container = this.modeButtons[modeType];
        if (container) {
            const background = container.getAt(0) as Phaser.GameObjects.Rectangle;
            background.setFillStyle(0x006600, 0.8);
        }
    }
    
    continueToNextScene() {
        switch (this.selectedMode) {
            case GameMode.SOLO:
                // Continue to class selection for solo mode
                this.scene.start('ClassSelection', { 
                    mapType: this.selectedMapType,
                    gameMode: this.selectedMode 
                });
                break;
                
            case GameMode.CHAOS:
                // For Chaos mode, go to multiplayer lobby scene
                this.scene.start('MultiplayerLobby', {
                    mapType: this.selectedMapType,
                    gameMode: this.selectedMode
                });
                break;
                
            case GameMode.STAGE:
                // For Stage mode, go to stage lobby scene
                this.scene.start('StageLobby', {
                    mapType: this.selectedMapType,
                    gameMode: this.selectedMode
                });
                break;
        }
    }
} 