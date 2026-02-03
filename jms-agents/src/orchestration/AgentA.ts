import { JMSMessage, ConsensusResult } from '../../../jms-core/src/types/jms';
import { JMSMessageBuilder } from '../../../jms-core/src/core/message';
import { IJMTSTransport } from '../../../jms-transport/src/transport';
import { JMSValidator } from '../../../jms-core/src/core/validator';
import { SecurityUtils } from '../../../jms-core/src/core/security';

export class AgentA {
    private agentId = 'AgentA';
    private responses: JMSMessage[] = [];
    private transport: IJMTSTransport;

    constructor(transport: IJMTSTransport) {
        this.transport = transport;

        this.transport.register(this.agentId, async (messageStr: string) => {
            const message: JMSMessage = JSON.parse(messageStr);

            // 1. Verify Integrity
            if (!SecurityUtils.verifyHash(message, message.security.hash)) {
                console.error(`🔒 [AgentA] Security Alert: Received message with invalid hash! From: ${message.agent}`);
                return; // Drop malicious message
            }

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
        schema: string = 'jms.generic.task.v1',
        quorumOverride?: { expected: number, minimum: number }
    ): Promise<void> {
        this.responses = [];
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

        // Wait for quorum (with timeout)
        const deadline = request.deadline_ms || 3000;
        const start = Date.now();

        // Dynamic wait logic: Finish as soon as we hit EXPECTED, or timeout if we at least hit MINIMUM
        while ((Date.now() - start) < deadline) {
            if (this.responses.length >= request.quorum.expected) break;

            // Optional: If in real-time mode, we could break at 'minimum' too
            // if (this.responses.length >= request.quorum.minimum && SecurityUtils.currentLevel === SecurityLevel.NONE) break;

            await new Promise(resolve => setTimeout(resolve, 10)); // Faster polling for perf
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
