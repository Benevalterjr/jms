import { JMSMessage } from '../types/jms';

/**
 * JMS-T: Asynchronous Transport Layer Simulation
 * Simulates network latency and JSON serialization/deserialization
 */
export class JMSTransport {
    private static handlers: Map<string, (message: string) => Promise<void>> = new Map();

    /**
     * Register an agent's listener
     */
    static register(agentId: string, handler: (message: string) => Promise<void>) {
        this.handlers.set(agentId, handler);
        console.log(`📡 [Transport] Agent ${agentId} registered`);
    }

    /**
     * Send a message over the "wire"
     */
    static async send(recipientId: string, message: JMSMessage): Promise<void> {
        const handler = this.handlers.get(recipientId);

        if (!handler) {
            console.error(`❌ [Transport] Recipient ${recipientId} not found`);
            return;
        }

        // Simulate "Wire" Serialization
        const serialized = JSON.stringify(message);

        // Simulate Network Latency (10ms to 150ms)
        const latency = Math.floor(Math.random() * 140) + 10;

        return new Promise((resolve) => {
            setTimeout(async () => {
                // console.log(`🚚 [Transport] Delivered to ${recipientId} (${latency}ms delay)`);
                await handler(serialized);
                resolve();
            }, latency);
        });
    }

    /**
     * Broadcast a message to multiple recipients
     */
    static async broadcast(recipientIds: string[], message: JMSMessage): Promise<void[]> {
        return Promise.all(recipientIds.map(id => this.send(id, message)));
    }
}
