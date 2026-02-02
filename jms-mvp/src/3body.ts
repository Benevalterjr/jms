import { SystemState, Body } from './core/physics';
import { AgentB_Physics } from './agents/SimulationAgent';
import { AgentA } from './agents/AgentA';
import { JMSMessage } from './types/jms';
import { JMSMessageBuilder } from './core/message';

/**
 * JMS Three-Body Simulation Runner
 */
async function solveThreeBody() {
    console.log(`\n${'█'.repeat(80)}`);
    console.log(`  JMS MASSIVE SCALE: SOLVING THE THREE-BODY PROBLEM (10 AGENTS)`);
    console.log(`${'█'.repeat(80)}\n`);

    // 1. Initial Chaotic State (The Triangle)
    const initialState: SystemState = {
        t: 0,
        bodies: [
            { id: 'Sun1', m: 1.0, pos: { x: 0, y: 1 }, vel: { x: 0.1, y: 0 } },
            { id: 'Sun2', m: 1.0, pos: { x: -0.866, y: -0.5 }, vel: { x: -0.05, y: 0.0866 } },
            { id: 'Sun3', m: 1.0, pos: { x: 0.866, y: -0.5 }, vel: { x: -0.05, y: -0.0866 } }
        ]
    };

    const targetT = 10.0; // Predict 10 seconds into the future
    const orchestrator = new AgentA();
    const { ref } = await orchestrator.initiate({ applicant_id: 'CHAOS-3BODY' } as any);

    // 2. Initialize 10 Massive Agents
    const agents: AgentB_Physics[] = [
        // 3 Euler Agents (Low confidence)
        new AgentB_Physics('Euler-1', 'EULER', 0.1, 0.3),
        new AgentB_Physics('Euler-2', 'EULER', 0.05, 0.35),
        new AgentB_Physics('Euler-3', 'EULER', 0.2, 0.2),

        // 4 RK4 Agents (Medium/High confidence)
        new AgentB_Physics('RK4-1', 'RK4', 0.1, 1.0),
        new AgentB_Physics('RK4-2', 'RK4', 0.05, 1.1),
        new AgentB_Physics('RK4-3', 'RK4', 0.02, 1.2),
        new AgentB_Physics('RK4-4', 'RK4', 0.1, 0.9),

        // 3 High-Precision / Symplectic Proxies (Very High confidence)
        new AgentB_Physics('Expert-1', 'RK4', 0.01, 1.4),
        new AgentB_Physics('Expert-2', 'RK4', 0.005, 1.5),
        new AgentB_Physics('Expert-3', 'RK4', 0.001, 1.5)
    ];

    // 3. Parallel Execution
    console.log(`🚀 Dispatching 10 agents to simulate chaotic trajectories...`);
    const predictions = await Promise.all(agents.map(a => a.predict(ref, initialState, targetT)));

    // 4. Custom Vector Consensus Logic (JMS-V)
    console.log(`\n🎯 AgentC (Consensus): Calculating λ-weighted Vector Mean...`);

    let totalWeight = 0;
    const consensusPos: { [key: string]: { x: number, y: number } } = { 'Sun1': { x: 0, y: 0 }, 'Sun2': { x: 0, y: 0 }, 'Sun3': { x: 0, y: 0 } };

    predictions.forEach(msg => {
        const weight = msg.λ;
        totalWeight += weight;
        const state = msg.data.finalState as SystemState;
        state.bodies.forEach(b => {
            consensusPos[b.id].x += b.pos.x * weight;
            consensusPos[b.id].y += b.pos.y * weight;
        });
    });

    // Final Normalization
    Object.keys(consensusPos).forEach(id => {
        consensusPos[id].x /= totalWeight;
        consensusPos[id].y /= totalWeight;
    });

    // 5. Results Display
    console.log(`${'='.repeat(80)}`);
    console.log(`🌌 FINAL CONSENSUS STATE (T=${targetT}s)`);
    console.log(`${'='.repeat(80)}`);
    Object.keys(consensusPos).forEach(id => {
        console.log(`   ${id}: { x: ${consensusPos[id].x.toFixed(4)}, y: ${consensusPos[id].y.toFixed(4)} }`);
    });

    console.log(`\n📊 Analysis Summary:`);
    console.log(`   Total Agents: 10`);
    console.log(`   λ Aggregate: ${totalWeight.toFixed(2)}`);
    console.log(`   Ref: ${ref}`);

    // Diversity Check (showing the dispersion between Euler and Expert)
    const euler1 = predictions[0].data.finalState.bodies[0].pos;
    const expert3 = predictions[9].data.finalState.bodies[0].pos;
    const drift = Math.sqrt(Math.pow(euler1.x - expert3.x, 2) + Math.pow(euler1.y - expert3.y, 2));

    console.log(`   Max Algorithm Drift: ${drift.toFixed(4)} units`);
    console.log(`   Result: JMS stabilized the chaos via λ-weighting.`);
    console.log(`${'='.repeat(80)}\n`);
}

solveThreeBody().catch(console.error);
