import { Physics, GameObjects } from 'phaser';
import { AssetsAudioEnum, AssetsEnum } from '../../app/constants/assets-enum';
import { Bullet } from './Bullet';
import { Player } from './Player';
import { TankStats, defaultEnemyStats, calculateDamage } from './TankStats';

export enum EnemyType {
    EASY = 'easy',
    MEDIUM = 'medium',
    HARD = 'hard'
}

export class Enemy {
    body: Phaser.Physics.Arcade.Sprite;
    barrel: GameObjects.Sprite;
    scene: Phaser.Scene;
    
    // Tank stats
    stats: TankStats;
    
    // Additional properties
    lastFired: number = 0;
    bullets: Bullet[] = [];
    isAlive: boolean = true;
    points: number; // Points awarded to player for destroying this enemy
    type: EnemyType;
    targetPlayer: Player;
    fireRange: number; // Distance at which the enemy will start firing
    changeDirectionTimer: Phaser.Time.TimerEvent;
    
    // Stats display
    statsText: Phaser.GameObjects.Text;
    
    constructor(scene: Phaser.Scene, x: number, y: number, type: EnemyType, targetPlayer: Player) {
        this.scene = scene;
        this.type = type;
        this.targetPlayer = targetPlayer;
        
        // Set properties based on difficulty type
        switch(type) {
            case EnemyType.HARD:
                this.stats = { ...defaultEnemyStats.hard };
                this.points = 300;
                this.fireRange = 400;
                // Use red tank for hard enemies
                this.body = scene.physics.add.sprite(x, y, AssetsEnum.TANK_BODY_RED);
                this.barrel = scene.add.sprite(x, y, AssetsEnum.TANK_RED_BARREL_2);
                // Correct initial rotation
                // this.body.setAngle(-90);
                break;
                
            case EnemyType.MEDIUM:
                this.stats = { ...defaultEnemyStats.medium };
                this.points = 200;
                this.fireRange = 350;
                // Use green tank for medium enemies
                this.body = scene.physics.add.sprite(x, y, AssetsEnum.TANK_BODY_GREEN);
                this.barrel = scene.add.sprite(x, y, AssetsEnum.TANK_GREEN_BARREL_2);
                // Correct initial rotation
                // this.body.setAngle(-90);
                break;
                
            case EnemyType.EASY:
            default:
                this.stats = { ...defaultEnemyStats.easy };
                this.points = 100;
                this.fireRange = 300;
                // Use sand tank for easy enemies
                this.body = scene.physics.add.sprite(x, y, AssetsEnum.TANK_BODY_DARK);
                this.barrel = scene.add.sprite(x, y, AssetsEnum.TANK_DARK_BARREL_2);
                // Correct initial rotation
                // this.body.setAngle(-90);
                break;
        }
        
        // Configure physics body
        this.body.setCollideWorldBounds(true);
        this.body.setDepth(1);
        this.body.setData('ref', this); // Store reference to this object for collision handling
        
        // Configure barrel
        this.barrel.setOrigin(0, 0.5); // Set origin point to bottom center of barrel
        this.barrel.setDepth(2);
        
        // Set up random direction changes
        this.setupRandomMovement();
        
        // Create HP display above enemy
        this.createHPDisplay();
    }
    
