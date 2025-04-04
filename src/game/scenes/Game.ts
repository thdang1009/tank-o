import { SocketEventBus } from '../utils/SocketEventBus';
import { Scene } from 'phaser';
import { GameConfig, GameManager } from '../managers/GameManager';
import { MapType } from '../map/MapManager';
import { TankClassType } from '../entities/TankClass';
import { makeAudioPath } from '../../app/utils/asset-utils';
import { GameMode } from '../constants/GameModes';
import { SocketService, SocketEvents, LobbyPlayer } from '../services/SocketService';
import { NotificationManager, NotificationType } from '../utils/NotificationManager';
import { Player } from '../entities/Player';
import { PhaserAngularEventBus } from '../PhaserAngularEventBus';

export interface GameSceneData {
    gameMode: GameMode;
    mapType: MapType;
    selectedClass?: TankClassType;
    stageLevel?: number;
    difficulty?: string;
    isMultiplayer?: boolean;
    players?: LobbyPlayer[];
    lobbyId?: string;
}

const gameDefaultConfig: GameConfig = {
    initialWave: 1,
    maxWaves: 10,
    enemiesPerWave: 5,
    waveDelay: 1000,
    mapType: MapType.GRASS
}

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    gameManager: GameManager;
    selectedMapType: MapType = MapType.GRASS;
    selectedTankClass: TankClassType = TankClassType.VERSATILE;
    selectedGameMode: GameMode = GameMode.SOLO;
    stageLevel: number = 1;
    difficulty: string = 'Normal';
    
    // HUD elements
    gameModeText: Phaser.GameObjects.Text;

    // Multiplayer properties
    private isMultiplayer: boolean = false;
    private lobbyId: string = '';
    private lobbyPlayers: LobbyPlayer[] = [];
    private socketService: SocketService;
    private otherPlayers: Map<string, Player> = new Map();
    private notificationManager!: NotificationManager;
    
    constructor ()
    {
        super('Game');
        this.socketService = SocketService.getInstance();
    }

    init(data: GameSceneData) {
        console.log('Game init', data);
        this.selectedMapType = data.mapType;
        this.selectedTankClass = data.selectedClass || TankClassType.VERSATILE;
        this.selectedGameMode = data.gameMode;
        
        if (data.stageLevel) {
            this.stageLevel = data.stageLevel;
        }
        
        if (data.difficulty) {
            this.difficulty = data.difficulty;
        }
        
        // Set multiplayer properties
        this.isMultiplayer = data.isMultiplayer || false;
        this.lobbyId = data.lobbyId || '';
        this.lobbyPlayers = data.players || [];
        
        // Set selected class from lobby data if multiplayer
        if (this.isMultiplayer && data.players) {
            const currentPlayer = data.players.find(p => p.id === this.socketService.socket?.id);
            if (currentPlayer && currentPlayer.tankClass) {
                this.selectedTankClass = currentPlayer.tankClass as TankClassType;
            }
        }
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        // Ensure physics is initialized before creating GameManager
        if (!this.physics || !this.physics.add) {
            console.error('Physics system not initialized properly');
            return;
        }
        
        // Adjust game configuration based on game mode
        let config = {
            ...gameDefaultConfig,
            mapType: this.selectedMapType,
            tankClass: this.selectedTankClass,
            gameMode: this.selectedGameMode
        };
        
        // Customize config based on game mode
        switch (this.selectedGameMode) {
            case GameMode.SOLO:
                // Default solo configuration is fine
                break;
                
            case GameMode.CHAOS:
                // Chaos mode - fewer enemies, but players fight each other
                config = {
                    ...config,
                    maxWaves: 5,
                    enemiesPerWave: 3,
                    isMultiplayer: true,
                    friendlyFire: true
                };
                break;
                
            case GameMode.STAGE:
                // Stage mode - cooperative with boss at the end
                config = {
                    ...config,
                    maxWaves: this.stageLevel * 2,
                    enemiesPerWave: 4 + Math.floor(this.stageLevel / 2),
                    isMultiplayer: true,
                    hasBoss: true,
                    friendlyFire: false,
                    stageLevel: this.stageLevel,
                    difficulty: this.difficulty
                };
                break;
        }
        
        this.gameManager = new GameManager(this, config);
        this.gameManager.startGame();

        // Add game mode indicator to HUD
        this.createModeHUD();

        // Initialize notification manager
        this.notificationManager = new NotificationManager(this);

        // Setup multiplayer if needed
        if (this.isMultiplayer) {
            this.setupMultiplayer();
        }

        // Notify that the scene is ready
        PhaserAngularEventBus.emit('current-scene-ready', this);
    }
    
    createModeHUD() {
        // Add mode indicator to the top-right corner
        let modeText = 'SOLO MODE';
        let modeColor = '#ffffff';
        
        switch (this.selectedGameMode) {
            case GameMode.SOLO:
                modeText = 'SOLO MODE';
                modeColor = '#88ff88';
                break;
                
            case GameMode.CHAOS:
                modeText = 'CHAOS MODE';
                modeColor = '#ff8888';
                break;
                
            case GameMode.STAGE:
                modeText = `STAGE MODE - LVL ${this.stageLevel}`;
                modeColor = '#88ccff';
                break;
        }
        
        this.gameModeText = this.add.text(
            this.cameras.main.width - 20,
            20,
            modeText,
            {
                fontSize: '18px',
                fontStyle: 'bold',
                color: modeColor,
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(1, 0);
        
        // Make this fixed to the camera
        this.gameModeText.setScrollFactor(0);
        this.gameModeText.setDepth(100);
    }

    override update(time: number, delta: number) {
        if (this.gameManager) {
            this.gameManager.update(time, delta);
        }

        // Send player position in multiplayer mode
        if (this.isMultiplayer && this.socketService.isConnected() && this.gameManager.player) {
            this.socketService.emit('player-move', {
                x: this.gameManager.player.body.x,
                y: this.gameManager.player.body.y,
                rotation: this.gameManager.player.body.rotation,
                turretRotation: this.gameManager.player.barrel.rotation
            });
        }
    }

    changeScene ()
    {
        this.scene.start('GameOver');
    }

    // Add this method to setup multiplayer
    private setupMultiplayer(): void {
        if (!this.socketService.isConnected()) {
            console.error('Socket not connected in multiplayer game');
            this.notificationManager.show(
                'Not connected to server. Multiplayer features disabled.', 
                { type: NotificationType.ERROR }
            );
            return;
        }
        
        // Setup game-specific socket events
        this.setupSocketEvents();
        
        // Create other players
        this.createOtherPlayers();
        
        // Notify that game has started
        this.notificationManager.show(
            'Multiplayer game started!', 
            { type: NotificationType.SUCCESS }
        );
    }
    
    // Add this method to create other players
    private createOtherPlayers(): void {
        if (!this.lobbyPlayers.length) return;
        
        // Filter out current player
        const otherLobbyPlayers = this.lobbyPlayers.filter(
            p => p.id !== this.socketService.socket?.id
        );
        
        // Create a tank for each other player
        otherLobbyPlayers.forEach(lobbyPlayer => {
            const tankClass = lobbyPlayer.tankClass as TankClassType || TankClassType.VERSATILE;
            
            // Create at a random position away from the current player
            const x = this.gameManager.player.body.x + (Math.random() * 400 - 200);
            const y = this.gameManager.player.body.y + (Math.random() * 400 - 200);
            
            // Create the player tank
            const otherPlayer = new Player(
                this,
                x,
                y,
                tankClass,
                lobbyPlayer.id
            );
            
            // Store the player
            this.otherPlayers.set(lobbyPlayer.id, otherPlayer);
        });
    }
    
    // Add this method to setup socket events
    private setupSocketEvents(): void {
        // Player movement update
        this.socketService.on('player-move', (data: any) => {
            const { playerId, x, y, rotation, turretRotation } = data;
            
            // Update other player position
            const otherPlayer = this.otherPlayers.get(playerId);
            if (otherPlayer) {
                otherPlayer.body.setPosition(x, y);
                otherPlayer.body.rotation = rotation;
                otherPlayer.barrel.rotation = turretRotation;
            }
        });
        
        // Player shooting
        this.socketService.on('player-shoot', (data: any) => {
            const { playerId, startX, startY, velocity } = data;
            
            // Get other player
            const otherPlayer = this.otherPlayers.get(playerId);
            if (otherPlayer) {
                // Create bullet for other player
                otherPlayer.fire();
            }
        });
        
        // Player hit
        this.socketService.on('player-hit', (data: any) => {
            const { playerId, damage, hitByPlayerId } = data;
            
            // Check if current player was hit
            if (playerId === this.socketService.socket?.id) {
                this.gameManager.player.takeDamage(damage);
            } else {
                // Other player was hit
                const otherPlayer = this.otherPlayers.get(playerId);
                if (otherPlayer) {
                    otherPlayer.takeDamage(damage);
                }
            }
        });
        
        // Player destroyed
        this.socketService.on('player-destroyed', (data: any) => {
            const { playerId, destroyedByPlayerId } = data;
            
            // Check if other player was destroyed
            const otherPlayer = this.otherPlayers.get(playerId);
            if (otherPlayer) {
                otherPlayer.die();
                this.otherPlayers.delete(playerId);
            }
        });
        
        // Player disconnect
        this.socketService.on('player-disconnect', (playerId: string) => {
            // Remove disconnected player
            const otherPlayer = this.otherPlayers.get(playerId);
            if (otherPlayer) {
                otherPlayer.die();
                this.otherPlayers.delete(playerId);
                
                this.notificationManager.show(
                    `Player ${otherPlayer.playerLobbyId} disconnected`, 
                    { type: NotificationType.WARNING }
                );
            }
        });
    }

    // Override the shutdown method to clean up socket events
    shutdown(): void {
        // Clean up socket events
        if (this.isMultiplayer) {
            this.socketService.off('player-move');
            this.socketService.off('player-shoot');
            this.socketService.off('player-hit');
            this.socketService.off('player-destroyed');
            this.socketService.off('player-disconnect');
        }
        
        // ... any other cleanup ...
    }
}
