import { BaseAgentB } from './BaseAgentB';
import { CreditApplication } from '../types/jms';

export class AgentB2 extends BaseAgentB {
    protected agentId = 'AgentB2';
    protected lambda = 0.9;

    protected analyze(app: CreditApplication) {
        const ratio = app.annual_income / app.loan_amount;
        const score = ratio >= 4 ? 1.0 : ratio / 4;
        return {
            score,
            rationale: ratio >= 4 ? 'Excellent income-to-loan ratio' : 'Sufficient income-to-loan ratio',
            metrics: { income_ratio: ratio }
        };
    }
}
