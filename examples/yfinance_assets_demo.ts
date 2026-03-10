import * as fs from 'fs';
import {
    AgentA,
    AgentC,
    BaseAgentB,
    MockTransport
} from '../jms-sdk/typescript/index';

interface AssetSnapshot {
    symbol: string;
    close: number;
    sma_5: number;
    sma_20: number;
    daily_return_pct: number;
    volatility_20d_pct: number;
    volume: number;
}

interface AssetBatchTask {
    assets: AssetSnapshot[];
}

class TrendAgent extends BaseAgentB<AssetBatchTask> {
    protected agentId = 'Agent_Trend';
    protected lambda = 1.1;

    constructor(transport: any) {
        super(transport);
    }

    protected async analyze(task: AssetBatchTask) {
        const bullish = task.assets.filter(a => a.sma_5 > a.sma_20).length;
        const ratio = bullish / task.assets.length;
        const score = 0.4 + ratio * 0.6;

        return {
            result: {
                score,
                rationale: `TrendAgent: ${bullish}/${task.assets.length} ativos com SMA5 > SMA20`,
                metrics: { bullish_ratio: ratio }
            },
            evolution: [
                { timestamp: Date.now(), score, λ: 1.0, rationale: 'SMA short-term vs medium-term' }
            ]
        };
    }
}

class RiskAgent extends BaseAgentB<AssetBatchTask> {
    protected agentId = 'Agent_Risk';
    protected lambda = 0.9;

    constructor(transport: any) {
        super(transport);
    }

    protected async analyze(task: AssetBatchTask) {
        const avgVol = task.assets.reduce((acc, a) => acc + a.volatility_20d_pct, 0) / task.assets.length;
        const score = Math.max(0.1, 1 - avgVol / 40);

        return {
            result: {
                score,
                rationale: `RiskAgent: volatilidade média 20d = ${avgVol.toFixed(2)}%`,
                metrics: { average_volatility_20d_pct: avgVol }
            },
            evolution: [
                { timestamp: Date.now(), score, λ: 1.0, rationale: 'Volatilidade penaliza risco' }
            ]
        };
    }
}

class MomentumAgent extends BaseAgentB<AssetBatchTask> {
    protected agentId = 'Agent_Momentum';
    protected lambda = 1.0;

    constructor(transport: any) {
        super(transport);
    }

    protected async analyze(task: AssetBatchTask) {
        const avgReturn = task.assets.reduce((acc, a) => acc + a.daily_return_pct, 0) / task.assets.length;
        const score = Math.max(0.1, Math.min(0.95, 0.5 + avgReturn / 4));

        return {
            result: {
                score,
                rationale: `MomentumAgent: retorno diário médio = ${avgReturn.toFixed(2)}%`,
                metrics: { average_daily_return_pct: avgReturn }
            },
            evolution: [
                { timestamp: Date.now(), score, λ: 1.0, rationale: 'Momentum de curtíssimo prazo' }
            ]
        };
    }
}

function loadAssets(path: string): AssetSnapshot[] {
    const raw = fs.readFileSync(path, 'utf-8');
    return JSON.parse(raw) as AssetSnapshot[];
}

async function runYFinanceAssetsDemo() {
    console.log('==============================================================');
    console.log('📈 JMS + YFINANCE ASSETS DEMO');
    console.log('==============================================================');

    const inputFile = process.argv[2] ?? 'examples/data/assets.json';
    const assets = loadAssets(inputFile);

    if (!assets.length) {
        throw new Error('Arquivo de ativos vazio. Gere dados com yfinance_fetch.py');
    }

    console.log(`✅ Carregados ${assets.length} ativos de ${inputFile}`);

    const transport = new MockTransport();
    const agentA = new AgentA(transport);
    const agentC = new AgentC(transport, {
        threshold: 0.65,
        weights: { analysis: 1.0 }
    });

    const trend = new TrendAgent(transport);
    const risk = new RiskAgent(transport);
    const momentum = new MomentumAgent(transport);

    trend.listen();
    risk.listen();
    momentum.listen();
    agentC.listen();

    const task: AssetBatchTask = { assets };

    await agentA.runProcess(
        task,
        ['Agent_Trend', 'Agent_Risk', 'Agent_Momentum'],
        'AgentC',
        'Finance::Portfolio::DailyCheck',
        'jms.finance.portfolio.snapshot.v1'
    );

    await new Promise(resolve => setTimeout(resolve, 2200));
}

runYFinanceAssetsDemo().catch(console.error);
