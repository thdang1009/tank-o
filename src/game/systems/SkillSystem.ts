import { Scene } from 'phaser';
import { TankClassType } from '../entities/TankClass';
import { Player } from '../entities/Player';
import { AssetsEnum, AssetsAudioEnum } from '../../app/constants/assets-enum';
import { gameStateManager } from '../managers/GameStateManager';

export interface SkillEffect {
    duration: number;
    damage?: number;
    healing?: number;
    damageMultiplier?: number;
    damageReduction?: number;
    speedMultiplier?: number;
    range?: number;
    cooldownReduction?: number;
}

export interface ActiveSkill {
    type: TankClassType;
    startTime: number;
    duration: number;
    effects: SkillEffect;
    visualEffects?: Phaser.GameObjects.GameObject[];
    onUpdate?: (player: Player, deltaTime: number) => void;
    onEnd?: (player: Player) => void;
    player?: Player; // Store reference to player for easier access
}

export class SkillSystem {
    private scene: Scene;
    private activeSkills: Map<string, ActiveSkill> = new Map();

    constructor(scene: Scene) {
        this.scene = scene;
    }

    // Main method to use a skill
    useSkill(player: Player, skillType: TankClassType, targetPosition?: { x: number, y: number }, skillSlot: 'skill1' | 'skill2' | 'ultimate' = 'skill1'): boolean {
        const playerId = player.playerLobbyId;

        // Check if player already has this specific skill slot active
        const skillKey = `${playerId}_${skillSlot}`;
        if (this.activeSkills.has(skillKey)) {
            console.log(`Player ${playerId} already has active ${skillSlot}`);
            return false;
        }

        // Double-check cooldowns as backup (in case Player.useSkill cooldown check fails)
        const now = Date.now();
        const cooldown = this.getSkillCooldown(skillType, skillSlot);
        let lastUsed: number;

        switch (skillSlot) {
            case 'skill1':
                lastUsed = player.lastSkill1Used;
                break;
            case 'skill2':
                lastUsed = player.lastSkill2Used;
                break;
            case 'ultimate':
                lastUsed = player.lastUltimateUsed;
                break;
        }

        if (now < lastUsed + cooldown) {
            console.log(`SkillSystem: ${skillSlot} still on cooldown for ${Math.ceil((lastUsed + cooldown - now) / 1000)}s`);
            return false;
        }

        // Activate the skill
        const skill = this.activateSkill(player, skillType, targetPosition, skillSlot);
        if (skill) {
            this.activeSkills.set(skillKey, skill);
            console.log(`Skill activated: ${skillType} for player ${playerId}, duration: ${skill.duration}ms`);

            // Note: lastSkillXUsed time is already updated by Player.useSkill() before calling this method

            // Notify server in multiplayer
            if (gameStateManager.isGameActive()) {
                gameStateManager.useSkill(skillType, targetPosition);
            }

            return true;
        }

        return false;
    }

    // Activate specific skill based on tank class and skill slot
    private activateSkill(player: Player, skillType: TankClassType, targetPosition?: { x: number, y: number }, skillSlot: 'skill1' | 'skill2' | 'ultimate' = 'skill1'): ActiveSkill | null {
        switch (skillType) {
            case TankClassType.BRUISER:
                return this.activateBruiserSkill(player, skillSlot, targetPosition);
            case TankClassType.DEALER:
                return this.activateDealerSkill(player, skillSlot, targetPosition);
            case TankClassType.SUPPORTER:
                return this.activateSupporterSkill(player, skillSlot, targetPosition);
            case TankClassType.VERSATILE:
                return this.activateVersatileSkill(player, skillSlot, targetPosition);
            case TankClassType.MAGE:
                return this.activateMageSkill(player, skillSlot, targetPosition);
            case TankClassType.SPY:
                return this.activateSpySkill(player, skillSlot, targetPosition);
            case TankClassType.DEMOLITION:
                return this.activateDemolitionSkill(player, skillSlot, targetPosition);
            case TankClassType.BOMBER:
                return this.activateBomberSkill(player, skillSlot, targetPosition);
            case TankClassType.ICE_TANK:
                return this.activateIceTankSkill(player, skillSlot, targetPosition);
            default:
                return null;
        }
    }

    // Bruiser skills
    private activateBruiserSkill(player: Player, skillSlot: 'skill1' | 'skill2' | 'ultimate' = 'skill1', targetPosition?: { x: number, y: number }): ActiveSkill | null {
        switch (skillSlot) {
            case 'skill1':
                return this.bruiserShieldWall(player);
            case 'skill2':
                return this.bruiserShockWave(player);
            case 'ultimate':
                return this.bruiserFortressMode(player);
        }
    }

    // Bruiser Skill 1: Shield Wall - 75% damage reduction for 5 seconds
    private bruiserShieldWall(player: Player): ActiveSkill {
        const effects: SkillEffect = {
            duration: 5000,
            damageReduction: 0.75
        };

        // Apply immediate effects
        player.damageReduction = effects.damageReduction!;

        // Visual effect - shield aura
        const shieldCircle = this.scene.add.circle(
            player.body.x,
            player.body.y,
            40,
            0x00ffff,
            0.4
        );
        shieldCircle.setStrokeStyle(4, 0x0088ff);
        shieldCircle.setDepth(player.body.depth + 1);

        // Animated shield effect
        this.scene.tweens.add({
            targets: shieldCircle,
            scaleX: 1.3,
            scaleY: 1.3,
            alpha: 0.6,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            onUpdate: () => {
                if (player.body.active) {
                    shieldCircle.setPosition(player.body.x, player.body.y);
                }
            }
        });

        // Sound effect
        this.scene.sound.play(AssetsAudioEnum.DEF_BUFF, { volume: 0.5 });

        return {
            type: TankClassType.BRUISER,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [shieldCircle],
            player: player, // Store player reference
            onEnd: (player: Player) => {
                player.damageReduction = 0;
                shieldCircle.destroy();
            }
        };
    }

    // Bruiser Skill 2: Shockwave Slam
    private bruiserShockWave(player: Player): ActiveSkill {
        const effects: SkillEffect = {
            duration: 3000, // Extended for slow effect
            damage: 100,
            range: 150
        };

        // Create expanding shockwave visual
        const shockwave = this.scene.add.circle(
            player.body.x,
            player.body.y,
            20,
            0xffaa00,
            0.6
        );
        shockwave.setStrokeStyle(8, 0xff4400);
        shockwave.setDepth(player.body.depth + 1);

        // Expand shockwave (faster animation than slow duration)
        this.scene.tweens.add({
            targets: shockwave,
            scale: effects.range! / 20,
            alpha: 0,
            duration: 800, // Fast visual expansion
            onComplete: () => {
                shockwave.destroy();
            }
        });

        // Screen shake for impact
        this.scene.cameras.main.shake(300, 0.01);

        // Sound effect
        this.scene.sound.play(AssetsAudioEnum.EXPLOSION, { volume: 0.6 });

        // Damage nearby enemies (both local AI enemies and remote players)
        const gameScene = this.scene as any;

        // Store affected enemies for slowing effect
        const affectedEnemies: any[] = [];

        // Damage local AI enemies
        if (gameScene.gameManager && gameScene.gameManager.enemies) {
            gameScene.gameManager.enemies.forEach((enemy: any) => {
                if (enemy.isAlive && enemy.body && enemy.body.active) {
                    const distance = Phaser.Math.Distance.Between(
                        player.body.x, player.body.y,
                        enemy.body.x, enemy.body.y
                    );
                    if (distance <= effects.range!) {
                        // Apply damage to enemy
                        enemy.takeDamage(effects.damage!);

                        // Apply slow effect
                        if (!enemy.originalSpeed) {
                            enemy.originalSpeed = enemy.stats.speed;
                        }
                        enemy.stats.speed = enemy.originalSpeed * 0.3; // Slow to 30% speed
                        affectedEnemies.push(enemy);

                        console.log(`Shockwave hit enemy for ${effects.damage!} damage and slowed!`);
                    }
                }
            });
        }

        // Damage remote players in multiplayer
        if (gameStateManager.isGameActive()) {
            const nearbyPlayers = gameStateManager.getRemotePlayers().filter(p => {
                const distance = Phaser.Math.Distance.Between(
                    player.body.x, player.body.y,
                    p.position.x, p.position.y
                );
                return distance <= effects.range! && p.isAlive;
            });

            // Apply damage to nearby remote players
            nearbyPlayers.forEach(remotePlayer => {
                // Report shockwave damage
                gameStateManager.reportHit(
                    remotePlayer.id,
                    effects.damage!,
                    'shockwave_' + Date.now(),
                    { x: player.body.x, y: player.body.y }
                );
            });

            // Notify server about skill usage
            gameStateManager.useSkill('bruiser_shockwave', {
                x: player.body.x,
                y: player.body.y
            });
        }

        return {
            type: TankClassType.BRUISER,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [shockwave],
            player: player,
            onEnd: () => {
                // Restore original speed to slowed enemies
                affectedEnemies.forEach(enemy => {
                    if (enemy.originalSpeed && enemy.stats) {
                        enemy.stats.speed = enemy.originalSpeed;
                        delete enemy.originalSpeed;
                    }
                });
                console.log(`Slow effect ended, restored speed to ${affectedEnemies.length} enemies`);
            }
        };
    }

    // Bruiser Ultimate: Fortress Mode
    private bruiserFortressMode(player: Player): ActiveSkill {
        const effects: SkillEffect = {
            duration: 8000,
            damageReduction: 0.9,
            speedMultiplier: 0.1
        };

        // Store original stats to ensure proper restoration
        const originalStats = {
            speed: player.stats.speed,
            damageReduction: player.damageReduction
        };

        // Apply fortress mode effects
        player.damageReduction = effects.damageReduction!;
        player.stats.speed = originalStats.speed * effects.speedMultiplier!;

        // Also store in player object for safety
        (player as any).fortressModeOriginalSpeed = originalStats.speed;

        // Visual effect - fortress appearance
        player.body.setTint(0x666666);
        player.barrel.setTint(0x666666);

        const fortressShield = this.scene.add.circle(
            player.body.x,
            player.body.y,
            50,
            0x444444,
            0.6
        );
        fortressShield.setStrokeStyle(8, 0x888888);
        fortressShield.setDepth(player.body.depth + 1);

        this.scene.tweens.add({
            targets: fortressShield,
            rotation: Math.PI * 2,
            duration: 3000,
            repeat: -1,
            onUpdate: () => {
                if (player.body.active) {
                    fortressShield.setPosition(player.body.x, player.body.y);
                }
            }
        });

        this.scene.sound.play(AssetsAudioEnum.DEF_BUFF, { volume: 0.7 });

        return {
            type: TankClassType.BRUISER,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [fortressShield],
            player: player, // Store player reference
            onEnd: (player: Player) => {
                // Properly restore original stats with multiple fallbacks
                player.damageReduction = originalStats.damageReduction;

                // Use stored speed with fallback
                const speedToRestore = (player as any).fortressModeOriginalSpeed || originalStats.speed;
                player.stats.speed = speedToRestore;

                // Clean up the temporary property
                delete (player as any).fortressModeOriginalSpeed;

                // Clear visual effects
                player.body.clearTint();
                player.barrel.clearTint();
                fortressShield.destroy();

                console.log('Fortress Mode ended - Speed restored to:', player.stats.speed);
            }
        };
    }

    // Dealer skills
    private activateDealerSkill(player: Player, skillSlot: 'skill1' | 'skill2' | 'ultimate' = 'skill1', targetPosition?: { x: number, y: number }): ActiveSkill | null {
        switch (skillSlot) {
            case 'skill1':
                return this.dealerRapidFire(player);
            case 'skill2':
                return this.dealerPrecisionShot(player, targetPosition);
            case 'ultimate':
                return this.dealerBulletStorm(player);
        }
    }

