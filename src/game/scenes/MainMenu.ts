import { GameObjects, Scene } from 'phaser';
import { AssetsEnum } from '../../app/constants/assets-enum';
import { PhaserAngularEventBus } from '../PhaserAngularEventBus';
import { MapType } from '../map/MapManager';
import { GameMode } from '../constants/GameModes';
import { TankClassType } from '../entities/TankClass';
import { SocketService } from '../services/SocketService';

// Mock user data for demonstration purposes
interface User {
    id: string;
    username: string;
    level: number;
    xp: number;
    avatar: string;
    tankCount: number;
}

interface Friend {
    id: string;
    username: string;
    online: boolean;
    avatar: string;
    inGame: boolean;
}

export class MainMenu extends Scene {
    background: GameObjects.Image;
    title: GameObjects.Text;
    mapOptions: GameObjects.Text[] = [];
    selectedMap: MapType = MapType.GRASS;

    // User data
    currentUser: User = {
        id: 'user123',
        username: 'TankCommander',
        level: 15,
        xp: 3750,
        avatar: AssetsEnum.TANK_BLUE,
        tankCount: 8
    };

    // Mock friends list
    friends: Friend[] = [
        { id: 'friend1', username: 'BattleBuddy', online: true, avatar: AssetsEnum.TANK_GREEN, inGame: false },
        { id: 'friend2', username: 'DestroyerX', online: true, avatar: AssetsEnum.TANK_RED, inGame: true },
        { id: 'friend3', username: 'TankMaster', online: false, avatar: AssetsEnum.TANK_SAND, inGame: false },
        { id: 'friend4', username: 'BulletStorm', online: true, avatar: AssetsEnum.TANK_DARK, inGame: false },
        { id: 'friend5', username: 'ArmorPlate', online: false, avatar: AssetsEnum.TANK_DARK, inGame: false }
    ];

    mapLabels: { [key in MapType]: string } = {
        [MapType.GRASS]: 'Grass Land',
        [MapType.SAND]: 'Desert',
        [MapType.MIXED]: 'Mixed'
    };

    constructor() {
        super('MainMenu');
    }

    create() {
        // Set up background
        this.background = this.add.image(512, 384, AssetsEnum.BACKGROUND);
        this.background.setAlpha(0.7);

        // Add tank decorations
        this.addTankDecorations();

        // Create the main sections
        this.createUserProfile();
        this.createFriendsList();
        this.createMainButtons();

        // Emit event for Angular component
        PhaserAngularEventBus.emit('current-scene-ready', this);
    }

