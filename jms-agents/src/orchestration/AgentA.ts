import { JMSMessage, ConsensusResult } from '../../../jms-core/src/types/jms';
import { JMSMessageBuilder } from '../../../jms-core/src/core/message';
import { IJMTSTransport } from '../../../jms-transport/src/transport';
import { JMSValidator } from '../../../jms-core/src/core/validator';

export class AgentA {
    private agentId = 'AgentA';
    private responses: JMSMessage[] = [];
    private transport: IJMTSTransport;

    constructor(transport: IJMTSTransport) {
        this.transport = transport;

        this.transport.register(this.agentId, async (messageStr: string) => {
            const message: JMSMessage = JSON.parse(messageStr);
            if (message.Ω !== 'consensus') {
                this.responses.push(message);
            } else if (message.data && message.data.decision) {
                const res = message.data as ConsensusResult;
                console.log(`🏁 [AgentA] Final Decision Received: ${res.decision} (Score: ${res.score.toFixed(3)})`);
            }
        });
    }

    async runProcess(
        data: any,
        agentsB: string[],
        agentC: string,
        domain: string = 'Generic::Task',
        schema: string = 'jms.generic.task.v1'
    ): Promise<void> {
        this.responses = [];
        const request = JMSMessageBuilder.createRequest(
            this.agentId,
            domain,
            'analysis',
            data,
            schema
        );

        await this.transport.broadcast(agentsB, request);

        // Wait for quorum (with timeout)
        const deadline = request.deadline_ms || 3000;
        const start = Date.now();
        while (this.responses.length < request.quorum.expected && (Date.now() - start) < deadline) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        if (this.responses.length >= request.quorum.minimum) {
            const forwardMsg = JMSMessageBuilder.createConsensusRequest(
                this.agentId,
                domain,
                this.responses
            );
            await this.transport.send(agentC, forwardMsg);
        }
    }
}
