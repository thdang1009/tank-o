import { Scene } from 'phaser';
import { GameMode } from '../constants/GameModes';
import { Player } from '../entities/Player';
import { gameStateManager } from '../managers/GameStateManager';
import { AssetsEnum, AssetsAudioEnum } from '../../app/constants/assets-enum';

export interface GameModeState {
    mode: GameMode;
    status: 'waiting' | 'starting' | 'active' | 'ending' | 'completed';
    startTime: number;
    endTime?: number;
    players: Player[];
    teams?: Map<string, Player[]>;
    objectives: Map<string, any>;
    config: any;
}

export interface GameModeObjective {
    id: string;
    name: string;
    description: string;
    position: { x: number, y: number };
    status: 'inactive' | 'active' | 'captured' | 'destroyed';
    team?: string;
    captureProgress?: number;
    sprite?: Phaser.GameObjects.Sprite;
}

export abstract class BaseGameMode {
    protected scene: Scene;
    protected state: GameModeState;
    
    constructor(scene: Scene, mode: GameMode, config: any) {
        this.scene = scene;
        this.state = {
            mode,
            status: 'waiting',
            startTime: 0,
            players: [],
            objectives: new Map(),
            config
        };
    }
    
    abstract initialize(): void;
    abstract update(deltaTime: number): void;
    abstract checkWinConditions(): { winner?: string | Player[], gameEnded: boolean };
    abstract cleanup(): void;
    
    start() {
        this.state.status = 'starting';
        this.state.startTime = Date.now();
        this.initialize();
        
        // Countdown before starting
        let countdown = 3;
        const countdownInterval = setInterval(() => {
            if (countdown > 0) {
                this.showCountdown(countdown);
                countdown--;
            } else {
                clearInterval(countdownInterval);
                this.state.status = 'active';
                this.onGameStart();
            }
        }, 1000);
    }
    
