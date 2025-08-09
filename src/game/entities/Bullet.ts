import { Physics, GameObjects } from 'phaser';
import { AssetsEnum } from '../../app/constants/assets-enum';

export class Bullet {
    sprite: Phaser.Physics.Arcade.Sprite;
    scene: Phaser.Scene;
    damage: number;
    speed: number = 400;
    lifespan: number = 2000; // 2 seconds
    collisionsSetUp: boolean = false; // Added property to track collision setup
    addedToPhysics: boolean = false; // Track if bullet has been added to physics system
    
    // Multiplayer properties
    private multiplayerId: string = '';
    private ownerId: string = '';

    constructor(scene: Phaser.Scene, x: number, y: number, angle: number, damage: number = 10, texture: string = AssetsEnum.BULLET_BLUE_1) {
        this.scene = scene;
        this.damage = damage;

        // Create bullet sprite
        this.sprite = scene.physics.add.sprite(x, y, texture);

        // Ensure physics body exists and is properly configured
        if (!this.sprite.body) {
            console.error('Bullet sprite has no physics body!');
            return;
        }
        
        const body = this.sprite.body as Phaser.Physics.Arcade.Body;
        
        // Force enable the physics body first
        body.enable = true;
        
        // Set up collision detection (allow bullets to leave world bounds)
        this.sprite.setCollideWorldBounds(false);
        body.setCollideWorldBounds(false);
        
        // Calculate velocity components
        const angleInRadians = Phaser.Math.DegToRad(angle);
        const velocityX = Math.cos(angleInRadians) * this.speed;
        const velocityY = Math.sin(angleInRadians) * this.speed;
        
        console.log('Bullet setup - angle:', angle, 'radians:', angleInRadians, 'velocity:', { x: velocityX, y: velocityY }, 'speed:', this.speed);
        
        // Set velocity immediately after body is enabled
        body.setVelocity(velocityX, velocityY);
        
        // Set rotation for visual alignment
        this.sprite.setRotation(angleInRadians);
        
        // Verify the body state
        console.log('Bullet body after setup - enabled:', body.enable, 'velocity:', { x: body.velocity.x, y: body.velocity.y }, 'mass:', body.mass);
        
        // Ensure no drag, friction, or bouncing that could interfere with collisions
        body.setDrag(0);
        body.setFriction(0, 0);
        body.setBounce(0, 0);
        
        // Disable all bouncing and restitution
        body.setMaxVelocity(this.speed * 2, this.speed * 2); // Allow fast movement
        
        // Set mass to very small to ensure bullets don't push things around
        body.setMass(0.1);
        
        // Force update the body once to ensure velocity is applied
        body.updateFromGameObject();
        
        console.log('Bullet configured - bounce:', body.bounce, 'mass:', body.mass, 'drag:', body.drag);

        // Destroy after lifespan
        scene.time.delayedCall(this.lifespan, () => {
            this.destroy();
        });
    }

    update() {
        // Let physics handle movement - don't interfere with velocity
        // The constant velocity reapplication was causing conflicts
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