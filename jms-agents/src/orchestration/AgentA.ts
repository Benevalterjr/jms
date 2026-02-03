import { JMSMessage, ConsensusResult } from '../../../jms-core/src/types/jms';
import { JMSMessageBuilder } from '../../../jms-core/src/core/message';
import { IJMTSTransport } from '../../../jms-transport/src/transport';
import { JMSValidator } from '../../../jms-core/src/core/validator';
import { SecurityUtils } from '../../../jms-core/src/core/security';

export class AgentA {
    private agentId = 'AgentA';
    private responses: JMSMessage[] = [];
    private transport: IJMTSTransport;
    private consensusFinished = false;
    private finalResult: ConsensusResult | null = null;

    constructor(transport: IJMTSTransport) {
        this.transport = transport;

        this.transport.register(this.agentId, async (messageStr: string) => {
            const message: JMSMessage = JSON.parse(messageStr);

            // 1. Verify Integrity
            if (!SecurityUtils.verifyHash(message, message.security.hash)) {
                console.error(`🔒 [AgentA] Security Alert: Received message with invalid hash! From: ${message.agent}`);
                return;
            }

            if (message.Ω === 'analysis') {
                this.responses.push(message);
            } else if (message.Ω === 'consensus' || (message.data && (message.data as any).decision)) {
                this.finalResult = message.data as ConsensusResult;
                console.log(`🏁 [AgentA] Final Decision Received: ${this.finalResult.decision} (Score: ${this.finalResult.score.toFixed(3)})`);
                this.consensusFinished = true;
            }
        });
    }

    async runProcess(
        data: any,
        agentsB: string[],
        agentC: string,
        domain: string = 'Generic::Task',
        schema: string = 'jms.generic.task.v1',
        quorumOverride?: { expected: number, minimum: number }
    ): Promise<ConsensusResult | null> {
        this.responses = [];
        this.consensusFinished = false;
        this.finalResult = null;

        const request = JMSMessageBuilder.create({
            ref: `task#${SecurityUtils.generateNonce().substring(0, 8)}`,
            agent: this.agentId,
            domain,
            operation: 'analysis',
            data,
            schema,
            lambda: 1.0,
            tau: 'k=1',
            quorum: quorumOverride || { expected: agentsB.length, minimum: Math.ceil(agentsB.length / 2) }
        });

        await this.transport.broadcast(agentsB, request);

        const deadline = request.deadline_ms || 5000;
        const start = Date.now();

        while ((Date.now() - start) < deadline) {
            if (this.responses.length >= request.quorum.expected) break;
            await new Promise(resolve => setTimeout(resolve, 20));
        }

        if (this.responses.length >= request.quorum.minimum) {
            const forwardMsg = JMSMessageBuilder.createConsensusRequest(
                this.agentId,
                domain,
                this.responses
            );
            await this.transport.send(agentC, forwardMsg);

            // Wait for final consensus from C
            while ((Date.now() - start) < deadline + 2000) {
                if (this.consensusFinished) break;
                await new Promise(resolve => setTimeout(resolve, 20));
            }
        }

        return this.finalResult;
    }
}