    protected showCountdown(count: number) {
        const countdownText = this.scene.add.text(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY,
            count.toString(),
            {
                fontSize: '64px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        countdownText.setOrigin(0.5);
        countdownText.setScrollFactor(0);
        countdownText.setDepth(1000);
        
        this.scene.tweens.add({
            targets: countdownText,
            scale: { from: 2, to: 1 },
            alpha: { from: 0.5, to: 1 },
            duration: 800,
            onComplete: () => {
                this.scene.tweens.add({
                    targets: countdownText,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => countdownText.destroy()
                });
            }
        });
        
        this.scene.sound.play(AssetsAudioEnum.ABSORB, { volume: 0.7 });
    }
    
    protected onGameStart() {
        // Override in subclasses
        console.log(`${this.state.mode} started!`);
    }
    
    addPlayer(player: Player) {
        this.state.players.push(player);
    }
    
    removePlayer(player: Player) {
        const index = this.state.players.indexOf(player);
        if (index > -1) {
            this.state.players.splice(index, 1);
        }
    }
    
    getState(): GameModeState {
        return this.state;
    }
    
    isActive(): boolean {
        return this.state.status === 'active';
    }
    
    end(winner?: string | Player[]) {
        this.state.status = 'ending';
        this.state.endTime = Date.now();
        this.onGameEnd(winner);
    }
    
    protected onGameEnd(winner?: string | Player[]) {
        // Show game end UI
        const duration = (this.state.endTime! - this.state.startTime) / 1000;
        console.log(`Game ended after ${duration.toFixed(1)} seconds`);
        
        if (winner) {
            console.log('Winner:', winner);
        }
        
        // Transition to results screen after delay
        this.scene.time.delayedCall(3000, () => {
            this.cleanup();
            this.state.status = 'completed';
        });
    }
}

// Battle Royale Mode
export class BattleRoyaleMode extends BaseGameMode {
    private shrinkingZone!: Phaser.GameObjects.Graphics;
    private safeZoneRadius: number = 800;
    private shrinkRate: number = 1; // pixels per second
    private lastShrinkTime: number = 0;
    private shrinkInterval: number = 30000; // 30 seconds between shrinks
    private damageZone: Phaser.GameObjects.Graphics | null = null;
    
    constructor(scene: Scene, config: any) {
        super(scene, GameMode.BATTLE_ROYALE, config);
        this.safeZoneRadius = config.initialZoneRadius || 800;
        this.shrinkInterval = config.shrinkInterval || 30000;
        this.shrinkRate = config.shrinkRate || 1;
    }
    
    initialize() {
        // Create shrinking zone visual
        this.createSafeZone();
        
        // Set up zone shrinking
        this.lastShrinkTime = Date.now();
        
        // Spawn supply drops periodically
        this.scheduleSupplyDrops();
        
        console.log('Battle Royale initialized with', this.state.players.length, 'players');
    }
    
    private createSafeZone() {
        const centerX = this.scene.cameras.main.centerX;
        const centerY = this.scene.cameras.main.centerY;
        
        // Create safe zone indicator
        this.shrinkingZone = this.scene.add.graphics();
        this.shrinkingZone.lineStyle(4, 0x00ff00, 0.8);
        this.shrinkingZone.strokeCircle(centerX, centerY, this.safeZoneRadius);
        this.shrinkingZone.setDepth(-1);
        
        // Create damage zone (red overlay outside safe zone)
        this.damageZone = this.scene.add.graphics();
        this.updateDamageZone(centerX, centerY);
    }
    
    private updateDamageZone(centerX: number, centerY: number) {
        if (!this.damageZone) return;
        
        this.damageZone.clear();
        this.damageZone.fillStyle(0xff0000, 0.1);
        
        // Fill entire world except safe zone
        const worldBounds = this.scene.physics.world.bounds;
        this.damageZone.fillRect(
            worldBounds.x,
            worldBounds.y,
            worldBounds.width,
            worldBounds.height
        );
        
        // Cut out safe zone
        this.damageZone.fillStyle(0x000000, 0);
        this.damageZone.beginPath();
        this.damageZone.arc(centerX, centerY, this.safeZoneRadius, 0, Math.PI * 2);
        this.damageZone.closePath();
        this.damageZone.fill();
    }
    
    update(deltaTime: number) {
        if (!this.isActive()) return;
        
        const currentTime = Date.now();
        
        // Check if it's time to shrink the zone
        if (currentTime - this.lastShrinkTime > this.shrinkInterval) {
            this.shrinkZone();
            this.lastShrinkTime = currentTime;
        }
        
        // Apply damage to players outside safe zone
        this.checkPlayersInZone();
        
        // Check win conditions
        const result = this.checkWinConditions();
        if (result.gameEnded) {
            this.end(result.winner);
        }
    }
    
    private shrinkZone() {
        if (this.safeZoneRadius <= 50) return; // Minimum zone size
        
        const shrinkAmount = 50;
        this.safeZoneRadius = Math.max(50, this.safeZoneRadius - shrinkAmount);
        
        // Update visual
        const centerX = this.scene.cameras.main.centerX;
        const centerY = this.scene.cameras.main.centerY;
        
        this.shrinkingZone.clear();
        this.shrinkingZone.lineStyle(4, 0x00ff00, 0.8);
        this.shrinkingZone.strokeCircle(centerX, centerY, this.safeZoneRadius);
        
        this.updateDamageZone(centerX, centerY);
        
        // Warning sound
        this.scene.sound.play(AssetsAudioEnum.DISAPPEAR, { volume: 0.8 });
        
        console.log('Zone shrinking to radius:', this.safeZoneRadius);
    }
    
    private checkPlayersInZone() {
        const centerX = this.scene.cameras.main.centerX;
        const centerY = this.scene.cameras.main.centerY;
        
        this.state.players.forEach(player => {
            if (!player.isAlive) return;
            
            const distance = Phaser.Math.Distance.Between(
                player.body.x, player.body.y,
                centerX, centerY
            );
            
            if (distance > this.safeZoneRadius) {
                // Player is outside safe zone, apply damage
                const damage = 10; // Damage per tick
                player.takeDamage(damage);
                
                // Visual indicator
                player.body.setTint(0xff0000);
                this.scene.time.delayedCall(200, () => {
                    if (player.body.active) {
                        player.body.clearTint();
                    }
                });
            }
        });
    }
    
    private scheduleSupplyDrops() {
        const dropInterval = 45000; // 45 seconds
        
        const scheduleNext = () => {
            this.scene.time.delayedCall(dropInterval, () => {
                if (this.isActive()) {
                    this.createSupplyDrop();
                    scheduleNext();
                }
            });
        };
        
        // First drop after 30 seconds
        this.scene.time.delayedCall(30000, () => {
            if (this.isActive()) {
                this.createSupplyDrop();
                scheduleNext();
            }
        });
    }
    
    private createSupplyDrop() {
        // Random position within safe zone
        const centerX = this.scene.cameras.main.centerX;
        const centerY = this.scene.cameras.main.centerY;
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * (this.safeZoneRadius * 0.8);
        
        const dropX = centerX + Math.cos(angle) * distance;
        const dropY = centerY + Math.sin(angle) * distance;
        
        // Create supply drop crate
        const supplyDrop = this.scene.add.sprite(dropX, dropY, AssetsEnum.CRATE_METAL);
        supplyDrop.setScale(1.5);
        supplyDrop.setDepth(10);
        
        // Falling animation
        supplyDrop.setY(dropY - 200);
        this.scene.tweens.add({
            targets: supplyDrop,
            y: dropY,
            duration: 2000,
            ease: 'Bounce.easeOut'
        });
        
        // Glow effect
        this.scene.tweens.add({
            targets: supplyDrop,
            alpha: 0.7,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        // Sound effect
        this.scene.sound.play(AssetsAudioEnum.ABSORB, { volume: 0.6 });
        
        console.log('Supply drop created at', dropX, dropY);
    }
    
    checkWinConditions(): { winner?: string | Player[], gameEnded: boolean } {
        const alivePlayers = this.state.players.filter(p => p.isAlive);
        
        if (alivePlayers.length <= 1) {
            return {
                winner: alivePlayers.length === 1 ? alivePlayers : undefined,
                gameEnded: true
            };
        }
        
        return { gameEnded: false };
    }
    
    cleanup() {
        if (this.shrinkingZone) {
            this.shrinkingZone.destroy();
        }
        if (this.damageZone) {
            this.damageZone.destroy();
        }
    }
}

// Capture the Flag Mode
export class CaptureTheFlagMode extends BaseGameMode {
    private flags: Map<string, GameModeObjective> = new Map();
    private flagCaptureRadius: number = 50;
    private captureTime: number = 3000; // 3 seconds to capture
    
    constructor(scene: Scene, config: any) {
        super(scene, GameMode.CAPTURE_FLAG, config);
        this.flagCaptureRadius = config.captureRadius || 50;
        this.captureTime = config.captureTime || 3000;
    }
    
    initialize() {
        // Set up teams
        this.setupTeams();
        
        // Create flags for each team
        this.createFlags();
        
        console.log('Capture the Flag initialized');
    }
    
    private setupTeams() {
        this.state.teams = new Map();
        
        // Divide players into two teams
        const teamA: Player[] = [];
        const teamB: Player[] = [];
        
        this.state.players.forEach((player, index) => {
            if (index % 2 === 0) {
                teamA.push(player);
            } else {
                teamB.push(player);
            }
        });
        
        this.state.teams.set('red', teamA);
        this.state.teams.set('blue', teamB);
        
        // Set team colors/indicators for players
        teamA.forEach(player => {
            player.body.setTint(0xff4444);
        });
        
        teamB.forEach(player => {
            player.body.setTint(0x4444ff);
        });
    }
    
    private createFlags() {
        const worldBounds = this.scene.physics.world.bounds;
        
        // Red team flag (left side)
        const redFlagX = worldBounds.x + 100;
        const redFlagY = worldBounds.y + worldBounds.height / 2;
        
        const redFlag = this.scene.add.sprite(redFlagX, redFlagY, AssetsEnum.STAR);
        redFlag.setScale(2);
        redFlag.setTint(0xff0000);
        redFlag.setDepth(5);
        
        this.flags.set('red', {
            id: 'red',
            name: 'Red Flag',
            description: 'Red team flag',
            position: { x: redFlagX, y: redFlagY },
            status: 'active',
            team: 'red',
            sprite: redFlag
        });
        
        // Blue team flag (right side)
        const blueFlagX = worldBounds.x + worldBounds.width - 100;
        const blueFlagY = worldBounds.y + worldBounds.height / 2;
        
        const blueFlag = this.scene.add.sprite(blueFlagX, blueFlagY, AssetsEnum.STAR);
        blueFlag.setScale(2);
        blueFlag.setTint(0x0000ff);
        blueFlag.setDepth(5);
        
        this.flags.set('blue', {
            id: 'blue',
            name: 'Blue Flag',
            description: 'Blue team flag',
            position: { x: blueFlagX, y: blueFlagY },
            status: 'active',
            team: 'blue',
            sprite: blueFlag
        });
        
        // Add flag capture zones
        this.createCaptureZones();
    }
    
    private createCaptureZones() {
        this.flags.forEach(flag => {
            const zone = this.scene.add.circle(
                flag.position.x,
                flag.position.y,
                this.flagCaptureRadius,
                0xffffff,
                0.1
            );
            zone.setStrokeStyle(2, flag.team === 'red' ? 0xff0000 : 0x0000ff, 0.5);
            zone.setDepth(0);
        });
    }
    
    update(deltaTime: number) {
        if (!this.isActive()) return;
        
        // Check flag interactions
        this.checkFlagCaptures();
        
        // Check win conditions
        const result = this.checkWinConditions();
        if (result.gameEnded) {
            this.end(result.winner);
        }
    }
    
    private checkFlagCaptures() {
        this.flags.forEach((flag, flagTeam) => {
            if (flag.status !== 'active') return;
            
            // Check if enemy players are near flag
            const enemyTeam = flagTeam === 'red' ? 'blue' : 'red';
            const enemyPlayers = this.state.teams?.get(enemyTeam) || [];
            
            const playersNearFlag = enemyPlayers.filter(player => {
                if (!player.isAlive) return false;
                
                const distance = Phaser.Math.Distance.Between(
                    player.body.x, player.body.y,
                    flag.position.x, flag.position.y
                );
                
                return distance <= this.flagCaptureRadius;
            });
            
            if (playersNearFlag.length > 0) {
                // Start capture process
                this.startFlagCapture(flag, enemyTeam, playersNearFlag);
            }
        });
    }
    
    private startFlagCapture(flag: GameModeObjective, capturingTeam: string, players: Player[]) {
        if (!flag.captureProgress) {
            flag.captureProgress = 0;
            
            // Visual indicator for capture in progress
            const captureBar = this.scene.add.graphics();
            captureBar.setDepth(20);
            
            const captureInterval = setInterval(() => {
                if (flag.status !== 'active') {
                    clearInterval(captureInterval);
                    captureBar.destroy();
                    return;
                }
                
                // Check if players are still in range
                const stillCapturing = players.some(player => {
                    const distance = Phaser.Math.Distance.Between(
                        player.body.x, player.body.y,
                        flag.position.x, flag.position.y
                    );
                    return distance <= this.flagCaptureRadius && player.isAlive;
                });
                
                if (!stillCapturing) {
                    // Stop capture
                    flag.captureProgress = 0;
                    clearInterval(captureInterval);
                    captureBar.destroy();
                    return;
                }
                
                // Increment capture progress
                flag.captureProgress! += 100; // 100ms increments
                
                // Update capture bar
                captureBar.clear();
                const progress = flag.captureProgress! / this.captureTime;
                const barWidth = 60;
                const barHeight = 8;
                
                captureBar.fillStyle(0x000000);
                captureBar.fillRect(
                    flag.position.x - barWidth / 2,
                    flag.position.y - 40,
                    barWidth,
                    barHeight
                );
                
                captureBar.fillStyle(capturingTeam === 'red' ? 0xff0000 : 0x0000ff);
                captureBar.fillRect(
                    flag.position.x - barWidth / 2,
                    flag.position.y - 40,
                    barWidth * progress,
                    barHeight
                );
                
                // Check if capture is complete
                if (flag.captureProgress! >= this.captureTime) {
                    this.captureFlag(flag, capturingTeam);
                    clearInterval(captureInterval);
                    captureBar.destroy();
                }
            }, 100);
        }
    }
    
    private captureFlag(flag: GameModeObjective, capturingTeam: string) {
        flag.status = 'captured';
        flag.team = capturingTeam;
        
        // Update visual
        if (flag.sprite) {
            flag.sprite.setTint(capturingTeam === 'red' ? 0xff0000 : 0x0000ff);
            
            // Victory effect
            this.scene.tweens.add({
                targets: flag.sprite,
                scale: 3,
                alpha: 0.5,
                duration: 500,
                yoyo: true,
                repeat: 2
            });
        }
        
        this.scene.sound.play(AssetsAudioEnum.ABSORB, { volume: 0.8 });
        
        console.log(`${capturingTeam} team captured the ${flag.id} flag!`);
    }
    
    checkWinConditions(): { winner?: string | Player[], gameEnded: boolean } {
        // Check if one team captured all flags
        const redFlags = Array.from(this.flags.values()).filter(f => f.team === 'red' && f.status === 'captured');
        const blueFlags = Array.from(this.flags.values()).filter(f => f.team === 'blue' && f.status === 'captured');
        
        if (redFlags.length >= 2) {
            return {
                winner: this.state.teams?.get('red') || [],
                gameEnded: true
            };
        }
        
        if (blueFlags.length >= 2) {
            return {
                winner: this.state.teams?.get('blue') || [],
                gameEnded: true
            };
        }
        
        // Check if one team is eliminated
        const redTeam = this.state.teams?.get('red') || [];
        const blueTeam = this.state.teams?.get('blue') || [];
        
        const redAlive = redTeam.filter(p => p.isAlive);
        const blueAlive = blueTeam.filter(p => p.isAlive);
        
        if (redAlive.length === 0) {
            return { winner: blueTeam, gameEnded: true };
        }
        
        if (blueAlive.length === 0) {
            return { winner: redTeam, gameEnded: true };
        }
        
        return { gameEnded: false };
    }
    
    cleanup() {
        this.flags.forEach(flag => {
            if (flag.sprite) {
                flag.sprite.destroy();
            }
        });
        this.flags.clear();
    }
}

// Game Mode Factory
export class GameModeFactory {
    static create(scene: Scene, mode: GameMode, config: any = {}): BaseGameMode {
        switch (mode) {
            case GameMode.BATTLE_ROYALE:
                return new BattleRoyaleMode(scene, config);
            case GameMode.CAPTURE_FLAG:
                return new CaptureTheFlagMode(scene, config);
            case GameMode.TEAM_PVP:
                return new TeamDeathMatchMode(scene, config);
            case GameMode.TEAM_PVE:
                return new AdventureModeMode(scene, config);
            default:
                throw new Error(`Unsupported game mode: ${mode}`);
        }
    }
}

// Team Deathmatch Mode
export class TeamDeathMatchMode extends BaseGameMode {
    private killGoal: number = 25;
    private timeLimit: number = 600000; // 10 minutes
    
    constructor(scene: Scene, config: any) {
        super(scene, GameMode.TEAM_PVP, config);
        this.killGoal = config.killGoal || 25;
        this.timeLimit = config.timeLimit || 600000;
    }
    
    initialize() {
        this.setupTeams();
        console.log('Team Deathmatch initialized');
    }
    
    private setupTeams() {
        this.state.teams = new Map();
        
        const teamA: Player[] = [];
        const teamB: Player[] = [];
        
        this.state.players.forEach((player, index) => {
            if (index % 2 === 0) {
                teamA.push(player);
            } else {
                teamB.push(player);
            }
        });
        
        this.state.teams.set('red', teamA);
        this.state.teams.set('blue', teamB);
        
        // Set team indicators
        teamA.forEach(player => player.body.setTint(0xff4444));
        teamB.forEach(player => player.body.setTint(0x4444ff));
    }
    
    update(deltaTime: number) {
        if (!this.isActive()) return;
        
        const result = this.checkWinConditions();
        if (result.gameEnded) {
            this.end(result.winner);
        }
        
        // Check time limit
        if (Date.now() - this.state.startTime > this.timeLimit) {
            const winner = this.getTeamWithMostKills();
            this.end(winner);
        }
    }
    
    private getTeamWithMostKills(): Player[] {
        const redTeam = this.state.teams?.get('red') || [];
        const blueTeam = this.state.teams?.get('blue') || [];
        
        const redKills = redTeam.reduce((total, player) => total + (player.score || 0), 0);
        const blueKills = blueTeam.reduce((total, player) => total + (player.score || 0), 0);
        
        return redKills > blueKills ? redTeam : blueTeam;
    }
    
    checkWinConditions(): { winner?: string | Player[], gameEnded: boolean } {
        if (!this.state.teams) return { gameEnded: false };
        
        const redTeam = this.state.teams.get('red') || [];
        const blueTeam = this.state.teams.get('blue') || [];
        
        const redKills = redTeam.reduce((total, player) => total + (player.score || 0), 0);
        const blueKills = blueTeam.reduce((total, player) => total + (player.score || 0), 0);
        
        if (redKills >= this.killGoal) {
            return { winner: redTeam, gameEnded: true };
        }
        
        if (blueKills >= this.killGoal) {
            return { winner: blueTeam, gameEnded: true };
        }
        
        return { gameEnded: false };
    }
    
    cleanup() {
        // Clean up team indicators
        this.state.players.forEach(player => {
            if (player.body.active) {
                player.body.clearTint();
            }
        });
    }
}

// Adventure Mode (Team PvE)
export class AdventureModeMode extends BaseGameMode {
    private waves: number = 0;
    private maxWaves: number = 10;
    private enemiesPerWave: number = 5;
    private bossSpawned: boolean = false;
    
    constructor(scene: Scene, config: any) {
        super(scene, GameMode.TEAM_PVE, config);
        this.maxWaves = config.maxWaves || 10;
        this.enemiesPerWave = config.enemiesPerWave || 5;
    }
    
    initialize() {
        console.log('Adventure Mode initialized');
        this.spawnWave();
    }
    
    private spawnWave() {
        this.waves++;
        
        if (this.waves > this.maxWaves && !this.bossSpawned) {
            this.spawnBoss();
            return;
        }
        
        // Spawn enemies for this wave
        for (let i = 0; i < this.enemiesPerWave; i++) {
            this.spawnEnemy();
        }
        
        console.log(`Wave ${this.waves} spawned with ${this.enemiesPerWave} enemies`);
    }
    
    private spawnEnemy() {
        // In a full implementation, you'd spawn actual enemy entities
        // This is a simplified version
        const worldBounds = this.scene.physics.world.bounds;
        const x = Phaser.Math.Between(worldBounds.x, worldBounds.x + worldBounds.width);
        const y = Phaser.Math.Between(worldBounds.y, worldBounds.y + worldBounds.height);
        
        console.log(`Enemy spawned at ${x}, ${y}`);
    }
    
    private spawnBoss() {
        this.bossSpawned = true;
        console.log('Boss spawned!');
        
        // Create boss visual indicator
        const bossIndicator = this.scene.add.text(
            this.scene.cameras.main.centerX,
            100,
            'BOSS BATTLE!',
            {
                fontSize: '32px',
                color: '#ff0000',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        bossIndicator.setOrigin(0.5);
        bossIndicator.setScrollFactor(0);
        bossIndicator.setDepth(1000);
        
        this.scene.sound.play(AssetsAudioEnum.EXPLOSION, { volume: 1.0 });
    }
    
    update(deltaTime: number) {
        if (!this.isActive()) return;
        
        const result = this.checkWinConditions();
        if (result.gameEnded) {
            this.end(result.winner);
        }
    }
    
    checkWinConditions(): { winner?: string | Player[], gameEnded: boolean } {
        // Check if all players are dead
        const alivePlayers = this.state.players.filter(p => p.isAlive);
        if (alivePlayers.length === 0) {
            return { gameEnded: true }; // Game over, no winner
        }
        
        // Check if boss is defeated (simplified)
        if (this.bossSpawned) {
            // In a real implementation, you'd check if boss entity is destroyed
            // For now, we'll simulate victory after some time
            const bossTime = 60000; // 1 minute boss fight
            if (Date.now() - this.state.startTime > (this.maxWaves * 30000) + bossTime) {
                return { winner: alivePlayers, gameEnded: true };
            }
        }
        
        return { gameEnded: false };
    }
    
    cleanup() {
        // Clean up spawned enemies and effects
    }
}