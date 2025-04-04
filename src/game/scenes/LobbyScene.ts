import { Scene, GameObjects } from 'phaser';
import { AssetsEnum } from '../../app/constants/assets-enum';
import { EventBus } from '../EventBus';
import { MapType } from '../map/MapManager';
import { GameMode, GameModes } from '../constants/GameModes';
import { TankClassType } from '../entities/TankClass';

// Define TankClasses with the required properties
const TankClasses: Record<TankClassType, {
    name: string;
    description: string;
    assetKey: string;
    specialty: string;
}> = {
    [TankClassType.VERSATILE]: {
        name: 'Versatile',
        description: 'Balanced in all aspects. Good for beginners and adaptable to any situation.',
        assetKey: AssetsEnum.TANK_BLUE,
        specialty: 'All-Rounder'
    },
    [TankClassType.DEALER]: {
        name: 'Dealer',
        description: 'High damage output but less durability. Best for players who want to deal maximum damage.',
        assetKey: AssetsEnum.TANK_RED,
        specialty: 'High Damage'
    },
    [TankClassType.BRUISER]: {
        name: 'Bruiser',
        description: 'High durability with moderate damage. Can withstand heavy attacks and is perfect for frontline combat.',
        assetKey: AssetsEnum.TANK_SAND,
        specialty: 'High Health'
    },
    [TankClassType.SUPPORTER]: {
        name: 'Supporter',
        description: 'Provides utility and support abilities. Can heal allies and deploy special effects on the battlefield.',
        assetKey: AssetsEnum.TANK_GREEN,
        specialty: 'Team Support'
    }
};

interface LobbySceneData {
    isHost: boolean;
    lobbyId: string;
    mapType?: MapType;
}

interface LobbyPlayer {
    id: string;
    name: string;
    tankClass: TankClassType;
    ready: boolean;
    isHost: boolean;
    avatar: string;
}

export class LobbyScene extends Scene {
    // Lobby information
    lobbyId: string = '';
    isHost: boolean = false;
    selectedMapType: MapType = MapType.GRASS;
    selectedGameMode: GameMode = GameMode.CHAOS; // Default to Chaos, can be changed

    // Player information
    localPlayerId: string = 'player1'; // Simulated local player ID
    players: LobbyPlayer[] = [];
    selectedClass: TankClassType = TankClassType.VERSATILE;

    // UI elements
    classButtons: { [key in TankClassType]?: Phaser.GameObjects.Container } = {};
    playersListContainer: Phaser.GameObjects.Container;
    startButton: Phaser.GameObjects.Container;
    readyButton: Phaser.GameObjects.Container;
    gameModeButtons: { [key in GameMode]?: Phaser.GameObjects.Container } = {};
    mapButtons: { [key in MapType]?: Phaser.GameObjects.Container } = {};
    classDescText: Phaser.GameObjects.Text;

    mapLabels: { [key in MapType]: string } = {
        [MapType.GRASS]: 'Grass Land',
        [MapType.SAND]: 'Desert',
        [MapType.MIXED]: 'Mixed'
    };

    constructor() {
        super('LobbyScene');
    }

    init(data: LobbySceneData) {
        this.isHost = data.isHost || false;
        this.lobbyId = data.lobbyId || 'lobby_' + Math.floor(Math.random() * 1000);
        this.selectedMapType = data.mapType || MapType.GRASS;

        // For demo purposes, create mock players
        this.players = [
            {
                id: 'player1',
                name: this.isHost ? 'You (Host)' : 'You',
                tankClass: TankClassType.VERSATILE,
                ready: false,
                isHost: this.isHost,
                avatar: AssetsEnum.TANK_BLUE
            }
        ];

        // Add some mock players if we're the host
        if (this.isHost) {
            // Add 2-3 mock players after a short delay for demo purposes
            setTimeout(() => {
                this.addMockPlayer('player2', 'BattleBuddy', TankClassType.BRUISER, false, AssetsEnum.TANK_SAND);

                setTimeout(() => {
                    this.addMockPlayer('player3', 'DestroyerX', TankClassType.DEALER, false, AssetsEnum.TANK_RED);

                    setTimeout(() => {
                        if (Math.random() > 0.5) {
                            this.addMockPlayer('player4', 'TankMaster', TankClassType.SUPPORTER, false, AssetsEnum.TANK_GREEN);
                        }
                    }, 4000);
                }, 2000);
            }, 1000);
        }
    }