    createUserProfile() {
        // User profile container
        const profileContainer = this.add.container(200, 120);

        // Background
        const profileBg = this.add.rectangle(0, 0, 350, 180, 0x222222, 0.8)
            .setStrokeStyle(2, 0xffffff);
        profileContainer.add(profileBg);

        // User avatar
        const avatar = this.add.image(-120, 0, AssetsEnum.TANK_BLUE)
            .setScale(0.6);
        profileContainer.add(avatar);

        // Username
        const usernameText = this.add.text(0, -60, 'Commander', {
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);
        profileContainer.add(usernameText);

        // Level info
        const levelContainer = this.add.container(0, -20);
        const levelBg = this.add.rectangle(0, 0, 180, 30, 0x444444, 0.8)
            .setStrokeStyle(1, 0xcccccc);
        const levelText = this.add.text(-70, 0, '#15', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);
        const xpText = this.add.text(70, 0, '1250/1500 XP', {
            fontSize: '14px',
            color: '#88ccff'
        }).setOrigin(1, 0.5);
        levelContainer.add(levelBg);
        levelContainer.add(levelText);
        levelContainer.add(xpText);
        profileContainer.add(levelContainer);

        // Tanks owned
        const tanksContainer = this.add.container(0, 20);
        const tanksBg = this.add.rectangle(0, 0, 180, 30, 0x444444, 0.8)
            .setStrokeStyle(1, 0xcccccc);
        const tanksText = this.add.text(-70, 0, 'Tanks Owned', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);
        const tanksCount = this.add.text(70, 0, '5/12', {
            fontSize: '14px',
            color: '#ffaa22'
        }).setOrigin(1, 0.5);
        tanksContainer.add(tanksBg);
        tanksContainer.add(tanksText);
        tanksContainer.add(tanksCount);
        profileContainer.add(tanksContainer);
    }

    createFriendsList() {
        // Friends list container
        const friendsContainer = this.add.container(824, 120);

        // Background
        const friendsBg = this.add.rectangle(0, 0, 350, 180, 0x222222, 0.8)
            .setStrokeStyle(2, 0xffffff);
        friendsContainer.add(friendsBg);

        // Title
        const titleText = this.add.text(0, -70, 'FRIENDS (3/12 online)', {
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);
        friendsContainer.add(titleText);

        // Mock friends data
        const friends = [
            { name: 'TankPro88', status: 'Online', playing: true },
            { name: 'BattleBuddy', status: 'Online', playing: false },
            { name: 'DestroyerX', status: 'Online', playing: true },
            { name: 'BlastMaster', status: 'Offline', playing: false },
            { name: 'SandWarrior', status: 'Offline', playing: false }
        ];

        // List friends
        friends.forEach((friend, index) => {
            const yPos = -40 + (index * 25);

            // Friend row container
            const friendRow = this.add.container(0, yPos);

            // Status indicator
            const statusColor = friend.status === 'Online' ? 0x00ff00 : 0x999999;
            const statusIndicator = this.add.circle(-150, 0, 5, statusColor);
            friendRow.add(statusIndicator);

            // Friend name
            const nameText = this.add.text(-135, 0, friend.name, {
                fontSize: '16px',
                color: friend.status === 'Online' ? '#ffffff' : '#999999'
            }).setOrigin(0, 0.5);
            friendRow.add(nameText);

            // Status text
            const statusText = this.add.text(70, 0,
                friend.status === 'Online' ? (friend.playing ? 'In Game' : 'In Lobby') : 'Offline',
                {
                    fontSize: '14px',
                    color: friend.status === 'Online' ?
                        (friend.playing ? '#ffaa22' : '#88ccff') : '#999999'
                }
            ).setOrigin(0.5, 0.5);
            friendRow.add(statusText);

            // Invite button (only for online friends)
            if (friend.status === 'Online') {
                const inviteButton = this.add.container(140, 0);
                const inviteBg = this.add.rectangle(0, 0, 60, 20, 0x006600, 0.8)
                    .setStrokeStyle(1, 0xffffff);
                const inviteText = this.add.text(0, 0, 'INVITE', {
                    fontSize: '12px',
                    color: '#ffffff'
                }).setOrigin(0.5, 0.5);

                inviteButton.add(inviteBg);
                inviteButton.add(inviteText);
                friendRow.add(inviteButton);

                // Make the invite button interactive
                inviteBg.setInteractive({ useHandCursor: true })
                    .on('pointerover', () => {
                        inviteBg.setFillStyle(0x008800, 0.8);
                    })
                    .on('pointerout', () => {
                        inviteBg.setFillStyle(0x006600, 0.8);
                    })
                    .on('pointerdown', () => {
                        this.inviteFriend(friend.name);
                    });
            }

            friendsContainer.add(friendRow);
        });
    }

    createMainButtons() {
        // Main buttons container in the center of the screen
        const mainButtonsContainer = this.add.container(512, 450);
        
        // Create main buttons
        this.createSoloButton(mainButtonsContainer, -300, -60);
        this.createLobbyButton(mainButtonsContainer, 0, -60);
        this.createJoinLobbyButton(mainButtonsContainer, 300, -60);
        this.createTankCollectionButton(mainButtonsContainer, 0, 90);
        this.createSettingsButton(mainButtonsContainer, 0, 190);
    }

    createSoloButton(container: Phaser.GameObjects.Container, x: number, y: number) {
        // Solo Mode Button
        const soloButtonContainer = this.add.container(x, y);

        // Background
        const soloBg = this.add.rectangle(0, 0, 250, 180, 0x005588, 0.8)
            .setStrokeStyle(2, 0xffffff);
        soloButtonContainer.add(soloBg);

        // Icon (placeholder)
        const soloIcon = this.add.image(0, -40, AssetsEnum.TANK_BLUE)
            .setScale(0.7);
        soloButtonContainer.add(soloIcon);

        // Text
        const soloText = this.add.text(0, 40, 'SOLO MODE', {
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5, 0.5);
        soloButtonContainer.add(soloText);

        // Make the button interactive
        soloBg.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                soloBg.setFillStyle(0x0077aa, 0.8);
            })
            .on('pointerout', () => {
                soloBg.setFillStyle(0x005588, 0.8);
            })
            .on('pointerdown', () => {
                this.startSoloMode();
            });

        container.add(soloButtonContainer);
    }

    createLobbyButton(container: Phaser.GameObjects.Container, x: number, y: number) {
        // Create Lobby Button
        const lobbyButtonContainer = this.add.container(x, y);

        // Background
        const lobbyBg = this.add.rectangle(0, 0, 250, 180, 0x885500, 0.8)
            .setStrokeStyle(2, 0xffffff);
        lobbyButtonContainer.add(lobbyBg);

        // Icon (placeholder)
        const lobbyIcon = this.add.image(0, -40, AssetsEnum.TANK_GREEN)
            .setScale(0.7);
        lobbyButtonContainer.add(lobbyIcon);

        // Text
        const lobbyText = this.add.text(0, 40, 'CREATE LOBBY', {
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5, 0.5);
        lobbyButtonContainer.add(lobbyText);

        // Make the button interactive
        lobbyBg.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                lobbyBg.setFillStyle(0xaa6600, 0.8);
            })
            .on('pointerout', () => {
                lobbyBg.setFillStyle(0x885500, 0.8);
            })
            .on('pointerdown', () => {
                this.createLobby();
            });

        container.add(lobbyButtonContainer);
    }

