import { JMSMessage, ConsensusResult } from '../types/jms';
import { JMSMessageBuilder } from '../core/message';
import { JMSTransport } from '../core/transport';
import { ConsensusEngine } from '../core/consensus';
import { JMSValidator } from '../core/validator';
import { CreditSchemas } from '../schemas/credit';

/**
 * AgentC - Consensus Engine (Deep Implementation)
 * Consolidates analysis results and enforces decision schemas.
 */
export class AgentC {
    private agentId = 'AgentC';

    constructor() {
        // Register output schema
        JMSValidator.registerSchema('jms.finance.credit.decision.v1', CreditSchemas['jms.finance.credit.decision.v1']);
    }

    /**
     * Start listening for consensus requests
     */
    public listen() {
        JMSTransport.register(this.agentId, async (messageStr) => {
            const message: JMSMessage = JSON.parse(messageStr);
            if (message.Ω === 'consensus') {
                await this.processConsensus(message);
            }
        });
    }

    private async processConsensus(message: JMSMessage) {
        console.log(`🎯 [AgentC] Consolidating ${message.data.length} analyses...`);

        // 1. Calculate Consensus using the Core Engine
        const analyses = message.data as JMSMessage[];
        const weights = {
            'stat_analysis': 1.0,
            'technical_analysis': 0.8,
            'trend_analysis': 0.9
        };

        const score = ConsensusEngine.calculate(analyses, weights);
        const confidence = ConsensusEngine.calculateConfidence(analyses, score);
        const lists = ConsensusEngine.getAgentLists(analyses);

        // 2. Map to Credit Decision Schema
        const decisionResult: ConsensusResult = {
            decision: ConsensusEngine.makeDecision(score, 0.7, 0.05),
            score: score,
            confidence: confidence,
            contributing_agents: lists.contributing,
            excluded_agents: lists.excluded,
            rationale: `Consensus reached with ${lists.contributing.length} valid agents. System parity: ${(confidence * 100).toFixed(1)}%`
        };

        // 3. Validate Final Decision
        const validation = JMSValidator.validate('jms.finance.credit.decision.v1', {
            decision: decisionResult.decision,
            consensus_score: decisionResult.score,
            confidence: decisionResult.confidence,
            rationale: decisionResult.rationale
        });

        let response: JMSMessage;
        if (validation.valid) {
            response = JMSMessageBuilder.createResponse(
                this.agentId,
                message,
                decisionResult,
                confidence,
                'jms.finance.credit.decision.v1'
            );
            response.τ = 'k=2'; // Consensus stage
        } else {
            console.error(`❌ [AgentC] Final decision validation failed:`, validation.errors);
            response = JMSMessageBuilder.createError(
                this.agentId,
                message,
                'JMS-422',
                `Consensus output invalid: ${validation.errors?.join(', ')}`
            );
        }

        // 4. Send Result back to Orchestrator (AgentA)
        await JMSTransport.send(message.agent, response);
    }
}
