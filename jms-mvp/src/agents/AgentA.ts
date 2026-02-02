import { JMSMessage, CreditApplication } from '../types/jms';
import { JMSMessageBuilder } from '../core/message';
import { JMSTransport } from '../core/transport';
import { JMSValidator } from '../core/validator';
import { CreditSchemas } from '../schemas/credit';

/**
 * AgentA - Orchestrator (Deep Implementation)
 * Manages the asynchronous flow and enforces strict schema contracts.
 */
export class AgentA {
    private agentId = 'AgentA';
    private responses: JMSMessage[] = [];

    constructor() {
        // Register schemas
        JMSValidator.registerSchema('jms.finance.credit.context.v1', CreditSchemas['jms.finance.credit.context.v1']);

        // Register transport listener
        JMSTransport.register(this.agentId, async (messageStr) => {
            const message: JMSMessage = JSON.parse(messageStr);

            if (message.Ω === 'consensus' && message.τ === 'k=2') {
                console.log(`🏁 [AgentA] Final Decision Received: ${message.data.decision} (Score: ${message.data.score.toFixed(3)})`);
            } else {
                console.log(`📥 [AgentA] Received analysis from ${message.agent}`);
                this.responses.push(message);
            }
        });
    }

    /**
     * Run the asynchronous credit approval process
     */
    async runProcess(application: CreditApplication, agentsB: string[], agentC: string): Promise<void> {
        console.log(`\n🚀 [AgentA] Starting process for ${application.applicant_id}`);
        this.responses = [];

        // 1. Validate Input Data
        const validation = JMSValidator.validate('jms.finance.credit.context.v1', {
            applicant_id: application.applicant_id,
            loan_amount: application.loan_amount,
            term_months: 36 // Hardcoded for simplicity
        });

        if (!validation.valid) {
            console.error(`❌ [AgentA] Input validation failed:`, validation.errors);
            return;
        }

        // 2. Build and Broadcast Request
        const request = JMSMessageBuilder.createRequest(
            this.agentId,
            'Finance::Credit',
            'stat_analysis',
            application,
            'jms.finance.credit.context.v1'
        );

        console.log(`📡 [AgentA] Broadcasting request to agents: ${agentsB.join(', ')}`);
        await JMSTransport.broadcast(agentsB, request);

        // 3. Wait for Responses (Deadline simulation)
        const deadline = request.deadline_ms || 3000;
        const start = Date.now();

        while (this.responses.length < request.quorum.expected && (Date.now() - start) < deadline) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        console.log(`⏱️  [AgentA] Collection finished. Received: ${this.responses.length}/${request.quorum.expected}`);

        // 4. Forward to AgentC
        if (this.responses.length >= request.quorum.minimum) {
            const forwardMsg = JMSMessageBuilder.createConsensusRequest(
                this.agentId,
                'Finance::Credit',
                this.responses
            );
            console.log(`➡️  [AgentA] Forwarding to Consensus Agent (${agentC})`);
            await JMSTransport.send(agentC, forwardMsg);
        } else {
            console.error(`❌ [AgentA] Quorum not met. Minimum: ${request.quorum.minimum}, Got: ${this.responses.length}`);
        }
    }
}
