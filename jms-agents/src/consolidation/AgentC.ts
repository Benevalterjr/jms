import { JMSMessage, ConsensusResult } from '../../../jms-core/src/types/jms';
import { JMSMessageBuilder } from '../../../jms-core/src/core/message';
import { ConsensusEngine } from '../../../jms-core/src/core/consensus';
import { IJMTSTransport } from '../../../jms-transport/src/transport';
import { CognitiveAggregator } from '../../../jms-learning/src/learning/aggregator';

export class AgentC {
    private agentId = 'AgentC';
    private transport: IJMTSTransport;

    constructor(transport: IJMTSTransport) {
        this.transport = transport;
    }

    public listen() {
        this.transport.register(this.agentId, async (messageStr: string) => {
            const message: JMSMessage = JSON.parse(messageStr);
            if (message.Ω === 'consensus') {
                await this.processConsensus(message);
            }
        });
    }

    private async processConsensus(message: JMSMessage) {
        const analyses = message.data as JMSMessage[];
        const weights = { 'stat_analysis': 1.0 };

        // Use CognitiveAggregator from jms-learning to get adjustments
        const adjustment = CognitiveAggregator.getAjustmentCallback(analyses);

        const score = ConsensusEngine.calculate(analyses, weights, adjustment);
        const confidence = ConsensusEngine.calculateConfidence(analyses, score);
        const lists = ConsensusEngine.getAgentLists(analyses);

        const decisionResult: ConsensusResult = {
            decision: ConsensusEngine.makeDecision(score, 0.7, 0.05),
            score: score,
            confidence: confidence,
            contributing_agents: lists.contributing,
            excluded_agents: lists.excluded,
            rationale: `Consensus reached with modular cognitive signals.`
        };

        const response = JMSMessageBuilder.createResponse(
            this.agentId,
            message,
            decisionResult,
            confidence,
            'jms.finance.credit.decision.v1'
        );
        response.τ = 'k=2';

        await this.transport.send(message.agent, response);
    }
}
