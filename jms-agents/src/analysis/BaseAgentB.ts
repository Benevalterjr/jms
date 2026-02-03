import { JMSMessage } from '../../../jms-core/src/types/jms';
import { JMSMessageBuilder } from '../../../jms-core/src/core/message';
import { IJMTSTransport } from '../../../jms-transport/src/transport';
import { JMSValidator } from '../../../jms-core/src/core/validator';
import { SecurityUtils } from '../../../jms-core/src/core/security';

export abstract class BaseAgentB<T = any> {
    protected abstract agentId: string;
    protected abstract lambda: number;
    protected transport: IJMTSTransport;

    constructor(transport: IJMTSTransport) {
        this.transport = transport;
    }

    public listen() {
        this.transport.register(this.agentId, async (messageStr: string) => {
            const message: JMSMessage = JSON.parse(messageStr);
            await this.processRequest(message);
        });
    }

    protected async processRequest(message: JMSMessage) {
        // 1. Integrity Verification
        const isValidHash = SecurityUtils.verifyHash(message, message.security.hash);
        if (!isValidHash) {
            console.error(`🔒 [${this.agentId}] Security Alert: Hash mismatch detected!`);
            const error = JMSMessageBuilder.createError(this.agentId, message, 'JMS-403', 'Integrity check failed');
            await this.transport.send(message.agent, error);
            return;
        }

        // 2. Schema Validation
        const validation = JMSValidator.validate(message.schema, message.data);
        if (!validation.valid) {
            console.warn(`⚠️ [${this.agentId}] Validation Error: ${validation.errors?.join(', ')}`);
            const error = JMSMessageBuilder.createError(this.agentId, message, 'JMS-422', validation.errors?.join(', ') || 'Schema validation failed');
            await this.transport.send(message.agent, error);
            return;
        }

        const data = message.data as T;
        const { result, evolution } = await this.analyze(data);

        const response = JMSMessageBuilder.createResponse(
            this.agentId,
            message,
            result,
            this.lambda,
            message.schema,
            evolution
        );

        await this.transport.send(message.agent, response);
    }

    protected abstract analyze(data: T): Promise<{
        result: { score: number; rationale: string; metrics?: any };
        evolution?: any[];
    }>;
}
