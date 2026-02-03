import { BaseAgentB } from './BaseAgentB';
import { CreditApplication } from '../types/jms';

export class AgentB3 extends BaseAgentB {
    protected agentId = 'AgentB3';
    protected lambda = 1.1;

    protected async analyze(app: CreditApplication) {
        const dti = app.monthly_debt / app.monthly_income;
        const score = dti <= 0.35 ? 1.0 : (1 - dti);
        const finalScore = Math.max(0, score);

        // Simulate evolution: high confidence from start
        const evolution = [
            { timestamp: Date.now(), score: finalScore, λ: 1.1, rationale: 'Direct DTI verification' }
        ];

        return {
            result: {
                score: finalScore,
                rationale: dti <= 0.35 ? 'Excellent DTI ratio' : 'High DTI ratio',
                metrics: { dti_ratio: dti }
            },
            evolution
        };
    }
}
