import {
    ConsensusEngine,
    JMSMessageBuilder,
    JMSMessage
} from '../jms-sdk/typescript/index';
import { CognitiveAggregator } from '../jms-learning/src/learning/aggregator';

/**
 * JMS Benchmark Suite
 * Compares JMS vs Baselines (Simple Average & Majority Vote)
 */

interface BenchmarkResult {
    scenario: string;
    simpleAverage: number;
    majorityVote: string;
    jmsConsensus: number;
    expectedTarget: number;
    winner: string;
}

class JMSBenchmarker {
    private aggregator = new CognitiveAggregator();

    /**
     * Baseline 1: Simple Average
     */
    private runSimpleAverage(messages: JMSMessage[]): number {
        const scores = messages.map(m => m.data.score || 0);
        return scores.reduce((a, b) => a + b, 0) / scores.length;
    }

    /**
     * Baseline 2: Majority Vote
     */
    private runMajorityVote(messages: JMSMessage[]): string {
        const votes = messages.map(m => (m.data.score || 0) >= 0.5 ? 'APPROVE' : 'REJECT');
        const counts: Record<string, number> = {};
        votes.forEach(v => counts[v] = (counts[v] || 0) + 1);
        return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    }

    /**
     * Proposed: JMS (with cognitive feedback)
     */
    private runJMS(messages: JMSMessage[]): number {
        const callback = CognitiveAggregator.getAjustmentCallback(messages);
        return ConsensusEngine.calculate(messages, {}, callback);
    }

    public runScenario(name: string, messages: JMSMessage[], target: number): BenchmarkResult {
        const avg = this.runSimpleAverage(messages);
        const vote = this.runMajorityVote(messages);
        const jms = this.runJMS(messages);

        // A winner is who is closer to the expected target (expert or safer side)
        const diffAvg = Math.abs(avg - target);
        const diffJMS = Math.abs(jms - target);
        const winner = diffJMS < diffAvg ? 'JMS' : 'Baseline';

        return {
            scenario: name,
            simpleAverage: Number(avg.toFixed(3)),
            majorityVote: vote,
            jmsConsensus: Number(jms.toFixed(3)),
            expectedTarget: target,
            winner
        };
    }
}

async function startBenchmark() {
    console.log("==============================================================");
    console.log("📊 JMS EMPIRICAL BENCHMARK SUITE");
    console.log("==============================================================");

    const bench = new JMSBenchmarker();
    const results: BenchmarkResult[] = [];

    // Utils for opinion state
    const opinion = (score: number) => ({ timestamp: Date.now(), score, λ: 1.0, rationale: 'Test' });

    // --- SCENARIO 1: ADVERSARIAL NOISE ---
    // 3 consistent agents, 2 low-confidence outliers
    const s1_msgs = [
        JMSMessageBuilder.create({ ref: 's1', agent: 'B1', domain: 'D', operation: 'O', data: { score: 0.8 }, schema: 'S', lambda: 1.0, tau: 'k=1' }),
        JMSMessageBuilder.create({ ref: 's1', agent: 'B2', domain: 'D', operation: 'O', data: { score: 0.82 }, schema: 'S', lambda: 1.0, tau: 'k=1' }),
        JMSMessageBuilder.create({ ref: 's1', agent: 'B3', domain: 'D', operation: 'O', data: { score: 0.79 }, schema: 'S', lambda: 1.0, tau: 'k=1' }),
        JMSMessageBuilder.create({ ref: 's1', agent: 'Noise1', domain: 'D', operation: 'O', data: { score: 0.2 }, schema: 'S', lambda: 0.3, tau: 'k=1' }),
        JMSMessageBuilder.create({ ref: 's1', agent: 'Noise2', domain: 'D', operation: 'O', data: { score: 0.25 }, schema: 'S', lambda: 0.2, tau: 'k=1' }),
    ];
    results.push(bench.runScenario("Adversarial Noise", s1_msgs, 0.8));

    // --- SCENARIO 2: ECHO CHAMBER ---
    // 4 conformists (duplicate analysis), 1 unique expert
    const now = Date.now();
    const s2_msgs = [
        { ...JMSMessageBuilder.createRequest('C1', 'D', 'O', { score: 0.9 }, 'S'), security: { timestamp: now, hash: 'h', nonce: 'n' }, evolution: [opinion(0.9), opinion(0.9)] },
        { ...JMSMessageBuilder.createRequest('C2', 'D', 'O', { score: 0.9 }, 'S'), security: { timestamp: now + 5, hash: 'h', nonce: 'n' }, evolution: [opinion(0.9), opinion(0.9)] },
        { ...JMSMessageBuilder.createRequest('C3', 'D', 'O', { score: 0.9 }, 'S'), security: { timestamp: now + 10, hash: 'h', nonce: 'n' }, evolution: [opinion(0.9), opinion(0.9)] },
        { ...JMSMessageBuilder.createRequest('C4', 'D', 'O', { score: 0.9 }, 'S'), security: { timestamp: now + 15, hash: 'h', nonce: 'n' }, evolution: [opinion(0.9), opinion(0.9)] },
        JMSMessageBuilder.create({
            ref: 's2', agent: 'Expert', domain: 'D', operation: 'O', data: { score: 0.4 }, schema: 'S', lambda: 1.2, tau: 'k=1',
            evolution: [opinion(0.5), opinion(0.45), opinion(0.4)]
        }),
    ];
    results.push(bench.runScenario("Echo Chamber", s2_msgs as any, 0.5));

    // --- SCENARIO 3: EXPERT DIVERGENCE ---
    const s3_msgs = [
        JMSMessageBuilder.create({ ref: 's3', agent: 'S1', domain: 'D', operation: 'O', data: { score: 0.9 }, schema: 'S', lambda: 1.0, tau: 'k=1' }),
        JMSMessageBuilder.create({ ref: 's3', agent: 'S2', domain: 'D', operation: 'O', data: { score: 0.85 }, schema: 'S', lambda: 1.0, tau: 'k=1' }),
        JMSMessageBuilder.create({
            ref: 's3', agent: 'Expert', domain: 'D', operation: 'O', data: { score: 0.3 }, schema: 'S', lambda: 1.0, tau: 'k=1',
            evolution: [
                { timestamp: now - 300, score: 0.31, λ: 0.8, rationale: 'Stable observation' },
                { timestamp: now - 100, score: 0.3, λ: 1.0, rationale: 'Confirmed divergence' }
            ]
        }),
    ];
    results.push(bench.runScenario("Expert Divergent", s3_msgs, 0.45));

    console.table(results);

    const jmsWins = results.filter(r => r.winner === 'JMS').length;
    console.log(`\n🏆 FINAL VERDICT: JMS won ${jmsWins}/${results.length} scenarios.`);
}

startBenchmark().catch(console.error);
