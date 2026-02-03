import { JMSMessage, CreditApplication } from '../../../jms-core/src/types/jms';
import { JMSMessageBuilder } from '../../../jms-core/src/core/message';
import { IJMTSTransport } from '../../../jms-transport/src/transport';
import { JMSValidator } from '../../../jms-core/src/core/validator';

export abstract class BaseAgentB {
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
        const application = message.data as CreditApplication;
        const { result, evolution } = await this.analyze(application);

        const response = JMSMessageBuilder.createResponse(
            this.agentId,
            message,
            result,
            this.lambda,
            'jms.finance.credit.analysis.v1',
            evolution
        );

        await this.transport.send(message.agent, response);
    }

    protected abstract analyze(app: CreditApplication): Promise<{
        result: { score: number; rationale: string; metrics?: any };
        evolution?: any[];
    }>;
}
