import { Scene, GameObjects } from 'phaser';

/**
 * Notification types
 */
export enum NotificationType {
    INFO = 'info',
    SUCCESS = 'success',
    WARNING = 'warning',
    ERROR = 'error'
}

/**
 * Notification position
 */
export enum NotificationPosition {
    TOP = 'top',
    MIDDLE = 'middle',
    BOTTOM = 'bottom'
}

/**
 * Notification options
 */
export interface NotificationOptions {
    type?: NotificationType;
    position?: NotificationPosition;
    duration?: number;
    width?: number;
    fontSize?: string;
}

/**
 * Default notification options
 */
const defaultOptions: NotificationOptions = {
    type: NotificationType.INFO,
    position: NotificationPosition.TOP,
    duration: 3000,
    width: 500,
    fontSize: '18px'
};

/**
 * Notification manager for displaying in-game notifications
 */
export class NotificationManager {
    private scene: Scene;
    private notifications: GameObjects.Container[] = [];
    private maxNotifications: number = 3;
    
    /**
     * Create a new notification manager
     * @param scene The scene to add notifications to
     */
    constructor(scene: Scene) {
        this.scene = scene;
    }
    
    /**
     * Show a notification
     * @param message The message to display
     * @param options Notification options
     */
    public show(message: string, options?: NotificationOptions): void {
        const opts = { ...defaultOptions, ...options };
        
        // Remove oldest notification if too many
        if (this.notifications.length >= this.maxNotifications) {
            const oldest = this.notifications.shift();
            if (oldest) {
                oldest.destroy();
            }
        }
        
        // Create notification container
        const container = this.scene.add.container(0, 0);
        container.setDepth(1000); // Always on top
        
        // Get position
        const { x, y } = this.getPosition(opts.position!);
        container.setPosition(x, y);
        
        // Add background
        const backgroundColor = this.getBackgroundColor(opts.type!);
        const bg = this.scene.add.rectangle(0, 0, opts.width!, 60, backgroundColor, 0.8)
            .setStrokeStyle(2, 0xffffff);
        container.add(bg);
        
        // Add message text
        const text = this.scene.add.text(0, 0, message, {
            fontSize: opts.fontSize,
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: opts.width! - 40 }
        }).setOrigin(0.5, 0.5);
        container.add(text);
        
        // Add to notifications array
        this.notifications.push(container);
        
        // Update positions of all notifications
        this.updatePositions();
        
        // Set a timer to remove the notification
        this.scene.time.delayedCall(opts.duration!, () => {
            const index = this.notifications.indexOf(container);
            if (index !== -1) {
                this.notifications.splice(index, 1);
                container.destroy();
                this.updatePositions();
            }
        });
    }
    
    /**
     * Get background color based on notification type
     */
    private getBackgroundColor(type: NotificationType): number {
        switch (type) {
            case NotificationType.INFO:
                return 0x2244aa;
            case NotificationType.SUCCESS:
                return 0x22aa44;
            case NotificationType.WARNING:
                return 0xaaaa22;
            case NotificationType.ERROR:
                return 0xaa2222;
            default:
                return 0x2244aa;
        }
    }
    
    /**
     * Get position based on notification position
     */
    private getPosition(position: NotificationPosition): { x: number, y: number } {
        // Center X
        const x = this.scene.cameras.main.width / 2;
        
        let y: number;
        switch (position) {
            case NotificationPosition.TOP:
                y = 80;
                break;
            case NotificationPosition.MIDDLE:
                y = this.scene.cameras.main.height / 2;
                break;
            case NotificationPosition.BOTTOM:
                y = this.scene.cameras.main.height - 80;
                break;
            default:
                y = 80;
                break;
        }
        
        return { x, y };
    }
    
    /**
     * Update positions of all notifications
     */
    private updatePositions(): void {
        const position = this.getPosition(NotificationPosition.TOP);
        const spacing = 70;
        
        this.notifications.forEach((notification, index) => {
            const y = position.y + (index * spacing);
            notification.y = y;
        });
    }
    
    /**
     * Clear all notifications
     */
    public clear(): void {
        this.notifications.forEach(notification => {
            notification.destroy();
        });
        this.notifications = [];
    }
} 