    create() {
        // Add background
        const background = this.add.image(512, 384, AssetsEnum.BACKGROUND);
        background.setAlpha(0.7);

        // Add title
        const title = this.add.text(
            this.cameras.main.width / 2,
            40,
            `GAME LOBBY #${this.lobbyId}`,
            {
                fontSize: '32px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5, 0.5);

        // Create main sections
        this.createPlayersListSection();
        this.createClassSelectionSection();
        this.createGameSettingsSection();
        this.createButtons();

        // Create back button
        this.createBackButton();

        // Emit event for Angular component
        EventBus.emit('current-scene-ready', this);
    }

    createButtons() {
        // Create buttons at the bottom
        if (this.isHost) {
            // Host sees START GAME button
            this.startButton = this.add.container(512, 680);
            const startBg = this.add.rectangle(0, 0, 200, 50, 0x006600, 0.8)
                .setStrokeStyle(2, 0xffffff);
            const startText = this.add.text(0, 0, 'START GAME', {
                fontSize: '20px',
                fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0.5, 0.5);

            this.startButton.add(startBg);
            this.startButton.add(startText);

            startBg.setInteractive({ useHandCursor: true })
                .on('pointerover', () => {
                    startBg.setFillStyle(0x008800, 0.8);
                })
                .on('pointerout', () => {
                    startBg.setFillStyle(0x006600, 0.8);
                })
                .on('pointerdown', () => {
                    this.startGame();
                });
        } else {
            // Non-host sees READY button
            this.readyButton = this.add.container(512, 650);
            const readyBg = this.add.rectangle(0, 0, 200, 50, 0x880000, 0.8)
                .setStrokeStyle(2, 0xffffff);
            const readyText = this.add.text(0, 0, 'I\'M READY', {
                fontSize: '20px',
                fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0.5, 0.5);

            this.readyButton.add(readyBg);
            this.readyButton.add(readyText);

            // Track player ready state
            let isReady = false;

            readyBg.setInteractive({ useHandCursor: true })
                .on('pointerover', () => {
                    readyBg.setFillStyle(isReady ? 0x008800 : 0xaa0000, 0.8);
                })
                .on('pointerout', () => {
                    readyBg.setFillStyle(isReady ? 0x006600 : 0x880000, 0.8);
                })
                .on('pointerdown', () => {
                    isReady = !isReady;
                    this.toggleReady();

                    // Update button appearance
                    readyBg.setFillStyle(isReady ? 0x006600 : 0x880000, 0.8);
                    readyText.setText(isReady ? 'READY!' : 'I\'M READY');
                });
        }
    }

    createBackButton() {
        const backButton = this.add.container(100, 40);
        const backBg = this.add.rectangle(0, 0, 120, 40, 0x000000, 0.6)
            .setStrokeStyle(1, 0xffffff);
        const backText = this.add.text(0, 0, '< BACK', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);

        backButton.add(backBg);
        backButton.add(backText);

        backBg.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                backBg.setFillStyle(0x222222, 0.6);
            })
            .on('pointerout', () => {
                backBg.setFillStyle(0x000000, 0.6);
            })
            .on('pointerdown', () => {
                this.leaveGame();
            });
    }

    leaveGame() {
        // Show confirmation dialog before leaving
        this.showConfirmation('Are you sure you want to leave the lobby?', () => {
            // Go back to main menu
            this.scene.start('MainMenu');
        });
    }

    startGame() {
        // Check if all players are ready
        const allPlayersReady = this.players.every(p => p.id === this.localPlayerId || p.ready);

        if (!allPlayersReady) {
            this.showNotification('Not all players are ready!');
            return;
        }

        // Start the appropriate game mode
        if (this.selectedGameMode === GameMode.CHAOS) {
            this.scene.start('ClassSelection', {
                gameMode: this.selectedGameMode,
                mapType: this.selectedMapType
            });
        } else if (this.selectedGameMode === GameMode.STAGE) {
            this.scene.start('ClassSelection', {
                gameMode: this.selectedGameMode,
                mapType: this.selectedMapType,
                stageLevel: 1
            });
        }
    }

    toggleReady() {
        // Toggle ready state for local player
        const localPlayer = this.players.find(p => p.id === this.localPlayerId);
        if (localPlayer) {
            localPlayer.ready = !localPlayer.ready;

            // Update the player list UI
            this.updatePlayersList();

            // In a real implementation, you would broadcast this to other players
            this.showNotification(localPlayer.ready ? 'You are now ready!' : 'You are no longer ready!');
        }
    }

    showConfirmation(message: string, onConfirm: () => void) {
        // Create a confirmation dialog
        const modal = this.add.container(512, 384);
        modal.setDepth(1000);

        // Background overlay
        const overlay = this.add.rectangle(0, 0, 1024, 768, 0x000000, 0.7);
        overlay.setOrigin(0.5, 0.5);
        modal.add(overlay);

        // Dialog box
        const dialogBg = this.add.rectangle(0, 0, 400, 200, 0x333333, 0.9)
            .setStrokeStyle(2, 0xffffff);
        modal.add(dialogBg);

        // Message
        const messageText = this.add.text(0, -40, message, {
            fontSize: '20px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 350 }
        }).setOrigin(0.5, 0.5);
        modal.add(messageText);

        // Yes button
        const yesButton = this.add.container(-80, 40);
        const yesBg = this.add.rectangle(0, 0, 120, 40, 0x006600, 0.8)
            .setStrokeStyle(1, 0xffffff);
        const yesText = this.add.text(0, 0, 'YES', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);

        yesButton.add(yesBg);
        yesButton.add(yesText);
        modal.add(yesButton);

        // No button
        const noButton = this.add.container(80, 40);
        const noBg = this.add.rectangle(0, 0, 120, 40, 0x660000, 0.8)
            .setStrokeStyle(1, 0xffffff);
        const noText = this.add.text(0, 0, 'NO', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);

        noButton.add(noBg);
        noButton.add(noText);
        modal.add(noButton);

        // Make buttons interactive
        yesBg.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                yesBg.setFillStyle(0x008800, 0.8);
            })
            .on('pointerout', () => {
                yesBg.setFillStyle(0x006600, 0.8);
            })
            .on('pointerdown', () => {
                modal.destroy();
                onConfirm();
            });

        noBg.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                noBg.setFillStyle(0x880000, 0.8);
            })
            .on('pointerout', () => {
                noBg.setFillStyle(0x660000, 0.8);
            })
            .on('pointerdown', () => {
                modal.destroy();
            });
    }

    createPlayersListSection() {
        // Create players list on the right side
        this.playersListContainer = this.add.container(784, 240);

        // Background panel
        const listBg = this.add.rectangle(0, 0, 420, 360, 0x222222, 0.8)
            .setStrokeStyle(2, 0xffffff);
        this.playersListContainer.add(listBg);

        // Title
        const listTitle = this.add.text(
            0,
            -160,
            'PLAYERS',
            {
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5, 0.5);
        this.playersListContainer.add(listTitle);

        // Invite friend button
        const inviteContainer = this.add.container(120, -160);
        const inviteBg = this.add.rectangle(0, 0, 160, 30, 0x006600, 0.8)
            .setStrokeStyle(1, 0xffffff);
        const inviteText = this.add.text(0, 0, 'INVITE FRIEND', {
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);

        inviteContainer.add(inviteBg);
        inviteContainer.add(inviteText);
        this.playersListContainer.add(inviteContainer);

        inviteBg.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                inviteBg.setFillStyle(0x008800, 0.8);
            })
            .on('pointerout', () => {
                inviteBg.setFillStyle(0x006600, 0.8);
            })
            .on('pointerdown', () => {
                // Show invite dialog/functionality
                this.showInviteDialog();
            });

        // Header row
        const headerY = -120;
        const avatarHeader = this.add.text(-180, headerY, 'AVATAR', {
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#ffcc00'
        }).setOrigin(0.5, 0.5);

        const nameHeader = this.add.text(-60, headerY, 'PLAYER', {
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#ffcc00'
        }).setOrigin(0.5, 0.5);

        const classHeader = this.add.text(60, headerY, 'TANK', {
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#ffcc00'
        }).setOrigin(0.5, 0.5);

        const statusHeader = this.add.text(160, headerY, 'STATUS', {
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#ffcc00'
        }).setOrigin(0.5, 0.5);

        this.playersListContainer.add(avatarHeader);
        this.playersListContainer.add(nameHeader);
        this.playersListContainer.add(classHeader);
        this.playersListContainer.add(statusHeader);

        // Update player list
        this.updatePlayersList();

        // Add invite link section at bottom
        const inviteLinkContainer = this.add.container(800, 30);

        const linkText = this.add.text(0, 10, `Link to lobby:`, {
            fontSize: '14px',
            color: '#000000'
        }).setOrigin(0.5, 0.5);
        inviteLinkContainer.add(linkText);

        const copyButton = this.add.container(140, 10);
        const copyBg = this.add.rectangle(0, 0, 80, 24, 0x444444, 0.8)
            .setStrokeStyle(1, 0xffffff);
        const copyText = this.add.text(0, 0, 'COPY LINK', {
            fontSize: '12px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);

        copyButton.add(copyBg);
        copyButton.add(copyText);
        inviteLinkContainer.add(copyButton);

        copyBg.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                copyBg.setFillStyle(0x666666, 0.8);
            })
            .on('pointerout', () => {
                copyBg.setFillStyle(0x444444, 0.8);
            })
            .on('pointerdown', () => {
                // Copy to clipboard functionality
                this.showNotification('Invite link copied to clipboard!');
            });

        this.playersListContainer.add(inviteLinkContainer);
    }

    updatePlayersList() {
        // Clear existing player entries (if any)
        for (let i = this.playersListContainer.length - 1; i >= 7; i--) {
            this.playersListContainer.removeAt(i);
        }

        // Add player entries
        this.players.forEach((player, index) => {
            const y = -90 + (index * 40);

            // Player container
            const playerRow = this.add.container(0, y);

            // Avatar
            try {
                const avatar = this.add.image(-180, 0, player.avatar).setScale(0.4);
                playerRow.add(avatar);
            } catch (e) {
                const avatarPlaceholder = this.add.circle(-180, 0, 15, 0x3366ff);
                playerRow.add(avatarPlaceholder);
            }

            // Player name
            const nameText = this.add.text(-60, 0,
                player.name + (player.isHost ? ' 👑' : ''), {
                fontSize: '16px',
                color: player.id === this.localPlayerId ? '#88ff88' : '#ffffff'
            }).setOrigin(0.5, 0.5);
            playerRow.add(nameText);

            // Tank class
            const classDefinition = TankClasses[player.tankClass];
            const classText = this.add.text(60, 0, classDefinition.name, {
                fontSize: '14px',
                color: '#cccccc'
            }).setOrigin(0.5, 0.5);
            playerRow.add(classText);

            // Status (ready/not ready)
            const statusText = this.add.text(160, 0, player.ready ? 'READY' : 'NOT READY', {
                fontSize: '14px',
                color: player.ready ? '#00ff00' : '#ff0000'
            }).setOrigin(0.5, 0.5);
            playerRow.add(statusText);

            // Add kick button for host (except for self)
            if (this.isHost && player.id !== this.localPlayerId) {
                const kickButton = this.add.container(200, 0);
                const kickBg = this.add.rectangle(0, 0, 18, 18, 0x880000, 0.8)
                    .setStrokeStyle(1, 0xffffff);
                const kickText = this.add.text(0, 0, 'X', {
                    fontSize: '12px',
                    color: '#ffffff'
                }).setOrigin(0.5, 0.5);

                kickButton.add(kickBg);
                kickButton.add(kickText);
                playerRow.add(kickButton);

                kickBg.setInteractive({ useHandCursor: true })
                    .on('pointerover', () => {
                        kickBg.setFillStyle(0xaa0000, 0.8);
                    })
                    .on('pointerout', () => {
                        kickBg.setFillStyle(0x880000, 0.8);
                    })
                    .on('pointerdown', () => {
                        this.kickPlayer(player);
                    });
            }

            this.playersListContainer.add(playerRow);
        });
    }

    createClassSelectionSection() {
        // Create class selection on the left side
        const classContainer = this.add.container(240, 240);

        // Background panel
        const classBg = this.add.rectangle(0, 0, 420, 360, 0x222222, 0.8)
            .setStrokeStyle(2, 0xffffff);
        classContainer.add(classBg);

        // Title
        const classTitle = this.add.text(
            0,
            -160,
            'SELECT YOUR TANK',
            {
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5, 0.5);
        classContainer.add(classTitle);

        // Tank Class Buttons
        const tankClasses = [
            TankClassType.VERSATILE,
            TankClassType.DEALER,
            TankClassType.BRUISER,
            TankClassType.SUPPORTER
        ];

        // Get the local player
        const localPlayer = this.players.find(p => p.id === this.localPlayerId);
        if (localPlayer) {
            this.selectedClass = localPlayer.tankClass;
        }

        // Create class buttons with a 2x2 grid layout
        tankClasses.forEach((tankClass, index) => {
            const classInfo = TankClasses[tankClass];
            const col = index % 2;
            const row = Math.floor(index / 2);

            const xPos = col === 0 ? -100 : 100;
            const yPos = row === 0 ? -80 : 40;

            // Create button container
            const buttonContainer = this.add.container(xPos, yPos);

            // Background for tank class
            const buttonBg = this.add.rectangle(0, 0, 180, 100, 0x333333, 0.8)
                .setStrokeStyle(2, 0xcccccc);
            buttonContainer.add(buttonBg);

            // Tank class name
            const nameText = this.add.text(0, -40, classInfo.name, {
                fontSize: '18px',
                fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0.5, 0);
            buttonContainer.add(nameText);

            // Tank image placeholder
            try {
                const tankImage = this.add.image(0, 0, classInfo.assetKey || AssetsEnum.TANK_BLUE).setScale(0.4);
                buttonContainer.add(tankImage);
            } catch (e) {
                const tankPlaceholder = this.add.rectangle(0, 0, 40, 40, 0x3366ff);
                buttonContainer.add(tankPlaceholder);
            }

            // Specialty label
            const specialtyText = this.add.text(0, 30, classInfo.specialty, {
                fontSize: '14px',
                color: '#88ccff'
            }).setOrigin(0.5, 0);
            buttonContainer.add(specialtyText);

            // Make button interactive
            buttonBg.setInteractive({ useHandCursor: true })
                .on('pointerover', () => {
                    buttonBg.setStrokeStyle(2, 0xffffff);
                    buttonBg.setFillStyle(0x444444, 0.8);
                })
                .on('pointerout', () => {
                    if (this.selectedClass !== tankClass) {
                        buttonBg.setStrokeStyle(2, 0xcccccc);
                        buttonBg.setFillStyle(0x333333, 0.8);
                    } else {
                        buttonBg.setStrokeStyle(3, 0xffcc00);
                    }
                })
                .on('pointerdown', () => {
                    this.selectClass(tankClass);
                });

            // Highlight selected class
            if (this.selectedClass === tankClass) {
                buttonBg.setStrokeStyle(3, 0xffcc00);
                buttonBg.setFillStyle(0x444444, 0.8);
            }

            // Store reference to button
            this.classButtons[tankClass] = buttonContainer;

            classContainer.add(buttonContainer);
        });

        // Add class description area
        const descContainer = this.add.container(0, 130);
        const descBg = this.add.rectangle(0, 0, 380, 80, 0x333333, 0.8)
            .setStrokeStyle(1, 0xffffff);
        descContainer.add(descBg);

        // Show description of selected class
        const selectedClassInfo = TankClasses[this.selectedClass];
        const descText = this.add.text(
            0,
            0,
            selectedClassInfo.description,
            {
                fontSize: '14px',
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: 360 }
            }
        ).setOrigin(0.5, 0.5);
        descContainer.add(descText);

        // Add the description container
        classContainer.add(descContainer);

        // Remember the description text for updates
        this.classDescText = descText;
    }

    selectClass(classType: TankClassType) {
        // Update selection
        this.selectedClass = classType;

        // Update local player's class
        const localPlayer = this.players.find(p => p.id === this.localPlayerId);
        if (localPlayer) {
            localPlayer.tankClass = classType;
            this.updatePlayersList();
        }

        // Update button visuals
        Object.entries(this.classButtons).forEach(([key, button]) => {
            const tankClass = key as TankClassType;
            const buttonBg = button.getAt(0) as Phaser.GameObjects.Rectangle;

            if (tankClass === classType) {
                buttonBg.setStrokeStyle(3, 0xffcc00);
                buttonBg.setFillStyle(0x444444, 0.8);
            } else {
                buttonBg.setStrokeStyle(2, 0xcccccc);
                buttonBg.setFillStyle(0x333333, 0.8);
            }
        });

        // Update description
        const classInfo = TankClasses[classType];
        if (this.classDescText) {
            this.classDescText.setText(classInfo.description);
        }
    }

    createGameSettingsSection() {
        // Only show game settings if the player is the host
        if (!this.isHost) {
            const waitingText = this.add.text(
                512,
                560,
                'Waiting for host to configure game settings...',
                {
                    fontSize: '18px',
                    color: '#cccccc',
                    stroke: '#000000',
                    strokeThickness: 2
                }
            ).setOrigin(0.5, 0.5);

            return;
        }

        // Create settings container
        const settingsContainer = this.add.container(512, 560);

        // Background
        const settingsBg = this.add.rectangle(0, 0, 960, 180, 0x222222, 0.8)
            .setStrokeStyle(2, 0xffffff);
        settingsContainer.add(settingsBg);

        // Title
        const settingsTitle = this.add.text(
            0,
            -70,
            'GAME SETTINGS',
            {
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5, 0.5);
        settingsContainer.add(settingsTitle);

        // Create two sections: Game Mode and Map

        // ---------- Game Mode Section ----------
        const modeSectionX = -240;

        // Mode title
        const modeTitle = this.add.text(
            modeSectionX,
            -30,
            'GAME MODE',
            {
                fontSize: '18px',
                fontStyle: 'bold',
                color: '#ffffff'
            }
        ).setOrigin(0.5, 0.5);
        settingsContainer.add(modeTitle);

        // Mode buttons (only Chaos and Stage)
        const availableModes = [GameMode.CHAOS, GameMode.STAGE];
        const modeSpacing = 120;

        availableModes.forEach((mode, index) => {
            const modeInfo = GameModes[mode];
            const xPos = modeSectionX + ((index - 0.5) * modeSpacing) + modeSpacing / 2;

            // Create button container
            const buttonContainer = this.add.container(xPos, 20);

            // Background
            const buttonBg = this.add.rectangle(0, 0, 100, 80, 0x333333, 0.8)
                .setStrokeStyle(2, 0xcccccc);
            buttonContainer.add(buttonBg);

            // Mode name
            const nameText = this.add.text(0, -25, modeInfo.name, {
                fontSize: '16px',
                fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0.5, 0.5);
            buttonContainer.add(nameText);

            // Mode icon placeholder
            const modeIcon = this.add.rectangle(0, 5, 30, 30, mode === GameMode.CHAOS ? 0xff0000 : 0x00ff00);
            buttonContainer.add(modeIcon);

            // Make button interactive
            buttonBg.setInteractive({ useHandCursor: true })
                .on('pointerover', () => {
                    buttonBg.setStrokeStyle(2, 0xffffff);
                    buttonBg.setFillStyle(0x444444, 0.8);
                })
                .on('pointerout', () => {
                    if (this.selectedGameMode !== mode) {
                        buttonBg.setStrokeStyle(2, 0xcccccc);
                        buttonBg.setFillStyle(0x333333, 0.8);
                    } else {
                        buttonBg.setStrokeStyle(3, 0xffcc00);
                    }
                })
                .on('pointerdown', () => {
                    this.selectGameMode(mode);
                });

            // Highlight selected mode
            if (this.selectedGameMode === mode) {
                buttonBg.setStrokeStyle(3, 0xffcc00);
                buttonBg.setFillStyle(0x444444, 0.8);
            }

            // Store reference to button
            this.gameModeButtons[mode] = buttonContainer;

            settingsContainer.add(buttonContainer);
        });

        // ---------- Map Section ----------
        const mapSectionX = 240;

        // Map title
        const mapTitle = this.add.text(
            mapSectionX,
            -30,
            'MAP TYPE',
            {
                fontSize: '18px',
                fontStyle: 'bold',
                color: '#ffffff'
            }
        ).setOrigin(0.5, 0.5);
        settingsContainer.add(mapTitle);

        // Map buttons
        const availableMaps = [MapType.GRASS, MapType.SAND, MapType.MIXED];
        const mapSpacing = 100;

        availableMaps.forEach((mapType, index) => {
            const xPos = mapSectionX + ((index - 1) * mapSpacing);

            // Create button container
            const buttonContainer = this.add.container(xPos, 20);

            // Background
            const buttonBg = this.add.rectangle(0, 0, 90, 80, 0x333333, 0.8)
                .setStrokeStyle(2, 0xcccccc);
            buttonContainer.add(buttonBg);

            // Map name
            const nameText = this.add.text(0, -25, this.mapLabels[mapType], {
                fontSize: '14px',
                fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0.5, 0.5);
            buttonContainer.add(nameText);

            // Map icon placeholder
            const mapColor = mapType === MapType.GRASS ? 0x00aa00 :
                mapType === MapType.SAND ? 0xddaa00 : 0x55aa55;
            const mapIcon = this.add.rectangle(0, 5, 30, 30, mapColor);
            buttonContainer.add(mapIcon);

            // Make button interactive
            buttonBg.setInteractive({ useHandCursor: true })
                .on('pointerover', () => {
                    buttonBg.setStrokeStyle(2, 0xffffff);
                    buttonBg.setFillStyle(0x444444, 0.8);
                })
                .on('pointerout', () => {
                    if (this.selectedMapType !== mapType) {
                        buttonBg.setStrokeStyle(2, 0xcccccc);
                        buttonBg.setFillStyle(0x333333, 0.8);
                    } else {
                        buttonBg.setStrokeStyle(3, 0xffcc00);
                    }
                })
                .on('pointerdown', () => {
                    this.selectMapType(mapType);
                });

            // Highlight selected map
            if (this.selectedMapType === mapType) {
                buttonBg.setStrokeStyle(3, 0xffcc00);
                buttonBg.setFillStyle(0x444444, 0.8);
            }

            // Store reference to button
            this.mapButtons[mapType] = buttonContainer;

            settingsContainer.add(buttonContainer);
        });
    }

    selectGameMode(mode: GameMode) {
        this.selectedGameMode = mode;

        // Update button visuals
        Object.entries(this.gameModeButtons).forEach(([key, button]) => {
            const gameMode = key as GameMode;
            const buttonBg = button.getAt(0) as Phaser.GameObjects.Rectangle;

            if (gameMode === mode) {
                buttonBg.setStrokeStyle(3, 0xffcc00);
                buttonBg.setFillStyle(0x444444, 0.8);
            } else {
                buttonBg.setStrokeStyle(2, 0xcccccc);
                buttonBg.setFillStyle(0x333333, 0.8);
            }
        });

        // Broadcast game mode update to other players
        this.broadcastGameSettings();
    }

    selectMapType(mapType: MapType) {
        this.selectedMapType = mapType;

        // Update button visuals
        Object.entries(this.mapButtons).forEach(([key, button]) => {
            const map = key as MapType;
            const buttonBg = button.getAt(0) as Phaser.GameObjects.Rectangle;

            if (map === mapType) {
                buttonBg.setStrokeStyle(3, 0xffcc00);
                buttonBg.setFillStyle(0x444444, 0.8);
            } else {
                buttonBg.setStrokeStyle(2, 0xcccccc);
                buttonBg.setFillStyle(0x333333, 0.8);
            }
        });

        // Broadcast map update to other players
        this.broadcastGameSettings();
    }

    broadcastGameSettings() {
        // In a real implementation, this would use a network library
        // to broadcast the settings to all players
        console.log('Broadcasting settings:', {
            gameMode: this.selectedGameMode,
            mapType: this.selectedMapType
        });

        // For demo purposes, show notification
        this.showNotification('Game settings updated!');
    }

    addMockPlayer(id: string, name: string, tankClass: TankClassType, ready: boolean, avatar: string) {
        // For demo purposes only - add a mock player
        this.players.push({
            id,
            name,
            tankClass,
            ready,
            isHost: false,
            avatar
        });

        this.updatePlayersList();
    }

    kickPlayer(player: LobbyPlayer) {
        // Remove player from the players array
        this.players = this.players.filter(p => p.id !== player.id);
        this.updatePlayersList();
        this.showNotification(`Player ${player.name} has been kicked!`);
    }

    showInviteDialog() {
        // Simple notification instead of a full dialog for demo purposes
        this.showNotification('Friend invitation feature coming soon!');
    }

    showNotification(message: string) {
        // Create a notification that fades out
        const notification = this.add.container(512, 100);

        const notifBg = this.add.rectangle(0, 0, 400, 40, 0x000000, 0.8)
            .setStrokeStyle(1, 0xffffff);

        const notifText = this.add.text(0, 0, message, {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);

        notification.add(notifBg);
        notification.add(notifText);

        // Make the notification appear and then fade out
        notification.setAlpha(0);
        this.tweens.add({
            targets: notification,
            alpha: 1,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.tweens.add({
                    targets: notification,
                    alpha: 0,
                    delay: 2000,
                    duration: 300,
                    ease: 'Power2',
                    onComplete: () => {
                        notification.destroy();
                    }
                });
            }
        });
    }
} 