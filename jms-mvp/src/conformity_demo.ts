import { AgentA } from './agents/AgentA';
import { AgentConformist } from './agents/AgentConformist';
import { AgentExpertDivergent } from './agents/AgentExpertDivergent';
import { AgentC } from './agents/AgentC';
import { CreditApplication } from './types/jms';

/**
 * Conformity vs. Divergence Demo
 * Showcases:
 * 1. Detection and penalization of blind conformity clusters (Echo Chambers).
 * 2. Rewarding of justified, stable divergence (Expert Signal).
 */
async function runConformityDemo() {
    console.log("============================================================");
    console.log("🛡️  JMS CONFORMITY DETECTION & DIVERGENCE REWARD DEMO");
    console.log("============================================================");

    // 1. Initialize Agents
    const agentA = new AgentA();

    // Three conformists (Echo Chamber)
    const conf1 = new AgentConformist('Agent_Conformist_1');
    const conf2 = new AgentConformist('Agent_Conformist_2');
    const conf3 = new AgentConformist('Agent_Conformist_3');

    // One expert divergent
    const expert = new AgentExpertDivergent();

    const agentC = new AgentC();

    // 1.1 Start Agent Listeners
    conf1.listen();
    conf2.listen();
    conf3.listen();
    expert.listen();
    agentC.listen();

    // 2. Test Applicant
    const application: CreditApplication = {
        applicant_id: "APP-CONFORMITY-001",
        annual_income: 100000,
        credit_score: 750,
        loan_amount: 50000,
        monthly_debt: 2000,
        monthly_income: 8000
    };

    // 3. Define the Agent Network
    const analyticAgents = [
        'Agent_Conformist_1',
        'Agent_Conformist_2',
        'Agent_Conformist_3',
        'AgentExpert_Divergent'
    ];
    const consensusAgent = 'AgentC';

    console.log("\n--- Scenario: 3 Conformists vs 1 Expert Divergent ---\n");
    // 4. Run the process
    await agentA.runProcess(application, analyticAgents, consensusAgent);
}

runConformityDemo().catch(console.error);
