import { Scene } from 'phaser';
import { TankClassType, TankClasses } from '../entities/TankClass';
import { MapType } from '../map/MapManager';
import { AssetsEnum } from '../../app/constants/assets-enum';

interface ClassSelectionSceneData {
    mapType: MapType;
}

export class ClassSelection extends Scene {
    selectedMapType: MapType = MapType.GRASS;
    selectedClass: TankClassType | null = null;
    classButtons: {[key in TankClassType]?: Phaser.GameObjects.Container} = {};
    continueButton: Phaser.GameObjects.Container;

    constructor() {
        super('ClassSelection');
    }

    init(data: ClassSelectionSceneData) {
        this.selectedMapType = data.mapType || MapType.GRASS;
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

        // Create class selection buttons
        this.createClassButtons();

        // Create continue button (initially disabled)
        this.createContinueButton();
    }

    createClassButtons() {
        const classTypes = Object.values(TankClassType);
        const buttonWidth = 200;
        const buttonHeight = 350;
        const buttonSpacing = 40;
        const totalWidth = (buttonWidth * classTypes.length) + (buttonSpacing * (classTypes.length - 1));
        const startX = (this.cameras.main.width - totalWidth) / 2;
        const startY = 150;

        classTypes.forEach((classType, index) => {
            const classDefinition = TankClasses[classType];
            const x = startX + (buttonWidth + buttonSpacing) * index + buttonWidth / 2;
            const y = startY + buttonHeight / 2;

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
                const tankBody = this.add.image(0, -80, bodyAssetName).setScale(0.8);
                const tankBarrel = this.add.image(2.5, -80, barrelAssetName).setScale(0.8);
                container.add(tankBody);
                container.add(tankBarrel);
            } catch (e) {
                console.error(`Could not load tank assets for ${classType}`, e);
                // Fallback: just show a placeholder
                const tankPlaceholder = this.add.rectangle(0, -80, 50, 50, 0xffffff);
                container.add(tankPlaceholder);
            }

            // Class name
            const nameText = this.add.text(0, -20, classDefinition.name, {
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5, 0.5);
            container.add(nameText);

            // Description
            const descText = this.add.text(0, 20, classDefinition.description, {
                fontSize: '14px',
                color: '#cccccc',
                align: 'center',
                wordWrap: { width: buttonWidth - 20 }
            }).setOrigin(0.5, 0);
            container.add(descText);

            // Skill name and description
            const skillText = this.add.text(0, 100, `Skill: ${classDefinition.skillName}`, {
                fontSize: '16px',
                fontStyle: 'bold',
                color: '#ffcc00',
                align: 'center'
            }).setOrigin(0.5, 0);
            container.add(skillText);

            const skillDescText = this.add.text(0, 120, classDefinition.skillDescription, {
                fontSize: '12px',
                color: '#cccccc',
                align: 'center',
                wordWrap: { width: buttonWidth - 20 }
            }).setOrigin(0.5, 0);
            container.add(skillDescText);

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
        
        // Start game scene with selected map and class
        this.scene.start('Game', {
            mapType: this.selectedMapType,
            tankClass: this.selectedClass
        });
    }
} 