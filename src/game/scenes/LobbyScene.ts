import { Scene, GameObjects } from 'phaser';
import { AssetsEnum } from '../../app/constants/assets-enum';
import { TankClassDefinition, TankClasses, TankClassType } from '../entities/TankClass';
import { GameMode } from '../constants/GameModes';
// import { MapType } from '../constants/MapEnum';
import { SocketService, SocketEvents, Lobby, LobbyPlayer } from '../services/SocketService';
import { MapType } from '../map/MapManager';

// Interface for lobby scene data
interface LobbySceneData {
    username: string;
    isHost: boolean;
    lobbyId?: string;
}

export class LobbyScene extends Scene {
    // Lobby info
    private lobby: Lobby | null = null;
    private playerId: string = '';
    private username: string = '';
    private isHost: boolean = false;
    private selectedTankClass: TankClassType = TankClassType.VERSATILE;

    // UI elements
    private lobbyCodeText!: GameObjects.Text;
    private playerListContainer!: GameObjects.Container;
    private gameModeButtons: GameObjects.Container[] = [];
    private mapTypeButtons: GameObjects.Container[] = [];
    private classButtons: GameObjects.Container[] = [];
    private startButton!: GameObjects.Container;
    private readyButton!: GameObjects.Container;
    private backButton!: GameObjects.Container;
    private statusText!: GameObjects.Text;

    // Socket service
    private socketService: SocketService;

    constructor() {
        super({ key: 'LobbyScene' });
        this.socketService = SocketService.getInstance();
    }

    init(data: LobbySceneData) {
        this.username = data.username;
        this.isHost = data.isHost;

        // Setup event listeners
        this.setupSocketEventListeners();
    }

