import { Scene, GameObjects } from 'phaser';
import { AssetsEnum } from '../../app/constants/assets-enum';
import { SocketService, SocketEvents } from '../services/SocketService';

export class JoinLobby extends Scene {
    private lobbyCode: string = '';
    private username: string = '';
    private codeInput!: GameObjects.Text;
    private usernameInput!: GameObjects.Text;
    private statusText!: GameObjects.Text;
    private joinButton!: GameObjects.Container;
    private backButton!: GameObjects.Container;
    private socketService: SocketService;
    
    constructor() {
        super({ key: 'JoinLobby' });
        this.socketService = SocketService.getInstance();
    }
    
    create() {
        // Background
        this.add.image(512, 384, AssetsEnum.BACKGROUND)
            .setScale(1)
            .setTint(0x555555);
        
        // Title
        this.add.text(512, 100, 'JOIN LOBBY', {
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5, 0.5);
        
        // Form container
        const formContainer = this.add.container(512, 300);
        
        // Background
        const formBg = this.add.rectangle(0, 0, 400, 300, 0x222244, 0.8)
            .setStrokeStyle(2, 0xffffff);
        formContainer.add(formBg);
        
        // Username section
        this.add.text(512, 200, 'ENTER YOUR USERNAME:', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);
        
        // Username input box
        const usernameBg = this.add.rectangle(512, 240, 300, 40, 0x333366, 0.8)
            .setStrokeStyle(1, 0xaaaaaa)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.promptUsername();
            });
            
        this.usernameInput = this.add.text(512, 240, 'Click to enter username', {
            fontSize: '18px',
            color: '#aaaaaa'
        }).setOrigin(0.5, 0.5);
        
        // Lobby code section
        this.add.text(512, 300, 'ENTER LOBBY CODE:', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);
        
        // Lobby code input box
        const codeBg = this.add.rectangle(512, 340, 300, 40, 0x333366, 0.8)
            .setStrokeStyle(1, 0xaaaaaa)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.promptLobbyCode();
            });
            
        this.codeInput = this.add.text(512, 340, 'Click to enter lobby code', {
            fontSize: '18px',
            color: '#aaaaaa'
        }).setOrigin(0.5, 0.5);
        
        // Status text for errors/notifications
        this.statusText = this.add.text(512, 400, '', {
            fontSize: '16px',
            color: '#ff0000',
            align: 'center'
        }).setOrigin(0.5, 0.5);
        
        // Join button
        this.joinButton = this.add.container(512, 450);
        const joinBg = this.add.rectangle(0, 0, 200, 50, 0x006600, 0.8)
            .setStrokeStyle(2, 0xffffff);
        const joinText = this.add.text(0, 0, 'JOIN LOBBY', {
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);
        this.joinButton.add([joinBg, joinText]);
        
        joinBg.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                joinBg.setFillStyle(0x008800, 0.8);
            })
            .on('pointerout', () => {
                joinBg.setFillStyle(0x006600, 0.8);
            })
            .on('pointerdown', () => {
                this.joinLobby();
            });
        
        // Back button
        this.backButton = this.add.container(512, 520);
        const backBg = this.add.rectangle(0, 0, 150, 40, 0x660000, 0.8)
            .setStrokeStyle(2, 0xffffff);
        const backText = this.add.text(0, 0, 'BACK', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);
        this.backButton.add([backBg, backText]);
        
        backBg.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                backBg.setFillStyle(0x880000, 0.8);
            })
            .on('pointerout', () => {
                backBg.setFillStyle(0x660000, 0.8);
            })
            .on('pointerdown', () => {
                this.goBack();
            });
        
        // Setup socket event listeners
        this.setupSocketEventListeners();
        
        // Prompt for username and lobby code automatically
        this.promptUsername();
    }
    
    /**
     * Prompt for username
     */
    private promptUsername() {
        // Using browser prompt for simplicity
        // In a real game, you would use a custom UI input field
        const username = prompt('Enter your username:', this.username || '');
        
        if (username) {
            this.username = username;
            this.usernameInput.setText(username);
            this.usernameInput.setColor('#ffffff');
        }
    }
    
    /**
     * Prompt for lobby code
     */
    private promptLobbyCode() {
        // Using browser prompt for simplicity
        const code = prompt('Enter lobby code:', this.lobbyCode || '');
        
        if (code) {
            this.lobbyCode = code;
            this.codeInput.setText(code);
            this.codeInput.setColor('#ffffff');
        }
    }
    
    /**
     * Join the lobby with the entered code
     */
    private joinLobby() {
        // Validate inputs
        if (!this.username) {
            this.statusText.setText('Please enter a username');
            return;
        }
        
        if (!this.lobbyCode) {
            this.statusText.setText('Please enter a lobby code');
            return;
        }
        
        // Clear any previous status
        this.statusText.setText('Connecting...');
        
        // Connect to socket server if not already connected
        if (!this.socketService.isConnected()) {
            this.socketService.connect()
                .then(() => {
                    this.attemptJoinLobby();
                })
                .catch(error => {
                    console.error('Failed to connect to server:', error);
                    this.statusText.setText('Failed to connect to server. Please try again.');
                });
        } else {
            this.attemptJoinLobby();
        }
    }
    
    /**
     * Attempt to join the lobby once connected
     */
    private attemptJoinLobby() {
        this.socketService.joinLobby(this.lobbyCode, this.username)
            .then(lobby => {
                console.log('Joined lobby:', lobby);
                this.statusText.setText('Joined lobby! Redirecting...');
                this.statusText.setColor('#00ff00');
                
                // Go to lobby scene with lobby data
                this.scene.start('LobbyScene', {
                    username: this.username,
                    isHost: false,
                    lobbyId: this.lobbyCode,
                    alreadyJoined: true,
                    lobbyData: lobby
                });
            })
            .catch(error => {
                console.error('Failed to join lobby:', error);
                this.statusText.setText(error.message || 'Failed to join lobby. Please check the code and try again.');
            });
    }
    
    /**
     * Set up socket event listeners
     */
    private setupSocketEventListeners() {
        this.socketService.on(SocketEvents.LOBBY_JOINED, () => {
            // This is handled by the join lobby promise
        });
        
        this.socketService.on(SocketEvents.ERROR, (error: any) => {
            console.error('Socket error:', error);
            this.statusText.setText(error.message || 'An error occurred');
        });
    }
    
    /**
     * Go back to main menu
     */
    private goBack() {
        this.scene.start('MainMenu');
    }
    
    /**
     * Clean up when shutting down the scene
     */
    shutdown() {
        // Remove all socket listeners to prevent memory leaks
        this.socketService.off(SocketEvents.LOBBY_JOINED);
        this.socketService.off(SocketEvents.ERROR);
    }
} 