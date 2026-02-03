export class StabilityAnalysis {
    /**
     * Calculate opinion stability based on evolution history.
     * Higher is more stable.
     */
    static calculate(evolution: any[]): number {
        if (evolution.length < 2) return 1.0;

        const scores = evolution.map(e => e.score);
        const mean = scores.reduce((a, b) => a + b) / scores.length;
        const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
        const volatility = Math.sqrt(variance);

        return Math.max(0, 1 - (volatility * 2));
    }
}
