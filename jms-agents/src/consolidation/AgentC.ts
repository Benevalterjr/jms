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
    samplingRate?: number; // 0.0 to 1.0 (initial batch)
    dynamicSampling?: boolean;
    entropyThreshold?: number; // Variance limit before expansion
    qualityPriority?: boolean; // Prioritize high-lambda agents for expansion
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
            samplingRate: config.samplingRate ?? 1.0,
            dynamicSampling: config.dynamicSampling ?? false,
            entropyThreshold: config.entropyThreshold ?? 0.05,
            qualityPriority: config.qualityPriority ?? false
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

    private calculateEntropy(messages: JMSMessage[]): number {
        const scores = messages.map(m => m.data.score || 0);
        if (scores.length < 2) return 0;
        const mean = scores.reduce((a, b) => a + b) / scores.length;
        const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
        return variance;
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

        const allAnalyses = message.data as JMSMessage[];
        let currentAnalyses: JMSMessage[] = [];
        let initialSampleSize = allAnalyses.length;
        let stages = 1;
        let entropy = 0;

        // 3. SCALABILITY: Dynamic & Quality Sampling
        if (this.config.samplingRate < 1.0 && allAnalyses.length > 10) {
            initialSampleSize = Math.max(10, Math.floor(allAnalyses.length * this.config.samplingRate));

            // Sort pool based on quality priority if enabled
            const pool = [...allAnalyses];
            if (this.config.qualityPriority) {
                // Keep highest lambda agents for the top of the pool
                pool.sort((a, b) => b.λ - a.λ);
            } else {
                pool.sort(() => 0.5 - Math.random());
            }

            currentAnalyses = pool.slice(0, initialSampleSize);
            entropy = this.calculateEntropy(currentAnalyses);

            if (this.config.dynamicSampling) {
                while (entropy > this.config.entropyThreshold && currentAnalyses.length < allAnalyses.length) {
                    stages++;
                    const expansionSize = Math.ceil(allAnalyses.length * 0.1); // Add 10% more
                    const nextBatch = pool.slice(currentAnalyses.length, currentAnalyses.length + expansionSize);
                    currentAnalyses = [...currentAnalyses, ...nextBatch];
                    entropy = this.calculateEntropy(currentAnalyses);

                    const avgLambda = currentAnalyses.reduce((sum, m) => sum + m.λ, 0) / currentAnalyses.length;
                    console.log(`⚖️ [AgentC] Stage ${stages}: Sample increased to ${currentAnalyses.length}. Entropy: ${entropy.toFixed(4)}. Avg λ: ${avgLambda.toFixed(2)}`);
                }
            }
            console.log(`⚖️ [AgentC] Consensus finalized: ${currentAnalyses.length}/${allAnalyses.length} agents in ${stages} stages.`);
        } else {
            currentAnalyses = allAnalyses;
            entropy = this.calculateEntropy(currentAnalyses);
        }

        // 4. Consensus Calculation
        const adjustment = CognitiveAggregator.getAjustmentCallback(currentAnalyses);
        const score = ConsensusEngine.calculate(currentAnalyses, this.config.weights, adjustment);
        const confidence = ConsensusEngine.calculateConfidence(currentAnalyses, score);
        const lists = ConsensusEngine.getAgentLists(currentAnalyses);

        const decisionResult: ConsensusResult = {
            decision: ConsensusEngine.makeDecision(score, this.config.threshold, this.config.margin),
            score: score,
            confidence: confidence,
            contributing_agents: lists.contributing,
            excluded_agents: lists.excluded,
            rationale: `Consensus reached with ${currentAnalyses.length} signals (Quality Expansion: ${this.config.qualityPriority}).`,
            sampling_metadata: {
                initial_sample: initialSampleSize,
                final_sample: currentAnalyses.length,
                entropy: entropy,
                stages: stages
            }
        };

        const response = JMSMessageBuilder.createResponse(
            this.agentId,
            message,
            decisionResult,
            confidence,
            message.schema,
            undefined,
            'k=2'
        );

        await this.transport.send(message.agent, response);
    }
}
