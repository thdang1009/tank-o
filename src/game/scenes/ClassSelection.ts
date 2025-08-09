import { Scene } from 'phaser';
import { TankClassType, TankClasses } from '../entities/TankClass';
import { MapType } from '../map/MapManager';
import { AssetsEnum } from '../../app/constants/assets-enum';
import { GameMode } from '../constants/GameModes';
import { GameSceneData } from './Game';

interface ClassSelectionSceneData {
    mapType: MapType;
    gameMode?: GameMode;
    stageLevel?: number;
    difficulty?: string;
}

export class ClassSelection extends Scene {
    selectedMapType: MapType = MapType.GRASS;
    selectedGameMode: GameMode = GameMode.SOLO;
    selectedClass: TankClassType | null = null;
    classButtons: {[key in TankClassType]?: Phaser.GameObjects.Container} = {};
    continueButton: Phaser.GameObjects.Container;
    stageLevel: number = 1;
    difficulty: string = 'Normal';

    constructor() {
        super('ClassSelection');
    }

    init(data: ClassSelectionSceneData) {
        this.selectedMapType = data.mapType || MapType.GRASS;
        this.selectedGameMode = data.gameMode || GameMode.SOLO;
        
        if (data.stageLevel) {
            this.stageLevel = data.stageLevel;
        }
        
        if (data.difficulty) {
            this.difficulty = data.difficulty;
        }
    }

