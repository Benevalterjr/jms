import { JMSMessage, MessageParams, SecurityContext } from '../types/jms';
import { SecurityUtils } from './security';

/**
 * JMS Message Builder
 * Creates valid JMS v1.0 messages
 */
export class JMSMessageBuilder {
    /**
     * Create a new JMS message
     */
    static create(params: MessageParams): JMSMessage {
        // Build message without security first
        const messageWithoutSecurity: any = {
            ref: params.ref,
            agent: params.agent,
            μ: 'JMS/1.0/PROD',
            Σ: params.domain,
            Ω: params.operation,
            data: params.data,
            schema: params.schema,
            λ: params.lambda,
            τ: params.tau,
            deadline_ms: params.deadline_ms || 3000,
            quorum: params.quorum || { expected: 3, minimum: 2 },
            ε: null
        };

        // Generate security context
        const security: SecurityContext = {
            nonce: SecurityUtils.generateNonce(),
            timestamp: SecurityUtils.getTimestamp(),
            hash: SecurityUtils.calculateHash(messageWithoutSecurity)
        };

        // Complete message
        const message: JMSMessage = {
            ...messageWithoutSecurity,
            security
        };

        return message;
    }

    /**
     * Create a request message (Initial k=0/k=1)
     */
    static createRequest(agent: string, domain: string, operation: string, data: any, schema: string): JMSMessage {
        return this.create({
            ref: `task#${SecurityUtils.generateNonce().substring(0, 8)}`,
            agent,
            domain,
            operation,
            data,
            schema,
            lambda: 1.0,
            tau: 'k=1'
        });
    }

    /**
     * Create a response to a specific request
     */
    static createResponse(agent: string, request: JMSMessage, data: any, lambda: number, schema: string): JMSMessage {
        return this.create({
            ref: request.ref,
            agent,
            domain: request.Σ,
            operation: request.Ω,
            data,
            schema,
            lambda,
            tau: 'k=1'
        });
    }

    /**
     * Create a consensus request (AgentA -> AgentC)
     */
    static createConsensusRequest(agent: string, domain: string, analyses: JMSMessage[]): JMSMessage {
        return this.create({
            ref: analyses[0].ref,
            agent,
            domain,
            operation: 'consensus',
            data: analyses,
            schema: 'jms.core.consensus.v1',
            lambda: 1.0,
            tau: 'k=2'
        });
    }

    /**
     * Create an error message (ε)
     */
    static createError(agent: string, request: JMSMessage, code: string, message: string): JMSMessage {
        const errorMsg = this.create({
            ref: request.ref,
            agent,
            domain: 'Core::Error',
            operation: 'error',
            data: {},
            schema: 'jms.core.error.v1',
            lambda: 0.0,
            tau: 'k=1'
        });
        errorMsg.ε = {
            code,
            message,
            severity: 'ERROR'
        };
        return errorMsg;
    }

    /**
     * Validate message structure
     */
    static validate(message: JMSMessage): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Required fields
        if (!message.ref) errors.push('Missing field: ref');
        if (!message.agent) errors.push('Missing field: agent');
        if (!message.μ) errors.push('Missing field: μ');
        if (!message.Σ) errors.push('Missing field: Σ');
        if (!message.Ω) errors.push('Missing field: Ω');
        if (!message.schema) errors.push('Missing field: schema');
        if (message.λ === undefined) errors.push('Missing field: λ');
        if (!message.τ) errors.push('Missing field: τ');

        // Lambda range
        if (message.λ < 0.0 || message.λ > 1.5) {
            errors.push('λ must be in range [0.0, 1.5]');
        }

        // Security
        if (!message.security) {
            errors.push('Missing security context');
        } else {
            if (!message.security.hash) errors.push('Missing security.hash');
            if (!message.security.nonce) errors.push('Missing security.nonce');
            if (!message.security.timestamp) errors.push('Missing security.timestamp');
        }

        // Quorum
        if (!message.quorum) {
            errors.push('Missing quorum config');
        } else {
            if (message.quorum.minimum > message.quorum.expected) {
                errors.push('quorum.minimum cannot exceed quorum.expected');
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}
