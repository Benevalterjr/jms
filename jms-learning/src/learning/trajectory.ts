export class TrajectoryAnalysis {
    /**
     * Analyzes the cognitive trajectory of an agent.
     * Rewards steady convergence/persistence and penalizes erratic jumps.
     */
    static calculateFactor(evolution: any[]): number {
        if (evolution.length < 3) return 1.0;

        let totalChange = 0;
        let directionChanges = 0;
        let lastDiff = 0;

        for (let i = 1; i < evolution.length; i++) {
            const diff = evolution[i].score - evolution[i - 1].score;
            totalChange += Math.abs(diff);

            if (i > 1) {
                if ((diff > 0 && lastDiff < 0) || (diff < 0 && lastDiff > 0)) {
                    directionChanges++;
                }
            }
            lastDiff = diff;
        }

        if (totalChange < 0.05) return 1.15; // Persistence Bonus
        if (directionChanges === 0 && totalChange < 0.3) return 1.1; // Convergence Bonus
        if (directionChanges >= 2) return 0.7; // Fluctuation Penalty
        if (totalChange > 0.5) return 0.85; // High Volatility Penalty

        return 1.0;
    }
}
