import { JMSMessage, ConsensusResult } from '../../../jms-core/src/types/jms';
import { JMSMessageBuilder } from '../../../jms-core/src/core/message';
import { ConsensusEngine } from '../../../jms-core/src/core/consensus';
import { IJMTSTransport } from '../../../jms-transport/src/transport';
import { CognitiveAggregator } from '../../../jms-learning/src/learning/aggregator';

export interface AgentCConfig {
    agentId?: string;
    threshold?: number;
    margin?: number;
    weights?: Record<string, number>;
}

export class AgentC {
    private agentId: string;
    private transport: IJMTSTransport;
    private config: Required<AgentCConfig>;

    constructor(transport: IJMTSTransport, config: AgentCConfig = {}) {
        this.transport = transport;
        this.agentId = config.agentId || 'AgentC';
        this.config = {
            agentId: this.agentId,
            threshold: config.threshold ?? 0.7,
            margin: config.margin ?? 0.05,
            weights: config.weights ?? {}
        };
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

        // Use CognitiveAggregator from jms-learning to get adjustments
        const adjustment = CognitiveAggregator.getAjustmentCallback(analyses);

        const score = ConsensusEngine.calculate(analyses, this.config.weights, adjustment);
        const confidence = ConsensusEngine.calculateConfidence(analyses, score);
        const lists = ConsensusEngine.getAgentLists(analyses);

        const decisionResult: ConsensusResult = {
            decision: ConsensusEngine.makeDecision(score, this.config.threshold, this.config.margin),
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
            message.schema // Maintain schema continuity
        );
        response.τ = 'k=2';

        await this.transport.send(message.agent, response);
    }
}
