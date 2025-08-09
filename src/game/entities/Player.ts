import { Physics, GameObjects } from 'phaser';
import { AssetsAudioEnum, AssetsEnum } from '../../app/constants/assets-enum';
import { Bullet } from './Bullet';
import { TankStats, calculateDamage } from './TankStats';
import { TankClassType, getTankClassDefinition, getSkillCooldown } from './TankClass';
import { gameStateManager } from '../managers/GameStateManager';
import { SkillSystem } from '../systems/SkillSystem';

export const deltaDefault = 100;

export class Player {
    body: Phaser.Physics.Arcade.Sprite;
    barrel: GameObjects.Sprite;
    scene: Phaser.Scene;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    isRapidFire: boolean = false;
    playerLobbyId: string;
    
    // Tank stats
    stats: TankStats;

    // Tank class
    tankClass: TankClassType;

    // Additional properties
    lastFired: number = 0;
    lastSkillUsed: number = 0;
    skillCooldown: number;
    isSkillActive: boolean = false;
    skillActiveTime: number = 0;
    skillDuration: number = 0;
    bullets: Bullet[] = [];
    isAlive: boolean = true;
    score: number = 0;
    isInvisible: boolean = false;
    damageReduction: number = 0; // Percentage of damage reduction (0-1)
    
    // Multiplayer properties
    private isRemotePlayer: boolean = false;
    private playerName: string = '';
    public isShooting: boolean = false;
    
    // Skill system
    private skillSystem: SkillSystem | null = null;

