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
 * Quality-Prioritized Sampling Demo
 * Compares Random vs. Quality (λ-based) expansion in conflicted scenarios.
 */

class MixedAnalyst extends BaseAgentB {
    protected agentId: string;
    protected lambda: number;
    private score: number;

    constructor(transport: any, id: string, lambda: number, score: number) {
        super(transport);
        this.agentId = id;
        this.lambda = lambda;
        this.score = score;
        this.performanceMode = true;
    }
    protected async analyze(data: any) {
        return {
            result: { score: this.score, rationale: 'Analysis complete.' },
            evolution: []
        };
    }
}

async function runQualityTest(label: string, qualityPriority: boolean) {
    console.log(`\n==============================================================`);
    console.log(`🧪 SCENARIO: ${label}`);
    console.log(`--------------------------------------------------------------`);

    const transport = new MockTransport();
    const agentA = new AgentA(transport);

    // Configure AgentC
    const agentC = new AgentC(transport, {
        samplingRate: 0.1,      // Start with only 10%
        dynamicSampling: true,  // Enable auto-expansion
        qualityPriority: qualityPriority,
        entropyThreshold: 0.03, // Trigger expansion on variance
        agentId: 'AgentC'
    });

    const agentsB: string[] = [];

    // Pool Composition: 100 Agents
    // - 20 Experts (λ=1.0, Score=0.8)
    // - 80 Noise (λ=0.2, Scores=Random 0.1 to 0.9)
    for (let i = 0; i < 100; i++) {
        let lambda, score;
        if (i < 20) {
            lambda = 1.0;
            score = 0.8;
            const b = new MixedAnalyst(transport, `Expert_${i}`, lambda, score);
            b.listen();
            agentsB.push(`Expert_${i}`);
        } else {
            lambda = 0.2;
            score = 0.1 + Math.random() * 0.8;
            const b = new MixedAnalyst(transport, `Noise_${i}`, lambda, score);
            b.listen();
            agentsB.push(`Noise_${i}`);
        }
    }
    agentC.listen();

    SecurityUtils.currentLevel = SecurityLevel.LIGHT;

    const start = performance.now();
    await agentA.runProcess({ data: "conflict" }, agentsB, 'AgentC', 'QualityTest', 'jms.perf.v1', {
        expected: 100,
        minimum: 10
    });
    const end = performance.now();
    console.log(`⏱️  Cycle Time: ${(end - start).toFixed(2)}ms`);
}

async function startDemo() {
    console.log("🏙️  JMS QUALITY-PRIORITIZED SAMPLING (2nd LAYER)");

    // 1. Random Expansion (Blind)
    await runQualityTest("RANDOM EXPANSION (May pick Noise first)", false);

    // 2. Quality-Based Expansion (Prioritized)
    await runQualityTest("QUALITY-PRIORITIZED EXPANSION (Experts first)", true);

    console.log("\n✅ Quality benchmark complete.");
}

startDemo().catch(console.error);