    // Dealer Skill 1: Rapid Fire - Fast fire rate for 3 seconds (no damage boost)
    private dealerRapidFire(player: Player): ActiveSkill {
        const effects: SkillEffect = {
            duration: 3000
        };

        // Store original stats (only fire rate needs to be changed)
        const originalFireRate = player.stats.fireRate;

        // Also store on player object for safety
        (player as any).rapidFireOriginalFireRate = originalFireRate;

        // Apply only fire rate buff (no damage boost)
        player.stats.fireRate = originalFireRate * 0.5; // Faster fire rate
        player.isRapidFire = true;

        console.log(`Rapid Fire activated - Original fire rate: ${originalFireRate}, New fire rate: ${player.stats.fireRate}`);

        // Create a fallback timer to force reset even if skill system fails
        const fallbackTimer = this.scene.time.delayedCall(effects.duration + 500, () => {
            // Force reset if still in rapid fire mode
            if (player.isRapidFire) {
                const fireRateToRestore = (player as any).rapidFireOriginalFireRate || originalFireRate;

                player.stats.fireRate = fireRateToRestore;
                player.isRapidFire = false;
                player.barrel.clearTint();
                player.barrel.setScale(1);

                // Clean up stored values
                delete (player as any).rapidFireOriginalFireRate;

                console.log(`FALLBACK: Rapid Fire force reset - Fire rate: ${player.stats.fireRate}`);
            }
        });

        // Store fallback timer reference for cleanup
        (player as any).rapidFireFallbackTimer = fallbackTimer;

        // Visual effect - red barrel glow
        player.barrel.setTint(0xff4444);
        player.barrel.setScale(1.2);

        // Muzzle flash effect
        const muzzleFlash = this.scene.add.circle(
            player.barrel.x,
            player.barrel.y,
            15,
            0xff0000,
            0.8
        );
        muzzleFlash.setDepth(player.barrel.depth + 1);

        this.scene.tweens.add({
            targets: muzzleFlash,
            alpha: 0,
            scale: 2,
            duration: 200,
            repeat: -1,
            onUpdate: () => {
                if (player.barrel.active) {
                    const barrelTip = this.getBarrelTip(player);
                    muzzleFlash.setPosition(barrelTip.x, barrelTip.y);
                }
            }
        });

        this.scene.sound.play(AssetsAudioEnum.ATK_BUFF, { volume: 0.5 });

        return {
            type: TankClassType.DEALER,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [muzzleFlash],
            player: player, // Store player reference
            onEnd: (player: Player) => {
                // Use stored values with fallbacks (only fire rate, no attack)
                const fireRateToRestore = (player as any).rapidFireOriginalFireRate || originalFireRate;

                player.stats.fireRate = fireRateToRestore;
                player.isRapidFire = false;
                player.barrel.clearTint();
                player.barrel.setScale(1);
                muzzleFlash.destroy();

                // Cancel fallback timer since we're properly ending
                const fallbackTimer = (player as any).rapidFireFallbackTimer;
                if (fallbackTimer) {
                    fallbackTimer.destroy();
                    delete (player as any).rapidFireFallbackTimer;
                }

                // Clean up stored values
                delete (player as any).rapidFireOriginalFireRate;

                console.log(`Rapid Fire ended normally - Fire rate restored to: ${player.stats.fireRate}`);
            }
        };
    }

    // Dealer Skill 2: Precision Shot - Piercing bullet that travels to map edge
    private dealerPrecisionShot(player: Player, targetPosition?: { x: number, y: number }): ActiveSkill {
        const effects: SkillEffect = {
            duration: 2000, // Longer duration for travel time
            damage: 250 // High damage per enemy hit
        };

        const angle = player.barrel.rotation;

        // Create a special piercing bullet using player's fire method but with modifications
        const barrelTip = this.getBarrelTip(player);

        // Temporarily increase damage and create special bullet
        const originalAtk = player.stats.atk;
        player.stats.atk = effects.damage!;

        // Create the precision bullet using the existing bullet system
        const precisionBullet = this.scene.add.sprite(
            barrelTip.x,
            barrelTip.y,
            AssetsEnum.BULLET_RED_3
        );
        precisionBullet.setScale(1.8);
        precisionBullet.setTint(0xffff00);
        precisionBullet.setDepth(10);
        precisionBullet.setRotation(angle);

        // Enable physics for the bullet
        this.scene.physics.world.enable(precisionBullet);
        const bulletBody = precisionBullet.body as Phaser.Physics.Arcade.Body;

        // Set velocity to travel across the map
        const speed = 600;
        const velocityX = Math.cos(angle) * speed;
        const velocityY = Math.sin(angle) * speed;
        bulletBody.setVelocity(velocityX, velocityY);

        // Make it piercing - track hit enemies to prevent multiple hits
        const hitEnemies = new Set();

        // Damage enemies it passes through
        const damageInterval = this.scene.time.addEvent({
            delay: 50, // Check for hits every 50ms
            repeat: -1,
            callback: () => {
                const gameScene = this.scene as any;

                // Check for collisions with enemies
                if (gameScene.gameManager && gameScene.gameManager.enemies) {
                    gameScene.gameManager.enemies.forEach((enemy: any) => {
                        if (enemy.isAlive && enemy.body && enemy.body.active && !hitEnemies.has(enemy)) {
                            const distance = Phaser.Math.Distance.Between(
                                precisionBullet.x, precisionBullet.y,
                                enemy.body.x, enemy.body.y
                            );
                            if (distance <= 30) { // Hit detection radius
                                enemy.takeDamage(effects.damage!);
                                hitEnemies.add(enemy);
                                console.log(`Precision Shot hit enemy for ${effects.damage!} damage!`);

                                // Create hit effect
                                const hitEffect = this.scene.add.circle(
                                    enemy.body.x, enemy.body.y, 20, 0xffff00, 0.8
                                );
                                this.scene.tweens.add({
                                    targets: hitEffect,
                                    scale: 2,
                                    alpha: 0,
                                    duration: 300,
                                    onComplete: () => hitEffect.destroy()
                                });
                            }
                        }
                    });
                }

                // Check if bullet is out of bounds (reached map edge)
                const bounds = this.scene.physics.world.bounds;
                if (precisionBullet.x < bounds.x || precisionBullet.x > bounds.x + bounds.width ||
                    precisionBullet.y < bounds.y || precisionBullet.y > bounds.y + bounds.height) {
                    damageInterval.destroy();
                    precisionBullet.destroy();
                }
            }
        });

        // Restore original attack
        player.stats.atk = originalAtk;

        // Muzzle flash
        const muzzleFlash = this.scene.add.circle(
            barrelTip.x, barrelTip.y, 25, 0xffff00, 0.9
        );

        this.scene.tweens.add({
            targets: muzzleFlash,
            alpha: 0,
            scale: 3,
            duration: 300,
            onComplete: () => muzzleFlash.destroy()
        });

        this.scene.sound.play(AssetsAudioEnum.SHOOT, { volume: 1.0 });

        return {
            type: TankClassType.DEALER,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [precisionBullet, muzzleFlash],
            player: player,
            onEnd: () => {
                // Clean up if still active
                if (damageInterval && !damageInterval.hasDispatched) {
                    damageInterval.destroy();
                }
                if (precisionBullet && precisionBullet.active) {
                    precisionBullet.destroy();
                }
            }
        };
    }

    // Dealer Ultimate: Bullet Storm - Fire 4 powerful bursts
    private dealerBulletStorm(player: Player): ActiveSkill {
        const effects: SkillEffect = {
            duration: 2000,
            damage: 150 // Increased damage per burst
        };

        const burstCount = 4;
        const bulletsPerBurst = 5; // 5 bullets per burst for total of 20 bullets
        let burstsFired = 0;

        // Fire 4 bursts with delay between each
        const fireNextBurst = () => {
            if (burstsFired >= burstCount || !player.body.active) {
                return;
            }

            // Fire a burst of bullets in different directions
            for (let i = 0; i < bulletsPerBurst; i++) {
                const spreadAngle = (i - 2) * 0.3; // Spread bullets in a cone
                const bulletAngle = player.barrel.rotation + spreadAngle;

                // Fire actual bullet using player's fire method
                if (player.fire) {
                    // Temporarily boost damage for ultimate bullets
                    const originalAtk = player.stats.atk;
                    player.stats.atk = originalAtk + effects.damage!;

                    // Override barrel rotation temporarily for spread
                    const originalRotation = player.barrel.rotation;
                    player.barrel.rotation = bulletAngle;

                    player.fire();

                    // Restore original values
                    player.stats.atk = originalAtk;
                    player.barrel.rotation = originalRotation;
                }
            }

            // Visual and audio effects for each burst
            this.scene.cameras.main.shake(200, 0.005);
            this.scene.sound.play(AssetsAudioEnum.SHOOT, { volume: 0.8 });

            burstsFired++;

            // Schedule next burst
            if (burstsFired < burstCount) {
                this.scene.time.delayedCall(500, fireNextBurst); // 500ms between bursts
            }
        };

        // Start the first burst immediately
        fireNextBurst();

        // Screen shake for ultimate activation
        this.scene.cameras.main.shake(400, 0.02);
        this.scene.sound.play(AssetsAudioEnum.ATK_BUFF, { volume: 0.7 });

        return {
            type: TankClassType.DEALER,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [],
            player: player
        };
    }

    // Supporter skills
    private activateSupporterSkill(player: Player, skillSlot: 'skill1' | 'skill2' | 'ultimate' = 'skill1', targetPosition?: { x: number, y: number }): ActiveSkill | null {
        switch (skillSlot) {
            case 'skill1':
                return this.supporterRepairPulse(player);
            case 'skill2':
                return this.supporterEnergyShield(player);
            case 'ultimate':
                return this.supporterMassRestoration(player);
        }
    }

    // Supporter Skill 1: Repair Pulse - Heal self and nearby allies
    private supporterRepairPulse(player: Player): ActiveSkill {
        const effects: SkillEffect = {
            duration: 2000,
            healing: 300,
            range: 150
        };

        // Heal self immediately
        player.heal(effects.healing!);

        // Create healing pulse visual
        const healPulse = this.scene.add.circle(
            player.body.x,
            player.body.y,
            10,
            0x00ff88,
            0.6
        );
        healPulse.setStrokeStyle(3, 0x00ff00);

        // Expand healing pulse
        this.scene.tweens.add({
            targets: healPulse,
            scale: effects.range! / 10,
            alpha: 0,
            duration: effects.duration,
            onComplete: () => {
                healPulse.destroy();
            }
        });

        // Heal nearby players in multiplayer
        if (gameStateManager.isGameActive()) {
            const nearbyPlayers = gameStateManager.getRemotePlayers().filter(p => {
                const distance = Phaser.Math.Distance.Between(
                    player.body.x, player.body.y,
                    p.position.x, p.position.y
                );
                return distance <= effects.range! && p.isAlive;
            });

            // In a full implementation, you'd send heal events to these players
        }

        this.scene.sound.play(AssetsAudioEnum.HEAL, { volume: 0.5 });

        return {
            type: TankClassType.SUPPORTER,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [healPulse]
        };
    }

    // Versatile skills
    private activateVersatileSkill(player: Player, skillSlot: 'skill1' | 'skill2' | 'ultimate' = 'skill1', targetPosition?: { x: number, y: number }): ActiveSkill | null {
        switch (skillSlot) {
            case 'skill1':
                return this.versatileStealthMode(player);
            case 'skill2':
                return this.versatileScoutVision(player);
            case 'ultimate':
                return this.versatileTacticalStrike(player);
        }
    }

    // Versatile Skill 1: Triple Rocket Barrage - Launch 3 homing rockets
    private versatileStealthMode(player: Player): ActiveSkill {
        const effects: SkillEffect = {
            duration: 3000,
            damage: 50
        };

        // Find closest 3 enemies
        const gameScene = this.scene as any;
        const targets: any[] = [];

        if (gameScene.gameManager && gameScene.gameManager.enemies) {
            const enemyList = gameScene.gameManager.enemies.children ?
                gameScene.gameManager.enemies.children.entries :
                gameScene.gameManager.enemies;

            const aliveEnemies = enemyList.filter((enemy: any) => 
                enemy && enemy.isAlive && enemy.body && enemy.body.active
            );

            // Sort by distance and take closest 3
            const sortedEnemies = aliveEnemies.sort((a: any, b: any) => {
                const distA = Phaser.Math.Distance.Between(player.body.x, player.body.y, a.body.x, a.body.y);
                const distB = Phaser.Math.Distance.Between(player.body.x, player.body.y, b.body.x, b.body.y);
                return distA - distB;
            });

            targets.push(...sortedEnemies.slice(0, 3));
        }

        // Create rockets for each target
        const rockets: any[] = [];
        targets.forEach((target, index) => {
            const rocket = this.scene.add.sprite(
                player.body.x,
                player.body.y,
                AssetsEnum.BULLET_RED_1
            );
            rocket.setScale(1.5);
            rocket.setTint(0x4444ff);
            
            // Calculate initial position offset for each rocket
            const offsetAngle = player.barrel.rotation + (index - 1) * 0.3;
            rocket.x = player.body.x + Math.cos(offsetAngle) * 30;
            rocket.y = player.body.y + Math.sin(offsetAngle) * 30;

            rockets.push({ sprite: rocket, target: target });

            // Animate rocket to target
            this.scene.tweens.add({
                targets: rocket,
                x: target.body.x,
                y: target.body.y,
                duration: 1500,
                ease: 'Cubic.Out',
                onUpdate: () => {
                    // Rotate rocket toward target
                    if (target.body && target.body.active) {
                        const angle = Phaser.Math.Angle.Between(rocket.x, rocket.y, target.body.x, target.body.y);
                        rocket.setRotation(angle);
                    }
                },
                onComplete: () => {
                    // Deal damage on impact
                    if (target && target.isAlive && target.body && target.body.active) {
                        const damage = effects.damage!;
                        if (target.takeDamage) {
                            target.takeDamage(damage);
                        }
                        
                        // Impact effect
                        const explosion = this.scene.add.circle(rocket.x, rocket.y, 20, 0xff4444, 0.7);
                        this.scene.tweens.add({
                            targets: explosion,
                            scaleX: 2,
                            scaleY: 2,
                            alpha: 0,
                            duration: 300,
                            onComplete: () => explosion.destroy()
                        });
                    }
                    rocket.destroy();
                }
            });
        });

        this.scene.sound.play(AssetsAudioEnum.SHOOT, { volume: 0.4 });

        return {
            type: TankClassType.VERSATILE,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: rockets.map(r => r.sprite),
            onEnd: () => {
                rockets.forEach(rocket => {
                    if (rocket.sprite && rocket.sprite.active) {
                        rocket.sprite.destroy();
                    }
                });
            }
        };
    }

