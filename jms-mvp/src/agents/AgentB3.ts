import { BaseAgentB } from './BaseAgentB';
import { CreditApplication } from '../types/jms';

export class AgentB3 extends BaseAgentB {
    protected agentId = 'AgentB3';
    protected lambda = 1.1;

    protected analyze(app: CreditApplication) {
        const dti = app.monthly_debt / app.monthly_income;
        const score = dti <= 0.35 ? 1.0 : (1 - dti);
        return {
            score: Math.max(0, score),
            rationale: dti <= 0.35 ? 'Excellent DTI ratio' : 'High DTI ratio',
            metrics: { dti_ratio: dti }
        };
    }
}
