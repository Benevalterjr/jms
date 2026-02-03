import {
    AgentA,
    AgentC,
    BaseAgentB,
    MockTransport,
    JMSMessageBuilder
} from '../jms-sdk/typescript/index';
import { PrimeTask } from './domain_types';

/**
 * Prime Number Analysis Demo (Hard Test)
 * Tests consensus on a mathematically complex task.
 */

class PrimeAnalysisAgent extends BaseAgentB<PrimeTask> {
    protected agentId: string;
    protected lambda: number;
    private method: 'miller-rabin' | 'fermat' | 'divisibility';

    constructor(transport: any, id: string, lambda: number, method: 'miller-rabin' | 'fermat' | 'divisibility') {
        super(transport);
        this.agentId = id;
        this.lambda = lambda;
        this.method = method;
    }

    protected async analyze(task: PrimeTask) {
        const n = task.number;
        let isPrime = false;
        let evolution: any[] = [];
        const now = Date.now();
        let rationale = '';

        if (this.method === 'miller-rabin') {
            // High rigor
            isPrime = this.millerRabin(n, 10);
            rationale = `Miller-Rabin (k=10) determined ${isPrime ? 'PRIME' : 'COMPOSITE'}`;
            evolution = [
                { timestamp: now - 100, score: 0.5, λ: 0.5, rationale: 'Iterating Miller-Rabin...' },
                { timestamp: now, score: isPrime ? 0.95 : 0.05, λ: 1.2, rationale: 'Confirmed with 10 iterations' }
            ];
        } else if (this.method === 'fermat') {
            // Fast, but fails on Carmichael numbers (like 561)
            isPrime = this.fermatTest(n);
            rationale = `Fermat test (base 2) suggests ${isPrime ? 'PRIME' : 'COMPOSITE'}`;
            evolution = [
                { timestamp: now, score: isPrime ? 0.8 : 0.2, λ: 0.8, rationale: 'Fermat test complete (base 2)' }
            ];
        } else {
            // Very simple
            isPrime = n % 2 !== 0 && n % 3 !== 0; // Obviously incomplete
            rationale = `Basic divisibility (2,3) suggests ${isPrime ? 'PRIME' : 'COMPOSITE'}`;
            evolution = [
                { timestamp: now, score: isPrime ? 0.6 : 0.4, λ: 0.4, rationale: 'Basic divisibility check' }
            ];
        }

        return {
            result: {
                score: isPrime ? 0.9 : 0.1,
                rationale,
                metrics: { is_prime: isPrime, method: this.method }
            },
            evolution
        };
    }

    private fermatTest(n: number): boolean {
        if (n <= 1) return false;
        if (n === 2) return true;
        // (2^(n-1)) % n === 1
        return this.power(2, n - 1, n) === 1;
    }

    private millerRabin(n: number, k: number): boolean {
        if (n <= 1 || n === 4) return false;
        if (n <= 3) return true;
        let d = n - 1;
        while (d % 2 === 0) d /= 2;
        for (let i = 0; i < k; i++) {
            if (!this.millerTest(n, d)) return false;
        }
        return true;
    }

    private millerTest(n: number, d: number): boolean {
        const a = 2 + Math.floor(Math.random() * (n - 4));
        let x = this.power(a, d, n);
        if (x === 1 || x === n - 1) return true;
        while (d !== n - 1) {
            x = (x * x) % n;
            d *= 2;
            if (x === 1) return false;
            if (x === n - 1) return true;
        }
        return false;
    }

    private power(a: number, b: number, m: number): number {
        let res = 1;
        a %= m;
        while (b > 0) {
            if (b % 2 === 1) res = (Number(BigInt(res) * BigInt(a)) % m);
            a = (Number(BigInt(a) * BigInt(a)) % m);
            b = Math.floor(b / 2);
        }
        return res;
    }
}

async function runPrimeSimulation() {
    console.log("==============================================================");
    console.log("🔢 JMS PRIME ANALYSIS SIMULATION (HARD TEST)");
    console.log("==============================================================");

    const transport = new MockTransport();
    const agentA = new AgentA(transport);
    const agentC = new AgentC(transport);

    // Scenario: Is 1729 prime? (Carmichael number: Fermat base 2 says yes, but it is 7 * 13 * 19)
    const testNumber = 1729;
    console.log(`🎯 TARGET: Is ${testNumber} prime? (Spoiler: It's a Carmichael number, 1729 = 7 * 13 * 19)`);
    console.log(`⚠️  CRITICAL: This will fool Divisibility (2,3) AND Fermat (base 2)!`);

    const expert = new PrimeAnalysisAgent(transport, 'Agent_MillerRabin_Expert', 1.2, 'miller-rabin');
    const fast = new PrimeAnalysisAgent(transport, 'Agent_Fermat_Fast', 0.8, 'fermat');
    const basic = new PrimeAnalysisAgent(transport, 'Agent_Divisibility_Basic', 0.4, 'divisibility');

    expert.listen();
    fast.listen();
    basic.listen();
    agentC.listen();

    console.log("🚀 Sending request to agents...");
    const task: PrimeTask = { number: testNumber };

    await agentA.runProcess(task, [
        'Agent_MillerRabin_Expert',
        'Agent_Fermat_Fast',
        'Agent_Divisibility_Basic'
    ], 'AgentC');

    // Wait for the decision
    await new Promise(resolve => setTimeout(resolve, 3000));
}

runPrimeSimulation().catch(console.error);