    create() {
        // Add title
        const title = this.add.text(
            this.cameras.main.width / 2,
            50,
            'SELECT YOUR TANK CLASS',
            {
                fontSize: '36px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5, 0.5);

        // Game mode info display
        this.displayGameModeInfo();

        // Create class selection buttons
        this.createClassButtons();

        // Create continue button (initially disabled)
        this.createContinueButton();
    }

    displayGameModeInfo() {
        // Show additional information based on game mode
        let infoText = '';
        
        switch (this.selectedGameMode) {
            case GameMode.SOLO:
                infoText = 'Solo Mode - Survive against AI enemies';
                break;
            case GameMode.CHAOS:
                infoText = 'Chaos Mode - Last tank standing wins!';
                break;
            case GameMode.STAGE:
                infoText = `Stage Mode - Level ${this.stageLevel} (${this.difficulty}) - Team up and defeat the boss`;
                break;
        }
        
        // Add game mode text
        const modeInfoText = this.add.text(
            this.cameras.main.width / 2,
            90,
            infoText,
            {
                fontSize: '18px',
                color: '#ffcc00',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5, 0.5);
    }

    createClassButtons() {
        const classTypes = Object.values(TankClassType);
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        
        // Make responsive to screen size
        const buttonWidth = Math.min(180, (screenWidth - 100) / 5); // Fit at least 5 per row
        const buttonHeight = Math.min(350, (screenHeight - 200) / 2); // Fit 2 rows max
        const buttonSpacing = 15;
        
        // Calculate layout - fit tanks to screen
        const maxTanksPerRow = Math.floor((screenWidth - 60) / (buttonWidth + buttonSpacing));
        const tanksPerRow = Math.min(maxTanksPerRow, classTypes.length);
        const rows = Math.ceil(classTypes.length / tanksPerRow);
        
        // Center the buttons
        const totalWidth = (buttonWidth * tanksPerRow) + (buttonSpacing * (tanksPerRow - 1));
        const startX = (screenWidth - totalWidth) / 2;
        const startY = 120;
        
        console.log('Tank selection layout:', { 
            screenWidth, screenHeight, buttonWidth, buttonHeight, 
            tanksPerRow, rows, totalWidth 
        });

        classTypes.forEach((classType, index) => {
            const classDefinition = TankClasses[classType];
            
            // Calculate position for multiple rows
            const row = Math.floor(index / tanksPerRow);
            const col = index % tanksPerRow;
            const x = startX + (buttonWidth + buttonSpacing) * col + buttonWidth / 2;
            const y = startY + (buttonHeight + 20) * row + buttonHeight / 2;

            // Create container for the button and its contents
            const container = this.add.container(x, y);
            
            // Button background
            const background = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x333333, 0.8)
                .setStrokeStyle(2, 0xffffff);
            container.add(background);

            // Get tank asset name for this class
            const bodyAssetName = classDefinition.tankBodyAsset;
            const barrelAssetName = classDefinition.tankBarrelAsset;

            // Tank preview
            try {
                let tankScale = 0.8;
                
                // Apply special scaling for certain tank types
                if (classType === TankClassType.SPY) {
                    tankScale = 0.7; // Make spy tank smaller in preview too
                }
                
                const tankBody = this.add.image(0, -80, bodyAssetName).setScale(tankScale);
                const tankBarrel = this.add.image(2.5, -80, barrelAssetName).setScale(tankScale);
                
                // Apply special tinting for certain tank types
                if (classType === TankClassType.ICE_TANK) {
                    tankBody.setTint(0xffffff); // White tint for ice theme
                    tankBarrel.setTint(0xffffff);
                }
                
                container.add(tankBody);
                container.add(tankBarrel);
            } catch (e) {
                console.error(`Could not load tank assets for ${classType}`, e);
                // Fallback: just show a placeholder
                const tankPlaceholder = this.add.rectangle(0, -80, 50, 50, 0xffffff);
                container.add(tankPlaceholder);
            }

            // Responsive font sizes
            const nameFontSize = Math.max(16, Math.min(20, buttonWidth / 10));
            const descFontSize = Math.max(10, Math.min(12, buttonWidth / 15));
            const skillFontSize = Math.max(12, Math.min(14, buttonWidth / 13));
            
            // Class name
            const nameText = this.add.text(0, -20, classDefinition.name, {
                fontSize: `${nameFontSize}px`,
                fontStyle: 'bold',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5, 0.5);
            container.add(nameText);

            // Description
            const descText = this.add.text(0, 20, classDefinition.description, {
                fontSize: `${descFontSize}px`,
                color: '#cccccc',
                align: 'center',
                wordWrap: { width: buttonWidth - 20 }
            }).setOrigin(0.5, 0);
            container.add(descText);

            // Skills info - show all three skills
            const skillTextSize = Math.max(10, skillFontSize - 2);
            const yStart = 80;
            
            // Skill 1 (Q)
            if (classDefinition.skill1Name || classDefinition.skillName) {
                const skill1Text = this.add.text(0, yStart, `[Q] ${classDefinition.skill1Name || classDefinition.skillName}`, {
                    fontSize: `${skillTextSize}px`,
                    fontStyle: 'bold',
                    color: '#ffcc00',
                    align: 'center'
                }).setOrigin(0.5, 0);
                container.add(skill1Text);
            }
            
            // Skill 2 (E)
            if (classDefinition.skill2Name) {
                const skill2Text = this.add.text(0, yStart + 20, `[E] ${classDefinition.skill2Name}`, {
                    fontSize: `${skillTextSize}px`,
                    fontStyle: 'bold',
                    color: '#66ff66',
                    align: 'center'
                }).setOrigin(0.5, 0);
                container.add(skill2Text);
            }
            
            // Ultimate (R)
            if (classDefinition.ultimateName) {
                const ultimateText = this.add.text(0, yStart + 40, `[R] ${classDefinition.ultimateName}`, {
                    fontSize: `${skillTextSize}px`,
                    fontStyle: 'bold',
                    color: '#ff6666',
                    align: 'center'
                }).setOrigin(0.5, 0);
                container.add(ultimateText);
            }
            
            // Show primary skill description
            const primarySkillDesc = classDefinition.skill1Description || classDefinition.skillDescription;
            if (primarySkillDesc) {
                const skillDescText = this.add.text(0, yStart + 65, primarySkillDesc, {
                    fontSize: `${Math.max(8, skillTextSize - 2)}px`,
                    color: '#cccccc',
                    align: 'center',
                    wordWrap: { width: buttonWidth - 20 }
                }).setOrigin(0.5, 0);
                container.add(skillDescText);
            }

            // Make button interactive
            background.setInteractive({ useHandCursor: true })
                .on('pointerover', () => {
                    background.setFillStyle(0x666666, 0.8);
                })
                .on('pointerout', () => {
                    if (this.selectedClass !== classType) {
                        background.setFillStyle(0x333333, 0.8);
                    }
                })
                .on('pointerdown', () => {
                    this.selectClass(classType);
                });

            this.classButtons[classType] = container;
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
        const text = this.add.text(0, 0, 'START BATTLE', {
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5, 0.5);
        this.continueButton.add(text);
        
        // Initially disabled
        this.continueButton.setAlpha(0.5);
        
        // Make button interactive when a class is selected
        background.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                if (this.selectedClass) {
                    background.setFillStyle(0x888888, 0.8);
                }
            })
            .on('pointerout', () => {
                if (this.selectedClass) {
                    background.setFillStyle(0x666666, 0.8);
                }
            })
            .on('pointerdown', () => {
                if (this.selectedClass) {
                    this.startGame();
                }
            });
    }

    selectClass(classType: TankClassType) {
        // Deselect previous selection
        if (this.selectedClass && this.classButtons[this.selectedClass]) {
            const container = this.classButtons[this.selectedClass];
            if (container) {
                const background = container.getAt(0) as Phaser.GameObjects.Rectangle;
                background.setFillStyle(0x333333, 0.8);
            }
        }
        
        // Set new selection
        this.selectedClass = classType;
        
        // Highlight new selection
        const container = this.classButtons[classType];
        if (container) {
            const background = container.getAt(0) as Phaser.GameObjects.Rectangle;
            background.setFillStyle(0x006600, 0.8);
        }
        
        // Enable continue button
        this.continueButton.setAlpha(1);
    }

    startGame() {
        if (!this.selectedClass) return;
        console.log('Starting game with class:', this.selectedClass);
        const gameSceneData: GameSceneData = {
            mapType: this.selectedMapType,
            selectedClass: this.selectedClass,
            gameMode: this.selectedGameMode,
            stageLevel: this.stageLevel,
            difficulty: this.difficulty
        };
        // Start game scene with selected map, class, and game mode
        this.scene.start('Game', gameSceneData);
    }
} 