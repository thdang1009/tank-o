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
    useSkill(player: Player, skillType: TankClassType, targetPosition?: { x: number, y: number }): boolean {
        const playerId = player.playerLobbyId;
        
        // Check if skill is on cooldown
        if (this.isOnCooldown(player, skillType)) {
            return false;
        }
        
        // Check if player already has an active skill
        if (this.activeSkills.has(playerId)) {
            return false;
        }
        
        // Activate the skill
        const skill = this.activateSkill(player, skillType, targetPosition);
        if (skill) {
            this.activeSkills.set(playerId, skill);
            
            // Update last skill used time
            player.lastSkillUsed = Date.now();
            
            // Notify server in multiplayer
            if (gameStateManager.isGameActive()) {
                gameStateManager.useSkill(skillType, targetPosition);
            }
            
            return true;
        }
        
        return false;
    }
    
    // Activate specific skill based on tank class
    private activateSkill(player: Player, skillType: TankClassType, targetPosition?: { x: number, y: number }): ActiveSkill | null {
        switch (skillType) {
            case TankClassType.BRUISER:
                return this.activateBruiserSkill(player);
            case TankClassType.DEALER:
                return this.activateDealerSkill(player);
            case TankClassType.SUPPORTER:
                return this.activateSupporterSkill(player);
            case TankClassType.VERSATILE:
                return this.activateVersatileSkill(player);
            case TankClassType.MAGE:
                return this.activateMageSkill(player, targetPosition);
            case TankClassType.SPY:
                return this.activateSpySkill(player);
            case TankClassType.DEMOLITION:
                return this.activateDemolitionSkill(player, targetPosition);
            case TankClassType.RADAR_SCOUT:
                return this.activateRadarScoutSkill(player);
            default:
                return null;
        }
    }
    
    // Bruiser: Shield Wall - 75% damage reduction for 5 seconds
    private activateBruiserSkill(player: Player): ActiveSkill {
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
    
    // Dealer: Rapid Fire - 200% damage and fire rate for 3 seconds
    private activateDealerSkill(player: Player): ActiveSkill {
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
    
    // Supporter: Repair Pulse - Heal self and nearby allies
    private activateSupporterSkill(player: Player): ActiveSkill {
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
    
    // Versatile: Stealth Mode - Become invisible and gain speed
    private activateVersatileSkill(player: Player): ActiveSkill {
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
    
    // Mage: Fireball - Launch devastating area damage projectile
    private activateMageSkill(player: Player, targetPosition?: { x: number, y: number }): ActiveSkill {
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
    
    // Spy: Shadow Clone - Create decoy clones
    private activateSpySkill(player: Player): ActiveSkill {
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
    
    // Demolition: Carpet Bomb - Artillery strike over large area
    private activateDemolitionSkill(player: Player, targetPosition?: { x: number, y: number }): ActiveSkill {
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
    
    // Radar Scout: Radar Sweep - Reveal all enemies and items
    private activateRadarScoutSkill(player: Player): ActiveSkill {
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
        const cooldown = this.getSkillCooldown(skillType);
        return Date.now() < player.lastSkillUsed + cooldown;
    }
    
    private getSkillCooldown(skillType: TankClassType): number {
        const cooldowns = {
            [TankClassType.BRUISER]: 15000,
            [TankClassType.DEALER]: 10000,
            [TankClassType.SUPPORTER]: 12000,
            [TankClassType.VERSATILE]: 8000,
            [TankClassType.MAGE]: 14000,
            [TankClassType.SPY]: 6000,
            [TankClassType.DEMOLITION]: 18000,
            [TankClassType.RADAR_SCOUT]: 7000
        };
        
        return cooldowns[skillType] || 10000;
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
    getSkillCooldownRemaining(player: Player, skillType: TankClassType): number {
        const cooldown = this.getSkillCooldown(skillType);
        const elapsed = Date.now() - player.lastSkillUsed;
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