    // Stats UI elements
    statsText: Phaser.GameObjects.Text[] = [];
    skillCooldownText: Phaser.GameObjects.Text;
    skillStatusEffect: Phaser.GameObjects.Sprite | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number, tankClass: TankClassType = TankClassType.VERSATILE, playerLobbyId?: string) {
        this.scene = scene;
        this.tankClass = tankClass;
        // TODO: make sure if create current player, playerLobbyId is auto generated
        this.playerLobbyId = playerLobbyId || '';

        // Get class definition
        const classDefinition = getTankClassDefinition(tankClass);

        // Initialize stats from class definition
        this.stats = { ...classDefinition.stats };

        // Set skill cooldown
        this.skillCooldown = getSkillCooldown(tankClass);

        // Create tank body (use class-specific assets)
        const bodyAsset = classDefinition.tankBodyAsset
        const barrelAsset = classDefinition.tankBarrelAsset

        const playerSprite = scene.physics.add.sprite(x, y, bodyAsset);

        this.body = playerSprite;
        this.body.setCollideWorldBounds(true);
        this.body.setDepth(1);

        // Create tank turret/barrel
        this.barrel = scene.add.sprite(x, y, barrelAsset);
        this.barrel.setOrigin(0, 0.5); // Set origin point to bottom center of barrel
        this.barrel.setDepth(2);

        // Set up input
        this.setupInput(scene);

        // Create stats display
        this.createStatsDisplay();
    }

    setupInput(scene: Phaser.Scene) {
        if (scene.input.keyboard) {
            this.cursors = scene.input.keyboard.createCursorKeys();
            
            // Initialize skill system
            this.skillSystem = new SkillSystem(scene);

            // Add space key for firing
            scene.input.keyboard.on('keydown-SPACE', () => {
                this.fire();
            });

            // Add Q key for special ability
            scene.input.keyboard.on('keydown-Q', () => {
                this.useSkill();
            });

            // WASD movement
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

    createStatsDisplay() {
        // Create background for stats
        const statsBackground = this.scene.add.rectangle(
            120,
            this.scene.cameras.main.height - 100,
            200,
            140,
            undefined,
            0.7
        );
        statsBackground.setScrollFactor(0);
        statsBackground.setDepth(100);

        // Create text for each stat
        const createStatText = (stat: string, value: number, yPos: number) => {
            const text = this.scene.add.text(
                30,
                this.scene.cameras.main.height - yPos,
                `${stat}: ${value}`,
                {
                    fontSize: '16px',
                    color: '#ffffff'
                }
            );
            text.setScrollFactor(0);
            text.setDepth(101);
            return text;
        };

        // Add each stat text to the array
        this.statsText.push(createStatText('HP', this.stats.hp, 130));
        this.statsText.push(createStatText('DEF', this.stats.def, 110));
        this.statsText.push(createStatText('ATK', this.stats.atk, 90));
        this.statsText.push(createStatText('SPELL', this.stats.spellPower, 70));
        this.statsText.push(createStatText('SPEED', this.stats.speed, 50));

        // Add skill cooldown text
        this.skillCooldownText = this.scene.add.text(
            30,
            this.scene.cameras.main.height - 30,
            `SKILL: Ready`,
            {
                fontSize: '16px',
                color: '#00ff00'
            }
        );
        this.skillCooldownText.setScrollFactor(0);
        this.skillCooldownText.setDepth(101);

        // // Show class name and skill name
        // const classDefinition = getTankClassDefinition(this.tankClass);
        // const classInfoText = this.scene.add.text(
        //     30,
        //     20,
        //     `Class: ${classDefinition.name}\nSkill: ${classDefinition.skillName}`,
        //     {
        //         fontSize: '16px',
        //         color: '#ffffff',
        //         stroke: '#000000',
        //         strokeThickness: 3
        //     }
        // );
        // classInfoText.setScrollFactor(0);
        // classInfoText.setDepth(101);
    }

    updateStatsDisplay() {
        // Update each stat text
        this.statsText[0].setText(`HP: ${this.stats.hp}`);
        this.statsText[1].setText(`DEF: ${this.stats.def}`);
        this.statsText[2].setText(`ATK: ${this.stats.atk}`);
        this.statsText[3].setText(`SPELL: ${this.stats.spellPower}`);
        this.statsText[4].setText(`SPEED: ${this.stats.speed}`);

        // Update skill status
        if (this.isSkillActive) {
            const remainingTime = Math.ceil((this.skillDuration - (Date.now() - this.skillActiveTime)) / 1000);
            this.skillCooldownText.setText(`SKILL: Active (${remainingTime}s)`);
            this.skillCooldownText.setColor('#ffff00');
        } else if (Date.now() < this.lastSkillUsed + this.skillCooldown) {
            const remainingTime = Math.ceil((this.skillCooldown - (Date.now() - this.lastSkillUsed)) / 1000);
            this.skillCooldownText.setText(`SKILL: Cooldown (${remainingTime}s)`);
            this.skillCooldownText.setColor('#ff0000');
        } else {
            this.skillCooldownText.setText(`SKILL: Ready (Press Q)`);
            this.skillCooldownText.setColor('#00ff00');
        }
    }

    // Move forward in the direction the tank is facing
    moveForward() {
        this.scene.physics.velocityFromRotation(
            this.body.rotation,
            this.stats.speed,
            (this.body.body as Physics.Arcade.Body).velocity
        );
    }

    moveBackward() {
        this.scene.physics.velocityFromRotation(
            this.body.rotation,
            -this.stats.speed * 0.5, // Move slower in reverse
            (this.body.body as Physics.Arcade.Body).velocity);
    }

    rotateLeft(delta: number) {
        this.body.rotation -= this.stats.rotationSpeed * delta;
    }

    rotateRight(delta: number) {
        this.body.rotation += this.stats.rotationSpeed * delta;
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
            if (time > this.lastFired + this.stats.fireRate) {
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

        // Check if skill effect has expired
        if (this.isSkillActive && Date.now() > this.skillActiveTime + this.skillDuration) {
            this.deactivateSkill();
        }

        // Update stats display
        this.updateStatsDisplay();
        
        // Update skill system
        if (this.skillSystem) {
            this.skillSystem.update(delta);
        }

        // Apply visual effect for stealth if active
        if (this.isInvisible) {
            this.body.setAlpha(0.5);
            this.barrel.setAlpha(0.5);
        } else {
            this.body.setAlpha(1);
            this.barrel.setAlpha(1);
        }
    }

    fire() {
        if (!this.isAlive) return;

        // Get bullet asset based on tank class
        const classDefinition = getTankClassDefinition(this.tankClass);
        const bulletAsset = this.isRapidFire ? classDefinition.bulletAsset.replace('1', '2') : classDefinition.bulletAsset;

        // Create a new bullet from the barrel position
        const bullet = new Bullet(
            this.scene,
            this.barrel.x,
            this.barrel.y,
            this.barrel.rotation * 180 / Math.PI,
            this.stats.atk,  // Use attack stat for bullet damage
            bulletAsset
        );

        this.bullets.push(bullet);
        this.isShooting = true;

        // If this is a multiplayer game and not a remote player, notify the server
        if (gameStateManager.isGameActive() && !this.isRemotePlayer) {
            const bulletId = gameStateManager.fireBullet(
                { x: this.barrel.x, y: this.barrel.y },
                this.barrel.rotation,
                300 // bullet speed
            );
            
            if (bulletId) {
                bullet.setMultiplayerInfo(bulletId, gameStateManager.getLocalPlayerId() || '');
            }
        }

        // Play sound effect
        this.scene.sound.play(AssetsAudioEnum.SHOOT);
        
        // Reset shooting flag after a brief moment
        this.scene.time.delayedCall(100, () => {
            this.isShooting = false;
        });
    }

    takeDamage(amount: number) {
        // Apply damage reduction if Shield Wall is active
        if (this.damageReduction > 0) {
            amount = amount * (1 - this.damageReduction);
        }

        // Calculate actual damage taken based on defense
        const actualDamage = calculateDamage(amount, this.stats.def);

        // Reduce HP
        this.stats.hp -= actualDamage;

        // Check if player is dead
        if (this.stats.hp <= 0) {
            this.stats.hp = 0;
            this.die();
        }
    }

    heal(amount: number) {
        // Get class definition to know max HP
        const classDefinition = getTankClassDefinition(this.tankClass);
        const maxHp = classDefinition.stats.hp;

        // Add health but don't exceed max
        this.stats.hp = Math.min(maxHp, this.stats.hp + amount);

        // Visual feedback for healing
        this.body.setTint(0x00ff00);
        this.scene.time.delayedCall(100, () => {
            this.body.clearTint();
        });
    }

    useSkill(targetPosition?: { x: number, y: number }) {
        if (!this.skillSystem) {
            return false;
        }
        
        return this.skillSystem.useSkill(this, this.tankClass, targetPosition);
    }

    deactivateSkill() {
        this.isSkillActive = false;

        // Remove skill effects
        this.damageReduction = 0;
        this.isInvisible = false;

        // Remove visual effects
        this.body.setAlpha(1);
        this.barrel.setAlpha(1);
        this.barrel.clearTint();

        if (this.skillStatusEffect) {
            this.skillStatusEffect.destroy();
            this.skillStatusEffect = null;
        }
    }

    die() {
        this.isAlive = false;

        // Deactivate any active skills
        if (this.isSkillActive) {
            this.deactivateSkill();
        }

        // Play death animation or particle effect
        this.scene.cameras.main.shake(500, 0.01);

        // Create explosion at player position
        const explosion = this.scene.add.sprite(this.body.x, this.body.y, AssetsEnum.EXPLOSION_1);
        explosion.setScale(2);

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
                }
            },
            repeat: explosionFrames.length - 1
        });

        // Trigger game over
        this.scene.time.delayedCall(2000, () => {
            this.scene.scene.start('GameOver', { victory: false, score: this.score });
        });
    }

    addScore(points: number) {
        this.score += points;
    }
    
    // Multiplayer methods
    setAsRemotePlayer(isRemote: boolean) {
        this.isRemotePlayer = isRemote;
    }
    
    setName(name: string) {
        this.playerName = name;
        // Add name text above player
        this.createNameText();
    }
    
    private createNameText() {
        if (this.playerName && this.isRemotePlayer) {
            const nameText = this.scene.add.text(
                this.body.x, 
                this.body.y - 40, 
                this.playerName, 
                { 
                    fontSize: '12px', 
                    color: '#ffffff',
                    backgroundColor: '#000000',
                    padding: { x: 4, y: 2 }
                }
            );
            nameText.setOrigin(0.5);
            nameText.setDepth(100);
        }
    }
    
    updateHealthBar(currentHp: number, maxHp: number) {
        // Update health bar for remote players
        if (this.isRemotePlayer) {
            // Simple health bar implementation
            // You could make this more sophisticated with actual graphics
            this.stats.hp = currentHp;
            this.stats.maxHp = maxHp;
        }
    }
    
    destroy() {
        // Clean up player sprite and associated objects
        this.body.destroy();
        this.barrel.destroy();
        
        // Clean up bullets
        this.bullets.forEach(bullet => bullet.destroy());
        this.bullets = [];
        
        // Clean up UI elements
        this.statsText.forEach(text => text.destroy());
        if (this.skillCooldownText) {
            this.skillCooldownText.destroy();
        }
        if (this.skillStatusEffect) {
            this.skillStatusEffect.destroy();
        }
    }
} 