import { Scene } from 'phaser';
import { Player } from '../entities/Player';
import { Enemy, EnemyType } from '../entities/Enemy';
import { MapManager, MapType } from '../map/MapManager';
import { TankClassType } from '../entities/TankClass';
import { GameMode } from '../constants/GameModes';
import { PhysicsSystem } from '../systems/PhysicsSystem';
import { BaseGameMode, GameModeFactory } from '../systems/GameModeSystem';
import { SkillSystem } from '../systems/SkillSystem';

export interface GameConfig {
    initialWave?: number;
    maxWaves?: number;
    enemiesPerWave?: number;
    waveDelay?: number;
    mapType: MapType;
    tankClass?: TankClassType;
    gameMode?: GameMode;
    
    // New properties for different game modes
    isMultiplayer?: boolean;
    friendlyFire?: boolean;
    hasBoss?: boolean;
    stageLevel?: number;
    difficulty?: string;
}

export enum GameState {
    WAITING = 'waiting',
    WAVE_IN_PROGRESS = 'wave_in_progress',
    WAVE_COMPLETE = 'wave_complete',
    GAME_OVER = 'game_over',
    VICTORY = 'victory'
}

export class GameManager {
    scene: Scene;
    player: Player;
    enemies: Enemy[] = [];
    mapManager: MapManager;
    
    // New systems
    physicsSystem: PhysicsSystem;
    gameMode: BaseGameMode | null = null;
    skillSystem: SkillSystem;

    // Game configuration
    config: Required<GameConfig> = {
        initialWave: 1,
        maxWaves: 10,
        enemiesPerWave: 5,
        waveDelay: 1000, // ms between waves
        mapType: MapType.GRASS,
        tankClass: TankClassType.VERSATILE,
        gameMode: GameMode.SOLO,
        isMultiplayer: false,
        friendlyFire: false,
        hasBoss: false,
        stageLevel: 1,
        difficulty: 'easy'
    };

    // Game state
    currentWave: number;
    enemiesRemainingToSpawn: number = 0;
    enemiesKilled: number = 0;
    waveTimer: Phaser.Time.TimerEvent | null = null;
    gameState: GameState = GameState.WAITING;

    // UI elements
    waveText: Phaser.GameObjects.Text;
    scoreText: Phaser.GameObjects.Text;
    healthText: Phaser.GameObjects.Text;
    stateText: Phaser.GameObjects.Text;

    constructor(scene: Scene, config?: GameConfig) {
        this.scene = scene;

        // Apply user config
        if (config) {
            this.config = { ...this.config, ...config };
        }

        this.currentWave = this.config.initialWave;

        // Create map
        this.mapManager = new MapManager(scene, this.config.mapType);

        // Initialize physics system with proper world bounds
        const worldWidth = scene.sys.canvas.width;
        const worldHeight = scene.sys.canvas.height;
        
        console.log('GameManager initializing PhysicsSystem with bounds:', { width: worldWidth, height: worldHeight });
        
        this.physicsSystem = new PhysicsSystem(scene, {
            world: {
                width: worldWidth,
                height: worldHeight,
                gravity: { x: 0, y: 0 }
            },
            enableDebug: false,
            collisionLayers: [
                { name: 'players', collidesWith: ['walls', 'enemies', 'explosions'] },
                { name: 'bullets', collidesWith: ['walls', 'players', 'enemies'] },
                { name: 'enemies', collidesWith: ['walls', 'players', 'bullets'] },
                { name: 'walls', collidesWith: ['players', 'bullets', 'enemies', 'explosions'] },
                { name: 'pickups', collidesWith: ['players'] },
                { name: 'explosions', collidesWith: ['players', 'enemies', 'walls'] }
            ]
        });
        
        // Ensure both physics systems have the same world bounds
        console.log('Main physics world bounds:', scene.physics.world.bounds);
        console.log('Custom physics system bounds:', this.physicsSystem);
        
        // Initialize skill system
        this.skillSystem = new SkillSystem(scene);

        // Create player with the selected tank class
        this.player = new Player(
            scene, 
            scene.sys.canvas.width / 2, 
            scene.sys.canvas.height / 2,
            this.config.tankClass
        );
        
        // Add player to physics system
        this.physicsSystem.addPlayerToPhysics(this.player);
        
        // Note: Enemies will use legacy collision system for now

        // Set up collision detection between player and obstacles
        scene.physics.add.collider(this.player.body, this.mapManager.getObstaclesGroup());
        
        // Initialize game mode if not solo
        if (this.config.gameMode !== GameMode.SOLO) {
            this.initializeGameMode();
        }

        // Create UI
        this.createUI();

        // Setup spell key
        if (scene.input.keyboard) {
            scene.input.keyboard.on('keydown-Q', () => {
                this.castPlayerSpell();
            });
        }
    }