    createHPDisplay() {
        // Create HP text above enemy
        this.statsText = this.scene.add.text(
            this.body.x, 
            this.body.y - 40, 
            `HP: ${this.stats.hp}`, 
            { 
                fontSize: '12px', 
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        this.statsText.setOrigin(0.5);
        this.statsText.setDepth(3);
    }
    
    updateHPDisplay() {
        if (this.statsText) {
            this.statsText.setText(`HP: ${this.stats.hp}`);
            this.statsText.setPosition(this.body.x, this.body.y - 40);
        }
    }
    
    setupRandomMovement() {
        // Change direction randomly every few seconds
        const changeDirectionInterval = Phaser.Math.Between(2000, 5000);
        this.changeDirectionTimer = this.scene.time.addEvent({
            delay: changeDirectionInterval,
            callback: this.changeDirection,
            callbackScope: this,
            loop: true
        });
    }
    
    changeDirection() {
        // 50% chance to change to a random direction, 50% chance to target player
        if (Phaser.Math.Between(0, 1) === 0 && this.targetPlayer.isAlive) {
            // Target player - do nothing, normal update logic will handle it
        } else {
            // Random rotation
            this.body.rotation = Phaser.Math.FloatBetween(0, Math.PI * 2);
        }
    }
    
    update(time: number, delta: number) {
        if (!this.isAlive) return;
        
        // Only proceed if player is still alive
        if (this.targetPlayer.isAlive && !this.targetPlayer.isInvisible) {
            // Calculate angle to player for the barrel
            const angleToPlayer = Phaser.Math.Angle.Between(
                this.body.x, this.body.y,
                this.targetPlayer.body.x, this.targetPlayer.body.y
            );
            
            // Calculate distance to player
            const distanceToPlayer = Phaser.Math.Distance.Between(
                this.body.x, this.body.y,
                this.targetPlayer.body.x, this.targetPlayer.body.y
            );
            
            // Smoothly rotate barrel towards player
            const currentRotation = this.barrel.rotation;
            const rotationDiff = Phaser.Math.Angle.Wrap(angleToPlayer - currentRotation);
            this.barrel.rotation = currentRotation + rotationDiff * 0.05 * delta;
            
            // Adjust barrel angle to account for sprite orientation (-90 degrees)
            // this.barrel.setAngle(Phaser.Math.RadToDeg(this.barrel.rotation) - 90);
            
            // If player is in range, fire
            if (distanceToPlayer < this.fireRange && time > this.lastFired + this.stats.fireRate) {
                this.fire();
                this.lastFired = time;
            }
            
            // Move in current direction
            this.scene.physics.velocityFromRotation(
                this.body.rotation,
                this.stats.speed,
                (this.body.body as Physics.Arcade.Body).velocity
            );
        } else {
            // Player is dead, just wander randomly
            this.scene.physics.velocityFromRotation(
                this.body.rotation,
                this.stats.speed * 0.5,
                (this.body.body as Physics.Arcade.Body).velocity
            );
        }
        
        // Position the barrel to follow the tank body
        this.barrel.x = this.body.x;
        this.barrel.y = this.body.y;
        
        // Update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update();
            
            // Remove bullets that are out of bounds
            if (bullet.isOutOfBounds()) {
                bullet.destroy();
                this.bullets.splice(i, 1);
            }
        }
        
        // Update HP display
        this.updateHPDisplay();
    }
    
    fire() {
        if (!this.isAlive) return;
        
        // Determine bullet type based on enemy type
        let bulletTexture;
        switch(this.type) {
            case EnemyType.HARD:
                bulletTexture = AssetsEnum.BULLET_RED_2_OUTLINE;
                break;
            case EnemyType.MEDIUM:
                bulletTexture = AssetsEnum.BULLET_GREEN_2_OUTLINE;
                break;
            case EnemyType.EASY:
            default:
                bulletTexture = AssetsEnum.BULLET_SAND_2_OUTLINE;
                break;
        }
        
        // Create a new bullet from the barrel position
        const bullet = new Bullet(
            this.scene,
            this.barrel.x,
            this.barrel.y,
            this.barrel.rotation * 180 / Math.PI,
            this.stats.atk,  // Use attack stat for bullet damage
            bulletTexture
        );
        
        this.bullets.push(bullet);
        
        // Play sound effect
        // this.scene.sound.play('enemy-shoot');
    }
    
    takeDamage(amount: number) {
        // Calculate actual damage taken based on defense
        const actualDamage = calculateDamage(amount, this.stats.def);
        
        // Reduce HP
        this.stats.hp -= actualDamage;
        
        // Visual feedback - flash the tank red
        this.body.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            this.body.clearTint();
        });
        
        // Check if enemy is dead
        if (this.stats.hp <= 0) {
            this.stats.hp = 0;
            this.die();
            
            this.scene.sound.play(AssetsAudioEnum.EXPLOSION, { volume: 0.5 });
            // Award points to player
            this.targetPlayer.addScore(this.points);
        }
    }
    
    die() {
        this.isAlive = false;
        
        // Clean up timer
        if (this.changeDirectionTimer) {
            this.changeDirectionTimer.destroy();
        }
        
        // Hide HP display
        if (this.statsText) {
            this.statsText.destroy();
        }
        
        // Play explosion animation
        const explosion = this.scene.add.sprite(this.body.x, this.body.y, AssetsEnum.EXPLOSION_1);
        
        // Create an explosion animation sequence
        const explosionFrames = [
            AssetsEnum.EXPLOSION_1,
            AssetsEnum.EXPLOSION_2,
            AssetsEnum.EXPLOSION_3,
            AssetsEnum.EXPLOSION_4,
            AssetsEnum.EXPLOSION_5
        ];
        
        let frameIndex = 0;
        const explosionTimer = this.scene.time.addEvent({
            delay: 100,
            callback: () => {
                frameIndex++;
                if (frameIndex < explosionFrames.length) {
                    explosion.setTexture(explosionFrames[frameIndex]);
                } else {
                    explosion.destroy();
                    explosionTimer.destroy();
                    
                    // Hide the tank
                    this.body.setVisible(false);
                    this.barrel.setVisible(false);
                    
                    // Disable physics body
                    if (this.body.body) {
                        (this.body.body as Physics.Arcade.Body).enable = false;
                    }
                }
            },
            repeat: explosionFrames.length - 1
        });
    }
    
    destroy() {
        // Clean up timer
        if (this.changeDirectionTimer) {
            this.changeDirectionTimer.destroy();
        }
        
        // Clean up stats text
        if (this.statsText) {
            this.statsText.destroy();
        }
        
        // Clean up bullets
        for (const bullet of this.bullets) {
            bullet.destroy();
        }
        
        // Destroy sprites
        if (this.body && this.body.active) {
            this.body.destroy();
        }
        
        if (this.barrel && this.barrel.active) {
            this.barrel.destroy();
        }
    }
} 