import { AgentA } from './agents/AgentA';
import { AgentB1 } from './agents/AgentB1';
import { AgentB2 } from './agents/AgentB2';
import { AgentB3 } from './agents/AgentB3';
import { AgentChaos } from './agents/AgentChaos';
import { AgentC } from './agents/AgentC';
import { CreditApplication } from './types/jms';
import { JMSTransport } from './core/transport';

/**
 * JMS Deep Implementation Demo
 * Showcases:
 * 1. Asynchronous Transport (JMS-T)
 * 2. Strict Schema Validation (AJV)
 * 3. Resilience against Malicious Agent (AgentChaos)
 * 4. Audit Trail of Consensus Cognitive State (CCS)
 */
async function runDeepDemo() {
    console.log("============================================================");
    console.log("🚀 JMS DEEP IMPLEMENTATION: RESILIENCE & RIGOR DEMO");
    console.log("============================================================");

    // 1. Initialize Agents
    const agentA = new AgentA();
    const b1 = new AgentB1();
    const b2 = new AgentB2();
    const b3 = new AgentB3();
    const chaos = new AgentChaos();
    const agentC = new AgentC();

    // 1.1 Start Agent Listeners
    b1.listen();
    b2.listen();
    b3.listen();
    chaos.listen();
    agentC.listen();

    // 2. Define Test Applicant (Strong Profile, but with a malicious noise)
    const application: CreditApplication = {
        applicant_id: "APP-DEEP-001",
        annual_income: 150000,
        credit_score: 820,
        loan_amount: 25000,
        monthly_debt: 2000,
        monthly_income: 12500
    };

    // 3. Define the Agent Network
    const analyticAgents = ['AgentB1', 'AgentB2', 'AgentB3', 'Agent_Chaos'];
    const consensusAgent = 'AgentC';

    // 4. Run the process
    await agentA.runProcess(application, analyticAgents, consensusAgent);
}

runDeepDemo().catch(console.error);
