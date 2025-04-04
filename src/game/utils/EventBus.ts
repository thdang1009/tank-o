/**
 * Event bus for game-wide communication
 */
export class EventBus {
    private static instance: EventBus;
    private events: Map<string, Function[]>;
    
    /**
     * Create a new event bus
     */
    private constructor() {
        this.events = new Map<string, Function[]>();
    }
    
    /**
     * Get the singleton instance
     */
    public static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }
    
    /**
     * Add an event listener
     * @param event Event name
     * @param callback Callback function
     */
    public on(event: string, callback: Function): void {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        
        const callbacks = this.events.get(event)!;
        callbacks.push(callback);
    }
    
    /**
     * Remove an event listener
     * @param event Event name
     * @param callback Callback function
     */
    public off(event: string, callback: Function): void {
        if (!this.events.has(event)) {
            return;
        }
        
        const callbacks = this.events.get(event)!;
        const index = callbacks.indexOf(callback);
        
        if (index !== -1) {
            callbacks.splice(index, 1);
        }
        
        // Remove event from map if no callbacks remain
        if (callbacks.length === 0) {
            this.events.delete(event);
        }
    }
    
    /**
     * Emit an event
     * @param event Event name
     * @param args Arguments to pass to callbacks
     */
    public emit(event: string, ...args: any[]): void {
        if (!this.events.has(event)) {
            return;
        }
        
        const callbacks = this.events.get(event)!;
        callbacks.forEach(callback => {
            callback(...args);
        });
    }
    
    /**
     * Clear all event listeners
     */
    public clear(): void {
        this.events.clear();
    }
} 