    createJoinLobbyButton(container: Phaser.GameObjects.Container, x: number, y: number) {
        // Join Lobby Button
        const joinLobbyContainer = this.add.container(x, y);
        
        // Background
        const joinLobbyBg = this.add.rectangle(0, 0, 250, 180, 0x555588, 0.8)
            .setStrokeStyle(2, 0xffffff);
        joinLobbyContainer.add(joinLobbyBg);
        
        // Icon (placeholder)
        const joinLobbyIcon = this.add.image(0, -40, AssetsEnum.TANK_SAND)
            .setScale(0.7);
        joinLobbyContainer.add(joinLobbyIcon);
        
        // Text
        const joinLobbyText = this.add.text(0, 40, 'JOIN LOBBY', {
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5, 0.5);
        joinLobbyContainer.add(joinLobbyText);
        
        // Make the button interactive
        joinLobbyBg.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                joinLobbyBg.setFillStyle(0x7777aa, 0.8);
            })
            .on('pointerout', () => {
                joinLobbyBg.setFillStyle(0x555588, 0.8);
            })
            .on('pointerdown', () => {
                this.joinLobby();
            });
        
        container.add(joinLobbyContainer);
    }

    createTankCollectionButton(container: Phaser.GameObjects.Container, x: number, y: number) {
        // Tank Collection Button
        const collectionButtonContainer = this.add.container(x, y);

        // Background
        const collectionBg = this.add.rectangle(0, 0, 250, 180, 0x550055, 0.8)
            .setStrokeStyle(2, 0xffffff);
        collectionButtonContainer.add(collectionBg);

        // Icon (placeholder)
        const collectionIcon = this.add.image(0, -40, AssetsEnum.TANK_RED)
            .setScale(0.7);
        collectionButtonContainer.add(collectionIcon);

        // Text
        const collectionText = this.add.text(0, 40, 'TANK COLLECTION', {
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5, 0.5);
        collectionButtonContainer.add(collectionText);

        // Make the button interactive
        collectionBg.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                collectionBg.setFillStyle(0x770077, 0.8);
            })
            .on('pointerout', () => {
                collectionBg.setFillStyle(0x550055, 0.8);
            })
            .on('pointerdown', () => {
                this.openTankCollection();
            });

        container.add(collectionButtonContainer);
    }

    createSettingsButton(container: Phaser.GameObjects.Container, x: number, y: number) {
        // Settings Button
        const settingsButtonContainer = this.add.container(x, y);

        // Background
        const settingsBg = this.add.rectangle(0, 0, 200, 60, 0x333333, 0.8)
            .setStrokeStyle(2, 0xffffff);
        settingsButtonContainer.add(settingsBg);

        // Text
        const settingsText = this.add.text(0, 0, 'SETTINGS', {
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5, 0.5);
        settingsButtonContainer.add(settingsText);

        // Make the button interactive
        settingsBg.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                settingsBg.setFillStyle(0x555555, 0.8);
            })
            .on('pointerout', () => {
                settingsBg.setFillStyle(0x333333, 0.8);
            })
            .on('pointerdown', () => {
                this.openSettings();
            });

        container.add(settingsButtonContainer);
    }

    addTankDecorations() {
        // Add decorative tanks on the menu screen
        const tankSprites = [
            {
                body: AssetsEnum.TANK_BLUE,
                x: 150,
                y: 650,
                rotation: -0.2
            },
            {
                body: AssetsEnum.TANK_GREEN,
                x: 850,
                y: 650,
                rotation: 0.2
            },
            {
                body: AssetsEnum.TANK_RED,
                x: 500,
                y: 700,
                rotation: 0.1
            }
        ];

        tankSprites.forEach(tank => {
            // Create tank body
            const body = this.add.image(tank.x, tank.y, tank.body);
            body.setRotation(tank.rotation);
            body.setDepth(5);

            // Animate the tanks slightly
            this.tweens.add({
                targets: [body],
                y: tank.y - 10,
                duration: 2000 + Math.random() * 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
    }

    startSoloMode() {
        // Navigate to the Map Selection for Solo Mode
        this.scene.start('MapSelection', { gameMode: GameMode.SOLO });
    }

    createLobby() {
        // Connect to socket server
        const socketService = SocketService.getInstance();
        
        socketService.connect()
            .then(() => {
                // Go to the lobby scene as host
                this.scene.start('LobbyScene', {
                    username: 'Commander',
                    isHost: true
                });
            })
            .catch(error => {
                console.error('Failed to connect to server:', error);
                // Show error notification
                this.showNotification('Cannot connect to server. Please try again later.', '#ff0000');
            });
    }

    openTankCollection() {
        // This would navigate to a tank collection scene (not implemented in this example)
        console.log('Opening tank collection (not implemented)');
        this.showNotification('Tank Collection feature coming soon!');
    }

    openSettings() {
        // This would open a settings menu or scene (not implemented in this example)
        console.log('Opening settings (not implemented)');
        this.showNotification('Settings menu coming soon!');
    }

    inviteFriend(friendName: string) {
        // This would invite a friend to play (not implemented in this example)
        console.log(`Inviting ${friendName} to play`);
        this.showNotification(`Invitation sent to ${friendName}!`);
    }

    joinLobby() {
        // Connect to socket server
        const socketService = SocketService.getInstance();
        
        socketService.connect()
            .then(() => {
                // Go to join lobby scene
                this.scene.start('JoinLobby');
            })
            .catch(error => {
                console.error('Failed to connect to server:', error);
                // Show error notification
                this.showNotification('Cannot connect to server. Please try again later.', '#ff0000');
            });
    }

    showNotification(message: string, color: string = '#ffffff') {
        // Remove existing notification if any
        const existingNotification = this.children.getByName('notification');
        if (existingNotification) {
            existingNotification.destroy();
        }
        
        // Create container for notification
        const container = this.add.container(512, 100);
        container.setName('notification');
        
        // Background
        const bg = this.add.rectangle(0, 0, 500, 50, 0x000000, 0.8)
            .setStrokeStyle(2, 0xffffff);
        
        // Message text
        const text = this.add.text(0, 0, message, {
            fontSize: '18px',
            color: color,
            align: 'center'
        }).setOrigin(0.5, 0.5);
        
        container.add([bg, text]);
        
        // Set a timer to remove the notification
        this.time.delayedCall(5000, () => {
            container.destroy();
        });
    }
}
