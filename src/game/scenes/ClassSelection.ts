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
    continueButton: Phaser.GameObjects.Container;
    stageLevel: number = 1;
    difficulty: string = 'Normal';
    
    // Slider/Carousel properties
    currentTankIndex: number = 0;
    tankContainers: Phaser.GameObjects.Container[] = [];
    prevButton: Phaser.GameObjects.Container;
    nextButton: Phaser.GameObjects.Container;
    tankIndicators: Phaser.GameObjects.Container[] = [];
    tankClassTypes: TankClassType[] = [];

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
        this.tankClassTypes = Object.values(TankClassType);
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        
        // Create tank detail containers (one per tank, all hidden initially except first)
        this.tankClassTypes.forEach((classType, index) => {
            const container = this.createTankDetailContainer(classType, screenWidth, screenHeight);
            container.setVisible(index === 0); // Only show first tank initially
            this.tankContainers.push(container);
        });
        
        // Create navigation arrows
        this.createNavigationButtons();
        
        // Create tank indicators (dots)
        this.createTankIndicators();
        
        // Setup keyboard navigation
        this.setupKeyboardNavigation();
        
        // Add navigation hints
        this.add.text(screenWidth / 2, screenHeight - 120, 'Use ◀ ▶ arrows or A/D keys to navigate • Click dots to jump', {
            fontSize: '14px',
            color: '#999999',
            align: 'center'
        }).setOrigin(0.5, 0);
        
        // Set initial selection
        this.selectedClass = this.tankClassTypes[0];
        this.updateTankDisplay();
        
        console.log('Tank slider created with', this.tankClassTypes.length, 'tanks');
    }
    
    createTankDetailContainer(classType: TankClassType, screenWidth: number, screenHeight: number): Phaser.GameObjects.Container {
        const classDefinition = TankClasses[classType];
        const container = this.add.container(screenWidth / 2, screenHeight / 2 - 20);
        
        // Main content area background
        const contentBg = this.add.rectangle(0, 0, screenWidth - 100, screenHeight - 200, 0x222244, 0.8)
            .setStrokeStyle(4, 0xffffff);
        container.add(contentBg);
        
        // Tank preview (larger)
        try {
            let tankScale = 2.0; // Much larger for detail view
            
            if (classType === TankClassType.SPY) {
                tankScale = 1.8;
            }
            
            const tankBody = this.add.image(-200, -80, classDefinition.tankBodyAsset).setScale(tankScale);
            const tankBarrel = this.add.image(-195, -80, classDefinition.tankBarrelAsset).setScale(tankScale);
            
            // Apply special tinting
            if (classType === TankClassType.ICE_TANK) {
                tankBody.setTint(0xffffff);
                tankBarrel.setTint(0xffffff);
            }
            
            container.add(tankBody);
            container.add(tankBarrel);
        } catch (e) {
            console.error(`Could not load tank assets for ${classType}`, e);
            const tankPlaceholder = this.add.rectangle(-200, -80, 120, 120, 0xffffff);
            container.add(tankPlaceholder);
        }
        
        // Tank name (large)
        const nameText = this.add.text(-200, 60, classDefinition.name, {
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5, 0);
        container.add(nameText);
        
        // Tank description
        const descText = this.add.text(-200, 110, classDefinition.description, {
            fontSize: '16px',
            color: '#cccccc',
            align: 'center',
            wordWrap: { width: 350 }
        }).setOrigin(0.5, 0);
        container.add(descText);
        
        // Stats display (left side)
        const statsTitle = this.add.text(-200, 170, 'TANK STATS', {
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#ffcc00',
            align: 'center'
        }).setOrigin(0.5, 0);
        container.add(statsTitle);
        
        const statsY = 200;
        const stats = [
            { name: 'Health', value: classDefinition.stats.hp, color: '#ff4444' },
            { name: 'Attack', value: classDefinition.stats.atk, color: '#ff8844' },
            { name: 'Defense', value: classDefinition.stats.def, color: '#44ff44' },
            { name: 'Speed', value: classDefinition.stats.speed, color: '#4444ff' },
            { name: 'Spell Power', value: classDefinition.stats.spellPower, color: '#ff44ff' }
        ];
        
        stats.forEach((stat, index) => {
            const y = statsY + (index * 25);
            const statText = this.add.text(-320, y, `${stat.name}:`, {
                fontSize: '14px',
                color: '#ffffff'
            }).setOrigin(0, 0);
            container.add(statText);
            
            const valueText = this.add.text(-200, y, stat.value.toString(), {
                fontSize: '14px',
                fontStyle: 'bold',
                color: stat.color
            }).setOrigin(0, 0);
            container.add(valueText);
        });
        
        // Skills display (right side)
        const skillsTitle = this.add.text(150, -120, 'SKILLS & ABILITIES', {
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#ffcc00',
            align: 'center'
        }).setOrigin(0.5, 0);
        container.add(skillsTitle);
        
        const skillsStartY = -80;
        
        // Skill 1 (Q)
        if (classDefinition.skill1Name || classDefinition.skillName) {
            const skill1Name = this.add.text(50, skillsStartY, `[Q] ${classDefinition.skill1Name || classDefinition.skillName}`, {
                fontSize: '16px',
                fontStyle: 'bold',
                color: '#ffcc00'
            }).setOrigin(0, 0);
            container.add(skill1Name);
            
            const skill1Desc = this.add.text(50, skillsStartY + 25, classDefinition.skill1Description || classDefinition.skillDescription || '', {
                fontSize: '12px',
                color: '#cccccc',
                wordWrap: { width: 300 }
            }).setOrigin(0, 0);
            container.add(skill1Desc);
        }
        
        // Skill 2 (E)
        if (classDefinition.skill2Name) {
            const skill2Name = this.add.text(50, skillsStartY + 80, `[E] ${classDefinition.skill2Name}`, {
                fontSize: '16px',
                fontStyle: 'bold',
                color: '#66ff66'
            }).setOrigin(0, 0);
            container.add(skill2Name);
            
            const skill2Desc = this.add.text(50, skillsStartY + 105, classDefinition.skill2Description || '', {
                fontSize: '12px',
                color: '#cccccc',
                wordWrap: { width: 300 }
            }).setOrigin(0, 0);
            container.add(skill2Desc);
        }
        
        // Ultimate (R)
        if (classDefinition.ultimateName) {
            const ultimateName = this.add.text(50, skillsStartY + 160, `[R] ${classDefinition.ultimateName}`, {
                fontSize: '16px',
                fontStyle: 'bold',
                color: '#ff6666'
            }).setOrigin(0, 0);
            container.add(ultimateName);
            
            const ultimateDesc = this.add.text(50, skillsStartY + 185, classDefinition.ultimateDescription || '', {
                fontSize: '12px',
                color: '#cccccc',
                wordWrap: { width: 300 }
            }).setOrigin(0, 0);
            container.add(ultimateDesc);
        }
        
        return container;
    }
    
    createNavigationButtons() {
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        
        // Previous button (left arrow)
        this.prevButton = this.add.container(80, screenHeight / 2); // Moved up by 50px
        
        const prevBg = this.add.circle(0, 0, 30, 0x444488, 0.8)
            .setStrokeStyle(2, 0xffffff);
        const prevArrow = this.add.text(0, 0, '◀', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);
        
        this.prevButton.add([prevBg, prevArrow]);
        
        prevBg.setInteractive({ useHandCursor: true })
            .on('pointerover', () => prevBg.setFillStyle(0x666699, 0.8))
            .on('pointerout', () => prevBg.setFillStyle(0x444488, 0.8))
            .on('pointerdown', () => this.previousTank());
        
        // Next button (right arrow)
        this.nextButton = this.add.container(screenWidth - 80, screenHeight / 2); // Moved up by 50px
        
        const nextBg = this.add.circle(0, 0, 30, 0x444488, 0.8)
            .setStrokeStyle(2, 0xffffff);
        const nextArrow = this.add.text(0, 0, '▶', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);
        
        this.nextButton.add([nextBg, nextArrow]);
        
        nextBg.setInteractive({ useHandCursor: true })
            .on('pointerover', () => nextBg.setFillStyle(0x666699, 0.8))
            .on('pointerout', () => nextBg.setFillStyle(0x444488, 0.8))
            .on('pointerdown', () => this.nextTank());
            
        this.updateNavigationButtons();
    }
    
    createTankIndicators() {
        const screenWidth = this.cameras.main.width;
        const indicatorY = this.cameras.main.height - 150;
        const totalWidth = this.tankClassTypes.length * 30;
        const startX = (screenWidth - totalWidth) / 2;
        
        this.tankClassTypes.forEach((classType, index) => {
            const indicator = this.add.container(startX + (index * 30), indicatorY);
            
            const dot = this.add.circle(0, 0, 8, index === 0 ? 0xffffff : 0x666666, 0.8)
                .setStrokeStyle(1, 0xaaaaaa);
            indicator.add(dot);
            
            dot.setInteractive({ useHandCursor: true })
                .on('pointerdown', () => this.selectTankByIndex(index));
            
            this.tankIndicators.push(indicator);
        });
    }
    
    setupKeyboardNavigation() {
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-LEFT', () => this.previousTank());
            this.input.keyboard.on('keydown-RIGHT', () => this.nextTank());
            this.input.keyboard.on('keydown-A', () => this.previousTank());
            this.input.keyboard.on('keydown-D', () => this.nextTank());
        }
    }
    
    previousTank() {
        if (this.currentTankIndex > 0) {
            this.selectTankByIndex(this.currentTankIndex - 1);
        }
    }
    
    nextTank() {
        if (this.currentTankIndex < this.tankClassTypes.length - 1) {
            this.selectTankByIndex(this.currentTankIndex + 1);
        }
    }
    
    selectTankByIndex(index: number) {
        if (index < 0 || index >= this.tankClassTypes.length) return;
        if (index === this.currentTankIndex) return; // Already selected
        
        const currentContainer = this.tankContainers[this.currentTankIndex];
        const newContainer = this.tankContainers[index];
        
        // Smooth transition animation
        this.tweens.add({
            targets: currentContainer,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                currentContainer.setVisible(false);
                currentContainer.setAlpha(1); // Reset for next time
            }
        });
        
        // Show new tank with fade-in
        newContainer.setVisible(true);
        newContainer.setAlpha(0);
        this.tweens.add({
            targets: newContainer,
            alpha: 1,
            duration: 200
        });
        
        this.currentTankIndex = index;
        this.selectedClass = this.tankClassTypes[this.currentTankIndex];
        
        this.updateTankDisplay();
        
        // Enable continue button
        this.continueButton.setAlpha(1);
    }
    
    updateTankDisplay() {
        // Update indicators
        this.tankIndicators.forEach((indicator, index) => {
            const dot = indicator.getAt(0) as Phaser.GameObjects.Arc;
            dot.setFillStyle(index === this.currentTankIndex ? 0xffffff : 0x666666, 0.8);
        });
        
        this.updateNavigationButtons();
    }
    
    updateNavigationButtons() {
        // Update button visibility/opacity based on current position
        this.prevButton.setAlpha(this.currentTankIndex > 0 ? 1 : 0.3);
        this.nextButton.setAlpha(this.currentTankIndex < this.tankClassTypes.length - 1 ? 1 : 0.3);
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
        // Find the index of the selected class type
        const index = this.tankClassTypes.indexOf(classType);
        if (index !== -1) {
            this.selectTankByIndex(index);
        }
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