import { BaseAgentB } from './BaseAgentB';
import { CreditApplication } from '../types/jms';

/**
 * AgentFluctuating - Oscillates between scores before settling.
 * Used to test Fluctuation Penalty.
 */
export class AgentFluctuating extends BaseAgentB {
    protected agentId = 'Agent_Fluctuating';
    protected lambda = 1.0;

    protected async analyze(app: CreditApplication) {
        // Settles on the same score as AgentPersistent, but after an erratic path.
        const score = 0.75;

        const evolution = [
            { timestamp: Date.now() - 300, score: 0.4, λ: 0.5, rationale: 'Initial doubt' },
            { timestamp: Date.now() - 200, score: 0.9, λ: 0.8, rationale: 'Sudden optimism' },
            { timestamp: Date.now() - 100, score: 0.6, λ: 0.7, rationale: 'Correction' },
            { timestamp: Date.now(), score: 0.75, λ: 1.0, rationale: 'Final settle' }
        ];

        return {
            result: {
                score,
                rationale: 'Arrived at conclusion after significant fluctuation.',
                metrics: { fluctuation_lvl: 80 }
            },
            evolution
        };
    }
}
