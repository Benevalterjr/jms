import { BaseAgentB } from './BaseAgentB';
import { CreditApplication } from '../types/jms';

/**
 * AgentPersistent - Maintains a very stable opinion with minimal changes.
 * Used to test Trajectory Boost.
 */
export class AgentPersistent extends BaseAgentB {
    protected agentId = 'Agent_Persistent';
    protected lambda = 1.0;

    protected async analyze(app: CreditApplication) {
        const score = 0.75;

        const evolution = [
            { timestamp: Date.now() - 200, score: 0.74, λ: 0.8, rationale: 'Initial scan' },
            { timestamp: Date.now() - 100, score: 0.75, λ: 1.0, rationale: 'Confirmation' },
            { timestamp: Date.now(), score: 0.75, λ: 1.2, rationale: 'Final persistent score' }
        ];

        return {
            result: {
                score,
                rationale: 'Very stable analysis with full persistence.',
                metrics: { persistence_lvl: 100 }
            },
            evolution
        };
    }
}