    createUI() {
        // Wave indicator
        this.waveText = this.scene.add.text(20, 20, `Wave: ${this.currentWave}/${this.config.maxWaves}`, {
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setScrollFactor(0).setDepth(100);

        // Score indicator
        this.scoreText = this.scene.add.text(20, 60, `Score: ${this.player.score}`, {
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setScrollFactor(0).setDepth(100);

        // State message (wave starting, complete, etc.)
        this.stateText = this.scene.add.text(
            this.scene.sys.canvas.width / 2,
            150,
            '',
            {
                fontSize: '32px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 6,
                align: 'center'
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(100);

        // Add spell key hint
        // const spellHint = this.scene.add.text(
        //     this.scene.sys.canvas.width - 150,
        //     this.scene.sys.canvas.height - 50,
        //     'Press Q to cast Spell',
        //     {
        //         fontSize: '16px',
        //         color: '#ffffff',
        //         stroke: '#000000',
        //         strokeThickness: 3
        //     }
        // ).setScrollFactor(0).setDepth(100);
    }

    startGame() {
        this.gameState = GameState.WAITING;
        this.showMessage(`Get Ready!\nWave ${this.currentWave} starting in 1 seconds...`);

        // Start the first wave after a delay
        this.scene.time.delayedCall(1000, () => {
            this.startWave();
        });
    }

    startWave() {
        this.gameState = GameState.WAVE_IN_PROGRESS;
        this.showMessage(`Wave ${this.currentWave} Started!`);

        // Clear message after a short delay
        this.scene.time.delayedCall(1000, () => {
            this.hideMessage();
        });

        // Calculate enemies for this wave
        this.enemiesRemainingToSpawn = this.config.enemiesPerWave + Math.floor(this.currentWave * 0.5);

        // Start spawning enemies
        this.spawnEnemies();
    }

    spawnEnemies() {
        if (this.enemiesRemainingToSpawn <= 0 || this.enemies.length >= 10) {
            return;
        }

        // Determine enemy type based on current wave
        let enemyType: EnemyType;
        if (this.currentWave <= 3) {
            enemyType = EnemyType.EASY;
        } else if (this.currentWave <= 7) {
            enemyType = EnemyType.MEDIUM;
        } else {
            enemyType = EnemyType.HARD;
        }

        // Determine spawn position (at the edge of the map)
        const spawnPos = this.getRandomSpawnPosition();

        // Create the enemy
        const enemy = new Enemy(this.scene, spawnPos.x, spawnPos.y, enemyType, this.player);
        this.enemies.push(enemy);

        // Set up collisions
        this.scene.physics.add.collider(enemy.body, this.mapManager.getObstaclesGroup());
        this.scene.physics.add.collider(
            enemy.body,
            this.player.body,
            (_enemy: any, _player: any) => {
                this.handlePlayerEnemyCollision();
            }
        );

        // Set up bullet collisions for player bullets with this enemy
        this.setupPlayerBulletCollisions(enemy);

        // Set up bullet collisions for this enemy's bullets with the player
        this.setupEnemyBulletCollisions(enemy);

        // Decrement enemies remaining to spawn
        this.enemiesRemainingToSpawn--;

        // Schedule next enemy spawn
        if (this.enemiesRemainingToSpawn > 0) {
            const spawnDelay = Phaser.Math.Between(1000, 3000); // Random delay between 1-3 seconds
            this.scene.time.delayedCall(spawnDelay, () => {
                this.spawnEnemies();
            });
        }
    }

    // Create a method to set up player bullet collisions with enemies
    setupPlayerBulletCollisions(enemy: Enemy) {
        for (const bullet of this.player.bullets) {
            this.scene.physics.add.overlap(
                bullet.sprite,
                enemy.body,
                (_bulletSprite: any, _enemyBody: any) => {
                    this.handleBulletEnemyCollision(bullet, enemy, 'setupPlayerBulletCollisions');
                }
            );
            bullet.collisionsSetUp = true;
        }
    }

    // Create a method to set up enemy bullet collisions with player
    setupEnemyBulletCollisions(enemy: Enemy) {
        for (const bullet of enemy.bullets) {
            this.scene.physics.add.overlap(
                bullet.sprite,
                this.player.body,
                (_bulletSprite: any, _playerBody: any) => {
                    this.handleBulletPlayerCollision(bullet);
                }
            );
            bullet.collisionsSetUp = true;
        }
    }

    getRandomSpawnPosition() {
        const canvas = this.scene.sys.canvas;
        const margin = 100; // Margin from the edge of the screen

        // Choose a random side (0: top, 1: right, 2: bottom, 3: left)
        const side = Phaser.Math.Between(0, 3);

        let x, y;

        switch (side) {
            case 0: // Top
                x = Phaser.Math.Between(margin, canvas.width - margin);
                y = margin / 2;
                break;
            case 1: // Right
                x = canvas.width - margin / 2;
                y = Phaser.Math.Between(margin, canvas.height - margin);
                break;
            case 2: // Bottom
                x = Phaser.Math.Between(margin, canvas.width - margin);
                y = canvas.height - margin / 2;
                break;
            case 3: // Left
                x = margin / 2;
                y = Phaser.Math.Between(margin, canvas.height - margin);
                break;
            default:
                x = margin;
                y = margin;
        }

        return { x, y };
    }

    handlePlayerEnemyCollision() {
        // Player takes damage from colliding with enemy
        this.player.takeDamage(10);

        // Update health display
        this.updateUI();
    }

    handleBulletEnemyCollision(bullet: any, enemy: Enemy, source: string) {
        console.log('Player bullet hit enemy!', { damage: bullet.damage, enemyHP: enemy.stats.hp, source });
        
        // Apply damage to enemy
        enemy.takeDamage(bullet.damage);

        // Destroy the bullet
        bullet.destroy();

        // Check if enemy is dead
        if (!enemy.isAlive) {
            this.enemiesKilled++;
            this.checkWaveComplete();
        }

        // Update UI
        this.updateUI();
    }

    handleBulletPlayerCollision(bullet: any) {
        console.log('Enemy bullet hit player!', { damage: bullet.damage, playerHP: this.player.stats.hp });
        
        // Apply damage to player
        this.player.takeDamage(bullet.damage);

        // Destroy the bullet
        bullet.destroy();

        // Update UI
        this.updateUI();

        // Check if player is dead
        if (!this.player.isAlive) {
            this.gameState = GameState.GAME_OVER;
        }
    }

    checkWaveComplete() {
        // Wave is complete when all enemies are killed and none left to spawn
        if (this.enemiesRemainingToSpawn === 0 && this.enemies.every(enemy => !enemy.isAlive)) {
            this.gameState = GameState.WAVE_COMPLETE;
            this.showMessage(`Wave ${this.currentWave} Complete!`);

            // Clean up dead enemies
            this.cleanupDeadEnemies();

            // Check if all waves are complete
            if (this.currentWave >= this.config.maxWaves) {
                this.gameState = GameState.VICTORY;
                this.showMessage('You Win!\nAll waves completed!');

                // Trigger victory screen after delay
                this.scene.time.delayedCall(3000, () => {
                    this.scene.scene.start('GameOver', { victory: true, score: this.player.score });
                });
            } else {
                // Start next wave after delay
                this.currentWave++;

                this.waveTimer = this.scene.time.delayedCall(this.config.waveDelay, () => {
                    this.startWave();
                });

                // Show countdown
                this.updateWaveCountdown(this.config.waveDelay);
            }
        }
    }

    updateWaveCountdown(remainingTime: number) {
        if (remainingTime <= 0 || this.gameState !== GameState.WAVE_COMPLETE) return;

        const seconds = Math.ceil(remainingTime / 1000);
        this.showMessage(`Wave ${this.currentWave} starting in ${seconds} seconds...`);

        this.scene.time.delayedCall(1000, () => {
            this.updateWaveCountdown(remainingTime - 1000);
        });
    }

    cleanupDeadEnemies() {
        // Remove dead enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (!enemy.isAlive) {
                enemy.destroy();
                this.enemies.splice(i, 1);
            }
        }
    }

    showMessage(message: string) {
        this.stateText.setText(message);
        this.stateText.setVisible(true);
    }

    hideMessage() {
        this.stateText.setVisible(false);
    }

    updateUI() {
        this.waveText.setText(`Wave: ${this.currentWave}/${this.config.maxWaves}`);
        this.scoreText.setText(`Score: ${this.player.score}`);
    }

    update(time: number, delta: number) {
        if (this.gameState === GameState.WAVE_IN_PROGRESS) {
            // Update player
            this.player.update(time, delta);
            
            // Update all enemies
            for (const enemy of this.enemies) {
                enemy.update(time, delta);
                
                // If player is invisible (Versatile class ability), make enemies unable to target player
                if (this.player.isInvisible) {
                    // Skip enemy targeting logic
                    continue;
                }
            }
            
            // Check for any new player bullets and set up collisions (legacy system)
            for (const enemy of this.enemies) {
                this.setupNewBulletCollisions(enemy);
            }
            
            // Temporarily disable custom physics system for bullets to avoid conflicts
            // this.addNewBulletsToPhysics();
        }
        
        // Update game mode if active
        if (this.gameMode && this.gameMode.isActive()) {
            this.gameMode.update(delta);
        }
        
        // Update skill system
        this.skillSystem.update(delta);
        
        // Update physics system
        // Note: Physics system handles its own collision detection automatically
        
        // Update UI
        this.updateUI();
    }

    // Helper method to set up collisions for any new bullets
    setupNewBulletCollisions(enemy: Enemy) {
        // Check for new player bullets that haven't had collisions set up
        for (const bullet of this.player.bullets) {
            // if (!bullet.collisionsSetUp) {
            this.scene.physics.add.overlap(
                bullet.sprite,
                enemy.body,
                (_bulletSprite: any, _enemyBody: any) => {
                    this.handleBulletEnemyCollision(bullet, enemy, 'setupNewBulletCollisions');
                }
            );
            bullet.collisionsSetUp = true;
            // }
        }

        // Check for new enemy bullets that haven't had collisions set up
        for (const bullet of enemy.bullets) {
            if (!bullet.collisionsSetUp) {
                this.scene.physics.add.overlap(
                    bullet.sprite,
                    this.player.body,
                    (_bulletSprite: any, _playerBody: any) => {
                        this.handleBulletPlayerCollision(bullet);
                    }
                );
                bullet.collisionsSetUp = true;
            }
        }
    }

    // Initialize game mode based on selected mode
    initializeGameMode() {
        try {
            this.gameMode = GameModeFactory.create(this.scene, this.config.gameMode, this.config);
            this.gameMode.addPlayer(this.player);
            this.gameMode.start();
        } catch (error) {
            console.error('Failed to initialize game mode:', error);
            // Fallback to solo mode if game mode fails
            this.config.gameMode = GameMode.SOLO;
        }
    }

    // Add new bullets to physics system for collision detection
    addNewBulletsToPhysics() {
        // Add new player bullets
        for (const bullet of this.player.bullets) {
            if (!bullet.addedToPhysics) {
                this.physicsSystem.addBulletToPhysics(bullet);
                bullet.addedToPhysics = true;
            }
        }

        // Add new enemy bullets
        for (const enemy of this.enemies) {
            for (const bullet of enemy.bullets) {
                if (!bullet.addedToPhysics) {
                    this.physicsSystem.addBulletToPhysics(bullet);
                    bullet.addedToPhysics = true;
                }
            }
        }
    }

    // Add method to handle player spell casting
    castPlayerSpell() {
        if (this.gameState !== GameState.WAVE_IN_PROGRESS || !this.player.isAlive) return;
        
        // Use the skill system instead of old special ability
        this.skillSystem.useSkill(this.player, this.player.tankClass);
        
        // If it's the Supporter class, apply healing to any allies (for future multiplayer support)
        if (this.player.tankClass === TankClassType.SUPPORTER && this.player.isSkillActive) {
            // Currently no allies to heal in single player mode
            // This would be implemented in multiplayer
        }
    }
} 