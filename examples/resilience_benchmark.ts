import {
    AgentA,
    AgentC,
    BaseAgentB,
    MockTransport,
    JMSMessageBuilder,
    SecurityUtils,
    SecurityLevel
} from '../jms-sdk/typescript/index';

/**
 * Resilience & Adversarial Benchmark
 * Scenario: 300 Experts (APPROVE) vs 200 Malicious (REJECT)
 * The Malicious group will coordinate (Sybil Attack) to test Conformity Detection.
 */

class ExpertAnalyst extends BaseAgentB {
    protected agentId: string;
    protected lambda: number = 0.95; // High reliability
    protected performanceMode: boolean = true;

    constructor(transport: any, id: string) {
        super(transport);
        this.agentId = id;
    }
    protected async analyze(data: any) {
        return {
            result: { score: 0.85 + Math.random() * 0.1, rationale: 'Solid data supporting approval.' },
            evolution: [0.3, 0.6, 0.9] // Deep analysis
        };
    }
}

class MaliciousAnalyst extends BaseAgentB {
    protected agentId: string;
    protected lambda: number = 0.4; // Lower reliability but still significant
    protected performanceMode: boolean = true;
    private coordinated: boolean;

    constructor(transport: any, id: string, coordinated: boolean = false) {
        super(transport);
        this.agentId = id;
        this.coordinated = coordinated;
    }
    protected async analyze(data: any) {
        return {
            // If coordinated, return EXACTLY the same score to trigger Conformity Penalty
            result: { score: this.coordinated ? 0.123 : 0.1 + Math.random() * 0.2, rationale: 'Data looks bad, reject.' },
            evolution: this.coordinated ? [0.1, 0.1, 0.1] : [0.1]
        };
    }
}

async function runResilienceTest() {
    console.log("==============================================================");
    console.log("🛡️ JMS CONSENSUS RESILIENCE BENCHMARK");
    console.log("Scenario: 300 Experts vs 200 Malicious (150 Coordinated)");
    console.log("==============================================================");

    SecurityUtils.currentLevel = SecurityLevel.LIGHT;

    const transport = new MockTransport();
    const agentA = new AgentA(transport);
    const agentC = new AgentC(transport, {
        samplingRate: 0.5 // Process half to keep it fast but representative
    });

    const agentsB: string[] = [];

    // 1. Setup 300 Experts
    for (let i = 0; i < 300; i++) {
        const id = `Expert_${i}`;
        const b = new ExpertAnalyst(transport, id);
        b.listen();
        agentsB.push(id);
    }

    // 2. Setup 200 Malicious (150 in a Sybil cluster, 50 random noise)
    for (let i = 0; i < 200; i++) {
        const id = `BadActor_${i}`;
        const coordinated = i < 150;
        const b = new MaliciousAnalyst(transport, id, coordinated);
        b.listen();
        agentsB.push(id);
    }

    agentC.listen();

    console.log("🚀 Starting consensus cycle under heavy pressure...");
    const start = performance.now();
    await agentA.runProcess({ sensitive_data: true }, agentsB, 'AgentC', 'SecurityAudit', 'jms.resilience.v1', {
        expected: 500,
        minimum: 251 // Require majority
    });
    const end = performance.now();

    console.log(`\n⏱️ Consensus Cycle Completed in ${(end - start).toFixed(2)}ms`);
    console.log("==============================================================\n");
}

runResilienceTest().catch(console.error);
