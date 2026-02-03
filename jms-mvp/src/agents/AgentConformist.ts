import { BaseAgentB } from './BaseAgentB';
import { CreditApplication } from '../types/jms';

/**
 * AgentConformist - Blindly follows another agent or a fixed pattern.
 * Used to test conformity detection.
 */
export class AgentConformist extends BaseAgentB {
    protected agentId: string;
    protected lambda = 1.0;

    constructor(id: string) {
        super();
        this.agentId = id;
    }

    protected async analyze(app: CreditApplication) {
        // Fixed "conformist" response pattern
        const score = 0.85;

        const evolution = [
            { timestamp: Date.now() - 100, score: 0.8, λ: 0.5, rationale: 'Initial scan' },
            { timestamp: Date.now(), score: 0.85, λ: 1.0, rationale: 'Standard confirmation' }
        ];

        return {
            result: {
                score,
                rationale: 'Follows standard criteria',
                metrics: { conformity_score: 1.0 }
            },
            evolution
        };
    }
}
