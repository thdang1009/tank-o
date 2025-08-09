import { Scene, Physics } from 'phaser';
import { Player } from '../entities/Player';
import { Bullet } from '../entities/Bullet';
import { gameStateManager } from '../managers/GameStateManager';

export interface CollisionLayer {
    name: string;
    group: Phaser.Physics.Arcade.Group;
    collidesWith: string[];
}

export interface PhysicsConfig {
    world: {
        width: number;
        height: number;
        gravity: { x: number, y: number };
    };
    enableDebug?: boolean;
    collisionLayers: {
        name: string;
        collidesWith: string[];
    }[];
}

export class PhysicsSystem {
    private scene: Scene;
    private physics: Phaser.Physics.Arcade.ArcadePhysics;
    private collisionLayers: Map<string, CollisionLayer> = new Map();
    private debugEnabled: boolean = false;
    
    // Collision groups
    private playerGroup: Phaser.Physics.Arcade.Group;
    private bulletGroup: Phaser.Physics.Arcade.Group;
    private enemyGroup: Phaser.Physics.Arcade.Group;
    private wallGroup: Phaser.Physics.Arcade.StaticGroup;
    private pickupGroup: Phaser.Physics.Arcade.Group;
    private explosionGroup: Phaser.Physics.Arcade.Group;
    
    constructor(scene: Scene, config: PhysicsConfig) {
        this.scene = scene;
        this.physics = scene.physics;
        this.debugEnabled = config.enableDebug || false;
        
        this.initializePhysicsWorld(config);
        this.createCollisionGroups();
        this.setupCollisionMatrix();
        this.setupDebugRendering();
    }
    
    private initializePhysicsWorld(config: PhysicsConfig) {
        // Set world bounds
        this.physics.world.setBounds(
            0, 0,
            config.world.width,
            config.world.height
        );
        
        // Set gravity
        this.physics.world.gravity.setTo(
            config.world.gravity.x,
            config.world.gravity.y
        );
        
        console.log('Physics world initialized:', config.world);
    }
    
