import { BaseAgentB } from './BaseAgentB';
import { CreditApplication } from '../types/jms';

export class AgentB2 extends BaseAgentB {
    protected agentId = 'AgentB2';
    protected lambda = 0.9;

    protected async analyze(app: CreditApplication) {
        const ratio = app.annual_income / app.loan_amount;
        const score = ratio >= 4 ? 1.0 : ratio / 4;

        // Simulate evolution: slight refinement
        const evolution = [
            { timestamp: Date.now() - 150, score: 0.5, λ: 0.4, rationale: 'Budget analysis' },
            { timestamp: Date.now(), score, λ: 0.9, rationale: 'Final ratio calculation' }
        ];

        return {
            result: {
                score,
                rationale: ratio >= 4 ? 'Excellent income-to-loan ratio' : 'Sufficient income-to-loan ratio',
                metrics: { income_ratio: ratio }
            },
            evolution
        };
    }
}
