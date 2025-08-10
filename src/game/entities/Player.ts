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
    lastSkill1Used: number = 0;
    lastSkill2Used: number = 0;
    lastUltimateUsed: number = 0;
    skill1Cooldown: number;
    skill2Cooldown: number;
    ultimateCooldown: number;
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

        // Set skill cooldowns
        this.skill1Cooldown = getSkillCooldown(tankClass, 'skill1');
        this.skill2Cooldown = getSkillCooldown(tankClass, 'skill2');
        this.ultimateCooldown = getSkillCooldown(tankClass, 'ultimate');

        // Create tank body (use class-specific assets)
        const bodyAsset = classDefinition.tankBodyAsset
        const barrelAsset = classDefinition.tankBarrelAsset

        const playerSprite = scene.physics.add.sprite(x, y, bodyAsset);

        this.body = playerSprite;
        this.body.setCollideWorldBounds(true);
        this.body.setDepth(1);
        
        // Apply special tinting for certain tank classes
        if (this.tankClass === TankClassType.ICE_TANK) {
            this.body.setTint(0xffffff); // White tint for ice theme
        } else if (this.tankClass === TankClassType.SPY) {
            this.body.setScale(0.9); // Make spy tank slightly smaller
        }
        
        // Ensure physics body is properly configured for world bounds collision
        if (this.body.body) {
            const physicsBody = this.body.body as Phaser.Physics.Arcade.Body;
            
            // Force enable world bounds collision with strong enforcement
            physicsBody.setCollideWorldBounds(true);
            physicsBody.setBounce(0.3, 0.3); // Stronger bounce to ensure collision is noticeable
            
            // Make sure the body size is correct for collision detection
            const bodyWidth = this.body.width * 0.7; // Slightly smaller for better collision
            const bodyHeight = this.body.height * 0.7;
            physicsBody.setSize(bodyWidth, bodyHeight);
            
            // Set up world bounds collision callback
            physicsBody.onWorldBounds = true;
            
            // Listen for world bounds events on this specific body
            scene.physics.world.on('worldbounds', (event: any, body: any) => {
                if (body === physicsBody) {
                    console.log('Player hit world bounds!', { 
                        playerPos: { x: body.x, y: body.y }, 
                        bounds: scene.physics.world.bounds,
                        velocity: { x: body.velocity.x, y: body.velocity.y }
                    });
                }
            });
            
            console.log('Player physics body configured:');
            console.log('- Bounds collision:', physicsBody.collideWorldBounds);
            console.log('- Body size:', { width: bodyWidth, height: bodyHeight });
            console.log('- World bounds:', scene.physics.world.bounds);
            console.log('- Player position:', { x: physicsBody.x, y: physicsBody.y });
        }

        // Create tank turret/barrel
        this.barrel = scene.add.sprite(x, y, barrelAsset);
        this.barrel.setOrigin(0, 0.5); // Set origin point to bottom center of barrel
        this.barrel.setDepth(2);
        
        // Apply special tinting to barrel to match body
        if (this.tankClass === TankClassType.ICE_TANK) {
            this.barrel.setTint(0xffffff); // White tint for ice theme
        } else if (this.tankClass === TankClassType.SPY) {
            this.barrel.setScale(0.9); // Make spy barrel slightly smaller
        }

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

            // Add skill keys
            scene.input.keyboard.on('keydown-Q', () => {
                this.useSkill('skill1');
            });
            
            scene.input.keyboard.on('keydown-E', () => {
                this.useSkill('skill2');
            });
            
            scene.input.keyboard.on('keydown-R', () => {
                this.useSkill('ultimate');
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

        // Add skill cooldown text with more information for all skills
        const classDefinition = getTankClassDefinition(this.tankClass);
        
        // Skill 1 (Q)
        this.skillCooldownText = this.scene.add.text(
            300,
            this.scene.cameras.main.height - 130,
            `[Q] ${classDefinition.skill1Name || classDefinition.skillName} - Ready`,
            {
                fontSize: '14px',
                color: '#00ff00',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            }
        );
        this.skillCooldownText.setScrollFactor(0);
        this.skillCooldownText.setDepth(101);
        
        // Skill 2 (E)
        const skill2Text = this.scene.add.text(
            300,
            this.scene.cameras.main.height - 110,
            `[E] ${classDefinition.skill2Name} - Ready`,
            {
                fontSize: '14px',
                color: '#00ff00',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            }
        );
        skill2Text.setScrollFactor(0);
        skill2Text.setDepth(101);
        this.statsText.push(skill2Text);
        
        // Ultimate (R)
        const ultimateText = this.scene.add.text(
            300,
            this.scene.cameras.main.height - 90,
            `[R] ${classDefinition.ultimateName} - Ready`,
            {
                fontSize: '14px',
                color: '#00ff00',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            }
        );
        ultimateText.setScrollFactor(0);
        ultimateText.setDepth(101);
        this.statsText.push(ultimateText);
        
        // Add skill description boxes (initially hidden)
        const skill1DescText = this.scene.add.text(
            300,
            this.scene.cameras.main.height - 70,
            classDefinition.skill1Description || classDefinition.skillDescription || '',
            {
                fontSize: '12px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 6, y: 4 },
                wordWrap: { width: 250 }
            }
        );
        skill1DescText.setScrollFactor(0);
        skill1DescText.setDepth(101);
        skill1DescText.setVisible(false);
        
        const skill2DescText = this.scene.add.text(
            300,
            this.scene.cameras.main.height - 70,
            classDefinition.skill2Description || '',
            {
                fontSize: '12px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 6, y: 4 },
                wordWrap: { width: 250 }
            }
        );
        skill2DescText.setScrollFactor(0);
        skill2DescText.setDepth(101);
        skill2DescText.setVisible(false);
        
        const ultimateDescText = this.scene.add.text(
            300,
            this.scene.cameras.main.height - 70,
            classDefinition.ultimateDescription || '',
            {
                fontSize: '12px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 6, y: 4 },
                wordWrap: { width: 250 }
            }
        );
        ultimateDescText.setScrollFactor(0);
        ultimateDescText.setDepth(101);
        ultimateDescText.setVisible(false);
        
        // Make skill texts interactive to show descriptions on hover
        this.skillCooldownText.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                skill1DescText.setVisible(true);
                skill2DescText.setVisible(false);
                ultimateDescText.setVisible(false);
            })
            .on('pointerout', () => {
                skill1DescText.setVisible(false);
            });
            
        skill2Text.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                skill1DescText.setVisible(false);
                skill2DescText.setVisible(true);
                ultimateDescText.setVisible(false);
            })
            .on('pointerout', () => {
                skill2DescText.setVisible(false);
            });
            
        ultimateText.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                skill1DescText.setVisible(false);
                skill2DescText.setVisible(false);
                ultimateDescText.setVisible(true);
            })
            .on('pointerout', () => {
                ultimateDescText.setVisible(false);
            });

        // Show class name at top of screen
        const classInfoText = this.scene.add.text(
            30,
            20,
            `Tank: ${classDefinition.name}`,
            {
                fontSize: '20px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 6, y: 4 },
                stroke: '#000000',
                strokeThickness: 3
            }
        );
        classInfoText.setScrollFactor(0);
        classInfoText.setDepth(101);
    }

    updateStatsDisplay() {
        // Update each stat text
        this.statsText[0].setText(`HP: ${this.stats.hp}`);
        this.statsText[1].setText(`DEF: ${this.stats.def}`);
        this.statsText[2].setText(`ATK: ${this.stats.atk}`);
        this.statsText[3].setText(`SPELL: ${this.stats.spellPower}`);
        this.statsText[4].setText(`SPEED: ${this.stats.speed}`);

        // Update skill status for all skills
        const classDefinition = getTankClassDefinition(this.tankClass);
        const now = Date.now();
        
        // Update Skill 1 (Q)
        if (this.isSkillActive) {
            const remainingTime = Math.ceil((this.skillDuration - (now - this.skillActiveTime)) / 1000);
            this.skillCooldownText.setText(`[Q] ${classDefinition.skill1Name || classDefinition.skillName} - Active (${remainingTime}s)`);
            this.skillCooldownText.setColor('#ffff00');
        } else if (now < this.lastSkill1Used + this.skill1Cooldown) {
            const remainingTime = Math.ceil((this.skill1Cooldown - (now - this.lastSkill1Used)) / 1000);
            this.skillCooldownText.setText(`[Q] ${classDefinition.skill1Name || classDefinition.skillName} - Cooldown (${remainingTime}s)`);
            this.skillCooldownText.setColor('#ff0000');
        } else {
            this.skillCooldownText.setText(`[Q] ${classDefinition.skill1Name || classDefinition.skillName} - Ready`);
            this.skillCooldownText.setColor('#00ff00');
        }
        
        // Update Skill 2 (E) - assuming it's the 6th element in statsText (index 5)
        if (this.statsText.length > 5) {
            const skill2Text = this.statsText[5];
            if (now < this.lastSkill2Used + this.skill2Cooldown) {
                const remainingTime = Math.ceil((this.skill2Cooldown - (now - this.lastSkill2Used)) / 1000);
                skill2Text.setText(`[E] ${classDefinition.skill2Name} - Cooldown (${remainingTime}s)`);
                skill2Text.setColor('#ff0000');
            } else {
                skill2Text.setText(`[E] ${classDefinition.skill2Name} - Ready`);
                skill2Text.setColor('#00ff00');
            }
        }
        
        // Update Ultimate (R) - assuming it's the 7th element in statsText (index 6)
        if (this.statsText.length > 6) {
            const ultimateText = this.statsText[6];
            if (now < this.lastUltimateUsed + this.ultimateCooldown) {
                const remainingTime = Math.ceil((this.ultimateCooldown - (now - this.lastUltimateUsed)) / 1000);
                ultimateText.setText(`[R] ${classDefinition.ultimateName} - Cooldown (${remainingTime}s)`);
                ultimateText.setColor('#ff0000');
            } else {
                ultimateText.setText(`[R] ${classDefinition.ultimateName} - Ready`);
                ultimateText.setColor('#00ff00');
            }
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
        
        // Manual world bounds check as backup
        this.checkWorldBounds();

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
        // Get barrel tip position for more accurate bullet spawn
        const barrelLength = 40;
        const bulletStartX = this.barrel.x + Math.cos(this.barrel.rotation) * barrelLength;
        const bulletStartY = this.barrel.y + Math.sin(this.barrel.rotation) * barrelLength;
        
        console.log('Firing bullet - barrel rotation (radians):', this.barrel.rotation, 'degrees:', this.barrel.rotation * 180 / Math.PI);
        
        const bullet = new Bullet(
            this.scene,
            bulletStartX,
            bulletStartY,
            this.barrel.rotation * 180 / Math.PI, // Convert radians to degrees for Bullet constructor
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

    useSkill(skillSlot: 'skill1' | 'skill2' | 'ultimate' = 'skill1', targetPosition?: { x: number, y: number }) {
        if (!this.skillSystem) {
            return false;
        }
        
        // Check cooldowns based on skill slot
        const now = Date.now();
        let lastUsed: number, cooldown: number;
        
        switch (skillSlot) {
            case 'skill1':
                lastUsed = this.lastSkill1Used;
                cooldown = this.skill1Cooldown;
                break;
            case 'skill2':
                lastUsed = this.lastSkill2Used;
                cooldown = this.skill2Cooldown;
                break;
            case 'ultimate':
                lastUsed = this.lastUltimateUsed;
                cooldown = this.ultimateCooldown;
                break;
        }
        
        if (now < lastUsed + cooldown) {
            console.log(`${skillSlot} on cooldown`);
            return false;
        }
        
        // Pass skill slot to skill system first
        const skillActivated = this.skillSystem.useSkill(this, this.tankClass, targetPosition, skillSlot);
        
        // Only update last used time if skill was successfully activated
        if (skillActivated) {
            switch (skillSlot) {
                case 'skill1':
                    this.lastSkill1Used = now;
                    break;
                case 'skill2':
                    this.lastSkill2Used = now;
                    break;
                case 'ultimate':
                    this.lastUltimateUsed = now;
                    break;
            }
        }
        
        return skillActivated;
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
    
    // Manual world bounds checking method
    public checkWorldBounds() {
        if (!this.body || !this.body.body) return;
        
        const physicsBody = this.body.body as Phaser.Physics.Arcade.Body;
        const worldBounds = this.scene.physics.world.bounds;
        
        let hitBounds = false;
        let newX = physicsBody.x;
        let newY = physicsBody.y;
        
        // Check left boundary
        if (physicsBody.x < worldBounds.x) {
            newX = worldBounds.x;
            hitBounds = true;
        }
        
        // Check right boundary
        if (physicsBody.x + physicsBody.width > worldBounds.x + worldBounds.width) {
            newX = worldBounds.x + worldBounds.width - physicsBody.width;
            hitBounds = true;
        }
        
        // Check top boundary
        if (physicsBody.y < worldBounds.y) {
            newY = worldBounds.y;
            hitBounds = true;
        }
        
        // Check bottom boundary
        if (physicsBody.y + physicsBody.height > worldBounds.y + worldBounds.height) {
            newY = worldBounds.y + worldBounds.height - physicsBody.height;
            hitBounds = true;
        }
        
        // If hit bounds, correct position and add bounce effect
        if (hitBounds) {
            console.log('Manual bounds check - player hit boundary, correcting position from', 
                { x: physicsBody.x, y: physicsBody.y }, 'to', { x: newX, y: newY });
            
            this.body.setPosition(newX + physicsBody.width/2, newY + physicsBody.height/2);
            
            // Apply bounce effect by reversing velocity
            physicsBody.setVelocity(physicsBody.velocity.x * -0.3, physicsBody.velocity.y * -0.3);
        }
    }
} 