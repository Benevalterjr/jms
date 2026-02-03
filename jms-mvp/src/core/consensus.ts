import { JMSMessage } from '../types/jms';

/**
 * Consensus Engine
 * Implements lambda-weighted consensus per JMS v1.0 spec
 */
export class ConsensusEngine {
    /**
     * Calculate lambda-weighted consensus score
     * 
     * Formula: score_global = Σ(wi × λi × scorei) / Σ(wi × λi)
     */
    static calculate(
        messages: JMSMessage[],
        weights: Record<string, number>
    ): number {
        let numerator = 0;
        let denominator = 0;

        // 1. Calculate Mean Score for divergence analysis
        const validMessages = messages.filter(m => m.ε === null);
        const rawScores = validMessages.map(m => this.extractScore(m.data));
        const meanScore = rawScores.length > 0 ? rawScores.reduce((a, b) => a + b) / rawScores.length : 0.5;

        // 2. Map of Adjusted Weights/Lambdas
        const adjustedParams = new Map<string, { w: number; λ: number }>();

        for (const msg of messages) {
            if (msg.ε !== null) continue;

            let w = weights[msg.Ω] || 1.0;
            let λ = msg.λ;

            // Step A: Stability Adjustment (Previous implementation)
            let stability = 1.0;
            if (msg.evolution && msg.evolution.length > 1) {
                stability = this.calculateOpinionStability(msg.evolution);
                if (stability < 0.7) {
                    const penalty = 1.0 - (0.7 - stability);
                    w *= Math.max(0.1, penalty);
                    console.log(`⚖️  [Consensus] Learning signal adjustment for ${msg.agent}: stability=${stability.toFixed(2)}, weight factor=${penalty.toFixed(2)}`);
                }
            }

            // Step B: Divergence Reward (Healthy Outliers)
            const score = this.extractScore(msg.data);
            const isOutlier = Math.abs(score - meanScore) > 0.3;
            if (isOutlier && stability > 0.8) {
                const reward = 1.2;
                λ *= reward;
                console.log(`💎 [Consensus] Healthy divergence reward for ${msg.agent}: λ boosted to ${λ.toFixed(2)}`);
            }

            // Step C: Trajectory Consistency Analysis
            if (msg.evolution && msg.evolution.length > 2) {
                const trajectoryFactor = this.calculateTrajectoryFactor(msg.evolution);
                w *= trajectoryFactor;
                if (trajectoryFactor > 1.05) {
                    console.log(`📈 [Consensus] Trajectory boost for ${msg.agent}: factor=${trajectoryFactor.toFixed(2)} (Persistent/Convergent)`);
                } else if (trajectoryFactor < 0.95) {
                    console.log(`📉 [Consensus] Fluctuation penalty for ${msg.agent}: factor=${trajectoryFactor.toFixed(2)} (Erratic path)`);
                }
            }

            adjustedParams.set(msg.agent, { w, λ });
        }

        // 3. Conformity Detection (Detecting "Echo Chambers")
        this.applyConformityPenalties(messages, adjustedParams);

        // 4. Final Aggregation
        for (const msg of messages) {
            if (msg.ε !== null) continue;

            const params = adjustedParams.get(msg.agent)!;
            const score = this.extractScore(msg.data);

            numerator += params.w * params.λ * score;
            denominator += params.w * params.λ;
        }

        return denominator > 0 ? numerator / denominator : 0;
    }

    /**
     * Detects groups of agents with suspiciously identical outputs and penalizes them.
     */
    private static applyConformityPenalties(messages: JMSMessage[], paramsMap: Map<string, { w: number; λ: number }>) {
        const clusters: string[][] = [];
        const checked = new Set<string>();

        const validMsgs = messages.filter(m => m.ε === null);

        for (let i = 0; i < validMsgs.length; i++) {
            const a = validMsgs[i];
            if (checked.has(a.agent)) continue;

            const cluster = [a.agent];
            for (let j = i + 1; j < validMsgs.length; j++) {
                const b = validMsgs[j];
                if (this.isSuspiciouslySimilar(a, b)) {
                    cluster.push(b.agent);
                    checked.add(b.agent);
                }
            }

            if (cluster.length > 1) {
                clusters.push(cluster);
            }
        }

        for (const cluster of clusters) {
            console.warn(`⚠️  [Consensus] Blind conformity cluster detected: [${cluster.join(', ')}]`);
            for (const agentId of cluster) {
                const params = paramsMap.get(agentId)!;
                // Penalize by dividing weight among cluster members
                params.w /= cluster.length;
            }
        }
    }

