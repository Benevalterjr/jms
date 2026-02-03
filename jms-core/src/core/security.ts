import * as crypto from 'crypto';

export enum SecurityLevel {
    FULL = 'FULL',   // Hash verification + Strict
    LIGHT = 'LIGHT',  // Basic checksum or skip
    NONE = 'NONE'    // Pure speed
}

/**
 * Security utilities for JMS messages
 */
export class SecurityUtils {
    public static currentLevel: SecurityLevel = SecurityLevel.FULL;

    /**
     * Generate a random nonce
     */
    static generateNonce(): string {
        return crypto.randomBytes(8).toString('hex');
    }

    /**
     * Get current timestamp in milliseconds
     */
    static getTimestamp(): number {
        return Date.now();
    }

    /**
     * Calculate SHA-256 hash of canonical message
     * (message without security field)
     */
    static calculateHash(message: any): string {
        const canonical = JSON.stringify(this.sortObject(message));
        const hash = crypto.createHash('sha256').update(canonical).digest('hex');
        return `sha256:${hash}`;
    }

    /**
     * Recursively sort object keys for canonical representation
     */
    private static sortObject(obj: any): any {
        if (obj === null || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(item => this.sortObject(item));

        const sorted: any = {};
        Object.keys(obj).sort().forEach(key => {
            sorted[key] = this.sortObject(obj[key]);
        });
        return sorted;
    }

    /**
     * Verify message hash
     */
    static verifyHash(message: any, expectedHash: string): boolean {
        if (this.currentLevel === SecurityLevel.NONE) return true;

        const { security, ...messageWithoutSecurity } = message;

        if (this.currentLevel === SecurityLevel.LIGHT) {
            return !!expectedHash;
        }

        const calculatedHash = this.calculateHash(messageWithoutSecurity);
        return calculatedHash === expectedHash;
    }

    /**
     * Check if message is fresh (not too old)
     */
    static isFresh(timestamp: number, maxAgeMs: number = 60000): boolean {
        const now = Date.now();
        return (now - timestamp) <= maxAgeMs;
    }
}