    // Versatile Skill 2: Self Repair - Heal the tank
    private versatileScoutVision(player: Player): ActiveSkill {
        const effects: SkillEffect = {
            duration: 1000,
            healing: Math.floor(player.stats.maxHp * 0.25) // Heal 25% of max HP
        };

        // Apply healing immediately
        const healAmount = effects.healing!;
        player.stats.hp = Math.min(player.stats.hp + healAmount, player.stats.maxHp);

        // Create healing effect
        const healingEffect = this.scene.add.particles(0, 0, AssetsEnum.BULLET_GREEN_1, {
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 800,
            frequency: 50,
            quantity: 5,
            emitZone: { type: 'edge', source: new Phaser.Geom.Circle(0, 0, 25), quantity: 20 }
        });

        healingEffect.startFollow(player.body);

        // Green tint effect
        player.body.setTint(0x44ff44);
        player.barrel.setTint(0x44ff44);

        this.scene.sound.play(AssetsAudioEnum.HEAL, { volume: 0.5 });

        return {
            type: TankClassType.VERSATILE,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [healingEffect],
            onEnd: (player: Player) => {
                player.body.clearTint();
                player.barrel.clearTint();
                healingEffect.destroy();
            }
        };
    }

    // Versatile Ultimate: Devastation Strike - Random damage and stun all enemies
    private versatileTacticalStrike(player: Player): ActiveSkill {
        const effects: SkillEffect = {
            duration: 3000,
            damage: 100, // This will be randomized
            range: 500
        };

        // Create shockwave effect
        const shockwave = this.scene.add.circle(
            player.body.x,
            player.body.y,
            50,
            0xff2222,
            0.6
        );
        shockwave.setStrokeStyle(6, 0xff0000);

        // Animate shockwave expansion
        this.scene.tweens.add({
            targets: shockwave,
            scaleX: 10,
            scaleY: 10,
            alpha: 0,
            duration: 2000,
            ease: 'Cubic.Out'
        });

        // Damage and stun all enemies
        const gameScene = this.scene as any;
        if (gameScene.gameManager && gameScene.gameManager.enemies) {
            const enemyList = gameScene.gameManager.enemies.children ?
                gameScene.gameManager.enemies.children.entries :
                gameScene.gameManager.enemies;

            enemyList.forEach((enemy: any) => {
                if (enemy && enemy.isAlive && enemy.body && enemy.body.active) {
                    // Random damage between 50-150
                    const randomDamage = Math.floor(Math.random() * 101) + 50;
                    
                    if (enemy.takeDamage) {
                        enemy.takeDamage(randomDamage);
                    }

                    // Stun effect - store original speed and disable movement
                    if (enemy.stats && !enemy.isStunned) {
                        enemy.isStunned = true;
                        enemy.originalSpeed = enemy.stats.speed;
                        enemy.stats.speed = 0;

                        // Visual stun effect
                        const stunEffect = this.scene.add.circle(
                            enemy.body.x,
                            enemy.body.y,
                            20,
                            0xffff00,
                            0.5
                        );
                        stunEffect.setStrokeStyle(3, 0xffaa00);

                        this.scene.tweens.add({
                            targets: stunEffect,
                            alpha: 0.2,
                            scaleX: 1.5,
                            scaleY: 1.5,
                            duration: 500,
                            yoyo: true,
                            repeat: 5,
                            onUpdate: () => {
                                if (enemy.body && enemy.body.active) {
                                    stunEffect.setPosition(enemy.body.x, enemy.body.y);
                                }
                            },
                            onComplete: () => stunEffect.destroy()
                        });

                        // Remove stun after 3 seconds
                        this.scene.time.delayedCall(3000, () => {
                            if (enemy && enemy.stats && enemy.isStunned) {
                                enemy.stats.speed = enemy.originalSpeed || 100;
                                enemy.isStunned = false;
                                delete enemy.originalSpeed;
                            }
                        });
                    }
                }
            });
        }

        // Screen shake effect
        if (gameScene.cameras && gameScene.cameras.main) {
            gameScene.cameras.main.shake(500, 0.02);
        }

        this.scene.sound.play(AssetsAudioEnum.EXPLOSION, { volume: 0.7 });

        return {
            type: TankClassType.VERSATILE,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [shockwave],
            onEnd: () => {
                shockwave.destroy();
            }
        };
    }

    // Mage skills
    private activateMageSkill(player: Player, skillSlot: 'skill1' | 'skill2' | 'ultimate' = 'skill1', targetPosition?: { x: number, y: number }): ActiveSkill | null {
        switch (skillSlot) {
            case 'skill1':
                return this.mageFireball(player, targetPosition);
            case 'skill2':
                return this.mageLightningBolt(player, targetPosition);
            case 'ultimate':
                return this.mageMeteor(player, targetPosition);
        }
    }

    // Mage Skill 1: Fireball - Launch devastating area damage projectile
    private mageFireball(player: Player, targetPosition?: { x: number, y: number }): ActiveSkill {
        const effects: SkillEffect = {
            duration: 3000, // Match the projectile flight time to prevent rapid firing
            damage: 200,
            range: 80
        };

        // Calculate much longer flight distance (10x further)
        const flightDistance = 800; // 10x longer range
        const angle = player.barrel.rotation;
        const startX = player.barrel.x;
        const startY = player.barrel.y;
        const targetX = startX + Math.cos(angle) * flightDistance;
        const targetY = startY + Math.sin(angle) * flightDistance;

        // Create fireball projectile
        const fireball = this.scene.add.sprite(
            startX,
            startY,
            AssetsEnum.FIREBALL_PROJECTILE
        );
        fireball.setScale(1.5);
        fireball.setDepth(10);
        fireball.setRotation(angle);

        // Add fire trail
        const fireTrail = this.scene.add.particles(0, 0, AssetsEnum.BULLET_RED_1, {
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: 0xff6600,
            lifespan: 800, // Longer lifespan for longer trail
            frequency: 50,
            quantity: 2
        });

        fireTrail.startFollow(fireball);

        // Track if fireball has exploded to prevent multiple explosions
        let hasExploded = false;

        // Create collision detection during flight
        const collisionCheck = this.scene.time.addEvent({
            delay: 50, // Check every 50ms
            repeat: -1,
            callback: () => {
                if (hasExploded || !fireball.active) {
                    collisionCheck.destroy();
                    return;
                }

                // Check if fireball is out of bounds
                const bounds = this.scene.physics.world.bounds;
                if (fireball.x < bounds.x || fireball.x > bounds.x + bounds.width ||
                    fireball.y < bounds.y || fireball.y > bounds.y + bounds.height) {

                    hasExploded = true;
                    this.createExplosion(fireball.x, fireball.y, effects.range!, effects.damage!);
                    fireball.destroy();
                    fireTrail.destroy();
                    collisionCheck.destroy();
                    return;
                }

                // Check collision with enemies
                const gameScene = this.scene as any;
                if (gameScene.gameManager && gameScene.gameManager.enemies) {
                    const enemyList = gameScene.gameManager.enemies.children ?
                        gameScene.gameManager.enemies.children.entries :
                        gameScene.gameManager.enemies;

                    enemyList.forEach((enemy: any) => {
                        if (enemy && enemy.isAlive && enemy.body && enemy.body.active && !hasExploded) {
                            const distance = Phaser.Math.Distance.Between(
                                fireball.x, fireball.y,
                                enemy.body.x, enemy.body.y
                            );
                            if (distance <= 40) { // Hit detection radius
                                hasExploded = true;
                                this.createExplosion(fireball.x, fireball.y, effects.range!, effects.damage!);
                                fireball.destroy();
                                fireTrail.destroy();
                                collisionCheck.destroy();
                                console.log(`Fireball hit ${enemy.constructor.name} directly!`);
                            }
                        }
                    });
                }
            }
        });

        // Animate fireball to target (longer duration for longer distance)
        this.scene.tweens.add({
            targets: fireball,
            x: targetX,
            y: targetY,
            duration: 2400, // 3x longer duration for the extended range
            ease: 'Linear',
            onComplete: () => {
                // Only explode if hasn't already exploded from collision
                if (!hasExploded) {
                    this.createExplosion(targetX, targetY, effects.range!, effects.damage!);
                    fireball.destroy();
                    fireTrail.destroy();
                }
                collisionCheck.destroy();
            }
        });

        this.scene.sound.play(AssetsAudioEnum.EXPLOSION, { volume: 0.7 });

        return {
            type: TankClassType.MAGE,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [fireball, fireTrail]
        };
    }

    // Add missing Supporter skills
    private supporterEnergyShield(player: Player): ActiveSkill {
        const effects: SkillEffect = {
            duration: 8000,
            damageReduction: 0.4
        };

        player.damageReduction = effects.damageReduction!;

        const energyShield = this.scene.add.circle(
            player.body.x,
            player.body.y,
            45,
            0x00ff88,
            0.4
        );
        energyShield.setStrokeStyle(3, 0x00ff00);
        energyShield.setDepth(player.body.depth + 1);

        this.scene.tweens.add({
            targets: energyShield,
            alpha: 0.6,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            onUpdate: () => {
                if (player.body.active) {
                    energyShield.setPosition(player.body.x, player.body.y);
                }
            }
        });

        this.scene.sound.play(AssetsAudioEnum.DEF_BUFF, { volume: 0.4 });

        return {
            type: TankClassType.SUPPORTER,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [energyShield],
            onEnd: (player: Player) => {
                player.damageReduction = 0;
                energyShield.destroy();
            }
        };
    }

    private supporterMassRestoration(player: Player): ActiveSkill {
        const effects: SkillEffect = {
            duration: 3000,
            healing: 500,
            range: 200
        };

        // Heal self
        player.heal(effects.healing!);

        const restoration = this.scene.add.circle(
            player.body.x,
            player.body.y,
            20,
            0x00ffaa,
            0.8
        );
        restoration.setStrokeStyle(5, 0x00ff00);

        this.scene.tweens.add({
            targets: restoration,
            scale: effects.range! / 20,
            alpha: 0,
            duration: effects.duration,
            onComplete: () => {
                restoration.destroy();
            }
        });

        // Screen flash for healing
        this.scene.cameras.main.flash(200, 0, 255, 0, true);

        this.scene.sound.play(AssetsAudioEnum.REVIVE, { volume: 0.6 });

        return {
            type: TankClassType.SUPPORTER,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [restoration]
        };
    }

    // Spy skills
    private activateSpySkill(player: Player, skillSlot: 'skill1' | 'skill2' | 'ultimate' = 'skill1', targetPosition?: { x: number, y: number }): ActiveSkill | null {
        switch (skillSlot) {
            case 'skill1':
                return this.spyCloak(player);
            case 'skill2':
                return this.spySmokeScreen(player);
            case 'ultimate':
                return this.spyAssassination(player, targetPosition);
        }
    }

