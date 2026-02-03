import { JMSMessage } from '../../../jms-core/src/types/jms';
import { StabilityAnalysis } from './stability';
import { TrajectoryAnalysis } from './trajectory';
import { ConformityDetection } from './conformity';

/**
 * Cognitive Aggregator
 * Coordinates all learning signals to provide a unified adjustment for the consensus engine.
 */
export class CognitiveAggregator {
    static getAjustmentCallback(messages: JMSMessage[]) {
        // Pre-calculate clusters for conformity penalties
        const clusters = ConformityDetection.detectClusters(messages);
        const agentToClusterSize = new Map<string, number>();
        for (const cluster of clusters) {
            console.warn(`⚠️  [Learning] Blind conformity cluster detected: [${cluster.join(', ')}]`);
            for (const agentId of cluster) {
                agentToClusterSize.set(agentId, cluster.length);
            }
        }

        // Calculate mean score for divergence analysis
        const validMessages = messages.filter(m => m.ε === null);
        const scores = validMessages.map(m => m.data.score || 0);
        const meanScore = scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 0.5;

        return (msg: JMSMessage, currentWeight: number, currentLambda: number) => {
            let w = currentWeight;
            let λ = currentLambda;
            let stability = 1.0;

            // 1. Stability Adjustment
            if (msg.evolution && msg.evolution.length > 1) {
                stability = StabilityAnalysis.calculate(msg.evolution);
                if (stability < 0.7) {
                    const penalty = 1.0 - (0.7 - stability);
                    w *= Math.max(0.1, penalty);
                }
            }

            // 2. Trajectory Adjustment
            if (msg.evolution && msg.evolution.length > 2) {
                w *= TrajectoryAnalysis.calculateFactor(msg.evolution);
            }

            // 3. Conformity Penalty
            const clusterSize = agentToClusterSize.get(msg.agent);
            if (clusterSize) {
                w /= clusterSize;
            }

            // 4. Divergence Reward
            const score = msg.data.score || 0;
            if (Math.abs(score - meanScore) > 0.3 && stability > 0.8) {
                λ *= 1.2;
            }

            return { w, λ };
        };
    }
}
