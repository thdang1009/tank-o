import { Scene, GameObjects } from 'phaser';
import { AssetsEnum } from '../../app/constants/assets-enum';
import { EventBus } from '../EventBus';
import { MapType } from '../map/MapManager';
import { GameMode } from '../constants/GameModes';
import { TankClassType, TankClasses } from '../entities/TankClass';

interface StageLobbySceneData {
    mapType: MapType;
    gameMode: GameMode;
}

interface Player {
    id: string;
    name: string;
    tankClass: TankClassType;
    ready: boolean;
    isHost: boolean;
}

export class StageLobby extends Scene {
    selectedMapType: MapType = MapType.GRASS;
    selectedGameMode: GameMode = GameMode.STAGE;
    selectedClass: TankClassType = TankClassType.VERSATILE;
    players: Player[] = [];
    localPlayerId: string = 'player1'; // Simulated local player ID
    stageLevel: number = 1;
    gameDifficulty: string = 'Normal';
    
    // UI elements
    classButtons: {[key in TankClassType]?: Phaser.GameObjects.Container} = {};
    playerListContainer: Phaser.GameObjects.Container;
    startButton: Phaser.GameObjects.Container;
    readyButton: Phaser.GameObjects.Container;
    
    constructor() {
        super('StageLobby');
    }
    
    init(data: StageLobbySceneData) {
        this.selectedMapType = data.mapType || MapType.GRASS;
        this.selectedGameMode = data.gameMode || GameMode.STAGE;
        
        // For demo purposes, create some dummy players
        this.players = [
            { id: 'player1', name: 'You (Host)', tankClass: TankClassType.VERSATILE, ready: false, isHost: true },
            { id: 'player2', name: 'Player 2', tankClass: TankClassType.BRUISER, ready: false, isHost: false },
            { id: 'player3', name: 'Player 3', tankClass: TankClassType.SUPPORTER, ready: false, isHost: false }
        ];
    }
    
