import { JMSMessage } from '../../jms-core/src/types/jms';

export interface IJMTSTransport {
    register(agentId: string, callback: (message: string) => Promise<void>): void;
    send(targetAgent: string, message: JMSMessage): Promise<void>;
    broadcast(agents: string[], message: JMSMessage): Promise<void>;
}

/**
 * Mock Transport Implementation
 * 
 * ⚠️ WARNING: This implementation is for DEMONSTRATION purposes only.
 * It uses in-memory callbacks and local timeouts to simulate network behavior.
 * 
 * For PRODUCTION environments, implement IJMTSTransport using:
 * - Message Brokers (Apache Kafka, RabbitMQ)
 * - Remote Procedure Calls (gRPC)
 * - Distributed Queues (SQS, Redis)
 */
export class MockTransport implements IJMTSTransport {
    private static listeners: Map<string, (message: string) => Promise<void>> = new Map();
    private static dlq: { target: string, message: JMSMessage, timestamp: number }[] = [];

    register(agentId: string, callback: (message: string) => Promise<void>): void {
        MockTransport.listeners.set(agentId, callback);
    }

    async send(targetAgent: string, message: JMSMessage): Promise<void> {
        const callback = MockTransport.listeners.get(targetAgent);

        if (callback) {
            // Emulate explicit serialization/deserialization over network
            const serialized = JSON.stringify(message);

            // Simulate network latency (async delivery)
            setTimeout(async () => {
                try {
                    await callback(serialized);
                } catch (error) {
                    console.error(`❌ [Transport] Delivery failed at Agent ${targetAgent}:`, error);
                }
            }, 50);
        } else {
            // BACKGROUND PROCESSING: Move logging/DLQ out of critical path
            setImmediate(() => {
                const errorMsg = `⚠️ [Transport] Target agent '${targetAgent}' not found. Message sent to DLQ.`;
                console.warn(errorMsg);

                MockTransport.dlq.push({
                    target: targetAgent,
                    message,
                    timestamp: Date.now()
                });
            });
        }
    }

    async broadcast(agents: string[], message: JMSMessage): Promise<void> {
        // Parallel distribution
        await Promise.all(agents.map(agent => this.send(agent, message)));
    }

    /**
     * Inspect messages that failed to reach their target
     */
    public static getDLQ() {
        return [...this.dlq];
    }

    public static clearDLQ() {
        this.dlq = [];
    }

    /**
     * Attempts to re-send all messages currently in the DLQ.
     */
    public static async retryDLQ(transport: IJMTSTransport) {
        const failedMessages = [...this.dlq];
        this.clearDLQ();

        for (const entry of failedMessages) {
            console.log(`🔄 [Transport] Retrying message for ${entry.target}...`);
            await transport.send(entry.target, entry.message);
        }
    }
}
