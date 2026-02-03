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
 * Performance & Latency Benchmark
 * Compares FULL security vs LIGHT vs NONE (Real-time mode)
 */

class FastAnalyst extends BaseAgentB {
    protected agentId: string;
    protected lambda: number = 1.0;
    constructor(transport: any, id: string, perf: boolean = false) {
        super(transport);
        this.agentId = id;
        this.performanceMode = perf;
    }
    protected async analyze(data: any) {
        // Minimal analysis simulation
        return {
            result: { score: 0.9, rationale: 'Fast' },
            evolution: []
        };
    }
}

async function runBenchmark(level: SecurityLevel, label: string) {
    SecurityUtils.currentLevel = level;

    const transport = new MockTransport();
    const agentA = new AgentA(transport);
    const agentC = new AgentC(transport);
    const b1 = new FastAnalyst(transport, 'B1', level !== SecurityLevel.FULL);
    const b2 = new FastAnalyst(transport, 'B2', level !== SecurityLevel.FULL);

    agentC.listen();
    b1.listen();
    b2.listen();

    const data = { test: "performance" };
    const start = performance.now();

    // Simulate 10 iterations to get average
    const iterations = 5;
    for (let i = 0; i < iterations; i++) {
        await agentA.runProcess(data, ['B1', 'B2'], 'AgentC', 'PerfTest', 'jms.perf.v1');
    }

    const end = performance.now();
    const avg = (end - start) / iterations;
    console.log(`⏱️ [${label}] Average Latency: ${avg.toFixed(2)}ms`);
}

async function startProfiling() {
    console.log("==============================================================");
    console.log("🚀 JMS PERFORMANCE & LATENCY BENCHMARK");
    console.log("==============================================================");

    // 1. FULL SECURITY (Default)
    await runBenchmark(SecurityLevel.FULL, "FULL SECURITY (SHA-256 + AJV)");

    // 2. LIGHT MODE
    await runBenchmark(SecurityLevel.LIGHT, "LIGHT MODE (Omit Full Hash)");

    // 3. REAL-TIME MODE (NONE)
    await runBenchmark(SecurityLevel.NONE, "REAL-TIME MODE (Trust Network)");

    console.log("\n✅ Benchmark complete.");
}

startProfiling().catch(console.error);