    // Spy Skill 1: Cloak - Enter stealth mode (invisibility only)
    private spyCloak(player: Player): ActiveSkill {
        const effects: SkillEffect = {
            duration: 3000 // Just invisibility, no speed changes
        };

        // Store original invisibility state for proper restoration
        const originalInvisible = player.isInvisible || false;

        // Apply stealth effects (invisibility only)
        player.isInvisible = true;

        // Store original invisibility state on player for safety
        (player as any).cloakOriginalInvisible = originalInvisible;

        // Visual effect - partial transparency
        player.body.setAlpha(0.3);
        player.barrel.setAlpha(0.3);

        // Stealth particles
        const stealthEffect = this.scene.add.particles(0, 0, AssetsEnum.BULLET_BLUE_1, {
            scale: { start: 0.1, end: 0 },
            alpha: { start: 0.5, end: 0 },
            tint: 0x8888ff,
            lifespan: 1000,
            frequency: 100,
            quantity: 3
        });

        stealthEffect.startFollow(player.body);

        // Create fallback timer to ensure effect ends even if skill system fails
        const fallbackTimer = this.scene.time.delayedCall(effects.duration + 500, () => {
            // Force reset if still in cloak mode
            if (player.isInvisible) {
                const invisibleToRestore = (player as any).cloakOriginalInvisible || false;

                player.isInvisible = invisibleToRestore;
                player.body.setAlpha(1);
                player.barrel.setAlpha(1);

                // Clean up stored values
                delete (player as any).cloakOriginalInvisible;

                console.log(`FALLBACK: Cloak force reset - Invisible: ${player.isInvisible}`);
            }
        });

        // Store fallback timer reference for cleanup
        (player as any).cloakFallbackTimer = fallbackTimer;

        this.scene.sound.play(AssetsAudioEnum.DISAPPEAR, { volume: 0.3 });

        return {
            type: TankClassType.SPY,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [stealthEffect],
            player: player, // Store player reference
            onEnd: (player: Player) => {
                // Restore original invisibility state
                const invisibleToRestore = (player as any).cloakOriginalInvisible || false;

                player.isInvisible = invisibleToRestore;
                player.body.setAlpha(1);
                player.barrel.setAlpha(1);
                stealthEffect.destroy();

                // Cancel fallback timer since we're properly ending
                const fallbackTimer = (player as any).cloakFallbackTimer;
                if (fallbackTimer) {
                    fallbackTimer.destroy();
                    delete (player as any).cloakFallbackTimer;
                }

                // Clean up stored values
                delete (player as any).cloakOriginalInvisible;

                console.log(`Cloak ended normally - Invisible: ${player.isInvisible}`);
            }
        };
    }

    // Demolition skills
    private activateDemolitionSkill(player: Player, skillSlot: 'skill1' | 'skill2' | 'ultimate' = 'skill1', targetPosition?: { x: number, y: number }): ActiveSkill | null {
        switch (skillSlot) {
            case 'skill1':
                return this.demolitionCarpetBomb(player, targetPosition);
            case 'skill2':
                return this.demolitionMineField(player);
            case 'ultimate':
                return this.demolitionNuclearStrike(player, targetPosition);
        }
    }

    // Demolition Skill 1: Carpet Bomb - Artillery strike over large area
    private demolitionCarpetBomb(player: Player, targetPosition?: { x: number, y: number }): ActiveSkill {
        const effects: SkillEffect = {
            duration: 3000,
            damage: 200,
            range: 200
        };

        const target = targetPosition || {
            x: player.body.x + Math.cos(player.barrel.rotation) * 300,
            y: player.body.y + Math.sin(player.barrel.rotation) * 300
        };

        // Create target indicator
        const targetIndicator = this.scene.add.circle(
            target.x,
            target.y,
            effects.range!,
            0xff0000,
            0.2
        );
        targetIndicator.setStrokeStyle(4, 0xff0000);

        // Warning phase
        this.scene.tweens.add({
            targets: targetIndicator,
            alpha: 0.5,
            duration: 500,
            yoyo: true,
            repeat: 3
        });

        // After warning, create multiple explosions
        this.scene.time.delayedCall(2000, () => {
            const bombCount = 8;
            for (let i = 0; i < bombCount; i++) {
                this.scene.time.delayedCall(i * 200, () => {
                    const bombX = target.x + (Math.random() - 0.5) * effects.range! * 1.5;
                    const bombY = target.y + (Math.random() - 0.5) * effects.range! * 1.5;
                    this.createExplosion(bombX, bombY, 60, effects.damage! / 2);
                });
            }

            targetIndicator.destroy();
        });

        this.scene.sound.play(AssetsAudioEnum.EXPLOSION, { volume: 0.8 });

        return {
            type: TankClassType.DEMOLITION,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [targetIndicator]
        };
    }

    // Bomber skills
    private activateBomberSkill(player: Player, skillSlot: 'skill1' | 'skill2' | 'ultimate' = 'skill1', targetPosition?: { x: number, y: number }): ActiveSkill | null {
        switch (skillSlot) {
            case 'skill1':
                return this.bomberMineField(player);
            case 'skill2':
                return this.bomberBombBarrage(player, targetPosition);
            case 'ultimate':
                return this.bomberSuperBomb(player);
        }
    }

    // Bomber Skill 1: Mine Field - Places 3 explosive mines in front
    private bomberMineField(player: Player): ActiveSkill {
        const effects: SkillEffect = { duration: 15000, damage: 80, range: 60 };
        const mines: Phaser.GameObjects.Sprite[] = [];
        const mineCollisionChecks: Phaser.Time.TimerEvent[] = [];

        // Place 3 mines in front of the tank
        for (let i = 0; i < 3; i++) {
            const distance = 100 + (i * 60);
            const mineX = player.body.x + Math.cos(player.barrel.rotation) * distance;
            const mineY = player.body.y + Math.sin(player.barrel.rotation) * distance;

            const mine = this.scene.add.sprite(mineX, mineY, AssetsEnum.BOMB);
            mine.setScale(0.7);
            mines.push(mine);

            // Enable physics for collision detection
            this.scene.physics.world.enable(mine);
            (mine.body as Phaser.Physics.Arcade.Body).setImmovable(true);

            let mineExploded = false;

            const collisionCheck = this.scene.time.addEvent({
                delay: 100,
                loop: true,
                callback: () => {
                    if (mineExploded || !mine.active) return;

                    // Check collision with AI enemies
                    const gameScene = this.scene as any;
                    if (gameScene.gameManager && gameScene.gameManager.enemies) {
                        const enemyList = gameScene.gameManager.enemies.children ?
                            gameScene.gameManager.enemies.children.entries :
                            gameScene.gameManager.enemies;

                        enemyList.forEach((enemy: any) => {
                            if (enemy && enemy.isAlive && enemy.body && enemy.body.active) {
                                const distance = Phaser.Math.Distance.Between(
                                    mine.x, mine.y, enemy.body.x, enemy.body.y
                                );
                                if (distance <= 40) {
                                    mineExploded = true;
                                    this.createExplosion(mine.x, mine.y, effects.range!, effects.damage!);
                                    mine.destroy();
                                    collisionCheck.destroy();
                                }
                            }
                        });
                    }

                    // Check collision with remote players
                    if (gameStateManager.isGameActive()) {
                        const remotePlayers = gameStateManager.getRemotePlayers();
                        remotePlayers.forEach(remotePlayer => {
                            const distance = Phaser.Math.Distance.Between(
                                mine.x, mine.y,
                                remotePlayer.position.x, remotePlayer.position.y
                            );

                            if (distance <= 40) {
                                mineExploded = true;
                                this.createExplosion(mine.x, mine.y, effects.range!, effects.damage!);
                                mine.destroy();
                                collisionCheck.destroy();
                            }
                        });
                    }
                }
            });

            mineCollisionChecks.push(collisionCheck);

            // Auto explode after 15 seconds
            this.scene.time.delayedCall(15000, () => {
                if (!mineExploded && mine.active) {
                    this.createExplosion(mine.x, mine.y, effects.range!, effects.damage!);
                    mine.destroy();
                    collisionCheck.destroy();
                }
            });
        }

        this.scene.sound.play(AssetsAudioEnum.ARTILLERY_WHISTLE, { volume: 0.6 });

        return {
            type: TankClassType.BOMBER,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: mines,
            onEnd: () => {
                mines.forEach(mine => mine.destroy());
                mineCollisionChecks.forEach(check => check.destroy());
            }
        };
    }

    // Ice Tank skills
    private activateIceTankSkill(player: Player, skillSlot: 'skill1' | 'skill2' | 'ultimate' = 'skill1', targetPosition?: { x: number, y: number }): ActiveSkill | null {
        switch (skillSlot) {
            case 'skill1':
                return this.iceTankFrostNova(player);
            case 'skill2':
                return this.iceTankIceWall(player, targetPosition);
            case 'ultimate':
                return this.iceTankAbsoluteZero(player);
        }
    }

    // Ice Tank Skill 1: Frost Nova - AOE ice damage with slow effect
    private iceTankFrostNova(player: Player): ActiveSkill {
        const effects: SkillEffect = {
            duration: 5000, // Extended for slow effect
            damage: 120,
            range: 100
        };

        // Store affected enemies for slowing effect
        const affectedEnemies: any[] = [];

        // Create frost nova visual effect
        const frostNova = this.scene.add.circle(
            player.body.x,
            player.body.y,
            20,
            0x00ddff,
            0.7
        );
        frostNova.setStrokeStyle(4, 0x0099dd);
        frostNova.setDepth(50);

        // Expand frost nova
        this.scene.tweens.add({
            targets: frostNova,
            scale: effects.range! / 20,
            alpha: 0.3,
            duration: 800,
            onComplete: () => {
                frostNova.destroy();
            }
        });

        // Create ice particles using bullet sprite as fallback
        const iceParticles = this.scene.add.particles(0, 0, AssetsEnum.BULLET_BLUE_1, {
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.8, end: 0 },
            tint: 0x88ddff,
            lifespan: 2000,
            frequency: 50,
            quantity: 3,
            speed: { min: 30, max: 100 },
            angle: { min: 0, max: 360 }
        });

        iceParticles.setPosition(player.body.x, player.body.y);

        // Damage local AI enemies and apply slow effect
        const gameScene = this.scene as any;
        if (gameScene.gameManager && gameScene.gameManager.enemies) {
            const enemyList = gameScene.gameManager.enemies.children ?
                gameScene.gameManager.enemies.children.entries :
                gameScene.gameManager.enemies;

            enemyList.forEach((enemy: any) => {
                if (enemy && enemy.isAlive && enemy.body && enemy.body.active) {
                    const distance = Phaser.Math.Distance.Between(
                        player.body.x, player.body.y,
                        enemy.body.x, enemy.body.y
                    );
                    if (distance <= effects.range!) {
                        // Apply damage to enemy
                        enemy.takeDamage(effects.damage!);

                        // Only apply slow effect if enemy is still alive after damage
                        if (enemy.isAlive && enemy.stats) {
                            // Apply slow effect (freeze enemies to 10% speed)
                            if (!enemy.originalSpeed) {
                                enemy.originalSpeed = enemy.stats.speed;
                            }
                            enemy.stats.speed = enemy.originalSpeed * 0.1; // Slow to 10% speed
                            affectedEnemies.push(enemy);

                            // Create freeze effect on enemy
                            const freezeEffect = this.scene.add.circle(
                                enemy.body.x, enemy.body.y, 25, 0x88ddff, 0.6
                            );
                            freezeEffect.setStrokeStyle(3, 0x0099dd);

                            this.scene.tweens.add({
                                targets: freezeEffect,
                                alpha: 0.3,
                                duration: effects.duration,
                                onUpdate: () => {
                                    if (enemy && enemy.body && enemy.body.active) {
                                        freezeEffect.setPosition(enemy.body.x, enemy.body.y);
                                    } else {
                                        // Enemy died, cleanup freeze effect
                                        freezeEffect.destroy();
                                    }
                                },
                                onComplete: () => {
                                    if (freezeEffect.active) {
                                        freezeEffect.destroy();
                                    }
                                }
                            });
                        }

                        console.log(`Frost Nova hit enemy for ${effects.damage!} damage and froze!`);
                    }
                }
            });
        }

        // In multiplayer, this would damage and slow nearby enemies
        if (gameStateManager.isGameActive()) {
            const nearbyPlayers = gameStateManager.getRemotePlayers().filter(p => {
                const distance = Phaser.Math.Distance.Between(
                    player.body.x, player.body.y,
                    p.position.x, p.position.y
                );
                return distance <= effects.range! && p.isAlive;
            });

            nearbyPlayers.forEach(remotePlayer => {
                // Report ice damage hit to server
                gameStateManager.reportHit(
                    remotePlayer.id,
                    effects.damage!,
                    'frost_nova_' + Date.now(),
                    { x: player.body.x, y: player.body.y }
                );
            });
        }

        // Screen freeze effect for dramatic impact
        this.scene.cameras.main.flash(300, 200, 230, 255, true);

        this.scene.sound.play(AssetsAudioEnum.ICE_FREEZE, { volume: 0.6 });

        // Clean up particles after effect
        this.scene.time.delayedCall(effects.duration, () => {
            iceParticles.destroy();
        });

