import { JMSMessage, CreditApplication } from '../types/jms';
import { JMSMessageBuilder } from '../core/message';
import { JMSTransport } from '../core/transport';
import { JMSValidator } from '../core/validator';
import { CreditSchemas } from '../schemas/credit';

export abstract class BaseAgentB {
    protected abstract agentId: string;
    protected abstract lambda: number;

    constructor() {
        // Register output schema
        JMSValidator.registerSchema('jms.finance.credit.analysis.v1', CreditSchemas['jms.finance.credit.analysis.v1']);
    }

    /**
     * Start listening for messages
     */
    public listen() {
        // Register transport listener
        JMSTransport.register(this.agentId, async (messageStr) => {
            const message: JMSMessage = JSON.parse(messageStr);
            // console.log(`📥 [${this.agentId}] Received request for ${message.ref}`);
            await this.processRequest(message);
        });
    }

    protected async processRequest(message: JMSMessage) {
        const application = message.data as CreditApplication;

        // 1. Execute Analysis (Logic defined in subclass)
        const { result, evolution } = await this.analyze(application);

        // 2. Validate Own Output
        const validation = JMSValidator.validate('jms.finance.credit.analysis.v1', result);

        let response: JMSMessage;
        if (validation.valid) {
            response = JMSMessageBuilder.createResponse(
                this.agentId,
                message,
                result,
                this.lambda,
                'jms.finance.credit.analysis.v1',
                evolution
            );
        } else {
            console.error(`❌ [${this.agentId}] Output validation failed:`, validation.errors);
            response = JMSMessageBuilder.createError(
                this.agentId,
                message,
                'JMS-422',
                `Validation failed: ${validation.errors?.join(', ')}`
            );
        }

        // 3. Send Response Back to Orchestrator (AgentA)
        // console.log(`📤 [${this.agentId}] Sending response for ${message.ref}`);
        await JMSTransport.send(message.agent, response);
    }

    protected abstract analyze(app: CreditApplication): Promise<{
        result: { score: number; rationale: string; metrics?: any };
        evolution?: any[];
    }>;
}