    create() {
        // Background
        this.add.image(512, 384, AssetsEnum.BACKGROUND)
            .setScale(1)
            .setTint(0x555555);

        // Title
        this.add.text(512, 50, 'GAME LOBBY', {
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5, 0.5);

        // Lobby code display
        this.add.text(512, 100, 'LOBBY CODE:', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);

        this.lobbyCodeText = this.add.text(512, 130, '------', {
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5, 0.5);

        // Create sections
        this.createPlayerListSection();
        this.createGameSettingsSection();
        this.createTankClassSection();
        this.createBottomButtons();

        // If we're joining an existing lobby
        if (!this.isHost) {
            this.joinExistingLobby();
        } else {
            this.createNewLobby();
        }
    }

    /**
     * Create a new lobby with this player as host
     */
    private createNewLobby() {
        // Set default values
        const initialGameMode = GameMode.CHAOS;
        const initialMapType = MapType.GRASS;

        // Create the lobby
        this.socketService.createLobby(this.username, initialGameMode, initialMapType, false)
            .then(lobby => {
                console.log('Lobby created:', lobby);
                this.lobby = lobby;
                this.playerId = this.socketService.socket?.id || '';
                this.lobbyCodeText.setText(lobby.id);
                this.updatePlayerList();
                this.updateGameSettingsButtons();
            })
            .catch(error => {
                console.error('Failed to create lobby:', error);
                this.showErrorMessage('Failed to create lobby');
            });
    }

    getLobbyId() {
        // TODO: Get lobby ID from URL
        return null;
    }

    /**
     * Join an existing lobby with lobby ID
     */
    private joinExistingLobby() {
        const lobbyId = this.getLobbyId();

        if (!lobbyId) {
            this.showErrorMessage('No lobby ID provided');
            return;
        }

        this.socketService.joinLobby(lobbyId, this.username)
            .then(lobby => {
                console.log('Lobby joined:', lobby);
                this.lobby = lobby;
                this.playerId = this.socketService.socket?.id || '';
                this.lobbyCodeText.setText(lobby.id);
                this.updatePlayerList();
                this.updateGameSettingsButtons();
            })
            .catch(error => {
                console.error('Failed to join lobby:', error);
                this.showErrorMessage('Failed to join lobby');
            });
    }

    /**
     * Set up socket event listeners
     */
    private setupSocketEventListeners() {
        // Lobby events
        this.socketService.on(SocketEvents.LOBBY_UPDATED, (updatedLobby: Lobby) => {
            console.log('Lobby updated:', updatedLobby);
            this.lobby = updatedLobby;
            this.updatePlayerList();
            this.updateGameSettingsButtons();
        });

        this.socketService.on(SocketEvents.PLAYER_JOINED, (player: LobbyPlayer) => {
            console.log('Player joined:', player);
            if (this.lobby) {
                this.lobby.players.push(player);
                this.updatePlayerList();
            }
        });

        this.socketService.on(SocketEvents.PLAYER_LEFT, (playerId: string) => {
            console.log('Player left:', playerId);
            if (this.lobby) {
                this.lobby.players = this.lobby.players.filter(p => p.id !== playerId);
                this.updatePlayerList();
            }
        });

        this.socketService.on(SocketEvents.GAME_STARTING, () => {
            console.log('Game starting!');
            this.startGame();
        });

        // Error handling
        this.socketService.on(SocketEvents.ERROR, (error: any) => {
            console.error('Socket error:', error);
            this.showErrorMessage(error.message || 'An error occurred');
        });
    }

    /**
     * Create player list section
     */
    private createPlayerListSection() {
        // Player list container on the left side
        const playerListBackground = this.add.rectangle(200, 300, 350, 400, 0x222244, 0.8)
            .setStrokeStyle(2, 0xffffff);

        this.add.text(200, 130, 'PLAYERS', {
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5, 0.5);

        this.playerListContainer = this.add.container(200, 300);
    }

    /**
     * Update the player list based on current lobby data
     */
    private updatePlayerList() {
        // Clear existing player list
        this.playerListContainer.removeAll();

        if (!this.lobby) return;

        const players = this.lobby.players;
        const startY = -150; // Starting Y position
        const spacing = 60; // Spacing between player entries

        players.forEach((player, index) => {
            const y = startY + (index * spacing);

            // Player container
            const playerContainer = this.add.container(0, y);

            // Background
            const background = this.add.rectangle(0, 0, 300, 50, 0x333366, 0.7)
                .setStrokeStyle(1, 0xaaaaaa);
            playerContainer.add(background);

            // Username
            const nameText = this.add.text(-130, 0, player.username, {
                fontSize: '20px',
                color: player.isHost ? '#ffff00' : '#ffffff'
            }).setOrigin(0, 0.5);
            playerContainer.add(nameText);

            // Status (ready/not ready)
            const statusColor = player.isReady ? '#00ff00' : '#ff0000';
            const statusText = this.add.text(100, 0, player.isReady ? 'READY' : 'NOT READY', {
                fontSize: '16px',
                color: statusColor
            }).setOrigin(0.5, 0.5);
            playerContainer.add(statusText);

            // Tank class icon (if selected)
            if (player.tankClass) {
                const tankClassInfo = TankClasses[player.tankClass as TankClassType];
                if (tankClassInfo) {
                    const tankIcon = this.add.image(-80, 0, tankClassInfo.tankBodyAsset)
                        .setScale(0.3);
                    playerContainer.add(tankIcon);
                }
            }

            // Add to player list container
            this.playerListContainer.add(playerContainer);
        });
    }

    /**
     * Create game settings section
     */
    private createGameSettingsSection() {
        // Game settings container on the right side
        const settingsBackground = this.add.rectangle(750, 230, 400, 250, 0x222244, 0.8)
            .setStrokeStyle(2, 0xffffff);

        this.add.text(750, 130, 'GAME SETTINGS', {
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5, 0.5);

        // Game mode selection
        this.add.text(650, 180, 'MODE:', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        // Create game mode buttons
        const modes = [
            { mode: GameMode.CHAOS, text: 'CHAOS', x: 650, y: 220 },
            { mode: GameMode.STAGE, text: 'STAGE', x: 800, y: 220 }
        ];

        this.gameModeButtons = modes.map(({ mode, text, x, y }) => {
            const container = this.add.container(x, y);
            const bg = this.add.rectangle(0, 0, 120, 40, 0x444488, 0.8)
                .setStrokeStyle(2, 0xaaaaaa);
            const txt = this.add.text(0, 0, text, {
                fontSize: '16px',
                color: '#ffffff'
            }).setOrigin(0.5, 0.5);

            container.add([bg, txt]);

            // Make interactive only for host
            if (this.isHost) {
                bg.setInteractive({ useHandCursor: true })
                    .on('pointerover', () => {
                        bg.setFillStyle(0x6666aa, 0.8);
                    })
                    .on('pointerout', () => {
                        bg.setFillStyle(0x444488, 0.8);
                    })
                    .on('pointerdown', () => {
                        this.selectGameMode(mode);
                    });
            }

            return container;
        });

        // Map type selection
        this.add.text(650, 280, 'MAP:', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        // Create map type buttons
        const maps = [
            { type: MapType.GRASS, text: 'GRASS', x: 650, y: 320 },
            { type: MapType.SAND, text: 'SAND', x: 750, y: 320 },
            { type: MapType.MIXED, text: 'MIXED', x: 850, y: 320 }
        ];

        this.mapTypeButtons = maps.map(({ type, text, x, y }) => {
            const container = this.add.container(x, y);
            const bg = this.add.rectangle(0, 0, 80, 40, 0x444488, 0.8)
                .setStrokeStyle(2, 0xaaaaaa);
            const txt = this.add.text(0, 0, text, {
                fontSize: '14px',
                color: '#ffffff'
            }).setOrigin(0.5, 0.5);

            container.add([bg, txt]);

            // Make interactive only for host
            if (this.isHost) {
                bg.setInteractive({ useHandCursor: true })
                    .on('pointerover', () => {
                        bg.setFillStyle(0x6666aa, 0.8);
                    })
                    .on('pointerout', () => {
                        bg.setFillStyle(0x444488, 0.8);
                    })
                    .on('pointerdown', () => {
                        this.selectMapType(type);
                    });
            }

            return container;
        });
    }

    /**
     * Update game settings buttons based on current lobby data
     */
    private updateGameSettingsButtons() {
        if (!this.lobby) return;

        // Update game mode buttons
        this.gameModeButtons.forEach(button => {
            const text = button.getAt(1) as GameObjects.Text;
            const rect = button.getAt(0) as GameObjects.Rectangle;

            if (text.text === this.lobby?.gameMode) {
                rect.setFillStyle(0x6666bb, 0.9);
                rect.setStrokeStyle(2, 0xffff00);
            } else {
                rect.setFillStyle(0x444488, 0.8);
                rect.setStrokeStyle(2, 0xaaaaaa);
            }
        });

        // Update map type buttons
        this.mapTypeButtons.forEach(button => {
            const text = button.getAt(1) as GameObjects.Text;
            const rect = button.getAt(0) as GameObjects.Rectangle;

            if (text.text === this.lobby?.mapType) {
                rect.setFillStyle(0x6666bb, 0.9);
                rect.setStrokeStyle(2, 0xffff00);
            } else {
                rect.setFillStyle(0x444488, 0.8);
                rect.setStrokeStyle(2, 0xaaaaaa);
            }
        });
    }

    /**
     * Create tank class selection section
     */
    private createTankClassSection() {
        // Tank class selection container
        const classBackground = this.add.rectangle(750, 450, 400, 200, 0x222244, 0.8)
            .setStrokeStyle(2, 0xffffff);

        this.add.text(750, 380, 'SELECT YOUR TANK', {
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5, 0.5);

        // Create tank class buttons
        const classTypes = Object.values(TankClassType);
        const startX = 600;
        const spacing = 100;

        this.classButtons = classTypes.map((classType: TankClassType, index: number) => {
            const x = startX + (index * spacing);
            const y = 450;
            const tankInfo = TankClasses[classType];

            const container = this.add.container(x, y);

            // Background
            const bg = this.add.rectangle(0, 0, 80, 80, 0x444488, 0.8)
                .setStrokeStyle(2, 0xaaaaaa);

            // Tank icon
            const tankIcon = this.add.image(0, -10, tankInfo.tankBodyAsset)
                .setScale(0.4);

            // Tank name
            const nameText = this.add.text(0, 30, tankInfo.name, {
                fontSize: '12px',
                color: '#ffffff'
            }).setOrigin(0.5, 0.5);

            container.add([bg, tankIcon, nameText]);

            // Make interactive
            bg.setInteractive({ useHandCursor: true })
                .on('pointerover', () => {
                    bg.setFillStyle(0x6666aa, 0.8);

                    // Show description
                    this.showTankDescription(tankInfo);
                })
                .on('pointerout', () => {
                    bg.setFillStyle(0x444488, 0.8);

                    // Hide description
                    this.hideTankDescription();
                })
                .on('pointerdown', () => {
                    this.selectTankClass(classType);
                });

            return container;
        });
    }

    /**
     * Show tank description
     */
    private showTankDescription(tankInfo: TankClassDefinition) {
        // Remove existing description if any
        this.hideTankDescription();

        // Create description container
        const descContainer = this.add.container(750, 500);
        descContainer.setName('tankDescription');

        // Background
        const bg = this.add.rectangle(0, 0, 350, 70, 0x222233, 0.9)
            .setStrokeStyle(1, 0xaaaaaa);

        // Description text
        const descText = this.add.text(0, -15, tankInfo.description, {
            fontSize: '14px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5, 0.5);

        // Specialty text
        const specText = this.add.text(0, 15, `Specialty: ${tankInfo.skillDescription}`, {
            fontSize: '14px',
            color: '#ffff00',
            align: 'center'
        }).setOrigin(0.5, 0.5);

        descContainer.add([bg, descText, specText]);
    }

    /**
     * Hide tank description
     */
    private hideTankDescription() {
        const descContainer = this.children.getByName('tankDescription');
        if (descContainer) {
            descContainer.destroy();
        }
    }

    /**
     * Create bottom buttons (start/ready and back)
     */
    private createBottomButtons() {
        // Status text
        this.statusText = this.add.text(512, 600, '', {
            fontSize: '18px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5, 0.5);

        // Create Start/Ready button
        if (this.isHost) {
            this.createStartButton();
        } else {
            this.createReadyButton();
        }

        // Back button
        this.createBackButton();
    }

    /**
     * Create start button (host only)
     */
    private createStartButton() {
        this.startButton = this.add.container(512, 650);

        const bg = this.add.rectangle(0, 0, 200, 50, 0x006600, 0.8)
            .setStrokeStyle(2, 0xffffff);

        const text = this.add.text(0, 0, 'START GAME', {
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);

        this.startButton.add([bg, text]);

        // Make interactive
        bg.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                bg.setFillStyle(0x008800, 0.8);
            })
            .on('pointerout', () => {
                bg.setFillStyle(0x006600, 0.8);
            })
            .on('pointerdown', () => {
                this.requestStartGame();
            });
    }

    /**
     * Create ready button (non-host only)
     */
    private createReadyButton() {
        this.readyButton = this.add.container(512, 650);

        const bg = this.add.rectangle(0, 0, 200, 50, 0x006600, 0.8)
            .setStrokeStyle(2, 0xffffff);

        const text = this.add.text(0, 0, 'READY', {
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);

        this.readyButton.add([bg, text]);

        // Make interactive
        bg.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                bg.setFillStyle(0x008800, 0.8);
            })
            .on('pointerout', () => {
                bg.setFillStyle(0x006600, 0.8);
            })
            .on('pointerdown', () => {
                this.toggleReady();
            });
    }

    /**
     * Create back button
     */
    private createBackButton() {
        this.backButton = this.add.container(100, 650);

        const bg = this.add.rectangle(0, 0, 150, 40, 0x660000, 0.8)
            .setStrokeStyle(2, 0xffffff);

        const text = this.add.text(0, 0, 'BACK', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);

        this.backButton.add([bg, text]);

        // Make interactive
        bg.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                bg.setFillStyle(0x880000, 0.8);
            })
            .on('pointerout', () => {
                bg.setFillStyle(0x660000, 0.8);
            })
            .on('pointerdown', () => {
                this.leaveLobby();
            });
    }

    /**
     * Select a game mode (host only)
     */
    private selectGameMode(mode: GameMode) {
        if (!this.isHost || !this.lobby) return;

        this.socketService.changeGameMode(mode);
    }

    /**
     * Select a map type (host only)
     */
    private selectMapType(mapType: MapType) {
        if (!this.isHost || !this.lobby) return;

        this.socketService.changeMapType(mapType);
    }

    /**
     * Select a tank class
     */
    private selectTankClass(classType: TankClassType) {
        this.selectedTankClass = classType;

        // Update visual selection
        this.classButtons.forEach(button => {
            // TODO: Update visual selection
        });

        // Inform server
        this.socketService.selectTankClass(classType);
    }

    /**
     * Toggle ready status (non-host only)
     */
    private toggleReady() {
        if (this.isHost) return;

        // Find player in lobby
        const player = this.lobby?.players.find(p => p.id === this.playerId);
        if (!player) return;

        // Toggle ready status
        this.socketService.toggleReady();

        // Update button appearance
        const bg = this.readyButton.getAt(0) as GameObjects.Rectangle;
        const text = this.readyButton.getAt(1) as GameObjects.Text;

        if (player.isReady) {
            bg.setFillStyle(0x660000, 0.8);
            text.setText('NOT READY');
        } else {
            bg.setFillStyle(0x006600, 0.8);
            text.setText('READY');
        }
    }

    /**
     * Request to start the game (host only)
     */
    private requestStartGame() {
        if (!this.isHost || !this.lobby) return;

        // Check if all players are ready
        const allReady = this.lobby.players.every(p => p.isHost || p.isReady);

        if (!allReady) {
            this.showStatusMessage('Not all players are ready!', '#ff0000');
            return;
        }

        // Check if everyone has selected a tank class
        const allSelectedClass = this.lobby.players.every(p => p.tankClass);

        if (!allSelectedClass) {
            this.showStatusMessage('Not all players have selected a tank class!', '#ff0000');
            return;
        }

        // Start the game
        this.socketService.startGame();
    }

    /**
     * Start the game
     */
    private startGame() {
        if (!this.lobby) return;

        // Transition to the game scene with lobby data
        this.scene.start('Game', {
            gameMode: this.lobby.gameMode,
            mapType: this.lobby.mapType,
            players: this.lobby.players,
            isMultiplayer: true,
            lobbyId: this.lobby.id
        });
    }

    /**
     * Leave the lobby and return to main menu
     */
    private leaveLobby() {
        this.socketService.leaveLobby();
        this.scene.start('MainMenu');
    }

    /**
     * Show a status message
     */
    private showStatusMessage(message: string, color: string = '#ffffff') {
        this.statusText.setText(message);
        this.statusText.setColor(color);

        // Clear message after a delay
        this.time.delayedCall(3000, () => {
            this.statusText.setText('');
        });
    }

    /**
     * Show an error message
     */
    private showErrorMessage(message: string) {
        this.showStatusMessage(message, '#ff0000');
    }

    /**
     * Clean up when shutting down the scene
     */
    shutdown() {
        // Remove all socket listeners to prevent memory leaks
        this.socketService.off(SocketEvents.LOBBY_UPDATED);
        this.socketService.off(SocketEvents.PLAYER_JOINED);
        this.socketService.off(SocketEvents.PLAYER_LEFT);
        this.socketService.off(SocketEvents.GAME_STARTING);
        this.socketService.off(SocketEvents.ERROR);
    }
} 