import { JMSMessage } from '../../../jms-core/src/types/jms';

export class ConformityDetection {
    /**
     * Detects groups of agents with suspiciously identical outputs.
     * O(N) implementation using bucketing.
     */
    static detectClusters(messages: JMSMessage[]): string[][] {
        const validMsgs = messages.filter(m => m.ε === null);
        if (validMsgs.length < 2) return [];

        // Bucket by: Quantized Score (0.01 resolution) + Evolution Length
        const buckets = new Map<string, string[]>();

        for (const msg of validMsgs) {
            const score = msg.data.score || 0;
            const quantizedScore = Math.round(score * 100); // 0.01 precision
            const evolutionLen = msg.evolution?.length || 0;

            // We use a "loose" key. For full O(N), we can't do fuzzy time match easily without N^2,
            // but we can bucket by time window (e.g. 100ms blocks)
            const timeBucket = Math.floor(msg.security.timestamp / 100);

            const key = `s:${quantizedScore}|e:${evolutionLen}|t:${timeBucket}`;

            if (!buckets.has(key)) {
                buckets.set(key, []);
            }
            buckets.get(key)!.push(msg.agent);
        }

        const clusters: string[][] = [];
        for (const agents of buckets.values()) {
            if (agents.length > 1) {
                clusters.push(agents);
            }
        }

        return clusters;
    }
}