    create() {
        // Add background
        const background = this.add.image(512, 384, AssetsEnum.BACKGROUND);
        background.setAlpha(0.7);
        
        // Add title
        const title = this.add.text(
            this.cameras.main.width / 2,
            40,
            'STAGE MODE - GAME LOBBY',
            {
                fontSize: '32px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5, 0.5);
        
        // Add map info
        const mapInfo = this.add.text(
            this.cameras.main.width / 2,
            80,
            `Map: ${this.getMapName(this.selectedMapType)}`,
            {
                fontSize: '20px',
                color: '#ffcc00',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5, 0.5);
        
        // Create main sections
        this.createClassSelection();
        this.createPlayerList();
        this.createGameSettings();
        this.createButtons();
        
        // Emit event for Angular component
        EventBus.emit('current-scene-ready', this);
    }
    
    getMapName(mapType: MapType): string {
        switch(mapType) {
            case MapType.GRASS: return 'Grass Land';
            case MapType.SAND: return 'Desert';
            case MapType.MIXED: return 'Mixed Terrain';
            default: return 'Unknown';
        }
    }
    
    createClassSelection() {
        // Create class selection section
        const classSelectionTitle = this.add.text(
            200,
            130,
            'SELECT YOUR TANK',
            {
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5, 0.5);
        
        const classTypes = Object.values(TankClassType);
        const buttonWidth = 150;
        const buttonHeight = 200;
        const buttonSpacing = 20;
        const totalWidth = (buttonWidth * classTypes.length) + (buttonSpacing * (classTypes.length - 1));
        const startX = (400 - totalWidth) / 2;
        const startY = 170;
        
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
            
            // Tank preview
            try {
                const tankBody = this.add.image(0, -50, classDefinition.tankBodyAsset).setScale(0.6);
                const tankBarrel = this.add.image(0, -50, classDefinition.tankBarrelAsset).setScale(0.6);
                container.add(tankBody);
                container.add(tankBarrel);
            } catch (e) {
                console.error(`Could not load tank assets for ${classType}`, e);
                const tankPlaceholder = this.add.rectangle(0, -50, 40, 40, 0xffffff);
                container.add(tankPlaceholder);
            }
            
            // Class name
            const nameText = this.add.text(0, 0, classDefinition.name, {
                fontSize: '18px',
                fontStyle: 'bold',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5, 0.5);
            container.add(nameText);
            
            // Skill name
            const skillText = this.add.text(0, 25, classDefinition.skillName, {
                fontSize: '14px',
                color: '#ffcc00',
                align: 'center'
            }).setOrigin(0.5, 0);
            container.add(skillText);
            
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
        
        // Set initial selection
        this.selectClass(this.selectedClass);
    }
    
    createPlayerList() {
        // Create player list container
        this.playerListContainer = this.add.container(724, 180);
        
        const listTitle = this.add.text(
            0,
            -70,
            'TEAM MEMBERS',
            {
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5, 0.5);
        this.playerListContainer.add(listTitle);
        
        // Background panel
        const background = this.add.rectangle(0, 0, 400, 220, 0x222222, 0.8)
            .setStrokeStyle(2, 0xffffff);
        this.playerListContainer.add(background);
        
        // Header row
        const headerY = -95;
        const nameHeader = this.add.text(-170, headerY, 'PLAYER NAME', {
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#ffcc00'
        }).setOrigin(0, 0.5);
        
        const tankHeader = this.add.text(-20, headerY, 'TANK', {
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#ffcc00'
        }).setOrigin(0, 0.5);
        
        const statusHeader = this.add.text(100, headerY, 'STATUS', {
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#ffcc00'
        }).setOrigin(0, 0.5);
        
        this.playerListContainer.add(nameHeader);
        this.playerListContainer.add(tankHeader);
        this.playerListContainer.add(statusHeader);
        
        // Player rows
        this.updatePlayerList();
    }
    
    updatePlayerList() {
        // Clear current player list items (keeping the headers and background)
        for (let i = this.playerListContainer.length - 1; i > 3; i--) {
            this.playerListContainer.removeAt(i);
        }
        
        // Add player rows
        this.players.forEach((player, index) => {
            const rowY = -65 + (index * 40);
            
            // Player name
            const nameText = this.add.text(-170, rowY, 
                player.name + (player.isHost ? ' 👑' : ''), {
                fontSize: '16px',
                color: player.id === this.localPlayerId ? '#88ff88' : '#ffffff'
            }).setOrigin(0, 0.5);
            
            // Tank class
            const classDefinition = TankClasses[player.tankClass];
            const tankText = this.add.text(-20, rowY, classDefinition.name, {
                fontSize: '16px',
                color: '#cccccc'
            }).setOrigin(0, 0.5);
            
            // Status (ready/not ready)
            const statusText = this.add.text(100, rowY, player.ready ? 'READY' : 'NOT READY', {
                fontSize: '16px',
                color: player.ready ? '#00ff00' : '#ff0000'
            }).setOrigin(0, 0.5);
            
            this.playerListContainer.add(nameText);
            this.playerListContainer.add(tankText);
            this.playerListContainer.add(statusText);
        });
    }
    
    createGameSettings() {
        // Stage settings panel
        const settingsContainer = this.add.container(724, 350);
        
        const settingsTitle = this.add.text(
            0,
            -40,
            'STAGE SETTINGS',
            {
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5, 0.5);
        settingsContainer.add(settingsTitle);
        
        // Background panel
        const background = this.add.rectangle(0, 20, 400, 140, 0x222222, 0.8)
            .setStrokeStyle(2, 0xffffff);
        settingsContainer.add(background);
        
        // Stage level setting
        const stageLevelText = this.add.text(-180, 0, 'Stage Level:', {
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0, 0.5);
        settingsContainer.add(stageLevelText);
        
        // Stage level buttons
        const decreaseLevel = this.add.text(-30, 0, '◀', {
            fontSize: '24px',
            color: '#ffcc00'
        }).setOrigin(0.5, 0.5);
        
        const stageLevelValue = this.add.text(0, 0, this.stageLevel.toString(), {
            fontSize: '20px',
            color: '#ffcc00'
        }).setOrigin(0.5, 0.5);
        
        const increaseLevel = this.add.text(30, 0, '▶', {
            fontSize: '24px',
            color: '#ffcc00'
        }).setOrigin(0.5, 0.5);
        
        settingsContainer.add(decreaseLevel);
        settingsContainer.add(stageLevelValue);
        settingsContainer.add(increaseLevel);
        
        // Make level buttons interactive
        decreaseLevel.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                if (this.stageLevel > 1) {
                    this.stageLevel--;
                    stageLevelValue.setText(this.stageLevel.toString());
                }
            });
        
        increaseLevel.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                if (this.stageLevel < 10) {
                    this.stageLevel++;
                    stageLevelValue.setText(this.stageLevel.toString());
                }
            });
        
        // Difficulty setting
        const difficultyText = this.add.text(-180, 40, 'Difficulty:', {
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0, 0.5);
        settingsContainer.add(difficultyText);
        
        // Difficulty options
        const difficulties = ['Easy', 'Normal', 'Hard'];
        
        difficulties.forEach((difficulty, index) => {
            const x = -30 + (index * 80);
            const diffButton = this.add.text(x, 40, difficulty, {
                fontSize: '16px',
                color: difficulty === this.gameDifficulty ? '#00ff00' : '#cccccc'
            }).setOrigin(0.5, 0.5);
            
            diffButton.setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    this.setDifficulty(difficulty);
                    
                    // Update colors
                    settingsContainer.list.forEach(item => {
                        if (item instanceof Phaser.GameObjects.Text && 
                            difficulties.includes(item.text)) {
                            item.setColor(item.text === difficulty ? '#00ff00' : '#cccccc');
                        }
                    });
                });
            
            settingsContainer.add(diffButton);
        });
        
        // Share link feature (for demo purposes)
        const shareLinkText = this.add.text(0, 80, 'Invite Link: [Click to Copy]', {
            fontSize: '16px',
            color: '#88ccff'
        }).setOrigin(0.5, 0.5);
        
        shareLinkText.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                // In a real game, this would copy a link to the clipboard
                shareLinkText.setText('Invite Link: [Copied!]');
                this.time.delayedCall(1000, () => {
                    shareLinkText.setText('Invite Link: [Click to Copy]');
                });
            });
        
        settingsContainer.add(shareLinkText);
    }
    
    createButtons() {
        // Create Ready button
        this.readyButton = this.add.container(200, 450);
        
        const readyBg = this.add.rectangle(0, 0, 150, 50, 0x006600, 0.8)
            .setStrokeStyle(2, 0xffffff);
        
        const localPlayer = this.players.find(p => p.id === this.localPlayerId);
        const readyText = this.add.text(0, 0, localPlayer?.ready ? 'NOT READY' : 'READY', {
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);
        
        this.readyButton.add(readyBg);
        this.readyButton.add(readyText);
        
        readyBg.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                readyBg.setFillStyle(0x008800, 0.8);
            })
            .on('pointerout', () => {
                readyBg.setFillStyle(0x006600, 0.8);
            })
            .on('pointerdown', () => {
                this.toggleReady();
            });
        
        // Create Start Game button (for host only)
        this.startButton = this.add.container(760, 450);
        
        const startBg = this.add.rectangle(0, 0, 200, 50, 0x880000, 0.8)
            .setStrokeStyle(2, 0xffffff);
        
        const startText = this.add.text(0, 0, 'START MISSION', {
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);
        
        this.startButton.add(startBg);
        this.startButton.add(startText);
        
        // Only make the start button interactive if player is host
        if (this.players.find(p => p.id === this.localPlayerId)?.isHost) {
            startBg.setInteractive({ useHandCursor: true })
                .on('pointerover', () => {
                    startBg.setFillStyle(0xaa0000, 0.8);
                })
                .on('pointerout', () => {
                    startBg.setFillStyle(0x880000, 0.8);
                })
                .on('pointerdown', () => {
                    this.startGame();
                });
        } else {
            // Dim the button for non-hosts
            this.startButton.setAlpha(0.5);
        }
        
        // Create Back button
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
        
        // Update local player's tank class
        const localPlayerIndex = this.players.findIndex(p => p.id === this.localPlayerId);
        if (localPlayerIndex !== -1) {
            this.players[localPlayerIndex].tankClass = classType;
            this.updatePlayerList();
        }
    }
    
    toggleReady() {
        // Toggle ready status for local player
        const localPlayerIndex = this.players.findIndex(p => p.id === this.localPlayerId);
        if (localPlayerIndex !== -1) {
            this.players[localPlayerIndex].ready = !this.players[localPlayerIndex].ready;
            this.updatePlayerList();
            
            // Update ready button text
            const readyText = this.readyButton.getAt(1) as Phaser.GameObjects.Text;
            readyText.setText(this.players[localPlayerIndex].ready ? 'NOT READY' : 'READY');
        }
    }
    
    setDifficulty(difficulty: string) {
        this.gameDifficulty = difficulty;
    }
    
    startGame() {
        // In a real implementation, this would check if all players are ready
        // and if the current user is the host
        
        // For demo purposes, start the game immediately
        this.scene.start('ClassSelection', {
            mapType: this.selectedMapType,
            gameMode: this.selectedGameMode,
            tankClass: this.selectedClass,
            stageLevel: this.stageLevel,
            difficulty: this.gameDifficulty
        });
    }
    
    goBack() {
        this.scene.start('ModeSelection', {
            mapType: this.selectedMapType
        });
    }
} 