import { Physics, GameObjects } from 'phaser';
import { AssetsEnum } from '../../app/constants/assets-enum';
import { Bullet } from './Bullet';

export class Player {
    body: Phaser.Physics.Arcade.Sprite;
    barrel: GameObjects.Sprite;
    scene: Phaser.Scene;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    speed: number = 150;
    rotationSpeed: number = 0.003;
    health: number = 100;
    fireRate: number = 500; // ms between shots
    lastFired: number = 0;
    bullets: Bullet[] = [];
    isAlive: boolean = true;
    score: number = 0;
    
    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;
        
        // Create tank body
        this.body = scene.physics.add.sprite(x, y, AssetsEnum.TANK_BODY_BLUE);
        this.body.setCollideWorldBounds(true);
        this.body.setDepth(1);
        // Correct initial rotation - apply a negative 90 degree rotation
        this.body.setAngle(-90);
        
        // Create tank turret/barrel
        this.barrel = scene.add.sprite(x, y, AssetsEnum.TANK_BLUE_BARREL_2);
        this.barrel.setOrigin(0.5, 0.8); // Set origin point to bottom center of barrel
        this.barrel.setDepth(2);
        // Correct initial rotation for barrel as well
        this.barrel.setAngle(-90);
        
        // Set up input
        if (scene.input.keyboard) {
            this.cursors = scene.input.keyboard.createCursorKeys();
            
            // Add space key for firing
            scene.input.keyboard.on('keydown-SPACE', () => {
                this.fire();
            });
        } else {
            // Create a dummy cursors object if keyboard is not available
            this.cursors = {
                up: { isDown: false },
                down: { isDown: false },
                left: { isDown: false },
                right: { isDown: false },
                space: { isDown: false },
                shift: { isDown: false }
            } as Phaser.Types.Input.Keyboard.CursorKeys;
        }
    }
    
    update(time: number, delta: number) {
        if (!this.isAlive) return;
        
        // Handle tank movement
        if (this.cursors.up.isDown) {
            // Move forward in the direction the tank is facing
            this.scene.physics.velocityFromRotation(
                this.body.rotation, 
                this.speed, 
                (this.body.body as Physics.Arcade.Body).velocity
            );
        } else if (this.cursors.down.isDown) {
            // Move backward in the opposite direction the tank is facing
            this.scene.physics.velocityFromRotation(
                this.body.rotation, 
                -this.speed * 0.5, // Move slower in reverse
                (this.body.body as Physics.Arcade.Body).velocity
            );
        } else {
            // No key is pressed, stop moving
            (this.body.body as Physics.Arcade.Body).setVelocity(0, 0);
        }
        
        // Handle rotation
        if (this.cursors.left.isDown) {
            this.body.rotation -= this.rotationSpeed * delta;
        } else if (this.cursors.right.isDown) {
            this.body.rotation += this.rotationSpeed * delta;
        }
        
        // Position the barrel to follow the tank body
        this.barrel.x = this.body.x;
        this.barrel.y = this.body.y;
        
        // Rotate barrel to follow mouse or touch position
        if (this.scene.input.activePointer.isDown) {
            const angle = Phaser.Math.Angle.Between(
                this.barrel.x, this.barrel.y,
                this.scene.input.activePointer.worldX, this.scene.input.activePointer.worldY
            );
            
            this.barrel.rotation = angle;
            
            // Adjust barrel angle to account for sprite orientation (-90 degrees)
            this.barrel.setAngle(Phaser.Math.RadToDeg(this.barrel.rotation) - 90);
            
            // Auto-fire when holding mouse/touch down
            if (time > this.lastFired + this.fireRate) {
                this.fire();
                this.lastFired = time;
            }
        }
        
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
        
        // Create a new bullet from the barrel position
        const bullet = new Bullet(
            this.scene,
            this.barrel.x,
            this.barrel.y,
            this.barrel.rotation,
            10,
            AssetsEnum.BULLET_BLUE_2_OUTLINE
        );
        
        this.bullets.push(bullet);
        
        // Play sound effect
        // this.scene.sound.play('shoot');
    }
    
    takeDamage(amount: number) {
        this.health -= amount;
        
        // Check if player is dead
        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
    }
    
    die() {
        this.isAlive = false;
        
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
                    
                    // Disable physics
                    if (this.body.body) {
                        (this.body.body as Physics.Arcade.Body).enable = false;
                    }
                    
                    // Trigger game over after a short delay
                    this.scene.time.delayedCall(1000, () => {
                        this.scene.scene.start('GameOver');
                    });
                }
            },
            repeat: explosionFrames.length - 1
        });
    }
    
    addScore(points: number) {
        this.score += points;
    }
    
    reset() {
        this.health = 100;
        this.isAlive = true;
        this.score = 0;
        this.body.setVisible(true);
        this.barrel.setVisible(true);
        this.body.setPosition(this.scene.sys.canvas.width / 2, this.scene.sys.canvas.height / 2);
        (this.body.body as Physics.Arcade.Body).setVelocity(0, 0);
        
        // Re-enable physics
        if (this.body.body) {
            (this.body.body as Physics.Arcade.Body).enable = true;
        }
    }
} 