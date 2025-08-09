import { Physics, GameObjects } from 'phaser';
import { AssetsEnum } from '../../app/constants/assets-enum';

export class Bullet {
    sprite: Phaser.Physics.Arcade.Sprite;
    scene: Phaser.Scene;
    damage: number;
    speed: number = 400;
    lifespan: number = 2000; // 2 seconds
    collisionsSetUp: boolean = false; // Added property to track collision setup
    
    // Multiplayer properties
    private multiplayerId: string = '';
    private ownerId: string = '';

    constructor(scene: Phaser.Scene, x: number, y: number, angle: number, damage: number = 10, texture: string = AssetsEnum.BULLET_BLUE_1) {
        this.scene = scene;
        this.damage = damage;

        // Create bullet sprite
        this.sprite = scene.physics.add.sprite(x, y, texture);

        // Set up physics
        if (this.sprite.body) {
            // Set collide world bounds
            this.sprite.setCollideWorldBounds(false);

            // Listen for world bounds collision
            scene.physics.world.on('worldbounds', (body: any) => {
                console.log('dangth worldbounds', body);
                this.destroy();
            });
            // Set velocity based on angle
            const velocity = scene.physics.velocityFromAngle(angle, this.speed);
            this.sprite.setVelocity(velocity.x, velocity.y);
            this.sprite.setRotation(angle * Math.PI / 180);
        }

        // Destroy after lifespan
        scene.time.delayedCall(this.lifespan, () => {
            this.destroy();
        });
    }

    update() {
        // Additional bullet logic could go here
    }

    isOutOfBounds(): boolean {
        // Check if bullet is outside the world bounds
        if (!this.sprite || !this.sprite.active) return true;

        const worldBounds = this.scene.physics.world.bounds;
        return (
            this.sprite.x < worldBounds.x ||
            this.sprite.x > worldBounds.x + worldBounds.width ||
            this.sprite.y < worldBounds.y ||
            this.sprite.y > worldBounds.y + worldBounds.height
        );
    }

    destroy() {
        if (this.sprite && this.sprite.active) {
            this.sprite.destroy();
        }
    }
    
    // Multiplayer methods
    setMultiplayerInfo(bulletId: string, playerId: string) {
        this.multiplayerId = bulletId;
        this.ownerId = playerId;
    }
    
    getMultiplayerId(): string {
        return this.multiplayerId;
    }
    
    getOwnerId(): string {
        return this.ownerId;
    }
} 