import { BaseAgentB } from './BaseAgentB';
import { CreditApplication } from '../types/jms';

export class AgentB1 extends BaseAgentB {
    protected agentId = 'AgentB1';
    protected lambda = 1.2;

    protected analyze(app: CreditApplication) {
        const score = app.credit_score >= 750 ? 1.0 : app.credit_score / 850;
        return {
            score,
            rationale: app.credit_score >= 750 ? 'Excellent credit score' : 'Fair credit score',
            metrics: { raw_score: app.credit_score }
        };
    }
}
