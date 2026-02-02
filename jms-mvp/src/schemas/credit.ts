export const CreditSchemas = {
    // AgentA Input: Application Context
    "jms.finance.credit.context.v1": {
        "type": "object",
        "required": ["applicant_id", "loan_amount", "term_months"],
        "properties": {
            "applicant_id": { "type": "string" },
            "loan_amount": { "type": "number", "minimum": 0 },
            "term_months": { "type": "integer", "minimum": 1, "maximum": 360 }
        }
    },

    // AgentB Output: Analysis Result
    "jms.finance.credit.analysis.v1": {
        "type": "object",
        "required": ["score", "rationale"],
        "properties": {
            "score": { "type": "number", "minimum": 0, "maximum": 1 },
            "rationale": { "type": "string" },
            "metrics": {
                "type": "object",
                "additionalProperties": { "type": "number" }
            }
        }
    },

    // AgentC Output: Decision Result
    "jms.finance.credit.decision.v1": {
        "type": "object",
        "required": ["decision", "consensus_score", "rationale"],
        "properties": {
            "decision": { "type": "string", "enum": ["APPROVE", "REJECT", "MANUAL_REVIEW"] },
            "consensus_score": { "type": "number", "minimum": 0, "maximum": 1 },
            "confidence": { "type": "number", "minimum": 0, "maximum": 1.5 },
            "rationale": { "type": "string" }
        }
    }
};