    private createCollisionGroups() {
        // Create collision groups for different entity types
        this.playerGroup = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite,
            runChildUpdate: false
        });
        
        this.bulletGroup = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite,
            runChildUpdate: false
        });
        
        this.enemyGroup = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite,
            runChildUpdate: false
        });
        
        this.wallGroup = this.physics.add.staticGroup({
            classType: Phaser.Physics.Arcade.Sprite
        });
        
        this.pickupGroup = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite,
            runChildUpdate: false
        });
        
        this.explosionGroup = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite,
            runChildUpdate: false
        });
        
        // Store groups in collision layers
        this.collisionLayers.set('players', {
            name: 'players',
            group: this.playerGroup,
            collidesWith: ['walls', 'enemies', 'explosions']
        });
        
        this.collisionLayers.set('bullets', {
            name: 'bullets',
            group: this.bulletGroup,
            collidesWith: ['walls', 'players', 'enemies']
        });
        
        this.collisionLayers.set('enemies', {
            name: 'enemies',
            group: this.enemyGroup,
            collidesWith: ['walls', 'players', 'bullets']
        });
        
        this.collisionLayers.set('walls', {
            name: 'walls',
            group: this.wallGroup as any,
            collidesWith: ['players', 'bullets', 'enemies', 'explosions']
        });
        
        this.collisionLayers.set('pickups', {
            name: 'pickups',
            group: this.pickupGroup,
            collidesWith: ['players']
        });
        
        this.collisionLayers.set('explosions', {
            name: 'explosions',
            group: this.explosionGroup,
            collidesWith: ['players', 'enemies', 'walls']
        });
    }
    
    private setupCollisionMatrix() {
        // Player vs Walls
        this.physics.add.collider(this.playerGroup, this.wallGroup, this.onPlayerWallCollision, undefined, this);
        
        // Bullets vs Walls
        this.physics.add.collider(this.bulletGroup, this.wallGroup, this.onBulletWallCollision, undefined, this);
        
        // Bullets vs Players
        this.physics.add.collider(this.bulletGroup, this.playerGroup, this.onBulletPlayerCollision, undefined, this);
        
        // Bullets vs Enemies
        this.physics.add.collider(this.bulletGroup, this.enemyGroup, this.onBulletEnemyCollision, undefined, this);
        
        // Players vs Enemies
        this.physics.add.collider(this.playerGroup, this.enemyGroup, this.onPlayerEnemyCollision, undefined, this);
        
        // Players vs Pickups (overlap, not collision)
        this.physics.add.overlap(this.playerGroup, this.pickupGroup, this.onPlayerPickupOverlap, undefined, this);
        
        // Explosions vs Players
        this.physics.add.overlap(this.explosionGroup, this.playerGroup, this.onExplosionPlayerOverlap, undefined, this);
        
        // Explosions vs Enemies
        this.physics.add.overlap(this.explosionGroup, this.enemyGroup, this.onExplosionEnemyOverlap, undefined, this);
        
        console.log('Collision matrix setup complete');
    }
    
    private setupDebugRendering() {
        if (this.debugEnabled) {
            this.physics.world.createDebugGraphic();
            this.physics.world.debugGraphic.setDepth(1000);
            console.log('Physics debug rendering enabled');
        }
    }
    
    // Collision handlers
    private onPlayerWallCollision(player: any, wall: any) {
        // Handle player bouncing off walls
        if (player.body && player.body.velocity) {
            // Reduce velocity on impact
            player.body.velocity.scale(0.5);
            
            // Play impact sound
            this.scene.sound.play('tank_hit_wall', { volume: 0.3 });
        }
    }
    
    private onBulletWallCollision(bullet: any, wall: any) {
        // Create ricochet effect
        this.createRicochetEffect(bullet.x, bullet.y);
        
        // Remove bullet
        this.removeBulletFromGame(bullet);
        
        // Play ricochet sound
        this.scene.sound.play('bullet_ricochet', { volume: 0.4 });
    }
    
    private onBulletPlayerCollision(bullet: any, player: any) {
        const bulletData = this.getBulletData(bullet);
        const playerData = this.getPlayerData(player);
        
        if (!bulletData || !playerData) return;
        
        // Prevent self-damage
        if (bulletData.ownerId === playerData.id) return;
        
        // Apply damage
        const damage = bulletData.damage || 25;
        this.applyDamageToPlayer(playerData, damage, bulletData.ownerId);
        
        // Create hit effect
        this.createHitEffect(bullet.x, bullet.y, 'player');
        
        // Remove bullet
        this.removeBulletFromGame(bullet);
        
        // Report hit in multiplayer
        if (gameStateManager.isGameActive() && bulletData.multiplayerId) {
            gameStateManager.reportHit(
                playerData.id,
                damage,
                bulletData.multiplayerId,
                { x: bullet.x, y: bullet.y }
            );
        }
        
        console.log(`Player ${playerData.id} hit by bullet for ${damage} damage`);
    }
    
    private onBulletEnemyCollision(bullet: any, enemy: any) {
        const bulletData = this.getBulletData(bullet);
        const enemyData = this.getEnemyData(enemy);
        
        if (!bulletData || !enemyData) return;
        
        // Apply damage to enemy
        const damage = bulletData.damage || 25;
        this.applyDamageToEnemy(enemyData, damage);
        
        // Create hit effect
        this.createHitEffect(bullet.x, bullet.y, 'enemy');
        
        // Remove bullet
        this.removeBulletFromGame(bullet);
        
        console.log(`Enemy hit by bullet for ${damage} damage`);
    }
    
    private onPlayerEnemyCollision(player: any, enemy: any) {
        const playerData = this.getPlayerData(player);
        const enemyData = this.getEnemyData(enemy);
        
        if (!playerData || !enemyData) return;
        
        // Apply collision damage
        const collisionDamage = 15;
        this.applyDamageToPlayer(playerData, collisionDamage, 'collision');
        
        // Push player away
        if (player.body && player.body.velocity && enemy.body) {
            const pushForce = 200;
            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
            player.body.velocity.x += Math.cos(angle) * pushForce;
            player.body.velocity.y += Math.sin(angle) * pushForce;
        }
        
        // Create collision effect
        this.createHitEffect(player.x, player.y, 'collision');
        
        console.log(`Player ${playerData.id} collided with enemy`);
    }
    
    private onPlayerPickupOverlap(player: any, pickup: any) {
        const playerData = this.getPlayerData(player);
        const pickupData = this.getPickupData(pickup);
        
        if (!playerData || !pickupData) return;
        
        // Apply pickup effect
        this.applyPickupEffect(playerData, pickupData);
        
        // Create pickup effect
        this.createPickupEffect(pickup.x, pickup.y, pickupData.type);
        
        // Remove pickup
        pickup.destroy();
        
        console.log(`Player ${playerData.id} picked up ${pickupData.type}`);
    }
    
    private onExplosionPlayerOverlap(explosion: any, player: any) {
        const explosionData = this.getExplosionData(explosion);
        const playerData = this.getPlayerData(player);
        
        if (!explosionData || !playerData) return;
        
        // Calculate damage based on distance from explosion center
        const distance = Phaser.Math.Distance.Between(
            explosion.x, explosion.y,
            player.x, player.y
        );
        
        const maxDistance = explosionData.radius || 100;
        const distanceRatio = Math.max(0, 1 - (distance / maxDistance));
        const damage = Math.floor((explosionData.damage || 50) * distanceRatio);
        
        if (damage > 0) {
            this.applyDamageToPlayer(playerData, damage, explosionData.source || 'explosion');
            
            // Apply knockback
            this.applyKnockback(player, explosion, 300);
        }
    }
    
    private onExplosionEnemyOverlap(explosion: any, enemy: any) {
        const explosionData = this.getExplosionData(explosion);
        const enemyData = this.getEnemyData(enemy);
        
        if (!explosionData || !enemyData) return;
        
        const distance = Phaser.Math.Distance.Between(
            explosion.x, explosion.y,
            enemy.x, enemy.y
        );
        
        const maxDistance = explosionData.radius || 100;
        const distanceRatio = Math.max(0, 1 - (distance / maxDistance));
        const damage = Math.floor((explosionData.damage || 50) * distanceRatio);
        
        if (damage > 0) {
            this.applyDamageToEnemy(enemyData, damage);
            this.applyKnockback(enemy, explosion, 250);
        }
    }
    
    // Utility methods
    private getBulletData(bullet: Phaser.Physics.Arcade.Sprite): any {
        return (bullet as any).bulletData;
    }
    
    private getPlayerData(player: Phaser.Physics.Arcade.Sprite): any {
        return (player as any).playerData;
    }
    
    private getEnemyData(enemy: Phaser.Physics.Arcade.Sprite): any {
        return (enemy as any).enemyData;
    }
    
    private getPickupData(pickup: Phaser.Physics.Arcade.Sprite): any {
        return (pickup as any).pickupData;
    }
    
    private getExplosionData(explosion: Phaser.Physics.Arcade.Sprite): any {
        return (explosion as any).explosionData;
    }
    
    private removeBulletFromGame(bullet: Phaser.Physics.Arcade.Sprite) {
        // Remove from collision group
        this.bulletGroup.remove(bullet);
        
        // Destroy sprite
        bullet.destroy();
    }
    
    private applyDamageToPlayer(playerData: any, damage: number, source: string) {
        if (!playerData.isAlive) return;
        
        // Apply damage reduction if any
        const actualDamage = damage * (1 - (playerData.damageReduction || 0));
        
        playerData.hp = Math.max(0, playerData.hp - actualDamage);
        
        if (playerData.hp <= 0) {
            playerData.isAlive = false;
            this.onPlayerDeath(playerData, source);
        }
        
        // Update player sprite if available
        if (playerData.sprite) {
            this.updatePlayerHealthBar(playerData.sprite, playerData.hp, playerData.maxHp);
        }
    }
    
    private applyDamageToEnemy(enemyData: any, damage: number) {
        if (!enemyData.isAlive) return;
        
        enemyData.hp = Math.max(0, enemyData.hp - damage);
        
        if (enemyData.hp <= 0) {
            enemyData.isAlive = false;
            this.onEnemyDeath(enemyData);
        }
    }
    
    private applyPickupEffect(playerData: any, pickupData: any) {
        switch (pickupData.type) {
            case 'health':
                const healAmount = pickupData.value || 50;
                playerData.hp = Math.min(playerData.maxHp, playerData.hp + healAmount);
                break;
            case 'ammo':
                // Increase ammo count
                break;
            case 'speed_boost':
                // Apply temporary speed boost
                this.applyTemporaryEffect(playerData, 'speed', pickupData.value || 1.5, pickupData.duration || 10000);
                break;
            case 'damage_boost':
                // Apply temporary damage boost
                this.applyTemporaryEffect(playerData, 'damage', pickupData.value || 2, pickupData.duration || 8000);
                break;
        }
    }
    
    private applyTemporaryEffect(playerData: any, effectType: string, multiplier: number, duration: number) {
        const effectId = `${effectType}_${Date.now()}`;
        
        // Apply effect
        switch (effectType) {
            case 'speed':
                if (playerData.sprite && playerData.sprite.body) {
                    playerData.originalSpeed = playerData.originalSpeed || playerData.sprite.body.maxSpeed;
                    playerData.sprite.body.maxSpeed *= multiplier;
                }
                break;
            case 'damage':
                playerData.originalDamage = playerData.originalDamage || playerData.damage;
                playerData.damage *= multiplier;
                break;
        }
        
        // Remove effect after duration
        this.scene.time.delayedCall(duration, () => {
            switch (effectType) {
                case 'speed':
                    if (playerData.sprite && playerData.sprite.body && playerData.originalSpeed) {
                        playerData.sprite.body.maxSpeed = playerData.originalSpeed;
                    }
                    break;
                case 'damage':
                    if (playerData.originalDamage) {
                        playerData.damage = playerData.originalDamage;
                    }
                    break;
            }
        });
    }
    
    private applyKnockback(target: Phaser.Physics.Arcade.Sprite, source: Phaser.Physics.Arcade.Sprite, force: number) {
        if (!target.body || !target.body.velocity) return;
        
        const angle = Phaser.Math.Angle.Between(source.x, source.y, target.x, target.y);
        target.body.velocity.x += Math.cos(angle) * force;
        target.body.velocity.y += Math.sin(angle) * force;
    }
    
    private createHitEffect(x: number, y: number, type: 'player' | 'enemy' | 'collision') {
        const color = type === 'player' ? 0xff0000 : type === 'enemy' ? 0x00ff00 : 0xffff00;
        
        // Create impact spark effect
        const sparks = this.scene.add.particles(x, y, 'bullet_spark', {
            scale: { start: 0.3, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: color,
            lifespan: 300,
            quantity: 5,
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 }
        });
        
        // Auto-destroy after animation
        this.scene.time.delayedCall(500, () => {
            sparks.destroy();
        });
        
        // Screen shake for player hits
        if (type === 'player') {
            this.scene.cameras.main.shake(200, 0.01);
        }
    }
    
    private createRicochetEffect(x: number, y: number) {
        // Create ricochet spark
        const spark = this.scene.add.sprite(x, y, 'ricochet_effect');
        spark.setScale(0.5);
        spark.setDepth(100);
        
        this.scene.tweens.add({
            targets: spark,
            alpha: 0,
            scale: 0.2,
            duration: 300,
            onComplete: () => spark.destroy()
        });
    }
    
    private createPickupEffect(x: number, y: number, type: string) {
        const color = this.getPickupColor(type);
        
        // Create pickup glow effect
        const glow = this.scene.add.circle(x, y, 30, color, 0.8);
        glow.setDepth(50);
        
        this.scene.tweens.add({
            targets: glow,
            scale: 2,
            alpha: 0,
            duration: 500,
            onComplete: () => glow.destroy()
        });
        
        // Play pickup sound
        this.scene.sound.play('item_pickup', { volume: 0.5 });
    }
    
    private getPickupColor(type: string): number {
        switch (type) {
            case 'health': return 0x00ff00;
            case 'ammo': return 0x0088ff;
            case 'speed_boost': return 0xffff00;
            case 'damage_boost': return 0xff8800;
            default: return 0xffffff;
        }
    }
    
    private updatePlayerHealthBar(sprite: Phaser.Physics.Arcade.Sprite, currentHp: number, maxHp: number) {
        // In a full implementation, you'd update the health bar UI
        const healthRatio = currentHp / maxHp;
        
        if (healthRatio < 0.3) {
            sprite.setTint(0xff4444); // Red tint for low health
            
            this.scene.time.delayedCall(200, () => {
                if (sprite.active) {
                    sprite.clearTint();
                }
            });
        }
    }
    
    private onPlayerDeath(playerData: any, source: string) {
        console.log(`Player ${playerData.id} died from ${source}`);
        
        // Create death explosion
        this.createExplosion(playerData.sprite?.x || 0, playerData.sprite?.y || 0, 80, 0);
        
        // Hide player sprite
        if (playerData.sprite) {
            playerData.sprite.setVisible(false);
            playerData.sprite.body.enable = false;
        }
        
        // In multiplayer, this would trigger respawn logic
        if (gameStateManager.isGameActive()) {
            // Schedule respawn
            this.scene.time.delayedCall(3000, () => {
                this.respawnPlayer(playerData);
            });
        }
    }
    
    private onEnemyDeath(enemyData: any) {
        console.log(`Enemy defeated`);
        
        // Create death explosion
        this.createExplosion(enemyData.sprite?.x || 0, enemyData.sprite?.y || 0, 60, 0);
        
        // Award points to nearby players
        this.awardKillPoints(enemyData);
        
        // Remove enemy sprite
        if (enemyData.sprite) {
            this.enemyGroup.remove(enemyData.sprite);
            enemyData.sprite.destroy();
        }
    }
    
    private awardKillPoints(enemyData: any) {
        // Award points to all players within range
        const awardRange = 200;
        
        this.playerGroup.children.entries.forEach((playerSprite: any) => {
            const distance = Phaser.Math.Distance.Between(
                playerSprite.x, playerSprite.y,
                enemyData.sprite?.x || 0, enemyData.sprite?.y || 0
            );
            
            if (distance <= awardRange) {
                const playerData = this.getPlayerData(playerSprite);
                if (playerData) {
                    playerData.score += 100;
                    console.log(`Player ${playerData.id} earned 100 points`);
                }
            }
        });
    }
    
    private respawnPlayer(playerData: any) {
        // Find safe respawn location
        const respawnPos = this.findSafeRespawnPosition();
        
        // Reset player stats
        playerData.hp = playerData.maxHp;
        playerData.isAlive = true;
        
        // Reposition and show player sprite
        if (playerData.sprite) {
            playerData.sprite.setPosition(respawnPos.x, respawnPos.y);
            playerData.sprite.setVisible(true);
            playerData.sprite.body.enable = true;
            playerData.sprite.clearTint();
        }
        
        // Create respawn effect
        this.createRespawnEffect(respawnPos.x, respawnPos.y);
        
        console.log(`Player ${playerData.id} respawned at`, respawnPos);
    }
    
    private findSafeRespawnPosition(): { x: number, y: number } {
        const worldBounds = this.physics.world.bounds;
        const attempts = 10;
        
        for (let i = 0; i < attempts; i++) {
            const x = Phaser.Math.Between(worldBounds.x + 50, worldBounds.x + worldBounds.width - 50);
            const y = Phaser.Math.Between(worldBounds.y + 50, worldBounds.y + worldBounds.height - 50);
            
            // Check if position is safe (no walls or enemies nearby)
            if (this.isPositionSafe(x, y, 60)) {
                return { x, y };
            }
        }
        
        // Fallback to center
        return {
            x: worldBounds.x + worldBounds.width / 2,
            y: worldBounds.y + worldBounds.height / 2
        };
    }
    
    private isPositionSafe(x: number, y: number, radius: number): boolean {
        // Check for walls
        const wallsNearby = this.wallGroup.children.entries.some((wall: any) => {
            const distance = Phaser.Math.Distance.Between(x, y, wall.x, wall.y);
            return distance < radius + 30;
        });
        
        if (wallsNearby) return false;
        
        // Check for enemies
        const enemiesNearby = this.enemyGroup.children.entries.some((enemy: any) => {
            const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
            return distance < radius + 50;
        });
        
        return !enemiesNearby;
    }
    
    private createRespawnEffect(x: number, y: number) {
        // Create respawn glow
        const respawnGlow = this.scene.add.circle(x, y, 5, 0x00ffff, 1);
        respawnGlow.setDepth(100);
        
        this.scene.tweens.add({
            targets: respawnGlow,
            scale: 4,
            alpha: 0,
            duration: 1000,
            onComplete: () => respawnGlow.destroy()
        });
        
        // Play respawn sound
        this.scene.sound.play('player_respawn', { volume: 0.6 });
    }
    
    // Public methods for creating physics objects
    createExplosion(x: number, y: number, radius: number, damage: number, source?: string): Phaser.Physics.Arcade.Sprite {
        const explosion = this.explosionGroup.create(x, y, 'explosion_effect');
        explosion.setCircle(radius);
        explosion.setDepth(200);
        
        // Store explosion data
        (explosion as any).explosionData = {
            radius,
            damage,
            source: source || 'unknown'
        };
        
        // Visual effect
        this.scene.tweens.add({
            targets: explosion,
            scale: { from: 0.1, to: radius / 25 },
            alpha: { from: 1, to: 0 },
            duration: 500,
            onComplete: () => {
                this.explosionGroup.remove(explosion);
                explosion.destroy();
            }
        });
        
        // Screen shake
        this.scene.cameras.main.shake(300, 0.02);
        
        // Sound effect
        this.scene.sound.play('explosion', { volume: 0.8 });
        
        return explosion;
    }
    
    addPlayerToPhysics(player: Player): void {
        if (player.body) {
            this.playerGroup.add(player.body);
            
            // Store player data for collision detection
            (player.body as any).playerData = {
                id: player.playerLobbyId,
                hp: player.stats.hp,
                maxHp: player.stats.maxHp,
                isAlive: player.isAlive,
                damageReduction: player.damageReduction,
                sprite: player.body
            };
        }
    }
    
    addBulletToPhysics(bullet: Bullet): void {
        if (bullet.sprite) {
            this.bulletGroup.add(bullet.sprite);
            
            // Store bullet data
            (bullet.sprite as any).bulletData = {
                damage: bullet.damage,
                ownerId: bullet.getOwnerId(),
                multiplayerId: bullet.getMultiplayerId()
            };
        }
    }
    
    // Debug methods
    toggleDebug(): void {
        this.debugEnabled = !this.debugEnabled;
        
        if (this.debugEnabled) {
            if (!this.physics.world.debugGraphic) {
                this.physics.world.createDebugGraphic();
            }
            this.physics.world.debugGraphic.setVisible(true);
        } else {
            if (this.physics.world.debugGraphic) {
                this.physics.world.debugGraphic.setVisible(false);
            }
        }
        
        console.log('Physics debug:', this.debugEnabled ? 'enabled' : 'disabled');
    }
    
    getCollisionGroups() {
        return {
            players: this.playerGroup,
            bullets: this.bulletGroup,
            enemies: this.enemyGroup,
            walls: this.wallGroup,
            pickups: this.pickupGroup,
            explosions: this.explosionGroup
        };
    }
    
    // Cleanup
    destroy(): void {
        this.collisionLayers.clear();
        
        if (this.physics.world.debugGraphic) {
            this.physics.world.debugGraphic.destroy();
        }
        
        console.log('PhysicsSystem destroyed');
    }
}