        return {
            type: TankClassType.ICE_TANK,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [frostNova, iceParticles],
            player: player,
            onEnd: () => {
                // Restore original speed to slowed enemies (only if they're still alive)
                affectedEnemies.forEach(enemy => {
                    if (enemy && enemy.isAlive && enemy.originalSpeed && enemy.stats) {
                        enemy.stats.speed = enemy.originalSpeed;
                        delete enemy.originalSpeed;
                    }
                });
                console.log(`Frost Nova slow effect ended, restored speed to living enemies`);
            }
        };
    }

    // Mage Skill 2: Lightning Bolt - Instant chain lightning damage
    private mageLightningBolt(player: Player, targetPosition?: { x: number, y: number }): ActiveSkill {
        const effects: SkillEffect = {
            duration: 800,
            damage: 180,
            range: 400 // Lightning range
        };

        // Create main lightning bolt visual
        const lightning = this.scene.add.rectangle(
            player.barrel.x, player.barrel.y,
            effects.range!, 8, 0xffff00, 0.9
        );
        lightning.setRotation(player.barrel.rotation);
        lightning.setOrigin(0, 0.5);

        // Calculate lightning path
        const angle = player.barrel.rotation;
        const startX = player.barrel.x;
        const startY = player.barrel.y;
        const endX = startX + Math.cos(angle) * effects.range!;
        const endY = startY + Math.sin(angle) * effects.range!;

        // Find all enemies in lightning path and damage them
        const gameScene = this.scene as any;
        const hitEnemies: any[] = [];

        if (gameScene.gameManager && gameScene.gameManager.enemies) {
            const enemyList = gameScene.gameManager.enemies.children ?
                gameScene.gameManager.enemies.children.entries :
                gameScene.gameManager.enemies;

            enemyList.forEach((enemy: any) => {
                if (enemy && enemy.isAlive && enemy.body && enemy.body.active) {
                    // Check if enemy is close to the lightning path
                    const distanceToLine = this.distanceToLine(
                        startX, startY, endX, endY,
                        enemy.body.x, enemy.body.y
                    );

                    const distanceFromStart = Phaser.Math.Distance.Between(
                        startX, startY, enemy.body.x, enemy.body.y
                    );

                    // Hit if within 30 pixels of lightning path and within range
                    if (distanceToLine <= 30 && distanceFromStart <= effects.range!) {
                        hitEnemies.push(enemy);

                        // Apply damage
                        enemy.takeDamage(effects.damage!);

                        console.log(`Lightning bolt hit ${enemy.constructor.name} for ${effects.damage!} damage`);

                        // Create lightning hit effect
                        const lightningHit = this.scene.add.circle(
                            enemy.body.x, enemy.body.y, 25, 0xffff00, 0.9
                        );

                        // Create branching lightning to enemy
                        const branchLightning = this.scene.add.line(
                            0, 0,
                            startX, startY,
                            enemy.body.x, enemy.body.y,
                            0xaaff00, 0.8
                        );
                        branchLightning.setLineWidth(4);
                        branchLightning.setDepth(50);

                        this.scene.tweens.add({
                            targets: [lightningHit, branchLightning],
                            alpha: 0,
                            duration: 300,
                            onComplete: () => {
                                lightningHit.destroy();
                                branchLightning.destroy();
                            }
                        });
                    }
                }
            });
        }

        // Chain lightning effect - hit nearby enemies of already hit enemies
        const chainRange = 120;
        const chainDamage = Math.floor(effects.damage! * 0.6); // 60% damage for chain
        const alreadyChained = new Set(hitEnemies);

        hitEnemies.forEach(hitEnemy => {
            if (gameScene.gameManager && gameScene.gameManager.enemies) {
                const enemyList = gameScene.gameManager.enemies.children ?
                    gameScene.gameManager.enemies.children.entries :
                    gameScene.gameManager.enemies;

                enemyList.forEach((nearbyEnemy: any) => {
                    if (nearbyEnemy && nearbyEnemy.isAlive && nearbyEnemy.body && nearbyEnemy.body.active &&
                        !alreadyChained.has(nearbyEnemy)) {

                        const chainDistance = Phaser.Math.Distance.Between(
                            hitEnemy.body.x, hitEnemy.body.y,
                            nearbyEnemy.body.x, nearbyEnemy.body.y
                        );

                        if (chainDistance <= chainRange) {
                            alreadyChained.add(nearbyEnemy);

                            // Apply chain damage
                            nearbyEnemy.takeDamage(chainDamage);

                            console.log(`Lightning chain hit ${nearbyEnemy.constructor.name} for ${chainDamage} damage`);

                            // Create chain lightning visual
                            const chainLightning = this.scene.add.line(
                                0, 0,
                                hitEnemy.body.x, hitEnemy.body.y,
                                nearbyEnemy.body.x, nearbyEnemy.body.y,
                                0x66ff66, 0.7
                            );
                            chainLightning.setLineWidth(3);
                            chainLightning.setDepth(51);

                            const chainHit = this.scene.add.circle(
                                nearbyEnemy.body.x, nearbyEnemy.body.y, 20, 0x66ff66, 0.8
                            );

                            this.scene.tweens.add({
                                targets: [chainLightning, chainHit],
                                alpha: 0,
                                duration: 400,
                                onComplete: () => {
                                    chainLightning.destroy();
                                    chainHit.destroy();
                                }
                            });
                        }
                    }
                });
            }
        });

        // Main lightning animation
        this.scene.tweens.add({
            targets: lightning,
            alpha: 0,
            duration: 200,
            repeat: 3,
            onComplete: () => lightning.destroy()
        });

        // Screen flash for lightning effect
        this.scene.cameras.main.flash(100, 255, 255, 0, true);
        this.scene.sound.play(AssetsAudioEnum.SPEED_UP, { volume: 0.7 });

        return {
            type: TankClassType.MAGE,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [lightning]
        };
    }

    // Mage Ultimate: Meteor - Battlefield-wide devastating meteor shower
    private mageMeteor(player: Player, targetPosition?: { x: number, y: number }): ActiveSkill {
        const effects: SkillEffect = {
            duration: 6000, // Longer duration for multiple meteors
            damage: 300, // Reduced per-meteor damage since it's area-wide
            range: 800 // Extremely wide range to cover entire battlefield
        };

        // Get battlefield bounds
        const bounds = this.scene.physics.world.bounds;
        const centerX = bounds.x + bounds.width / 2;
        const centerY = bounds.y + bounds.height / 2;

        // Create multiple meteors across the battlefield
        const meteorCount = 8; // Multiple meteors for wide coverage
        const meteors: Phaser.GameObjects.GameObject[] = [];

        // Create warning indicators first
        const warningIndicators: Phaser.GameObjects.GameObject[] = [];

        for (let i = 0; i < meteorCount; i++) {
            // Spread meteors across the battlefield
            const angle = (i / meteorCount) * Math.PI * 2;
            const distance = Math.random() * (effects.range! * 0.4) + 100; // Random distance from center

            const meteorTargetX = centerX + Math.cos(angle) * distance + (Math.random() - 0.5) * 200;
            const meteorTargetY = centerY + Math.sin(angle) * distance + (Math.random() - 0.5) * 200;

            // Clamp to battlefield bounds
            const targetX = Phaser.Math.Clamp(meteorTargetX, bounds.x + 50, bounds.x + bounds.width - 50);
            const targetY = Phaser.Math.Clamp(meteorTargetY, bounds.y + 50, bounds.y + bounds.height - 50);

            // Create warning indicator
            const warning = this.scene.add.circle(targetX, targetY, 80, 0xff0000, 0.3);
            warning.setStrokeStyle(4, 0xff4400);
            warning.setDepth(5);
            warningIndicators.push(warning);

            // Warning animation
            this.scene.tweens.add({
                targets: warning,
                alpha: 0.6,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 800,
                yoyo: true,
                repeat: 2
            });

            // Create meteor starting high above target
            const meteor = this.scene.add.sprite(targetX, targetY - 400, AssetsEnum.METEOR);
            meteor.setScale(0.8 + Math.random() * 0.4); // Random size variation (0.8 to 1.2 scale)
            meteor.setDepth(100);
            meteor.setRotation(Math.random() * Math.PI * 2); // Random rotation for variety
            meteors.push(meteor);

            // Add fire trail for each meteor
            const meteorTrail = this.scene.add.particles(0, 0, AssetsEnum.BULLET_RED_1, {
                scale: { start: 0.8, end: 0 },
                alpha: { start: 1, end: 0 },
                tint: [0xff4400, 0xff6600, 0xffaa00],
                lifespan: 800,
                frequency: 30,
                quantity: 3
            });
            meteorTrail.startFollow(meteor);
            meteors.push(meteorTrail);

            // Stagger meteor impacts
            const impactDelay = 2000 + (i * 300); // 300ms between each meteor

            // Meteor fall animation
            this.scene.tweens.add({
                targets: meteor,
                y: targetY,
                duration: 1500,
                delay: impactDelay,
                ease: 'Power2',
                onComplete: () => {
                    // Create massive explosion
                    this.createExplosion(targetX, targetY, 120, effects.damage!); // Each meteor has good range

                    // Create additional screen effects for each impact
                    this.scene.cameras.main.shake(400, 0.008);

                    // Destroy meteor and trail
                    meteor.destroy();
                    meteorTrail.destroy();

                    console.log(`Meteor ${i + 1} impact at (${Math.round(targetX)}, ${Math.round(targetY)})`);
                }
            });

            // Add rotation animation during fall for more realistic meteor effect
            this.scene.tweens.add({
                targets: meteor,
                rotation: meteor.rotation + (Math.PI * 4), // 2 full rotations during fall
                duration: 1500,
                delay: impactDelay,
                ease: 'Linear'
            });
        }

        // Remove warning indicators after a delay
        this.scene.time.delayedCall(2500, () => {
            warningIndicators.forEach(warning => {
                if (warning.active) {
                    warning.destroy();
                }
            });
        });

        // Dramatic screen effects for ultimate activation
        this.scene.cameras.main.flash(1000, 100, 0, 0, true);
        this.scene.cameras.main.shake(2000, 0.005);

        // Sound effects
        this.scene.sound.play(AssetsAudioEnum.ARTILLERY_WHISTLE, { volume: 0.9 });
        this.scene.time.delayedCall(2000, () => {
            this.scene.sound.play(AssetsAudioEnum.EXPLOSION, { volume: 1.0 });
        });

        return {
            type: TankClassType.MAGE,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: meteors.concat(warningIndicators),
            onEnd: () => {
                // Cleanup any remaining meteors and effects
                meteors.forEach(meteor => {
                    if (meteor.active) {
                        meteor.destroy();
                    }
                });
                warningIndicators.forEach(warning => {
                    if (warning.active) {
                        warning.destroy();
                    }
                });
            }
        };
    }

    // Spy Skill 2: Smoke Bomb - Creates obscuring smoke cloud
    private spySmokeScreen(player: Player): ActiveSkill {
        const effects: SkillEffect = {
            duration: 5000,
            range: 100
        };

        // Throw smoke bomb projectile in front of player
        const throwDistance = 120;
        const throwX = player.body.x + Math.cos(player.barrel.rotation) * throwDistance;
        const throwY = player.body.y + Math.sin(player.barrel.rotation) * throwDistance;

        // Create smoke bomb projectile
        const smokeBomb = this.scene.add.sprite(
            player.body.x,
            player.body.y,
            AssetsEnum.BULLET_DARK_1
        );
        smokeBomb.setScale(0.8);
        smokeBomb.setTint(0x444444);
        smokeBomb.setDepth(10);

        // Animate throwing the smoke bomb
        this.scene.tweens.add({
            targets: smokeBomb,
            x: throwX,
            y: throwY,
            duration: 600,
            ease: 'Power2',
            onComplete: () => {
                // Create smoke cloud at impact location
                const smokeCloud = this.scene.add.circle(throwX, throwY, 20, 0x666666, 0.8);
                smokeCloud.setDepth(player.body.depth + 1);

                // Create multiple smoke particles for better effect
                const smokeParticles = this.scene.add.particles(throwX, throwY, AssetsEnum.BULLET_DARK_1, {
                    scale: { start: 0.5, end: 1.2 },
                    alpha: { start: 0.8, end: 0.3 },
                    tint: [0x666666, 0x888888, 0x444444],
                    lifespan: effects.duration,
                    frequency: 150,
                    quantity: 4,
                    speed: { min: 20, max: 60 },
                    angle: { min: 0, max: 360 }
                });

                // Expand smoke cloud
                this.scene.tweens.add({
                    targets: smokeCloud,
                    scale: effects.range! / 20,
                    alpha: 0.4,
                    duration: 1000,
                    onComplete: () => {
                        // Keep smoke cloud visible but reduce alpha
                        this.scene.tweens.add({
                            targets: smokeCloud,
                            alpha: 0.2,
                            duration: effects.duration - 1000,
                            onComplete: () => smokeCloud.destroy()
                        });
                    }
                });

                // In a full implementation, this would:
                // - Break enemy targeting/line of sight
                // - Hide players inside the smoke from enemies
                // - Provide concealment for repositioning

                // Store original invisibility state
                const wasInvisible = player.isInvisible;

                // Create smoke concealment effect
                const checkSmokeInterval = this.scene.time.addEvent({
                    delay: 200,
                    repeat: Math.floor(effects.duration / 200),
                    callback: () => {
                        if (player.body && player.body.active) {
                            const distanceToSmoke = Phaser.Math.Distance.Between(
                                player.body.x, player.body.y,
                                throwX, throwY
                            );

                            // If player is inside smoke cloud, apply concealment
                            if (distanceToSmoke <= effects.range!) {
                                if (!(player as any).inSmokeCloud) {
                                    // Enter smoke - become invisible to enemies
                                    (player as any).inSmokeCloud = true;
                                    (player as any).wasInvisibleBeforeSmoke = player.isInvisible;
                                    player.isInvisible = true;
                                    player.body.setAlpha(0.4);
                                    player.barrel.setAlpha(0.4);
                                    console.log('Player entered smoke cloud - now invisible to enemies');
                                }
                            } else {
                                // Outside smoke, restore original visibility state
                                if ((player as any).inSmokeCloud) {
                                    const wasInvisibleBefore = (player as any).wasInvisibleBeforeSmoke || false;
                                    player.isInvisible = wasInvisibleBefore;

                                    // Only restore alpha if not invisible from other sources (like cloak)
                                    if (!wasInvisibleBefore) {
                                        player.body.setAlpha(1);
                                        player.barrel.setAlpha(1);
                                    }

                                    delete (player as any).inSmokeCloud;
                                    delete (player as any).wasInvisibleBeforeSmoke;
                                    console.log('Player left smoke cloud - visibility restored');
                                }
                            }
                        }
                    }
                });

                // Clean up smoke particles and effects
                this.scene.time.delayedCall(effects.duration, () => {
                    smokeParticles.destroy();
                    checkSmokeInterval.destroy();

                    // Restore player visibility if they were in smoke
                    if ((player as any).inSmokeCloud) {
                        const wasInvisibleBefore = (player as any).wasInvisibleBeforeSmoke || false;
                        player.isInvisible = wasInvisibleBefore;

                        // Only restore alpha if not invisible from other sources
                        if (!wasInvisibleBefore) {
                            player.body.setAlpha(1);
                            player.barrel.setAlpha(1);
                        }

                        delete (player as any).inSmokeCloud;
                        delete (player as any).wasInvisibleBeforeSmoke;
                        console.log('Smoke cloud expired - player visibility restored');
                    }
                });

                smokeBomb.destroy();
            }
        });

        this.scene.sound.play(AssetsAudioEnum.STEALTH_ACTIVATE, { volume: 0.4 });

        return {
            type: TankClassType.SPY,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [smokeBomb], // Initial projectile, other effects are managed internally
            onEnd: () => {
                // Ensure player visibility is restored
                if ((player as any).inSmokeCloud) {
                    const wasInvisibleBefore = (player as any).wasInvisibleBeforeSmoke || false;
                    player.isInvisible = wasInvisibleBefore;

                    // Only restore alpha if not invisible from other sources
                    if (!wasInvisibleBefore) {
                        player.body.setAlpha(1);
                        player.barrel.setAlpha(1);
                    }

                    delete (player as any).inSmokeCloud;
                    delete (player as any).wasInvisibleBeforeSmoke;
                }
            }
        };
    }

    // Spy Ultimate: Assassination - Teleport to enemy and debuff them
    private spyAssassination(player: Player, targetPosition?: { x: number, y: number }): ActiveSkill {
        const effects: SkillEffect = {
            duration: 3000, // Duration of debuff effect
            damage: 350,
            damageReduction: -0.3, // Reduce enemy defense by 30%
            range: 300 // Max teleport range
        };

        // Find nearest enemy to teleport to
        let targetEnemy: any = null;
        let closestDistance = effects.range!;

        const gameScene = this.scene as any;
        if (gameScene.gameManager && gameScene.gameManager.enemies) {
            const enemyList = gameScene.gameManager.enemies.children ?
                gameScene.gameManager.enemies.children.entries :
                gameScene.gameManager.enemies;

            enemyList.forEach((enemy: any) => {
                if (enemy && enemy.isAlive && enemy.body && enemy.body.active) {
                    const distance = Phaser.Math.Distance.Between(
                        player.body.x, player.body.y,
                        enemy.body.x, enemy.body.y
                    );
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        targetEnemy = enemy;
                    }
                }
            });
        }

        if (!targetEnemy) {
            // No valid target found, just do a short stealth
            console.log('No enemy target found for assassination');
            return this.spyCloak(player);
        }

        // Store original position for escape
        const originalX = player.body.x;
        const originalY = player.body.y;

        // Phase 1: Disappear
        player.body.setAlpha(0.1);
        player.barrel.setAlpha(0.1);
        player.isInvisible = true;

        // Phase 2: Teleport behind target (after 300ms)
        this.scene.time.delayedCall(300, () => {
            // Calculate position behind the target
            const behindDistance = 60;
            const targetAngle = targetEnemy.body.rotation || 0;
            const teleportX = targetEnemy.body.x - Math.cos(targetAngle) * behindDistance;
            const teleportY = targetEnemy.body.y - Math.sin(targetAngle) * behindDistance;

            // Teleport player
            player.body.setPosition(teleportX, teleportY);

            // Face the target
            const angleToTarget = Phaser.Math.Angle.Between(
                player.body.x, player.body.y,
                targetEnemy.body.x, targetEnemy.body.y
            );
            player.barrel.setRotation(angleToTarget);

            // Reappear with attack
            player.body.setAlpha(1);
            player.barrel.setAlpha(1);
            player.isInvisible = false;

            // Apply damage to target
            if (targetEnemy.takeDamage) {
                targetEnemy.takeDamage(effects.damage!);
            }

            // Apply debuff to target (reduce attack and defense)
            if (targetEnemy.stats) {
                if (!targetEnemy.originalDebuffStats) {
                    targetEnemy.originalDebuffStats = {
                        atk: targetEnemy.stats.atk,
                        def: targetEnemy.stats.def
                    };
                }

                // Reduce enemy attack and defense by 50%
                targetEnemy.stats.atk = targetEnemy.originalDebuffStats.atk * 0.5;
                targetEnemy.stats.def = targetEnemy.originalDebuffStats.def * 0.5;
                targetEnemy.isDebuffed = true;

                // Create debuff visual effect on enemy
                const debuffEffect = this.scene.add.circle(
                    targetEnemy.body.x, targetEnemy.body.y, 30, 0x8800ff, 0.6
                );
                debuffEffect.setStrokeStyle(3, 0x4400aa);
                debuffEffect.setDepth(targetEnemy.body.depth + 1);

                this.scene.tweens.add({
                    targets: debuffEffect,
                    alpha: 0.3,
                    scaleX: 1.5,
                    scaleY: 1.5,
                    duration: 1000,
                    yoyo: true,
                    repeat: Math.floor(effects.duration / 2000),
                    onUpdate: () => {
                        if (targetEnemy && targetEnemy.body && targetEnemy.body.active) {
                            debuffEffect.setPosition(targetEnemy.body.x, targetEnemy.body.y);
                        }
                    },
                    onComplete: () => {
                        debuffEffect.destroy();

                        // Remove debuff from enemy
                        if (targetEnemy && targetEnemy.isDebuffed && targetEnemy.originalDebuffStats) {
                            targetEnemy.stats.atk = targetEnemy.originalDebuffStats.atk;
                            targetEnemy.stats.def = targetEnemy.originalDebuffStats.def;
                            delete targetEnemy.originalDebuffStats;
                            delete targetEnemy.isDebuffed;
                            console.log('Assassination debuff expired');
                        }
                    }
                });

                console.log(`Assassination hit ${targetEnemy.constructor.name} for ${effects.damage} damage and applied debuff`);
            }

            // Create impact effect
            const impactEffect = this.scene.add.circle(
                targetEnemy.body.x, targetEnemy.body.y, 40, 0xff0000, 0.8
            );
            this.scene.tweens.add({
                targets: impactEffect,
                scale: 2,
                alpha: 0,
                duration: 400,
                onComplete: () => impactEffect.destroy()
            });

            // Phase 3: Quick escape after 800ms
            this.scene.time.delayedCall(800, () => {
                // Fade out
                player.body.setAlpha(0.1);
                player.barrel.setAlpha(0.1);
                player.isInvisible = true;

                // Teleport to safe distance (200ms later)
                this.scene.time.delayedCall(200, () => {
                    // Calculate escape position (opposite direction from target)
                    const escapeAngle = angleToTarget + Math.PI; // Opposite direction
                    const escapeDistance = 150;
                    const escapeX = player.body.x + Math.cos(escapeAngle) * escapeDistance;
                    const escapeY = player.body.y + Math.sin(escapeAngle) * escapeDistance;

                    // Ensure escape position is within bounds
                    const bounds = this.scene.physics.world.bounds;
                    const finalEscapeX = Phaser.Math.Clamp(escapeX, bounds.x + 50, bounds.x + bounds.width - 50);
                    const finalEscapeY = Phaser.Math.Clamp(escapeY, bounds.y + 50, bounds.y + bounds.height - 50);

                    player.body.setPosition(finalEscapeX, finalEscapeY);

                    // Reappear
                    player.body.setAlpha(1);
                    player.barrel.setAlpha(1);
                    player.isInvisible = false;

                    console.log('Spy escaped after assassination');
                });
            });
        });

        // Screen flash for dramatic effect
        this.scene.cameras.main.flash(200, 100, 0, 100, true);
        this.scene.sound.play(AssetsAudioEnum.DISAPPEAR, { volume: 0.8 });

        return {
            type: TankClassType.SPY,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [], // Effects are managed internally
            player: player,
            onEnd: () => {
                // Ensure debuff is removed if skill ends early
                if (targetEnemy && targetEnemy.isDebuffed && targetEnemy.originalDebuffStats) {
                    targetEnemy.stats.atk = targetEnemy.originalDebuffStats.atk;
                    targetEnemy.stats.def = targetEnemy.originalDebuffStats.def;
                    delete targetEnemy.originalDebuffStats;
                    delete targetEnemy.isDebuffed;
                }

                // Ensure player is visible
                if (player.body && player.barrel) {
                    player.body.setAlpha(1);
                    player.barrel.setAlpha(1);
                    player.isInvisible = false;
                }
            }
        };
    }

    private demolitionMineField(player: Player): ActiveSkill {
        const effects: SkillEffect = { duration: 10000, damage: 150, range: 80 };
        const mines: Phaser.GameObjects.Sprite[] = [];
        const mineCollisionChecks: Phaser.Time.TimerEvent[] = [];

        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const distance = 100;
            const mineX = player.body.x + Math.cos(angle) * distance;
            const mineY = player.body.y + Math.sin(angle) * distance;

            const mine = this.scene.add.sprite(mineX, mineY, AssetsEnum.BOMB);
            mine.setScale(0.7);
            mines.push(mine);

            // Enable physics for collision detection
            this.scene.physics.world.enable(mine);
            (mine.body as Phaser.Physics.Arcade.Body).setImmovable(true);

            let mineExploded = false;

            // Collision detection with enemies
            const collisionCheck = this.scene.time.addEvent({
                delay: 100,
                loop: true,
                callback: () => {
                    if (mineExploded || !mine.active) return;

                    const gameScene = this.scene as any;
                    if (gameScene.gameManager && gameScene.gameManager.enemies) {
                        const enemyList = gameScene.gameManager.enemies.children ?
                            gameScene.gameManager.enemies.children.entries :
                            gameScene.gameManager.enemies;

                        enemyList.forEach((enemy: any) => {
                            if (enemy && enemy.isAlive && enemy.body && enemy.body.active) {
                                const distance = Phaser.Math.Distance.Between(
                                    mine.x, mine.y, enemy.body.x, enemy.body.y
                                );
                                if (distance <= 30) { // Close collision distance
                                    mineExploded = true;
                                    this.createExplosion(mine.x, mine.y, effects.range!, effects.damage!);
                                    mine.destroy();
                                    collisionCheck.destroy();
                                }
                            }
                        });
                    }
                }
            });

            mineCollisionChecks.push(collisionCheck);

            // Auto explode after 10 seconds
            this.scene.time.delayedCall(10000, () => {
                if (!mineExploded && mine.active) {
                    this.createExplosion(mine.x, mine.y, effects.range!, effects.damage!);
                    mine.destroy();
                }
                collisionCheck.destroy();
            });
        }

        this.scene.sound.play(AssetsAudioEnum.ARTILLERY_WHISTLE, { volume: 0.5 });

        return {
            type: TankClassType.DEMOLITION,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: mines,
            onEnd: () => {
                mines.forEach(mine => {
                    if (mine.active) mine.destroy();
                });
                mineCollisionChecks.forEach(check => {
                    if (check.hasDispatched === false) check.destroy();
                });
            }
        };
    }

    private demolitionNuclearStrike(player: Player, targetPosition?: { x: number, y: number }): ActiveSkill {
        // Map-wide damage range - use entire screen dimensions
        const mapWidth = this.scene.cameras.main.width;
        const mapHeight = this.scene.cameras.main.height;
        const mapWideRange = Math.max(mapWidth, mapHeight) * 2; // Ensure entire map coverage
        
        const effects: SkillEffect = { duration: 5000, damage: 800, range: mapWideRange };
        const target = targetPosition || { x: player.body.x, y: player.body.y - 300 };

        // Create nuclear warning sprite
        const nuclear = this.scene.add.sprite(target.x, target.y, AssetsEnum.NUCLEAR);
        nuclear.setScale(1.5);
        nuclear.setAlpha(0.8);
        
        // Pulsing warning effect
        this.scene.tweens.add({
            targets: nuclear,
            scale: nuclear.scaleX * 1.2,
            yoyo: true,
            repeat: 6,
            duration: 250,
            onComplete: () => nuclear.destroy()
        });

        this.scene.time.delayedCall(3000, () => {
            // Create massive explosion at center of map for visual effect
            const centerX = this.scene.cameras.main.width / 2;
            const centerY = this.scene.cameras.main.height / 2;
            this.createExplosion(centerX, centerY, 400, effects.damage!);
            
            // Additional visual effects for map-wide devastation
            this.scene.cameras.main.flash(2000, 255, 255, 255, true);
            this.scene.cameras.main.shake(1000, 0.02);
        });

        this.scene.sound.play(AssetsAudioEnum.EXPLOSION, { volume: 1.0 });

        return {
            type: TankClassType.DEMOLITION,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [nuclear]
        };
    }

    private bomberBombBarrage(player: Player, targetPosition?: { x: number, y: number }): ActiveSkill {
        const effects: SkillEffect = { duration: 2000, damage: 60, range: 80 };
        const bombs: Phaser.GameObjects.Sprite[] = [];
        
        // Default to cursor/barrel direction if no target position
        const target = targetPosition || {
            x: player.body.x + Math.cos(player.barrel.rotation) * 200,
            y: player.body.y + Math.sin(player.barrel.rotation) * 200
        };

        // Throw 3 bombs in the target direction
        for (let i = 0; i < 3; i++) {
            const spread = (i - 1) * 50; // Spread bombs apart
            const bombX = target.x + spread * Math.cos(player.barrel.rotation + Math.PI/2);
            const bombY = target.y + spread * Math.sin(player.barrel.rotation + Math.PI/2);

            const bomb = this.scene.add.sprite(bombX, bombY, AssetsEnum.BOMB);
            bomb.setScale(0.8);
            bombs.push(bomb);

            // Each bomb explodes with a slight delay
            this.scene.time.delayedCall(500 + (i * 200), () => {
                this.createExplosion(bombX, bombY, effects.range!, effects.damage!);
                bomb.destroy();
            });
        }

        this.scene.sound.play(AssetsAudioEnum.EXPLOSION, { volume: 0.6 });

        return {
            type: TankClassType.BOMBER,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: bombs
        };
    }

    private bomberSuperBomb(player: Player): ActiveSkill {
        const effects: SkillEffect = { duration: 3500, damage: 300, range: 160 };
        
        // Place the super bomb at current tank position
        const bombX = player.body.x;
        const bombY = player.body.y;

        const superBomb = this.scene.add.sprite(bombX, bombY, AssetsEnum.BOMB);
        superBomb.setScale(1.5);
        
        // Create warning indicator
        const warningCircle = this.scene.add.circle(bombX, bombY, effects.range!, 0xff0000, 0.3);
        warningCircle.setStrokeStyle(3, 0xff0000);

        // Pulsing animation for warning
        this.scene.tweens.add({
            targets: [superBomb, warningCircle],
            scale: 1.2,
            duration: 500,
            repeat: 5,
            yoyo: true
        });

        // Explode after 3 seconds
        this.scene.time.delayedCall(3000, () => {
            this.createExplosion(bombX, bombY, effects.range!, effects.damage!);
            superBomb.destroy();
            warningCircle.destroy();
        });

        this.scene.sound.play(AssetsAudioEnum.EXPLOSION, { volume: 0.8 });

        return {
            type: TankClassType.BOMBER,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [superBomb, warningCircle]
        };
    }

    private iceTankIceWall(player: Player, targetPosition?: { x: number, y: number }): ActiveSkill {
        const effects: SkillEffect = { duration: 8000, range: 120 };

        // Calculate wall position in front of the tank
        const wallDistance = 100;
        const wallX = player.body.x + Math.cos(player.barrel.rotation) * wallDistance;
        const wallY = player.body.y + Math.sin(player.barrel.rotation) * wallDistance;

        // Create visual wall
        const wall = this.scene.add.rectangle(
            wallX, wallY,
            effects.range!, 35, 0x88ddff, 0.8
        );
        wall.setRotation(player.barrel.rotation + Math.PI / 2);
        wall.setDepth(10);
        wall.setStrokeStyle(4, 0x0099dd);

        // Create a single large collision body for the wall
        const wallCollisionBody = this.scene.add.rectangle(
            wallX, wallY,
            effects.range!, 35, 0x88ddff, 0
        );
        wallCollisionBody.setRotation(player.barrel.rotation + Math.PI / 2);

        // Enable physics for the wall
        this.scene.physics.world.enable(wallCollisionBody);
        const wallBody = wallCollisionBody.body as Phaser.Physics.Arcade.Body;
        wallBody.setImmovable(true);

        // Create ice particles around the wall
        const wallParticles = this.scene.add.particles(wallX, wallY, AssetsEnum.BULLET_BLUE_1, {
            scale: { start: 0.2, end: 0 },
            alpha: { start: 0.6, end: 0 },
            tint: 0x88ddff,
            lifespan: 1500,
            frequency: 200,
            quantity: 2,
            speed: { min: 10, max: 30 },
            angle: { min: 0, max: 360 }
        });

        // Set up collision detection using the existing bullet management system
        const gameScene = this.scene as any;
        const bulletCollisionInterval = this.scene.time.addEvent({
            delay: 50, // Check every 50ms
            repeat: -1,
            callback: () => {
                // Check collisions with all player bullets
                if (gameScene.gameManager && gameScene.gameManager.player) {
                    const playerBullets = gameScene.gameManager.player.bullets || [];

                    playerBullets.forEach((bullet: any) => {
                        if (bullet && bullet.sprite && bullet.sprite.active && wallCollisionBody.active) {
                            // Check if bullet overlaps with wall
                            const bulletBounds = bullet.sprite.getBounds();
                            const wallBounds = wallCollisionBody.getBounds();

                            if (Phaser.Geom.Rectangle.Overlaps(bulletBounds, wallBounds)) {
                                // Create ice impact effect
                                const impactEffect = this.scene.add.circle(
                                    bullet.sprite.x, bullet.sprite.y, 15, 0x88ddff, 0.8
                                );
                                this.scene.tweens.add({
                                    targets: impactEffect,
                                    scale: 2,
                                    alpha: 0,
                                    duration: 300,
                                    onComplete: () => impactEffect.destroy()
                                });

                                // Remove bullet from player's bullet array
                                const bulletIndex = gameScene.gameManager.player.bullets.indexOf(bullet);
                                if (bulletIndex > -1) {
                                    gameScene.gameManager.player.bullets.splice(bulletIndex, 1);
                                }

                                bullet.destroy();
                                console.log('Ice wall blocked a player bullet!');
                            }
                        }
                    });
                }

                // Check collisions with all enemy bullets
                if (gameScene.gameManager && gameScene.gameManager.enemies) {
                    gameScene.gameManager.enemies.forEach((enemy: any) => {
                        if (enemy && enemy.bullets) {
                            enemy.bullets.forEach((bullet: any, bulletIndex: number) => {
                                if (bullet && bullet.sprite && bullet.sprite.active && wallCollisionBody.active) {
                                    // Check if bullet overlaps with wall
                                    const bulletBounds = bullet.sprite.getBounds();
                                    const wallBounds = wallCollisionBody.getBounds();

                                    if (Phaser.Geom.Rectangle.Overlaps(bulletBounds, wallBounds)) {
                                        // Create ice impact effect
                                        const impactEffect = this.scene.add.circle(
                                            bullet.sprite.x, bullet.sprite.y, 15, 0x88ddff, 0.8
                                        );
                                        this.scene.tweens.add({
                                            targets: impactEffect,
                                            scale: 2,
                                            alpha: 0,
                                            duration: 300,
                                            onComplete: () => impactEffect.destroy()
                                        });

                                        // Remove bullet from enemy's bullet array
                                        enemy.bullets.splice(bulletIndex, 1);

                                        bullet.destroy();
                                        console.log('Ice wall blocked an enemy bullet!');
                                    }
                                }
                            });
                        }
                    });
                }
            }
        });

        // Set up enemy collision using overlap detection
        const enemyCollision = this.scene.physics.add.overlap(
            wallCollisionBody,
            gameScene.gameManager ? gameScene.gameManager.enemies.map((e: any) => e.body) : [],
            (wall: any, enemyBody: any) => {
                const enemy = enemyBody.getData('ref'); // Get enemy reference from physics body
                if (enemy && enemy.isAlive && enemy.body && enemy.body.active) {
                    // Push enemy back from wall
                    const pushAngle = Phaser.Math.Angle.Between(
                        wallX, wallY,
                        enemy.body.x, enemy.body.y
                    );
                    const pushForce = 80;
                    const pushX = Math.cos(pushAngle) * pushForce;
                    const pushY = Math.sin(pushAngle) * pushForce;

                    enemy.body.x += pushX;
                    enemy.body.y += pushY;

                    // Apply slow effect
                    if (!enemy.wallSlowed) {
                        enemy.wallSlowed = true;
                        enemy.wallOriginalSpeed = enemy.stats.speed;
                        enemy.stats.speed = enemy.wallOriginalSpeed * 0.2; // 20% speed
                        console.log('Enemy blocked and slowed by ice wall!');

                        // Remove slow after 3 seconds
                        this.scene.time.delayedCall(3000, () => {
                            if (enemy && enemy.wallSlowed && enemy.stats && enemy.wallOriginalSpeed) {
                                enemy.stats.speed = enemy.wallOriginalSpeed;
                                delete enemy.wallSlowed;
                                delete enemy.wallOriginalSpeed;
                            }
                        });
                    }
                }
            }
        );

        this.scene.sound.play(AssetsAudioEnum.ICE_FREEZE, { volume: 0.5 });

        return {
            type: TankClassType.ICE_TANK,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [wall, wallParticles, wallCollisionBody],
            onEnd: () => {
                // Clean up bullet collision interval
                if (bulletCollisionInterval && !bulletCollisionInterval.hasDispatched) {
                    bulletCollisionInterval.destroy();
                }

                // Clean up enemy collision
                if (enemyCollision && enemyCollision.destroy) {
                    enemyCollision.destroy();
                }

                // Restore speed to any slowed enemies
                const gameScene = this.scene as any;
                if (gameScene.gameManager && gameScene.gameManager.enemies) {
                    gameScene.gameManager.enemies.forEach((enemy: any) => {
                        if (enemy && enemy.wallSlowed && enemy.wallOriginalSpeed && enemy.stats) {
                            enemy.stats.speed = enemy.wallOriginalSpeed;
                            delete enemy.wallSlowed;
                            delete enemy.wallOriginalSpeed;
                        }
                    });
                }

                // Destroy visual elements
                wallParticles.destroy();
                wall.destroy();
                wallCollisionBody.destroy();
                console.log('Ice wall destroyed');
            }
        };
    }

    private iceTankAbsoluteZero(player: Player): ActiveSkill {
        const effects: SkillEffect = { duration: 8000, damage: 300, range: 300 };

        // Store affected enemies for stunning effect
        const affectedEnemies: any[] = [];

        const freeze = this.scene.add.circle(player.body.x, player.body.y, 20, 0x88ddff, 0.8);
        freeze.setStrokeStyle(8, 0x0099dd);
        freeze.setDepth(100);

        // Create expanding freeze wave
        this.scene.tweens.add({
            targets: freeze,
            scale: effects.range! / 20,
            alpha: 0.3,
            duration: 2000,
            onComplete: () => freeze.destroy()
        });

        // Damage and stun all enemies in range
        const gameScene = this.scene as any;
        if (gameScene.gameManager && gameScene.gameManager.enemies) {
            const enemyList = gameScene.gameManager.enemies.children ?
                gameScene.gameManager.enemies.children.entries :
                gameScene.gameManager.enemies;

            enemyList.forEach((enemy: any) => {
                if (enemy && enemy.isAlive && enemy.body && enemy.body.active) {
                    const distance = Phaser.Math.Distance.Between(
                        player.body.x, player.body.y,
                        enemy.body.x, enemy.body.y
                    );
                    if (distance <= effects.range!) {
                        // Apply massive damage
                        enemy.takeDamage(effects.damage!);

                        // Only apply stun effect if enemy is still alive after damage
                        if (enemy.isAlive && enemy.stats) {
                            // Freeze enemy completely (0 speed and disable firing)
                            if (!enemy.originalSpeed) {
                                enemy.originalSpeed = enemy.stats.speed;
                                enemy.originalFireRate = enemy.stats.fireRate;
                            }
                            enemy.stats.speed = 0; // Complete freeze
                            enemy.stats.fireRate = 999999; // Prevent firing
                            enemy.isStunned = true;
                            affectedEnemies.push(enemy);

                            // Create freeze effect on enemy
                            const enemyFreezeEffect = this.scene.add.circle(
                                enemy.body.x, enemy.body.y, 35, 0x88ddff, 0.7
                            );
                            enemyFreezeEffect.setStrokeStyle(4, 0x0099dd);
                            enemyFreezeEffect.setDepth(enemy.body.depth + 1);

                            // Pulsing freeze effect
                            this.scene.tweens.add({
                                targets: enemyFreezeEffect,
                                alpha: 0.9,
                                scaleX: 1.2,
                                scaleY: 1.2,
                                duration: 1000,
                                yoyo: true,
                                repeat: Math.floor(effects.duration / 2000),
                                onUpdate: () => {
                                    if (enemy && enemy.body && enemy.body.active) {
                                        enemyFreezeEffect.setPosition(enemy.body.x, enemy.body.y);
                                    } else {
                                        // Enemy died, cleanup freeze effect
                                        enemyFreezeEffect.destroy();
                                    }
                                },
                                onComplete: () => {
                                    if (enemyFreezeEffect.active) {
                                        enemyFreezeEffect.destroy();
                                    }
                                }
                            });
                        }

                        console.log(`Absolute Zero hit enemy for ${effects.damage!} damage and stunned!`);
                    }
                }
            });
        }

        // In multiplayer, damage all players on the battlefield
        if (gameStateManager.isGameActive()) {
            const allPlayers = gameStateManager.getRemotePlayers().filter(p => p.isAlive);

            allPlayers.forEach(remotePlayer => {
                const distance = Phaser.Math.Distance.Between(
                    player.body.x, player.body.y,
                    remotePlayer.position.x, remotePlayer.position.y
                );
                if (distance <= effects.range!) {
                    // Report massive ice damage hit to server
                    gameStateManager.reportHit(
                        remotePlayer.id,
                        effects.damage!,
                        'absolute_zero_' + Date.now(),
                        { x: player.body.x, y: player.body.y }
                    );
                }
            });
        }

        // Create ice shards falling from sky effect
        const iceShards = this.scene.add.particles(0, 0, AssetsEnum.BULLET_BLUE_3, {
            scale: { start: 0.5, end: 0.1 },
            alpha: { start: 0.9, end: 0 },
            tint: 0x88ddff,
            lifespan: 4000,
            frequency: 30,
            quantity: 5,
            speed: { min: 100, max: 200 },
            angle: { min: 80, max: 100 },
            gravityY: 50,
            x: { min: player.body.x - effects.range!, max: player.body.x + effects.range! },
            y: player.body.y - 200
        });

        // Dramatic screen effects
        this.scene.cameras.main.flash(2000, 200, 230, 255, true);
        this.scene.cameras.main.shake(1000, 0.01);
        this.scene.sound.play(AssetsAudioEnum.ICE_FREEZE, { volume: 0.8 });

        // Clean up ice shards after duration
        this.scene.time.delayedCall(effects.duration, () => {
            iceShards.destroy();
        });

        return {
            type: TankClassType.ICE_TANK,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [freeze, iceShards],
            player: player,
            onEnd: () => {
                // Restore original speed and firing to stunned enemies (only if they're still alive)
                affectedEnemies.forEach(enemy => {
                    if (enemy && enemy.isAlive && enemy.originalSpeed && enemy.stats) {
                        enemy.stats.speed = enemy.originalSpeed;
                        enemy.stats.fireRate = enemy.originalFireRate;
                        enemy.isStunned = false;
                        delete enemy.originalSpeed;
                        delete enemy.originalFireRate;
                    }
                });
                console.log(`Absolute Zero stun effect ended, restored living enemies`);
            }
        };
    }

    // Update active skills
    update(deltaTime: number) {
        const currentTime = Date.now();
        const expiredSkills: string[] = [];

        this.activeSkills.forEach((skill, skillKey) => {
            // Check if skill has expired
            if (currentTime >= skill.startTime + skill.duration) {
                // End skill
                if (skill.onEnd && skill.player) {
                    console.log(`Skill ${skill.type} expiring for skillKey ${skillKey}`);
                    skill.onEnd(skill.player);
                }

                // Clean up visual effects
                skill.visualEffects?.forEach(effect => {
                    if (effect.active) {
                        effect.destroy();
                    }
                });

                expiredSkills.push(skillKey);
            } else {
                // Update skill if needed
                if (skill.onUpdate && skill.player) {
                    skill.onUpdate(skill.player, deltaTime);
                }
            }
        });

        // Remove expired skills
        expiredSkills.forEach(skillKey => {
            this.activeSkills.delete(skillKey);
        });
    }

    // Helper methods
    private isOnCooldown(player: Player, skillType: TankClassType): boolean {
        // This method is no longer used since we check cooldowns in Player.useSkill
        // Keep for backward compatibility
        const cooldown = this.getSkillCooldown(skillType);
        return Date.now() < player.lastSkill1Used + cooldown;
    }

    private getSkillCooldown(skillType: TankClassType, skillSlot: 'skill1' | 'skill2' | 'ultimate' = 'skill1'): number {
        const cooldowns = {
            [TankClassType.BRUISER]: { skill1: 8000, skill2: 15000, ultimate: 45000 },
            [TankClassType.DEALER]: { skill1: 6000, skill2: 10000, ultimate: 35000 },
            [TankClassType.SUPPORTER]: { skill1: 10000, skill2: 12000, ultimate: 40000 },
            [TankClassType.VERSATILE]: { skill1: 5000, skill2: 8000, ultimate: 30000 },
            [TankClassType.MAGE]: { skill1: 6000, skill2: 6000, ultimate: 50000 },
            [TankClassType.SPY]: { skill1: 10000, skill2: 8000, ultimate: 25000 },
            [TankClassType.DEMOLITION]: { skill1: 15000, skill2: 18000, ultimate: 60000 },
            [TankClassType.BOMBER]: { skill1: 14000, skill2: 6000, ultimate: 50000 },
            [TankClassType.ICE_TANK]: { skill1: 8000, skill2: 12000, ultimate: 40000 }
        };

        return cooldowns[skillType]?.[skillSlot] || 10000;
    }

    private getBarrelTip(player: Player): { x: number, y: number } {
        const barrelLength = 40;
        return {
            x: player.barrel.x + Math.cos(player.barrel.rotation) * barrelLength,
            y: player.barrel.y + Math.sin(player.barrel.rotation) * barrelLength
        };
    }

    // Helper function to calculate distance from a point to a line segment
    private distanceToLine(x1: number, y1: number, x2: number, y2: number, px: number, py: number): number {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;

        if (lenSq === 0) {
            // Line segment is actually a point
            return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
        }

        let param = dot / lenSq;

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    private createExplosion(x: number, y: number, radius: number, damage: number) {
        // Create explosion visual
        const explosion = this.scene.add.sprite(x, y, AssetsEnum.EXPLOSION_1);
        explosion.setScale(radius / 50);
        explosion.setDepth(100);

        // Animate explosion
        this.scene.tweens.add({
            targets: explosion,
            scale: explosion.scaleX * 1.5,
            alpha: 0,
            duration: 500,
            onComplete: () => explosion.destroy()
        });

        // Screen shake
        this.scene.cameras.main.shake(300, 0.005);

        // Sound
        this.scene.sound.play(AssetsAudioEnum.EXPLOSION, { volume: 0.6 });

        // Damage local AI enemies
        const gameScene = this.scene as any;
        if (gameScene.gameManager && gameScene.gameManager.enemies) {
            const enemyList = gameScene.gameManager.enemies.children ?
                gameScene.gameManager.enemies.children.entries :
                gameScene.gameManager.enemies;

            enemyList.forEach((enemy: any) => {
                if (enemy && enemy.isAlive && enemy.body && enemy.body.active) {
                    const distance = Phaser.Math.Distance.Between(
                        x, y, enemy.body.x, enemy.body.y
                    );
                    if (distance <= radius) {
                        // Calculate damage based on distance (closer = more damage)
                        const distanceRatio = 1 - (distance / radius);
                        const actualDamage = Math.floor(damage * Math.max(0.3, distanceRatio)); // Min 30% damage

                        // Apply damage to enemy
                        enemy.takeDamage(actualDamage);

                        console.log(`Explosion hit ${enemy.constructor.name} for ${actualDamage} damage at distance ${Math.round(distance)}`);

                        // Create hit effect on enemy
                        const hitEffect = this.scene.add.circle(
                            enemy.body.x, enemy.body.y, 20, 0xff4400, 0.8
                        );
                        this.scene.tweens.add({
                            targets: hitEffect,
                            scale: 2,
                            alpha: 0,
                            duration: 400,
                            onComplete: () => hitEffect.destroy()
                        });
                    }
                }
            });
        }

        // Damage remote players in multiplayer
        if (gameStateManager.isGameActive()) {
            const remotePlayers = gameStateManager.getRemotePlayers();
            remotePlayers.forEach(remotePlayer => {
                const distance = Phaser.Math.Distance.Between(
                    x, y, remotePlayer.position.x, remotePlayer.position.y
                );
                if (distance <= radius) {
                    // Calculate damage based on distance
                    const distanceRatio = 1 - (distance / radius);
                    const actualDamage = Math.floor(damage * distanceRatio);

                    // Report hit to server
                    gameStateManager.reportHit(
                        remotePlayer.id,
                        actualDamage,
                        'explosion_' + Date.now(),
                        { x, y }
                    );
                }
            });
        }
    }

    private findPlayerById(playerId: string): Player | null {
        // This is a simplified implementation
        // In a real game, you'd have a proper player manager
        return null;
    }

    // Get remaining cooldown time for a player's skill
    getSkillCooldownRemaining(player: Player, skillType: TankClassType, skillSlot: 'skill1' | 'skill2' | 'ultimate' = 'skill1'): number {
        const cooldown = this.getSkillCooldown(skillType, skillSlot);
        let lastUsed: number;

        switch (skillSlot) {
            case 'skill1':
                lastUsed = player.lastSkill1Used;
                break;
            case 'skill2':
                lastUsed = player.lastSkill2Used;
                break;
            case 'ultimate':
                lastUsed = player.lastUltimateUsed;
                break;
        }

        const elapsed = Date.now() - lastUsed;
        return Math.max(0, cooldown - elapsed);
    }

    // Check if player has any active skill
    hasActiveSkill(playerId: string): boolean {
        for (const skillKey of this.activeSkills.keys()) {
            if (skillKey.startsWith(`${playerId}_`)) {
                return true;
            }
        }
        return false;
    }

    // Check if player has a specific skill slot active
    hasActiveSkillSlot(playerId: string, skillSlot: 'skill1' | 'skill2' | 'ultimate'): boolean {
        const skillKey = `${playerId}_${skillSlot}`;
        return this.activeSkills.has(skillKey);
    }

    // Force end a specific skill slot
    endSkill(playerId: string, skillSlot?: 'skill1' | 'skill2' | 'ultimate'): boolean {
        if (skillSlot) {
            // End specific skill slot
            const skillKey = `${playerId}_${skillSlot}`;
            const skill = this.activeSkills.get(skillKey);
            if (skill) {
                if (skill.onEnd) {
                    const player = this.findPlayerById(playerId);
                    if (player) {
                        skill.onEnd(player);
                    }
                }

                skill.visualEffects?.forEach(effect => {
                    if (effect.active) {
                        effect.destroy();
                    }
                });

                this.activeSkills.delete(skillKey);
                return true;
            }
        } else {
            // End all skills for player (backward compatibility)
            let ended = false;
            for (const [skillKey, skill] of this.activeSkills.entries()) {
                if (skillKey.startsWith(`${playerId}_`)) {
                    if (skill.onEnd) {
                        const player = this.findPlayerById(playerId);
                        if (player) {
                            skill.onEnd(player);
                        }
                    }

                    skill.visualEffects?.forEach(effect => {
                        if (effect.active) {
                            effect.destroy();
                        }
                    });

                    this.activeSkills.delete(skillKey);
                    ended = true;
                }
            }
            return ended;
        }
        return false;
    }
}