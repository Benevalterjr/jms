import * as crypto from 'crypto';

/**
 * Security utilities for JMS messages
 */
export class SecurityUtils {
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
        const canonical = JSON.stringify(message, Object.keys(message).sort());
        const hash = crypto.createHash('sha256').update(canonical).digest('hex');
        return `sha256:${hash}`;
    }

    /**
     * Verify message hash
     */
    static verifyHash(message: any, expectedHash: string): boolean {
        const { security, ...messageWithoutSecurity } = message;
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
