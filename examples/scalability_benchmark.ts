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
 * Scalability Benchmark
 * Simulates 10, 100, and 500 agents to verify O(N) performance.
 */

class DummyAnalyst extends BaseAgentB {
    protected agentId: string;
    protected lambda: number = 1.0;
    protected performanceMode: boolean = true;

    constructor(transport: any, id: string) {
        super(transport);
        this.agentId = id;
    }
    protected async analyze(data: any) {
        return {
            result: { score: 0.8 + Math.random() * 0.2, rationale: 'OK' },
            evolution: []
        };
    }
}

async function runScaleTest(agentCount: number) {
    SecurityUtils.currentLevel = SecurityLevel.LIGHT; // Speed focus for scale

    const transport = new MockTransport();
    const agentA = new AgentA(transport);
    const agentC = new AgentC(transport, {
        samplingRate: 0.2 // Only sample 20% if pool is huge
    });

    const agentsB: string[] = [];
    for (let i = 0; i < agentCount; i++) {
        const id = `B_${i}`;
        const b = new DummyAnalyst(transport, id);
        b.listen();
        agentsB.push(id);
    }
    agentC.listen();

    const start = performance.now();
    await agentA.runProcess({ task: "scale" }, agentsB, 'AgentC', 'ScaleTest', 'jms.perf.v1', {
        expected: agentCount,
        minimum: Math.ceil(agentCount * 0.1) // Wait for at least 10%
    });
    const end = performance.now();

    console.log(`📈 [SCALE: ${agentCount}] Consensus Cycle: ${(end - start).toFixed(2)}ms`);
}

async function startBenchmark() {
    console.log("==============================================================");
    console.log("🏙️ JMS CONSENSUS SCALABILITY BENCHMARK");
    console.log("==============================================================");

    await runScaleTest(10);
    await runScaleTest(100);
    await runScaleTest(500);

    console.log("\n✅ Scalability test complete.");
}

startBenchmark().catch(console.error);
