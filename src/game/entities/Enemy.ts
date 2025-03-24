import { Physics, GameObjects } from 'phaser';
import { AssetsEnum } from '../../app/constants/assets-enum';
import { Bullet } from './Bullet';
import { Player } from './Player';

export enum EnemyType {
    EASY = 'easy',
    MEDIUM = 'medium',
    HARD = 'hard'
}

export class Enemy {
    body: Phaser.Physics.Arcade.Sprite;
    barrel: GameObjects.Sprite;
    scene: Phaser.Scene;
    speed: number;
    rotationSpeed: number;
    health: number;
    fireRate: number; // ms between shots
    lastFired: number = 0;
    bullets: Bullet[] = [];
    isAlive: boolean = true;
    points: number; // Points awarded to player for destroying this enemy
    type: EnemyType;
    targetPlayer: Player;
    fireRange: number; // Distance at which the enemy will start firing
    changeDirectionTimer: Phaser.Time.TimerEvent;
    
    constructor(scene: Phaser.Scene, x: number, y: number, type: EnemyType, targetPlayer: Player) {
        this.scene = scene;
        this.type = type;
        this.targetPlayer = targetPlayer;
        
        // Set properties based on difficulty type
        switch(type) {
            case EnemyType.HARD:
                this.speed = 120;
                this.rotationSpeed = 0.025;
                this.health = 150;
                this.fireRate = 1500;
                this.points = 300;
                this.fireRange = 400;
                // Use red tank for hard enemies
                this.body = scene.physics.add.sprite(x, y, AssetsEnum.TANK_BODY_RED);
                this.barrel = scene.add.sprite(x, y, AssetsEnum.TANK_RED_BARREL_3);
                // Correct initial rotation
                this.body.setAngle(-90);
                break;
                
            case EnemyType.MEDIUM:
                this.speed = 100;
                this.rotationSpeed = 0.02;
                this.health = 100;
                this.fireRate = 2000;
                this.points = 200;
                this.fireRange = 350;
                // Use green tank for medium enemies
                this.body = scene.physics.add.sprite(x, y, AssetsEnum.TANK_BODY_GREEN);
                this.barrel = scene.add.sprite(x, y, AssetsEnum.TANK_GREEN_BARREL_2);
                // Correct initial rotation
                this.body.setAngle(-90);
                break;
                
            case EnemyType.EASY:
            default:
                this.speed = 80;
                this.rotationSpeed = 0.015;
                this.health = 50;
                this.fireRate = 2500;
                this.points = 100;
                this.fireRange = 300;
                // Use sand tank for easy enemies
                this.body = scene.physics.add.sprite(x, y, AssetsEnum.TANK_BODY_SAND);
                this.barrel = scene.add.sprite(x, y, AssetsEnum.TANK_SAND_BARREL_1);
                // Correct initial rotation
                this.body.setAngle(-90);
                break;
        }
        
        // Configure physics body
        this.body.setCollideWorldBounds(true);
        this.body.setDepth(1);
        this.body.setData('ref', this); // Store reference to this object for collision handling
        
        // Configure barrel
        this.barrel.setOrigin(0.5, 0.8); // Set origin point to bottom center of barrel
        this.barrel.setDepth(2);
        
        // Set up random direction changes
        this.setupRandomMovement();
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
        if (this.targetPlayer.isAlive) {
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
            this.barrel.setAngle(Phaser.Math.RadToDeg(this.barrel.rotation) - 90);
            
            // If player is in range, fire
            if (distanceToPlayer < this.fireRange && time > this.lastFired + this.fireRate) {
                this.fire();
                this.lastFired = time;
            }
            
            // Move in current direction
            this.scene.physics.velocityFromRotation(
                this.body.rotation,
                this.speed,
                (this.body.body as Physics.Arcade.Body).velocity
            );
        } else {
            // Player is dead, just wander randomly
            this.scene.physics.velocityFromRotation(
                this.body.rotation,
                this.speed * 0.5,
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
            this.barrel.rotation,
            10,
            bulletTexture
        );
        
        this.bullets.push(bullet);
        
        // Play sound effect
        // this.scene.sound.play('enemy-shoot');
    }
    
    takeDamage(amount: number) {
        this.health -= amount;
        
        // Check if enemy is dead
        if (this.health <= 0) {
            this.health = 0;
            this.die();
            
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