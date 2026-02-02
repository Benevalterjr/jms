/**
 * JMS Protocol v1.0 - Core Type Definitions
 */

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
    deadline_ms?: number;
    quorum?: QuorumConfig;
}

export interface CreditApplication {
    applicant_id: string;
    credit_score: number;
    annual_income: number;
    loan_amount: number;
    monthly_debt: number;
    monthly_income: number;
}

export interface AnalysisResult {
    score: number;
    rationale: string;
    details: Record<string, any>;
}

export interface ConsensusResult {
    decision: 'APPROVE' | 'DENY' | 'MANUAL_REVIEW';
    score: number;
    confidence: number;
    contributing_agents: string[];
    excluded_agents: string[];
    rationale: string;
}
