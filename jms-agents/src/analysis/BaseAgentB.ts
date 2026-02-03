import { JMSMessage } from '../../../jms-core/src/types/jms';
import { JMSMessageBuilder } from '../../../jms-core/src/core/message';
import { IJMTSTransport } from '../../../jms-transport/src/transport';
import { JMSValidator } from '../../../jms-core/src/core/validator';

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
        const data = message.data as T;
        const { result, evolution } = await this.analyze(data);

        const response = JMSMessageBuilder.createResponse(
            this.agentId,
            message,
            result,
            this.lambda,
            message.schema, // Reuse incoming schema or provide default
            evolution
        );

        await this.transport.send(message.agent, response);
    }

    protected abstract analyze(data: T): Promise<{
        result: { score: number; rationale: string; metrics?: any };
        evolution?: any[];
    }>;
}
