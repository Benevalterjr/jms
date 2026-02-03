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
 * Dynamic Sampling Demo
 * Demonstrates how AgentC expands its sample size when it detects 
 * high entropy (conflict) in the cognitive signals.
 */

class VariableAnalyst extends BaseAgentB {
    protected agentId: string;
    protected lambda: number = 1.0;
    private score: number;

    constructor(transport: any, id: string, score: number) {
        super(transport);
        this.agentId = id;
        this.score = score;
        this.performanceMode = true;
    }
    protected async analyze(data: any) {
        // Return a fixed score to simulate high/low variance
        return {
            result: { score: this.score, rationale: 'Analysis complete.' },
            evolution: []
        };
    }
}

async function runTest(label: string, isHighEntropy: boolean) {
    console.log(`\n==============================================================`);
    console.log(`🧪 SCENARIO: ${label}`);
    console.log(`==============================================================`);

    const transport = new MockTransport();
    const agentA = new AgentA(transport);

    // Configure AgentC with Dynamic Sampling
    const agentC = new AgentC(transport, {
        samplingRate: 0.1,      // Start with only 10%
        dynamicSampling: true,  // Enable auto-expansion
        entropyThreshold: 0.02, // Threshold for "conflict"
        agentId: 'AgentC'
    });

    const agentsB: string[] = [];
    for (let i = 0; i < 100; i++) {
        // High Entropy: Split 50/50 between 0.1 and 0.9
        // Low Entropy: All 0.8
        const score = isHighEntropy ? (i % 2 === 0 ? 0.9 : 0.1) : 0.8;
        const b = new VariableAnalyst(transport, `B_${i}`, score);
        b.listen();
        agentsB.push(`B_${i}`);
    }
    agentC.listen();

    SecurityUtils.currentLevel = SecurityLevel.LIGHT;

    console.log(`🚀 Dispatching process to 100 agents...`);
    await agentA.runProcess({ data: "test" }, agentsB, 'AgentC', 'EntropyTest', 'jms.perf.v1', {
        expected: 100,
        minimum: 10
    });
}

async function startDemo() {
    console.log("🏙️  JMS DYNAMIC SAMPLING & ENTROPY CONTROL");

    // 1. Stable Scenario (Low Entropy)
    await runTest("STABLE CONSENSUS (All agents agree)", false);

    // 2. Conflict Scenario (High Entropy)
    await runTest("CONFLICTED CONSENSUS (Agents disagree 50/50)", true);

    console.log("\n✅ Demo complete.");
}

startDemo().catch(console.error);
