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
        
        // Check if player already has an active skill
        if (this.activeSkills.has(playerId)) {
            return false;
        }
        
        // Activate the skill
        const skill = this.activateSkill(player, skillType, targetPosition, skillSlot);
        if (skill) {
            this.activeSkills.set(playerId, skill);
            
            // Update last skill used time based on skill slot
            const now = Date.now();
            switch (skillSlot) {
                case 'skill1':
                    player.lastSkill1Used = now;
                    break;
                case 'skill2':
                    player.lastSkill2Used = now;
                    break;
                case 'ultimate':
                    player.lastUltimateUsed = now;
                    break;
            }
            
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
            case TankClassType.RADAR_SCOUT:
                return this.activateRadarScoutSkill(player, skillSlot, targetPosition);
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
                return this.bruiserTaunt(player);
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
            onEnd: (player: Player) => {
                player.damageReduction = 0;
                shieldCircle.destroy();
            }
        };
    }
    
    // Bruiser Skill 2: Taunt
    private bruiserTaunt(player: Player): ActiveSkill {
        const effects: SkillEffect = {
            duration: 6000,
            damageReduction: 0.25
        };
        
        player.damageReduction = effects.damageReduction!;
        
        // Visual effect - intimidating aura
        const tauntAura = this.scene.add.circle(
            player.body.x,
            player.body.y,
            60,
            0xff4444,
            0.3
        );
        tauntAura.setStrokeStyle(6, 0xff0000);
        tauntAura.setDepth(player.body.depth + 1);
        
        this.scene.tweens.add({
            targets: tauntAura,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0.5,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            onUpdate: () => {
                if (player.body.active) {
                    tauntAura.setPosition(player.body.x, player.body.y);
                }
            }
        });
        
        this.scene.sound.play(AssetsAudioEnum.DEF_BUFF, { volume: 0.5 });
        
        return {
            type: TankClassType.BRUISER,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [tauntAura],
            onEnd: (player: Player) => {
                player.damageReduction = 0;
                tauntAura.destroy();
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
        
        const originalSpeed = player.stats.speed;
        player.damageReduction = effects.damageReduction!;
        player.stats.speed = originalSpeed * effects.speedMultiplier!;
        
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
            onEnd: (player: Player) => {
                player.damageReduction = 0;
                player.stats.speed = originalSpeed;
                player.body.clearTint();
                player.barrel.clearTint();
                fortressShield.destroy();
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
    
    // Dealer Skill 1: Rapid Fire - 200% damage and fire rate for 3 seconds
    private dealerRapidFire(player: Player): ActiveSkill {
        const effects: SkillEffect = {
            duration: 3000,
            damageMultiplier: 2.0
        };
        
        // Store original stats
        const originalAtk = player.stats.atk;
        const originalFireRate = player.stats.fireRate;
        
        // Apply buffs
        player.stats.atk = originalAtk * effects.damageMultiplier!;
        player.stats.fireRate = originalFireRate * 0.5; // Faster fire rate
        player.isRapidFire = true;
        
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
            onEnd: (player: Player) => {
                player.stats.atk = originalAtk;
                player.stats.fireRate = originalFireRate;
                player.isRapidFire = false;
                player.barrel.clearTint();
                player.barrel.setScale(1);
                muzzleFlash.destroy();
            }
        };
    }
    
    // Dealer Skill 2: Precision Shot
    private dealerPrecisionShot(player: Player, targetPosition?: { x: number, y: number }): ActiveSkill {
        const effects: SkillEffect = {
            duration: 500,
            damage: 300
        };
        
        const target = targetPosition || this.getBarrelTip(player);
        const angle = player.barrel.rotation;
        
        // Create precision bullet
        const precisionBullet = this.scene.add.sprite(
            player.barrel.x,
            player.barrel.y,
            AssetsEnum.BULLET_RED_3
        );
        precisionBullet.setScale(1.5);
        precisionBullet.setTint(0xffff00);
        precisionBullet.setDepth(10);
        precisionBullet.setRotation(angle);
        
        // Move bullet rapidly in direction of barrel
        const distance = 800;
        const endX = player.barrel.x + Math.cos(angle) * distance;
        const endY = player.barrel.y + Math.sin(angle) * distance;
        
        this.scene.tweens.add({
            targets: precisionBullet,
            x: endX,
            y: endY,
            duration: 300,
            onComplete: () => {
                precisionBullet.destroy();
            }
        });
        
        // Muzzle flash
        const muzzleFlash = this.scene.add.circle(
            player.barrel.x + Math.cos(angle) * 30,
            player.barrel.y + Math.sin(angle) * 30,
            20,
            0xffff00,
            0.9
        );
        
        this.scene.tweens.add({
            targets: muzzleFlash,
            alpha: 0,
            scale: 3,
            duration: 200,
            onComplete: () => muzzleFlash.destroy()
        });
        
        this.scene.sound.play(AssetsAudioEnum.SHOOT, { volume: 0.8 });
        
        return {
            type: TankClassType.DEALER,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [precisionBullet, muzzleFlash]
        };
    }
    
    // Dealer Ultimate: Bullet Storm
    private dealerBulletStorm(player: Player): ActiveSkill {
        const effects: SkillEffect = {
            duration: 2000,
            damage: 50
        };
        
        const bulletCount = 12;
        const bullets: Phaser.GameObjects.Sprite[] = [];
        
        // Create bullets in all directions
        for (let i = 0; i < bulletCount; i++) {
            const angle = (i / bulletCount) * Math.PI * 2;
            
            this.scene.time.delayedCall(i * 50, () => {
                const bullet = this.scene.add.sprite(
                    player.body.x,
                    player.body.y,
                    AssetsEnum.BULLET_RED_2
                );
                bullet.setRotation(angle);
                bullet.setTint(0xff8800);
                
                // Move bullet outward
                this.scene.tweens.add({
                    targets: bullet,
                    x: player.body.x + Math.cos(angle) * 600,
                    y: player.body.y + Math.sin(angle) * 600,
                    duration: 1000,
                    onComplete: () => bullet.destroy()
                });
                
                bullets.push(bullet);
            });
        }
        
        // Screen shake for impact
        this.scene.cameras.main.shake(500, 0.01);
        
        this.scene.sound.play(AssetsAudioEnum.EXPLOSION, { volume: 0.6 });
        
        return {
            type: TankClassType.DEALER,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: bullets
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
    
    // Versatile Skill 1: Stealth Mode - Become invisible and gain speed
    private versatileStealthMode(player: Player): ActiveSkill {
        const effects: SkillEffect = {
            duration: 8000,
            speedMultiplier: 1.5
        };
        
        // Apply stealth
        player.isInvisible = true;
        const originalSpeed = player.stats.speed;
        player.stats.speed = originalSpeed * effects.speedMultiplier!;
        
        // Visual effect - partial transparency
        player.body.setAlpha(0.3);
        player.barrel.setAlpha(0.3);
        
        // Stealth particles
        const stealthEffect = this.scene.add.particles(0, 0, AssetsEnum.BULLET_BLUE_1, {
            scale: { start: 0.1, end: 0 },
            alpha: { start: 0.5, end: 0 },
            lifespan: 1000,
            frequency: 100,
            quantity: 3
        });
        
        stealthEffect.startFollow(player.body);
        
        this.scene.sound.play(AssetsAudioEnum.DISAPPEAR, { volume: 0.3 });
        
        return {
            type: TankClassType.VERSATILE,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [stealthEffect],
            onEnd: (player: Player) => {
                player.isInvisible = false;
                player.stats.speed = originalSpeed;
                player.body.setAlpha(1);
                player.barrel.setAlpha(1);
                stealthEffect.destroy();
            }
        };
    }
    
    // Versatile Skill 2: Scout Vision
    private versatileScoutVision(player: Player): ActiveSkill {
        const effects: SkillEffect = {
            duration: 5000,
            range: 400
        };
        
        // Create radar effect
        const scoutRadar = this.scene.add.circle(
            player.body.x,
            player.body.y,
            effects.range!,
            0x00ff00,
            0.1
        );
        scoutRadar.setStrokeStyle(3, 0x00ff00);
        scoutRadar.setDepth(1);
        
        this.scene.tweens.add({
            targets: scoutRadar,
            alpha: 0.3,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            onUpdate: () => {
                if (player.body.active) {
                    scoutRadar.setPosition(player.body.x, player.body.y);
                }
            }
        });
        
        this.scene.sound.play(AssetsAudioEnum.SPEED_UP, { volume: 0.4 });
        
        return {
            type: TankClassType.VERSATILE,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [scoutRadar],
            onEnd: () => {
                scoutRadar.destroy();
            }
        };
    }
    
    // Versatile Ultimate: Tactical Strike
    private versatileTacticalStrike(player: Player): ActiveSkill {
        const effects: SkillEffect = {
            duration: 6000,
            damageMultiplier: 1.5
        };
        
        const originalAtk = player.stats.atk;
        player.stats.atk = originalAtk * effects.damageMultiplier!;
        
        // Visual effect - targeting system
        player.barrel.setTint(0xff0000);
        
        const targetingSystem = this.scene.add.circle(
            player.body.x,
            player.body.y,
            30,
            0xff0000,
            0.3
        );
        targetingSystem.setStrokeStyle(4, 0xff0000);
        targetingSystem.setDepth(player.body.depth + 1);
        
        this.scene.tweens.add({
            targets: targetingSystem,
            rotation: Math.PI * 4,
            duration: effects.duration,
            onUpdate: () => {
                if (player.body.active) {
                    targetingSystem.setPosition(player.body.x, player.body.y);
                }
            }
        });
        
        this.scene.sound.play(AssetsAudioEnum.ATK_BUFF, { volume: 0.5 });
        
        return {
            type: TankClassType.VERSATILE,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [targetingSystem],
            onEnd: (player: Player) => {
                player.stats.atk = originalAtk;
                player.barrel.clearTint();
                targetingSystem.destroy();
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
            duration: 500,
            damage: 200,
            range: 80
        };
        
        const target = targetPosition || this.getBarrelTip(player);
        const angle = Phaser.Math.Angle.Between(player.body.x, player.body.y, target.x, target.y);
        
        // Create fireball projectile
        const fireball = this.scene.add.sprite(
            player.barrel.x,
            player.barrel.y,
            AssetsEnum.BULLET_RED_3
        );
        fireball.setScale(2);
        fireball.setTint(0xff6600);
        fireball.setDepth(10);
        
        // Animate fireball to target
        this.scene.tweens.add({
            targets: fireball,
            x: target.x,
            y: target.y,
            duration: 800,
            onComplete: () => {
                // Create explosion at target
                this.createExplosion(target.x, target.y, effects.range!, effects.damage!);
                fireball.destroy();
            }
        });
        
        // Add fire trail
        const fireTrail = this.scene.add.particles(0, 0, AssetsEnum.BULLET_RED_1, {
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: 0xff6600,
            lifespan: 300,
            frequency: 50,
            quantity: 2
        });
        
        fireTrail.startFollow(fireball);
        
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
                return this.spyShadowClone(player);
            case 'skill2':
                return this.spySmokeScreen(player);
            case 'ultimate':
                return this.spyAssassination(player, targetPosition);
        }
    }
    
    // Spy Skill 1: Shadow Clone - Create decoy clones
    private spyShadowClone(player: Player): ActiveSkill {
        const effects: SkillEffect = {
            duration: 6000
        };
        
        const clones: Phaser.GameObjects.Sprite[] = [];
        const clonePositions = [
            { x: player.body.x - 60, y: player.body.y - 30 },
            { x: player.body.x + 60, y: player.body.y - 30 },
            { x: player.body.x - 30, y: player.body.y + 60 }
        ];
        
        clonePositions.forEach((pos, index) => {
            // Create clone body
            const cloneBody = this.scene.add.sprite(pos.x, pos.y, player.body.texture);
            cloneBody.setScale(0.8);
            cloneBody.setAlpha(0.6);
            cloneBody.setTint(0x4444ff);
            
            // Create clone barrel
            const cloneBarrel = this.scene.add.sprite(pos.x, pos.y, player.barrel.texture);
            cloneBarrel.setScale(0.8);
            cloneBarrel.setAlpha(0.6);
            cloneBarrel.setTint(0x4444ff);
            
            clones.push(cloneBody, cloneBarrel);
            
            // Animate clone movement
            this.scene.tweens.add({
                targets: [cloneBody, cloneBarrel],
                x: pos.x + (Math.random() - 0.5) * 200,
                y: pos.y + (Math.random() - 0.5) * 200,
                duration: 2000 + index * 500,
                yoyo: true,
                repeat: -1
            });
            
            // Random rotation for barrel
            this.scene.tweens.add({
                targets: cloneBarrel,
                rotation: Math.PI * 2,
                duration: 3000,
                repeat: -1
            });
        });
        
        this.scene.sound.play(AssetsAudioEnum.DISAPPEAR, { volume: 0.4 });
        
        return {
            type: TankClassType.SPY,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: clones,
            onEnd: () => {
                clones.forEach(clone => clone.destroy());
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
            damage: 150,
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
    
    // Radar Scout skills
    private activateRadarScoutSkill(player: Player, skillSlot: 'skill1' | 'skill2' | 'ultimate' = 'skill1', targetPosition?: { x: number, y: number }): ActiveSkill | null {
        switch (skillSlot) {
            case 'skill1':
                return this.radarScoutRadarSweep(player);
            case 'skill2':
                return this.radarScoutEMPBlast(player);
            case 'ultimate':
                return this.radarScoutOrbitalStrike(player, targetPosition);
        }
    }
    
    // Radar Scout Skill 1: Radar Sweep - Reveal all enemies and items
    private radarScoutRadarSweep(player: Player): ActiveSkill {
        const effects: SkillEffect = {
            duration: 10000,
            range: 800
        };
        
        // Create radar sweep animation
        const radarSweep = this.scene.add.graphics();
        radarSweep.lineStyle(3, 0x00ff00, 0.8);
        radarSweep.fillStyle(0x00ff00, 0.1);
        
        let sweepAngle = 0;
        const sweepInterval = this.scene.time.addEvent({
            delay: 50,
            repeat: -1,
            callback: () => {
                radarSweep.clear();
                radarSweep.lineStyle(3, 0x00ff00, 0.8);
                radarSweep.fillStyle(0x00ff00, 0.1);
                
                // Draw radar circle
                radarSweep.strokeCircle(player.body.x, player.body.y, effects.range!);
                
                // Draw sweep line
                const endX = player.body.x + Math.cos(sweepAngle) * effects.range!;
                const endY = player.body.y + Math.sin(sweepAngle) * effects.range!;
                radarSweep.lineBetween(player.body.x, player.body.y, endX, endY);
                
                sweepAngle += 0.1;
            }
        });
        
        // In multiplayer, this would reveal hidden enemies
        if (gameStateManager.isGameActive()) {
            const remotePlayers = gameStateManager.getRemotePlayers();
            remotePlayers.forEach(remotePlayer => {
                // Create radar blip for each player
                const blip = this.scene.add.circle(
                    remotePlayer.position.x,
                    remotePlayer.position.y,
                    5,
                    0xff0000,
                    0.8
                );
                
                this.scene.tweens.add({
                    targets: blip,
                    alpha: 0,
                    duration: 1000,
                    repeat: 9,
                    yoyo: true,
                    onComplete: () => blip.destroy()
                });
            });
        }
        
        this.scene.sound.play(AssetsAudioEnum.SPEED_UP, { volume: 0.6 });
        
        return {
            type: TankClassType.RADAR_SCOUT,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [radarSweep],
            onEnd: () => {
                sweepInterval.destroy();
                radarSweep.destroy();
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
            duration: 3000,
            damage: 120,
            range: 100
        };
        
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
            visualEffects: [frostNova, iceParticles]
        };
    }
    
    // Add missing skill implementations with basic effects
    private mageLightningBolt(player: Player, targetPosition?: { x: number, y: number }): ActiveSkill {
        const effects: SkillEffect = { duration: 800, damage: 180 };
        
        const lightning = this.scene.add.rectangle(
            player.barrel.x, player.barrel.y,
            400, 5, 0xffff00, 0.9
        );
        lightning.setRotation(player.barrel.rotation);
        lightning.setOrigin(0, 0.5);
        
        this.scene.tweens.add({
            targets: lightning,
            alpha: 0,
            duration: 200,
            repeat: 3,
            onComplete: () => lightning.destroy()
        });
        
        this.scene.sound.play(AssetsAudioEnum.SPEED_UP, { volume: 0.7 });
        
        return {
            type: TankClassType.MAGE,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [lightning]
        };
    }
    
    private mageMeteor(player: Player, targetPosition?: { x: number, y: number }): ActiveSkill {
        const effects: SkillEffect = { duration: 4000, damage: 400, range: 150 };
        const target = targetPosition || { x: player.body.x, y: player.body.y - 200 };
        
        const meteor = this.scene.add.circle(target.x, target.y - 300, 25, 0xff4400, 0.9);
        
        this.scene.tweens.add({
            targets: meteor,
            y: target.y,
            duration: 2000,
            onComplete: () => {
                this.createExplosion(target.x, target.y, effects.range!, effects.damage!);
                meteor.destroy();
            }
        });
        
        this.scene.sound.play(AssetsAudioEnum.EXPLOSION, { volume: 0.8 });
        
        return {
            type: TankClassType.MAGE,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [meteor]
        };
    }
    
    private spySmokeScreen(player: Player): ActiveSkill {
        const effects: SkillEffect = { duration: 5000 };
        
        const smoke = this.scene.add.circle(player.body.x, player.body.y, 80, 0x666666, 0.6);
        smoke.setDepth(player.body.depth + 1);
        
        this.scene.tweens.add({
            targets: smoke,
            scale: 1.5,
            alpha: 0.3,
            duration: effects.duration,
            onUpdate: () => {
                if (player.body.active) {
                    smoke.setPosition(player.body.x, player.body.y);
                }
            },
            onComplete: () => smoke.destroy()
        });
        
        this.scene.sound.play(AssetsAudioEnum.STEALTH_ACTIVATE, { volume: 0.4 });
        
        return {
            type: TankClassType.SPY,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [smoke]
        };
    }
    
    private spyAssassination(player: Player, targetPosition?: { x: number, y: number }): ActiveSkill {
        const effects: SkillEffect = { duration: 1000, damage: 350 };
        
        player.body.setAlpha(0.3);
        player.barrel.setAlpha(0.3);
        
        this.scene.time.delayedCall(500, () => {
            player.body.setAlpha(1);
            player.barrel.setAlpha(1);
        });
        
        this.scene.sound.play(AssetsAudioEnum.DISAPPEAR, { volume: 0.6 });
        
        return {
            type: TankClassType.SPY,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: []
        };
    }
    
    private demolitionMineField(player: Player): ActiveSkill {
        const effects: SkillEffect = { duration: 2000 };
        const mines: Phaser.GameObjects.Sprite[] = [];
        
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const distance = 100;
            const mineX = player.body.x + Math.cos(angle) * distance;
            const mineY = player.body.y + Math.sin(angle) * distance;
            
            const mine = this.scene.add.sprite(mineX, mineY, AssetsEnum.BULLET_RED_1);
            mine.setTint(0x444444);
            mine.setScale(0.5);
            mines.push(mine);
        }
        
        this.scene.sound.play(AssetsAudioEnum.ARTILLERY_WHISTLE, { volume: 0.5 });
        
        return {
            type: TankClassType.DEMOLITION,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: mines,
            onEnd: () => {
                mines.forEach(mine => mine.destroy());
            }
        };
    }
    
    private demolitionNuclearStrike(player: Player, targetPosition?: { x: number, y: number }): ActiveSkill {
        const effects: SkillEffect = { duration: 5000, damage: 600, range: 250 };
        const target = targetPosition || { x: player.body.x, y: player.body.y - 300 };
        
        this.scene.time.delayedCall(3000, () => {
            this.createExplosion(target.x, target.y, effects.range!, effects.damage!);
            this.scene.cameras.main.flash(1000, 255, 255, 255, true);
        });
        
        this.scene.sound.play(AssetsAudioEnum.EXPLOSION, { volume: 1.0 });
        
        return {
            type: TankClassType.DEMOLITION,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: []
        };
    }
    
    private radarScoutEMPBlast(player: Player): ActiveSkill {
        const effects: SkillEffect = { duration: 3000, range: 150 };
        
        const emp = this.scene.add.circle(player.body.x, player.body.y, 10, 0x00aaff, 0.7);
        
        this.scene.tweens.add({
            targets: emp,
            scale: effects.range! / 10,
            alpha: 0,
            duration: 1000,
            onComplete: () => emp.destroy()
        });
        
        this.scene.sound.play(AssetsAudioEnum.SPEED_UP, { volume: 0.5 });
        
        return {
            type: TankClassType.RADAR_SCOUT,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [emp]
        };
    }
    
    private radarScoutOrbitalStrike(player: Player, targetPosition?: { x: number, y: number }): ActiveSkill {
        const effects: SkillEffect = { duration: 3000, damage: 250 };
        const target = targetPosition || { x: player.body.x, y: player.body.y - 200 };
        
        this.scene.time.delayedCall(2000, () => {
            this.createExplosion(target.x, target.y, 80, effects.damage!);
        });
        
        this.scene.sound.play(AssetsAudioEnum.ARTILLERY_WHISTLE, { volume: 0.7 });
        
        return {
            type: TankClassType.RADAR_SCOUT,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: []
        };
    }
    
    private iceTankIceWall(player: Player, targetPosition?: { x: number, y: number }): ActiveSkill {
        const effects: SkillEffect = { duration: 8000 };
        
        const wall = this.scene.add.rectangle(
            player.body.x + Math.cos(player.barrel.rotation) * 100,
            player.body.y + Math.sin(player.barrel.rotation) * 100,
            80, 20, 0x88ddff, 0.8
        );
        wall.setRotation(player.barrel.rotation + Math.PI / 2);
        
        this.scene.sound.play(AssetsAudioEnum.ICE_FREEZE, { volume: 0.5 });
        
        return {
            type: TankClassType.ICE_TANK,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [wall],
            onEnd: () => {
                wall.destroy();
            }
        };
    }
    
    private iceTankAbsoluteZero(player: Player): ActiveSkill {
        const effects: SkillEffect = { duration: 6000, damage: 300, range: 300 };
        
        const freeze = this.scene.add.circle(player.body.x, player.body.y, 20, 0x88ddff, 0.8);
        
        this.scene.tweens.add({
            targets: freeze,
            scale: effects.range! / 20,
            alpha: 0.3,
            duration: 2000,
            onComplete: () => freeze.destroy()
        });
        
        this.scene.cameras.main.flash(2000, 200, 230, 255, true);
        this.scene.sound.play(AssetsAudioEnum.ICE_FREEZE, { volume: 0.8 });
        
        return {
            type: TankClassType.ICE_TANK,
            startTime: Date.now(),
            duration: effects.duration,
            effects: effects,
            visualEffects: [freeze]
        };
    }
    
    // Update active skills
    update(deltaTime: number) {
        const currentTime = Date.now();
        const expiredSkills: string[] = [];
        
        this.activeSkills.forEach((skill, playerId) => {
            // Check if skill has expired
            if (currentTime >= skill.startTime + skill.duration) {
                // End skill
                if (skill.onEnd) {
                    // Find player by ID (simplified - in real implementation you'd have a proper player manager)
                    const player = this.findPlayerById(playerId);
                    if (player) {
                        skill.onEnd(player);
                    }
                }
                
                // Clean up visual effects
                skill.visualEffects?.forEach(effect => {
                    if (effect.active) {
                        effect.destroy();
                    }
                });
                
                expiredSkills.push(playerId);
            } else {
                // Update skill if needed
                if (skill.onUpdate) {
                    const player = this.findPlayerById(playerId);
                    if (player) {
                        skill.onUpdate(player, deltaTime);
                    }
                }
            }
        });
        
        // Remove expired skills
        expiredSkills.forEach(playerId => {
            this.activeSkills.delete(playerId);
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
            [TankClassType.MAGE]: { skill1: 12000, skill2: 14000, ultimate: 50000 },
            [TankClassType.SPY]: { skill1: 4000, skill2: 6000, ultimate: 25000 },
            [TankClassType.DEMOLITION]: { skill1: 15000, skill2: 18000, ultimate: 60000 },
            [TankClassType.RADAR_SCOUT]: { skill1: 5000, skill2: 7000, ultimate: 30000 },
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
        
        // In a full implementation, you'd check for players in range and apply damage
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
    
    // Check if player has an active skill
    hasActiveSkill(playerId: string): boolean {
        return this.activeSkills.has(playerId);
    }
    
    // Force end a skill
    endSkill(playerId: string): boolean {
        const skill = this.activeSkills.get(playerId);
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
            
            this.activeSkills.delete(playerId);
            return true;
        }
        return false;
    }
}