import { JMSMessage } from '../types/jms';

/**
 * Consensus Engine (Base)
 * Implements lambda-weighted consensus per JMS v1.0 spec.
 * Agnostic to learning signals (handled by jms-learning).
 */
export class ConsensusEngine {
    /**
     * Calculate lambda-weighted consensus score
     * Formula: score_global = Σ(wi × λi × scorei) / Σ(wi × λi)
     */
    static calculate(
        messages: JMSMessage[],
        weights: Record<string, number>,
        ajustmentCallback?: (msg: JMSMessage, currentWeight: number, currentLambda: number) => { w: number; λ: number }
    ): number {
        let numerator = 0;
        let denominator = 0;

        for (const msg of messages) {
            if (msg.ε !== null) continue;

            let w = weights[msg.Ω] || 1.0;
            let λ = msg.λ;

            // Apply external adjustments (Learning Signals, etc.)
            if (ajustmentCallback) {
                const adjusted = ajustmentCallback(msg, w, λ);
                w = adjusted.w;
                λ = adjusted.λ;
            }

            const score = this.extractScore(msg.data);
            numerator += w * λ * score;
            denominator += w * λ;
        }

        return denominator > 0 ? numerator / denominator : 0;
    }

    /**
     * Extract normalized score from message data
     */
    static extractScore(data: Record<string, any>): number {
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

        const avgLambda = validMessages.reduce((sum, m) => sum + m.λ, 0) / validMessages.length;
        const distanceFromBorderline = Math.abs(score - 0.5);
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
