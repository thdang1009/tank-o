import { GameObjects, Scene } from 'phaser';
import { AssetsEnum } from '../../app/constants/assets-enum';
import { PhaserAngularEventBus } from '../PhaserAngularEventBus';
import { GameMode } from '../constants/GameModes';
import { SocketService } from '../services/SocketService';

export class MainMenu extends Scene {
    background: GameObjects.Image;
    title: GameObjects.Text;

    constructor() {
        super('MainMenu');
    }

    create() {
        // Set up background
        this.background = this.add.image(512, 384, AssetsEnum.BACKGROUND);
        this.background.setAlpha(0.5);

        // Create game title
        this.title = this.add.text(512, 150, 'TANK-O', {
            fontSize: '64px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5, 0.5);

        // Create simple vertical menu
        this.createSimpleMenu();

        // Emit event for Angular component
        PhaserAngularEventBus.emit('current-scene-ready', this);
    }

    createSimpleMenu() {
        const centerX = 512;
        const startY = 280;
        const buttonSpacing = 80;
        const buttonWidth = 300;
        const buttonHeight = 60;

        // Define menu options
        const menuOptions = [
            { 
                text: 'SOLO MODE', 
                color: 0x005588, 
                hoverColor: 0x0077aa, 
                action: () => this.startSoloMode() 
            },
            { 
                text: 'CREATE LOBBY', 
                color: 0x885500, 
                hoverColor: 0xaa6600, 
                action: () => this.createLobby() 
            },
            { 
                text: 'JOIN LOBBY', 
                color: 0x555588, 
                hoverColor: 0x7777aa, 
                action: () => this.joinLobby() 
            },
            { 
                text: 'SETTINGS', 
                color: 0x333333, 
                hoverColor: 0x555555, 
                action: () => this.openSettings() 
            }
        ];

        // Create each menu button
        menuOptions.forEach((option, index) => {
            const y = startY + (index * buttonSpacing);
            
            // Create button container
            const buttonContainer = this.add.container(centerX, y);
            
            // Button background
            const background = this.add.rectangle(0, 0, buttonWidth, buttonHeight, option.color, 0.8)
                .setStrokeStyle(3, 0xffffff);
            buttonContainer.add(background);
            
            // Button text
            const text = this.add.text(0, 0, option.text, {
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5, 0.5);
            buttonContainer.add(text);
            
            // Make button interactive
            background.setInteractive({ useHandCursor: true })
                .on('pointerover', () => {
                    background.setFillStyle(option.hoverColor, 0.8);
                    text.setScale(1.1);
                })
                .on('pointerout', () => {
                    background.setFillStyle(option.color, 0.8);
                    text.setScale(1);
                })
                .on('pointerdown', () => {
                    option.action();
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

    openSettings() {
        // This would open a settings menu or scene (not implemented in this example)
        console.log('Opening settings (not implemented)');
        this.showNotification('Settings menu coming soon!');
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
