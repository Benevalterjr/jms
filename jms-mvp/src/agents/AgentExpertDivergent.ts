import { BaseAgentB } from './BaseAgentB';
import { CreditApplication } from '../types/jms';

/**
 * AgentExpertDivergent - Provides a highly divergent but very stable analysis.
 * Should be rewarded by the ConsensusEngine.
 */
export class AgentExpertDivergent extends BaseAgentB {
    protected agentId = 'AgentExpert_Divergent';
    protected lambda = 1.1;

    protected async analyze(app: CreditApplication) {
        // Diverges from the group (group might say 0.8+, this one says 0.3)
        // But justifies it with absolute stability.
        const score = 0.35;

        const evolution = [
            { timestamp: Date.now() - 200, score: 0.35, λ: 1.1, rationale: 'Detected hidden risk factor' },
            { timestamp: Date.now() - 100, score: 0.35, λ: 1.1, rationale: 'Cross-verified risk' },
            { timestamp: Date.now(), score: 0.35, λ: 1.1, rationale: 'Confirmed divergence based on secondary data' }
        ];

        return {
            result: {
                score,
                rationale: 'Critical divergence: detected high-risk pattern ignored by standard models.',
                metrics: { divergence_factor: 2.5 }
            },
            evolution
        };
    }
}
