import { Physics, GameObjects } from 'phaser';
import { AssetsEnum } from '../../app/constants/assets-enum';
import { Bullet } from './Bullet';

const defaultPlayerConfig = {
    speed: 150,
    rotationSpeed: 0.003,
    health: 10_000,
    fireRate: 500,
    bulletDamage: 10_000
}

export const deltaDefault = 100;

export class Player {
    body: Phaser.Physics.Arcade.Sprite;
    barrel: GameObjects.Sprite;
    scene: Phaser.Scene;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    speed: number = defaultPlayerConfig.speed;
    rotationSpeed: number = defaultPlayerConfig.rotationSpeed;
    health: number = defaultPlayerConfig.health;
    fireRate: number = defaultPlayerConfig.fireRate; // ms between shots
    lastFired: number = 0;
    bullets: Bullet[] = [];
    isAlive: boolean = true;
    bulletDamage: number = defaultPlayerConfig.bulletDamage;
    score: number = 0;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;

        // Create tank body
        const playerSprite = scene.physics.add.sprite(x, y, AssetsEnum.TANK_BODY_BLUE);

        this.body = playerSprite;
        this.body.setCollideWorldBounds(true);
        this.body.setDepth(1);

        // Create tank turret/barrel
        this.barrel = scene.add.sprite(x, y, AssetsEnum.TANK_BLUE_BARREL_2);
        this.barrel.setOrigin(0, 0.5); // Set origin point to bottom center of barrel
        this.barrel.setDepth(2);

        // Set up input
        if (scene.input.keyboard) {

            this.cursors = scene.input.keyboard.createCursorKeys();

            // Add space key for firing
            scene.input.keyboard.on('keydown-SPACE', () => {
                this.fire();
            });
            scene.input.keyboard.on('keydown-W', () => {
                this.cursors.up.isDown = true;
            });

            scene.input.keyboard.on('keyup-W', () => {
                this.cursors.up.isDown = false;
            });
            scene.input.keyboard.on('keydown-S', () => {
                this.cursors.down.isDown = true;
            });
            scene.input.keyboard.on('keyup-S', () => {
                this.cursors.down.isDown = false;
            });
            scene.input.keyboard.on('keydown-A', () => {
                this.cursors.left.isDown = true;
            });
            scene.input.keyboard.on('keyup-A', () => {
                this.cursors.left.isDown = false;
            });
            scene.input.keyboard.on('keydown-D', () => {
                this.cursors.right.isDown = true;
            });
            scene.input.keyboard.on('keyup-D', () => {
                this.cursors.right.isDown = false;
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

    // Move forward in the direction the tank is facing
    moveForward() {
        this.scene.physics.velocityFromRotation(
            this.body.rotation,
            this.speed,
            (this.body.body as Physics.Arcade.Body).velocity
        );
    }

    moveBackward() {
        this.scene.physics.velocityFromRotation(
            this.body.rotation,
            -this.speed * 0.5, // Move slower in reverse
            (this.body.body as Physics.Arcade.Body).velocity);
    }

    rotateLeft(delta: number) {
        this.body.rotation -= this.rotationSpeed * delta;
    }

    rotateRight(delta: number) {
        this.body.rotation += this.rotationSpeed * delta;
    }

    update(time: number, delta: number) {
        if (!this.isAlive) return;

        // Handle tank movement
        if (this.cursors.up.isDown) {
            this.moveForward();
        } else if (this.cursors.down.isDown) {
            // Move backward in the opposite direction the tank is facing
            this.moveBackward();
        } else {
            // No key is pressed, stop moving
            (this.body.body as Physics.Arcade.Body).setVelocity(0, 0);
        }
        // Handle rotation
        if (this.cursors.left.isDown) {
            this.rotateLeft(delta);
        } else if (this.cursors.right.isDown) {
            this.rotateRight(delta);
        }

        // Position the barrel to follow the tank body
        this.barrel.x = this.body.x;
        this.barrel.y = this.body.y;

        // Rotate barrel to follow mouse or touch position
        if (this.scene.input.activePointer) {
            const angle = Phaser.Math.Angle.Between(
                this.barrel.x, this.barrel.y,
                this.scene.input.activePointer.worldX, this.scene.input.activePointer.worldY
            );

            this.barrel.rotation = angle;
        }

        if (this.scene.input.activePointer.isDown) {
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
            this.barrel.rotation * 180 / Math.PI,
            this.bulletDamage,
            AssetsEnum.BULLET_BLUE_1
        );

        this.bullets.push(bullet);

        // Play sound effect
        this.scene.sound.play("shoot");
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
        this.health = defaultPlayerConfig.health;
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