    /**
     * Heuristic to detect if two agents are "blindly" conforming.
     * Checks if final score and evolution pattern are nearly identical.
     */
    private static isSuspiciouslySimilar(a: JMSMessage, b: JMSMessage): boolean {
        const scoreA = this.extractScore(a.data);
        const scoreB = this.extractScore(b.data);

        // Core score is nearly identical
        const scoreDiff = Math.abs(scoreA - scoreB);
        if (scoreDiff > 0.01) return false;

        // Evolution length is identical
        if ((a.evolution?.length || 0) !== (b.evolution?.length || 0)) return false;

        // This is a simplified check for the demo. In prod, we'd compare the evolution vectors.
        return true;
    }

    /**
     * Analyzes the cognitive trajectory of an agent.
     * Rewards steady convergence/persistence and penalizes erratic jumps.
     */
    private static calculateTrajectoryFactor(evolution: any[]): number {
        if (evolution.length < 3) return 1.0;

        let totalChange = 0;
        let directionChanges = 0;
        let lastDiff = 0;

        for (let i = 1; i < evolution.length; i++) {
            const diff = evolution[i].score - evolution[i - 1].score;
            totalChange += Math.abs(diff);

            if (i > 1) {
                // If sign of diff changes, it's an oscillation
                if ((diff > 0 && lastDiff < 0) || (diff < 0 && lastDiff > 0)) {
                    directionChanges++;
                }
            }
            lastDiff = diff;
        }

        // 1. Persistence Bonus: If very low total change and high confidence
        if (totalChange < 0.05) return 1.15;

        // 2. Convergence Bonus: If moving in one direction towards final value
        if (directionChanges === 0 && totalChange < 0.3) return 1.1;

        // 3. Fluctuation Penalty: Multiple direction changes or high oscillation
        if (directionChanges >= 2) return 0.7;
        if (totalChange > 0.5) return 0.85;

        return 1.0;
    }

    /**
     * Calculate opinion stability based on evolution history.
     * Higher is more stable.
     */
    private static calculateOpinionStability(evolution: any[]): number {
        if (evolution.length < 2) return 1.0;

        // Calculate variance of scores
        const scores = evolution.map(e => e.score);
        const mean = scores.reduce((a, b) => a + b) / scores.length;
        const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;

        // Check if it's converging (last score should be close to trend)
        // High variance in a short period suggests instability
        const volatility = Math.sqrt(variance);

        // Simple stability metric: 1 - volatility (normalized)
        return Math.max(0, 1 - (volatility * 2));
    }

    /**
     * Extract normalized score from message data
     */
    private static extractScore(data: Record<string, any>): number {
        return data.score || 0;
    }

    /**
     * Make decision based on score and threshold
     */
    static makeDecision(
        score: number,
        threshold: number = 0.6,
        margin: number = 0.1
    ): 'APPROVE' | 'REJECT' | 'MANUAL_REVIEW' {
        if (score > threshold + margin) {
            return 'APPROVE';
        } else if (score < threshold - margin) {
            return 'REJECT';
        } else {
            return 'MANUAL_REVIEW';
        }
    }

    /**
     * Calculate confidence in the decision
     */
    static calculateConfidence(
        messages: JMSMessage[],
        score: number
    ): number {
        const validMessages = messages.filter(m => m.ε === null);

        if (validMessages.length === 0) return 0;

        // Average lambda of contributing agents
        const avgLambda = validMessages.reduce((sum, m) => sum + m.λ, 0) / validMessages.length;

        // Distance from borderline (0.5)
        const distanceFromBorderline = Math.abs(score - 0.5);

        // Confidence is combination of agent confidence and score clarity
        return Math.min(1.0, avgLambda * (0.5 + distanceFromBorderline));
    }

    /**
     * Get list of contributing and excluded agents
     */
    static getAgentLists(messages: JMSMessage[]): {
        contributing: string[];
        excluded: string[];
    } {
        const contributing: string[] = [];
        const excluded: string[] = [];

        for (const msg of messages) {
            if (msg.ε === null) {
                contributing.push(msg.agent);
            } else {
                excluded.push(msg.agent);
            }
        }

        return { contributing, excluded };
    }
}
