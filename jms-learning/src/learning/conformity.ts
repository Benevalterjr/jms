import { JMSMessage } from '../../../jms-core/src/types/jms';

export class ConformityDetection {
    /**
     * Detects groups of agents with suspiciously identical outputs.
     */
    static detectClusters(messages: JMSMessage[]): string[][] {
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
        return clusters;
    }

    private static isSuspiciouslySimilar(a: JMSMessage, b: JMSMessage): boolean {
        const scoreDiff = Math.abs((a.data.score || 0) - (b.data.score || 0));
        const timeDiff = Math.abs(a.security.timestamp - b.security.timestamp);

        // If score is nearly identical AND response time is nearly identical
        // AND "depth of thought" (evolution) is the same...
        return scoreDiff < 0.01 && timeDiff < 100 && (a.evolution?.length || 0) === (b.evolution?.length || 0);
    }
}
