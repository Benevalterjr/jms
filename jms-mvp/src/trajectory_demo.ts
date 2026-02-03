import { AgentA } from './agents/AgentA';
import { AgentPersistent } from './agents/AgentPersistent';
import { AgentFluctuating } from './agents/AgentFluctuating';
import { AgentC } from './agents/AgentC';
import { CreditApplication } from './types/jms';

/**
 * Trajectory & Temporal Consistency Demo
 * Showcases:
 * 1. Weight boost for agents with Persistent/Convergent cognitive paths.
 * 2. Weight penalty for agents with erratic Fluctuations, even if final score is the same.
 */
async function runTrajectoryDemo() {
    console.log("============================================================");
    console.log("📈 JMS COGNITIVE TRAJECTORY & TEMPORAL CONSISTENCY DEMO");
    console.log("============================================================");

    // 1. Initialize Agents
    const agentA = new AgentA();
    const persistent = new AgentPersistent();
    const fluctuating = new AgentFluctuating();
    const agentC = new AgentC();

    // 1.1 Start Agent Listeners
    persistent.listen();
    fluctuating.listen();
    agentC.listen();

    // 2. Test Applicant
    const application: CreditApplication = {
        applicant_id: "APP-TRAJECTORY-001",
        annual_income: 120000,
        credit_score: 720,
        loan_amount: 30000,
        monthly_debt: 1500,
        monthly_income: 10000
    };

    // 3. Define the Agent Network
    // We compare two agents that give the EXACT same final score but have different paths.
    const analyticAgents = ['Agent_Persistent', 'Agent_Fluctuating'];
    const consensusAgent = 'AgentC';

    console.log("\n--- Scenario: Persistent Agent vs. Fluctuating Agent (Same final score: 0.75) ---\n");
    // 4. Run the process
    await agentA.runProcess(application, analyticAgents, consensusAgent);
}

runTrajectoryDemo().catch(console.error);
