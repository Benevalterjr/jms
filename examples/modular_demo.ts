import {
    AgentA,
    AgentC,
    BaseAgentB,
    MockTransport,
    CreditApplication
} from '../jms-sdk/typescript/index';

/**
 * Modular Demo
 * Uses the new decentralized structure of JMS.
 */

class ModularAnalyticAgent extends BaseAgentB {
    protected agentId: string;
    protected lambda: number;

    constructor(id: string, lambda: number, transport: any) {
        super(transport);
        this.agentId = id;
        this.lambda = lambda;
    }

    protected async analyze(app: CreditApplication) {
        const score = app.credit_score > 700 ? 0.9 : 0.4;
        return {
            result: { score, rationale: 'Standard modular analysis' },
            evolution: [
                { timestamp: Date.now() - 100, score: score * 0.9, λ: 0.5, rationale: 'Initial' },
                { timestamp: Date.now(), score, λ: 1.0, rationale: 'Final' }
            ]
        }
    }
}

async function runModularDemo() {
    console.log("==============================================================");
    console.log("📦 JMS MODULAR ARCHITECTURE DEMO");
    console.log("==============================================================");

    const transport = new MockTransport();

    const agentA = new AgentA(transport);
    const agentC = new AgentC(transport);
    const b1 = new ModularAnalyticAgent('AgentB1', 1.2, transport);
    const b2 = new ModularAnalyticAgent('AgentB2', 0.9, transport);

    b1.listen();
    b2.listen();
    agentC.listen();

    const application: CreditApplication = {
        applicant_id: "MOD-001",
        annual_income: 120000,
        credit_score: 750,
        loan_amount: 30000,
        monthly_debt: 1500,
        monthly_income: 10000
    };

    console.log("🚀 Starting modular process...");

    // Simulate a failure: target an agent that doesn't exist
    await agentA.runProcess(application, ['AgentB1', 'AgentB2', 'MissingAgentX'], 'AgentC');

    // Wait for the final decision and check transport health
    await new Promise(resolve => setTimeout(resolve, 2500));

    const dlq = MockTransport.getDLQ();
    if (dlq.length > 0) {
        console.log(`📦 [Demo] Observed ${dlq.length} messages in DLQ (Expected for 'MissingAgentX')`);

        console.log("🛠️ [Demo] Late-registering MissingAgentX and retrying DLQ...");
        const missingAgent = new ModularAnalyticAgent('MissingAgentX', 0.95, transport);
        missingAgent.listen();
        await MockTransport.retryDLQ(transport);

        // Wait for the late response
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

runModularDemo().catch(console.error);
