import { JMSMessage, ConsensusResult } from '../../../jms-core/src/types/jms';
import { JMSMessageBuilder } from '../../../jms-core/src/core/message';
import { ConsensusEngine } from '../../../jms-core/src/core/consensus';
import { IJMTSTransport } from '../../../jms-transport/src/transport';
import { CognitiveAggregator } from '../../../jms-learning/src/learning/aggregator';
import { JMSValidator } from '../../../jms-core/src/core/validator';

import { SecurityUtils } from '../../../jms-core/src/core/security';

export interface AgentCConfig {
    agentId?: string;
    threshold?: number;
    margin?: number;
    weights?: Record<string, number>;
    strict?: boolean;
    samplingRate?: number; // 0.0 to 1.0
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
            weights: config.weights ?? {},
            strict: config.strict ?? false,
            samplingRate: config.samplingRate ?? 1.0
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
        // 1. Integrity Verification
        if (!SecurityUtils.verifyHash(message, message.security.hash)) {
            console.error(`🔒 [AgentC] Security Alert: Hash mismatch detected on consensus request!`);
            const error = JMSMessageBuilder.createError(this.agentId, message, 'JMS-403', 'Integrity check failed');
            await this.transport.send(message.agent, error);
            return;
        }

        // 2. Schema Validation (Consensus Payload)
        const validation = JMSValidator.validate(message.schema, message.data, this.config.strict);
        if (!validation.valid) {
            console.warn(`⚠️ [AgentC] Validation Error: ${validation.errors?.join(', ')}`);
            const error = JMSMessageBuilder.createError(this.agentId, message, 'JMS-422', validation.errors?.join(', ') || 'Schema validation failed');
            await this.transport.send(message.agent, error);
            return;
        }

        let analyses = message.data as JMSMessage[];

        // 3. SCALABILITY: Sampling
        if (this.config.samplingRate < 1.0 && analyses.length > 10) {
            const sampleSize = Math.max(10, Math.floor(analyses.length * this.config.samplingRate));
            analyses = analyses.sort(() => 0.5 - Math.random()).slice(0, sampleSize);
            console.log(`⚖️ [AgentC] Sampling active: processing ${sampleSize}/${message.data.length} agents.`);
        }

        // 4. SCALABILITY: Bubbling (Recursive depth support)
        // If an input is already a ConsensusResult (not raw score), the engine handles it.
        // We ensure data is normalized for the engine.

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
            rationale: `Consensus reached with ${analyses.length} signals (Hierarchical Ready).`
        };

        const response = JMSMessageBuilder.createResponse(
            this.agentId,
            message,
            decisionResult,
            confidence,
            message.schema,
            undefined, // no evolution for C
            'k=2'
        );

        await this.transport.send(message.agent, response);
    }
}
