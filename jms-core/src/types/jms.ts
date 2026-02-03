/**
 * JMS Protocol v1.0 - Core Type Definitions
 */

export interface OpinionState {
    timestamp: number;
    score: number;
    λ: number;
    rationale?: string;
}

export interface JMSMessage {
    ref: string;
    agent: string;
    μ: string;  // Protocol version (mu)
    Σ: string;  // Semantic domain (sigma)
    Ω: string;  // Operation type (omega)
    data: Record<string, any>;
    schema: string;
    λ: number;  // Confidence (lambda) [0.0, 1.5]
    τ: string;  // Depth/stage (tau)
    evolution?: OpinionState[]; // Opinion evolution history
    security: SecurityContext;
    deadline_ms: number;
    quorum: QuorumConfig;
    ε: ErrorInfo | null;  // Error (epsilon)
}

export interface SecurityContext {
    hash: string;
    nonce: string;
    timestamp: number;
}

export interface QuorumConfig {
    expected: number;
    minimum: number;
}

export interface ErrorInfo {
    code: string;
    message: string;
    severity: 'WARN' | 'ERROR' | 'FATAL';
}

export interface MessageParams {
    ref: string;
    agent: string;
    domain: string;
    operation: string;
    data: Record<string, any>;
    schema: string;
    lambda: number;
    tau: string;
    evolution?: OpinionState[];
    deadline_ms?: number;
    quorum?: QuorumConfig;
}

// Domain types moved to domain-specific files (e.g. examples/domain_types.ts)

export interface AnalysisResult {
    score: number;
    rationale: string;
    details: Record<string, any>;
}

export interface ConsensusResult {
    decision: 'APPROVE' | 'REJECT' | 'MANUAL_REVIEW';
    score: number;
    confidence: number;
    contributing_agents: string[];
    excluded_agents: string[];
    rationale: string;
}
