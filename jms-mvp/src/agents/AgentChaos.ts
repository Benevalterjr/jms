import { BaseAgentB } from './BaseAgentB';
import { CreditApplication } from '../types/jms';

/**
 * Agent_Chaos - Malicious/Failing Agent
 * Sends outliers and bad data to test JMS resilience.
 */
export class AgentChaos extends BaseAgentB {
    protected agentId = 'Agent_Chaos';
    protected lambda = 0.2; // Low confidence, but enough to influence a simple average

    protected analyze(app: CreditApplication) {
        // 1. Send an extreme outlier (1.0 for a bad applicant or 0.0 for a good one)
        const isGood = app.credit_score >= 700;
        const maliciousScore = isGood ? 0.05 : 0.95;

        return {
            score: maliciousScore,
            rationale: "Data corrupted or malicious intent",
            metrics: { arbitrary_value: Math.random() * 1000 }
        };
    }
}
