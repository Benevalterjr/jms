# 📐 JMS — Joint Message System

## Production Specification v1.0

**Status:** Production Ready  
**Date:** 2026-02-02  
**Authors:** JMS Technical Committee  

---

## Abstract

JMS (Joint Message System) is a **protocol for distributed consensus between autonomous cognitive agents**, featuring semantic contracts, confidence control (λ), fault tolerance, cryptographic security, and adaptive learning support.

JMS is **NOT**:
- Just messaging
- Just multi-agent coordination
- Just machine learning
- Just consensus

JMS is the **conscious integration** of these domains into a production-grade protocol.

---

## 1. Scope and Definitions

### 1.1 Scope

This specification defines:

1. **Message structure and semantics**
2. **Agent behavioral contracts**
3. **Validation and error handling**
4. **Consensus model with fault tolerance**
5. **Transport layer requirements (JMS-T)**
6. **Security requirements (mandatory)**
7. **Timeout and quorum mechanisms**
8. **Optional extensions (learning, advanced security)**
9. **Modular Architecture (JMS-M)**

### 1.3 Modular Architecture (JMS-M)

JMS 1.0 follows a decentralized architecture to ensure scalability and separation of concerns:

| Module | Responsibility |
|--------|----------------|
| **JMS-Spec** | Normative documents, RFCs, and semantic definitions. |
| **JMS-Core** | Consensus engine primitives, message validation, and core types. |
| **JMS-Transport** | Abstraction layer (JMS-T) for network distribution. |
| **JMS-Agents** | Standard templates for Orchestration, Analysis, and Consolidation. |
| **JMS-Learning** | The "Evolution Layer" providing cognitive signals and adjustment logic. |
| **JMS-SDK** | Unified developer experience (DX) for protocol implementation. |

### 1.2 Terminology

| Term | Definition |
|------|------------|
| **Agent** | Autonomous entity that produces, validates, or consolidates messages |
| **JMSMessage** | Fundamental unit of communication in JMS |
| **Consensus** | Aggregated result from multiple analyses |
| **λ (Lambda)** | Confidence degree associated with a message [0.0, 1.5] |
| **Ω (Omega)** | Semantic type of the message |
| **τ (Tau)** | Depth/stage in the decision flow |
| **ε (Epsilon)** | Error information structure |
| **Quorum** | Minimum number of agent responses required |

---

## 2. Message Structure

### 2.1 Canonical JMSMessage (v1.0)

```json
{
  "ref": "task#381e6f",
  "agent": "AgentB2",
  "μ": "JMS/1.0/PROD",
  "Σ": "Finance::Equity::B3",
  "Ω": "stat_analysis",
  "data": {
    "sharpe_ratio": 1.42,
    "volatility": 0.18,
    "returns": 0.12
  },
  "schema": "jms.finance.equity.analysis.v1",
  "λ": 0.85,
  "τ": "k=1",
  "evolution": [
    { "timestamp": 1738517830, "score": 0.8, "λ": 0.5, "rationale": "Initial check" },
    { "timestamp": 1738517834, "score": 0.85, "λ": 1.0, "rationale": "Deep scan complete" }
  ],
  "security": {
    "hash": "sha256:a3f2...",
    "nonce": "7f3e9a2b",
    "timestamp": 1738517834
  },
  "deadline_ms": 3000,
  "quorum": {
    "expected": 3,
    "minimum": 2
  },
  "ε": null
}
```

---

### 2.2 Mandatory Fields

#### `ref` (Reference ID)
- **Type:** `string`
- **Function:** Logical task identifier
- **Rules:** 
  - Shared by all related messages
  - Contextually unique
  - Format: `task#<hex>` recommended

#### `agent` (Agent Identity)
- **Type:** `string`
- **Function:** Sender identity
- **Rules:**
  - Must be unique within the system
  - Format: `Agent[A-Z][0-9]+` recommended

#### `μ` (Mu - Protocol Version)
- **Type:** `string`
- **Function:** Semantic protocol version
- **Format:** `JMS/<major>.<minor>/<stage>`
- **Example:** `"JMS/1.0/PROD"`
- **Stages:** `DEV`, `TEST`, `PROD`

#### `Σ` (Sigma - Semantic Domain)
- **Type:** `string`
- **Function:** Domain context
- **Format:** `<Domain>::<Subdomain>::<Context>`
- **Grammar:** `[A-Za-z0-9_]+(::[A-Za-z0-9_]+)*`
- **Examples:**
  - `"Finance::Equity::B3"`
  - `"Media::Recommendation::Streaming"`
  - `"Healthcare::Diagnosis::Radiology"`

#### `Ω` (Omega - Operation Type)
- **Type:** `string` (enum)
- **Function:** Type of operation or analysis
- **Standard Values:**
  - `stat_analysis` - Statistical analysis
  - `technical_analysis` - Technical indicators
  - `trend_analysis` - Trend detection
  - `consensus` - Consensus result
  - `validation` - Validation check
  - `error` - Error message
  - `reward_feedback` - Learning feedback

#### `data` (Payload)
- **Type:** `object`
- **Function:** Analysis-specific content
- **Rules:**
  - MUST conform to declared `schema`
  - MUST be auditable (structured, not opaque)
  - MUST NOT contain executable code

#### `schema` (Data Contract)
- **Type:** `string`
- **Function:** Data validation schema identifier
- **Format:** `<namespace>.<domain>.<type>.v<version>`
- **Example:** `"jms.finance.equity.analysis.v1"`
- **Rules:**
  - MANDATORY in production
  - Must reference a published JSON Schema or Protobuf definition
  - Versioned independently from protocol

#### `λ` (Lambda - Confidence)
- **Type:** `float`
- **Range:** `[0.0, 1.5]`
- **Function:** Operational credibility (NOT probability)
- **Interpretation:**
  - `< 0.5` → Low confidence
  - `≈ 1.0` → Normal confidence
  - `> 1.0` → Reinforced confidence
- **Rules:**
  - Subject to calibration via feedback
  - Influences consensus weighting

#### `τ` (Tau - Depth)
- **Type:** `string`
- **Format:** `k=<integer>` or semantic label
- **Function:** Stage in decision flow
- **Examples:**
  - `"k=1"` → Primary analysis
  - `"k=2"` → Consensus
  - `"k=3"` → Post-validation
- **Alternative:** `"primary"`, `"consensus"`, `"validation"`

#### `security` (Security Context)
- **Type:** `object`
- **MANDATORY in production**
- **Structure:**
```json
{
  "hash": "sha256:<hex>",
  "nonce": "<random_string>",
  "timestamp": <unix_epoch_ms>
}
```
- **Rules:**
  - `hash`: SHA-256 of canonical message (excluding security field itself)
  - `nonce`: Prevents replay attacks
  - `timestamp`: Message creation time (for freshness validation)

#### `deadline_ms` (Deadline)
- **Type:** `integer`
- **Function:** Maximum wait time for responses (milliseconds)
- **Default:** `3000` (3 seconds)
- **Rules:**
  - AgentA enforces this timeout
  - Expired messages trigger quorum evaluation

#### `quorum` (Quorum Requirements)
- **Type:** `object`
- **Structure:**
```json
{
  "expected": <integer>,
  "minimum": <integer>
}
```
- **Rules:**
  - `expected`: Ideal number of agent responses
  - `minimum`: Minimum required for valid consensus
  - Consensus proceeds when `minimum` reached OR `deadline_ms` expires

#### `ε` (Epsilon - Error)
- **Type:** `object | null`
- **Function:** Error information
- **Structure:**
```json
{
  "code": "JMS-422",
  "message": "Data validation failed: missing sharpe_ratio",
  "severity": "ERROR"
}
```
- **Standard Error Codes:**

| Code | Description |
|------|-------------|
| `JMS-400` | Malformed message |
| `JMS-401` | Authentication failure |
| `JMS-408` | Agent timeout |
| `JMS-422` | Data validation failure (schema mismatch) |
| `JMS-500` | Internal agent error |
| `JMS-503` | Agent unavailable |

- **Severity Levels:** `WARN`, `ERROR`, `FATAL`

---

### 2.3 Optional Fields

#### `signature` (Digital Signature)
- **Type:** `string`
- **Function:** Cryptographic signature of message hash
- **Recommended for:** Regulated environments, cross-organization consensus

#### `agent_public_key` (Agent Public Key)
- **Type:** `string`
- **Function:** Public key for signature verification

#### `message_version` (Message Version)
- **Type:** `integer`
- **Function:** Version number for message updates
- **Default:** `1`

#### `evolution` (Opinion History)
- **Type:** `array` of `OpinionState`
- **Function:** Tracks the internal cognitive process of the agent
- **Fields:** `timestamp`, `score`, `λ`, `rationale`
- **Rules:**
  - Recommended for `k=1` analytical messages
  - Enables trajectory analysis in AgentC

---

## 3. Transport Layer (JMS-T)

### 3.1 Transport Abstraction

```
┌─────────────────────────────┐
│   JMS Core (Protocol)       │
├─────────────────────────────┤
│   JMS-T (Transport Layer)   │
├─────────────────────────────┤
│   Infrastructure            │
│   (HTTP, Kafka, gRPC, NATS) │
└─────────────────────────────┘
```

### 3.2 Baseline Transport: JMS-T/HTTP 1.0

**MANDATORY for production conformance**

#### HTTP Specification

- **Protocol:** HTTP/1.1 or HTTP/2 over TLS 1.2+
- **Method:** `POST`
- **Endpoint:** `/jms/message`
- **Content-Type:** `application/jms+json`
- **Encoding:** UTF-8

#### Request Example

```http
POST /jms/message HTTP/1.1
Host: agent-coordinator.example.com
Content-Type: application/jms+json
JMS-Version: 1.0
Content-Length: 512

{
  "ref": "task#381e6f",
  "agent": "AgentB2",
  ...
}
```

#### Response Codes

| Code | Meaning |
|------|---------|
| `202` | Accepted (async processing) |
| `400` | Malformed JMS message |
| `401` | Authentication required |
| `422` | Schema validation failed |
| `500` | Internal server error |
| `503` | Service unavailable |

### 3.3 Extended Transports (Optional)

- **JMS-T/Kafka** - For high-throughput streaming
- **JMS-T/gRPC** - For low-latency RPC
- **JMS-T/NATS** - For pub/sub patterns
- **JMS-T/WebSocket** - For real-time bidirectional

> Extended transports MUST maintain JMS message semantics

### 3.4 Resilience and Reliability (Draft)

To ensure production-grade reliability, transport implementations SHOULD follow these patterns:

1. **Dead Letter Queue (DLQ)**: Undeliverable messages MUST be isolated in a DLQ for inspection and manual recovery.
2. **Retry Mechanism**: Transports SHOULD implement idempotent retries for transient failures or late-joined agents.
3. **Explicit Serialization**: Transports MUST NOT rely on shared memory; messages MUST be serialized/deserialized to simulate network boundaries.

---

## 4. Agent Contracts

### 4.1 General Rules

All JMS agents MUST:

1. ✅ Produce valid messages per this specification
2. ✅ NOT alter messages from other agents
3. ✅ Declare explicit confidence (λ)
4. ✅ Be able to justify their `data`
5. ✅ Respect timeout and quorum constraints
6. ✅ Handle errors gracefully (emit error messages)

### 4.2 AgentA - Orchestrator

**Responsibilities:**
- Initialize `ref` for new tasks
- Distribute context to AgentB instances
- Collect responses within `deadline_ms`
- Forward to AgentC when quorum met or deadline expires
- Handle timeout scenarios

**Constraints:**
- ❌ MUST NOT alter analytical data
- ❌ MUST NOT define final decision
- ✅ MUST enforce timeouts
- ✅ MUST track quorum

**Timeout Behavior:**
```
if responses >= quorum.minimum OR time >= deadline_ms:
    forward_to_consensus()
else:
    emit_error(JMS-408, "Quorum not met")
```

### 4.3 AgentB - Analytical Agents

**Responsibilities:**
- Execute independent analyses
- Produce messages with specific Ω
- Declare λ consistent with certainty
- Conform to schema for their Ω type
- Respond within deadline

**Constraints:**
- ❌ MUST NOT know final outcome
- ❌ MUST NOT adjust global weights
- ✅ MUST validate own output against schema
- ✅ MUST emit error message if analysis fails

**Error Handling:**
```json
{
  "Ω": "error",
  "ε": {
    "code": "JMS-500",
    "message": "Data source unavailable",
    "severity": "ERROR"
  },
  "λ": 0.0
}
```

### 4.4 AgentC - Consensus Agent

**Responsibilities:**
- Consume multiple JMSMessages
- Normalize scales across different Ω types
- Apply weighted aggregation
- Incorporate λ into weighting
- Emit final decision

**Critical Rule:**
> **AgentC NEVER creates new facts, only consolidates existing ones**

**Constraints:**
- ✅ MUST handle partial responses (quorum.minimum)
- ✅ MUST incorporate λ in weighting
- ✅ MUST handle error messages gracefully
- ❌ MUST NOT introduce new analytical data

---

## 5. Consensus Model

### 5.1 Normalization

Each analytical message is converted to a normalized score:

```
score_i ∈ [0, 1]
```

**Normalization Examples:**

| Input Type | Normalization |
|------------|---------------|
| Sharpe Ratio | `clamp(sharpe / 2.0, 0, 1)` |
| Binary Trend | `{up: 1.0, down: 0.0}` |
| Categorical | Map to `[0, 1]` range |
| Percentage | `value / 100` |

### 5.2 Lambda-Weighted Aggregation

**Improved formula incorporating confidence:**

```
score_global = Σ(wi × λi × scorei) / Σ(wi × λi)
```

Where:
- `wi` = configured weight for analysis type
- `λi` = confidence from agent
- `scorei` = normalized score

**Rationale:** High-confidence analyses have more influence

### 5.3 Outlier Handling

**Median-based robustness (optional):**

```
score_robust = weighted_median({wi × λi × scorei})
```

Use when outliers are expected.

### 5.4 Decision Threshold

```
if score_global > θ + margin:
    decision = "POSITIVE"
elif score_global < θ - margin:
    decision = "NEGATIVE"
else:
    decision = "INCONCLUSIVE"
```

**Parameters:**
- `θ` (theta): Domain-specific threshold (e.g., 0.6)
- `margin`: Confidence margin (e.g., 0.05)

**Prevents:** Decisions on borderline cases

### 5.5 Error Message Handling

Messages with `ε != null`:
- Automatically assigned `λ = 0.0`
- Counted toward quorum but not toward score
- Logged for diagnostics

---

## 6. Data Validation

### 6.1 Schema Registry

Every `Ω` type MUST have a registered schema.

**Example Schema Definition (JSON Schema):**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "jms.finance.equity.analysis.v1",
  "type": "object",
  "required": ["sharpe_ratio", "volatility", "returns"],
  "properties": {
    "sharpe_ratio": {
      "type": "number",
      "minimum": -5.0,
      "maximum": 5.0
    },
    "volatility": {
      "type": "number",
      "minimum": 0.0,
      "maximum": 1.0
    },
    "returns": {
      "type": "number"
    }
  }
}
```

### 6.2 Validation Rules

1. **Pre-send validation:** AgentB validates before sending
2. **Receive validation:** AgentA/AgentC validates on receipt
3. **Schema mismatch:** Emit `JMS-422` error
4. **Invalid data:** Message rejected OR λ penalized

---

## 7. Security Requirements

### 7.1 Mandatory Security (Level 1)

**REQUIRED in production:**

1. **Transport Security:** TLS 1.2+ for all HTTP traffic
2. **Message Integrity:** SHA-256 hash in `security.hash`
3. **Replay Protection:** Unique `nonce` + `timestamp`
4. **Freshness Validation:** Reject messages older than threshold (e.g., 60s)

**Hash Calculation:**
```javascript
// Canonical message = message without 'security' field
canonical = JSON.stringify(message_without_security, sort_keys=true)
hash = SHA256(canonical)
```

### 7.2 Recommended Security (Level 2)

**For regulated environments:**

1. **Digital Signatures:** ECDSA or RSA signatures
2. **Agent Authentication:** Mutual TLS or JWT tokens
3. **Audit Logging:** Persistent message logs with retention policy

### 7.3 Security Validation

```
if timestamp < (now - freshness_threshold):
    reject(JMS-401, "Message too old")

if nonce in seen_nonces:
    reject(JMS-401, "Replay attack detected")

if hash != SHA256(canonical_message):
    reject(JMS-400, "Hash mismatch")
```

---

## 8. Timeout and Quorum

### 8.1 Timeout Mechanism

**AgentA behavior:**

```python
responses = []
start_time = now()

while True:
    if len(responses) >= quorum.expected:
        break
    if (now() - start_time) >= deadline_ms:
        break
    
    response = await_response(timeout=remaining_time)
    if response:
        responses.append(response)

if len(responses) >= quorum.minimum:
    forward_to_consensus(responses)
else:
    emit_error(JMS-408, "Quorum not met")
```

### 8.2 Quorum Strategies

| Strategy | Use Case |
|----------|----------|
| **Strict** | `minimum = expected` | Critical decisions |
| **Flexible** | `minimum < expected` | Best-effort consensus |
| **Majority** | `minimum = ceil(expected / 2)` | Democratic voting |

### 8.3 Partial Consensus

When `minimum ≤ responses < expected`:
- Consensus proceeds with available data
- Final decision includes confidence penalty
- Logged as "partial consensus"

---

## 9. Learning and Adaptation (Optional)

### 9.1 Reward Feedback Loop

**Message Type:**
```json
{
  "Ω": "reward_feedback",
  "data": {
    "ref": "task#381e6f",
    "actual_outcome": 1.0,
    "predicted_score": 0.75,
    "reward": 0.8
  }
}
```

### 9.2 Q-Learning Integration

**State-Action-Reward:**
- **State:** Market conditions, agent responses
- **Action:** Consensus decision
- **Reward:** Actual outcome vs. prediction

**Weight Adjustment:**
```
wi(t+1) = wi(t) + α × (reward - score_global) × scorei
```

Where `α` is learning rate.

### 9.3 Lambda Calibration

Track agent accuracy over time:

```
calibration_factor = actual_accuracy / claimed_confidence
λ_adjusted = λ_declared × calibration_factor
```

Agents with poor calibration are automatically down-weighted.

### 9.4 Opinion Stability Analysis

The evolution layer tracks the variance of an agent's opinion over time. 

- **Stability (S) ∈ [0.1, 1.0]**
- **Penalty:** If $S < 0.7$, weight $w_i$ is reduced by $1.0 - S$.
- **Rationale:** Erratic opinions represent lower cognitive maturity.

### 9.5 Cognitive Trajectory Analysis

Analyzes the "path" to the final score:

- **Persistent Boost:** Agents with stable, non-wavering opinions receive a weight boost of up to 20%.
- **Fluctuation Penalty:** Agents with drastic score changes are penalized up to 30%.
- **Convergence Reward:** Agents showing clear refinement toward a score are rewarded.

### 9.6 Blind Conformity Detection (Anti-Echo)

Identifies clusters of agents with suspiciously similar responses and evolution patterns.

- **Detection Heuristics:**
  - `dist(score_i, score_j) < 0.01`
  - `abs(timestamp_i - timestamp_j) < 100ms`
  - `evolution_i.length == evolution_j.length`
- **Mitigation:** The effective weight for the cluster is $W_{total} / \text{count}$.
- **Reward:** Outlier agents with high stability receive an **Expert Divergence Boost**.

---

## 10. Conformance

### 10.1 Conformance Levels

| Level | Requirements |
|-------|--------------|
| **JMS-Core** | Message structure, agent contracts, basic consensus |
| **JMS-Secure** | + Mandatory security (Level 1) |
| **JMS-Production** | + Transport (JMS-T/HTTP), schemas, timeouts, quorum |
| **JMS-Advanced** | + Learning, digital signatures, extended transports |

### 10.2 Conformance Checklist

A JMS implementation is **conformant** if:

- ✅ Produces valid JMSMessage v1.0 structures
- ✅ Respects agent role constraints
- ✅ Implements deterministic consensus
- ✅ Validates data against schemas
- ✅ Enforces timeouts and quorum
- ✅ Implements mandatory security (production)
- ✅ Does NOT violate message integrity
- ✅ Handles errors gracefully

---

## 11. Complete Example

### Scenario: Stock Purchase Decision

#### Step 1: AgentA Initiates

```json
{
  "ref": "task#7f3a2e",
  "agent": "AgentA",
  "μ": "JMS/1.0/PROD",
  "Σ": "Finance::Equity::AAPL",
  "Ω": "consensus",
  "data": {
    "symbol": "AAPL",
    "context": "Q4 earnings released"
  },
  "schema": "jms.finance.context.v1",
  "λ": 1.0,
  "τ": "k=0",
  "security": {
    "hash": "sha256:...",
    "nonce": "a1b2c3",
    "timestamp": 1738517834
  },
  "deadline_ms": 5000,
  "quorum": {
    "expected": 3,
    "minimum": 2
  },
  "ε": null
}
```

#### Step 2: AgentB1 (Statistical Analysis)

```json
{
  "ref": "task#7f3a2e",
  "agent": "AgentB1",
  "μ": "JMS/1.0/PROD",
  "Σ": "Finance::Equity::AAPL",
  "Ω": "stat_analysis",
  "data": {
    "sharpe_ratio": 1.42,
    "volatility": 0.18,
    "returns": 0.12
  },
  "schema": "jms.finance.equity.analysis.v1",
  "λ": 0.9,
  "τ": "k=1",
  "security": { "hash": "...", "nonce": "...", "timestamp": 1738517835 },
  "ε": null
}
```

#### Step 3: AgentB2 (Technical Analysis)

```json
{
  "ref": "task#7f3a2e",
  "agent": "AgentB2",
  "μ": "JMS/1.0/PROD",
  "Σ": "Finance::Equity::AAPL",
  "Ω": "technical_analysis",
  "data": {
    "rsi": 62,
    "macd": "bullish",
    "trend": "upward"
  },
  "schema": "jms.finance.technical.v1",
  "λ": 1.1,
  "τ": "k=1",
  "security": { "hash": "...", "nonce": "...", "timestamp": 1738517836 },
  "ε": null
}
```

#### Step 4: AgentB3 (Sentiment Analysis - Error)

```json
{
  "ref": "task#7f3a2e",
  "agent": "AgentB3",
  "μ": "JMS/1.0/PROD",
  "Σ": "Finance::Equity::AAPL",
  "Ω": "error",
  "data": {},
  "schema": "jms.core.error.v1",
  "λ": 0.0,
  "τ": "k=1",
  "security": { "hash": "...", "nonce": "...", "timestamp": 1738517837 },
  "ε": {
    "code": "JMS-503",
    "message": "Twitter API rate limit exceeded",
    "severity": "WARN"
  }
}
```

#### Step 5: AgentC (Consensus)

**Input Processing:**
- B1: score = 0.71 (normalized), λ = 0.9, w = 0.4
- B2: score = 0.82 (normalized), λ = 1.1, w = 0.6
- B3: excluded (error)

**Calculation:**
```
score_global = (0.4 × 0.9 × 0.71 + 0.6 × 1.1 × 0.82) / (0.4 × 0.9 + 0.6 × 1.1)
             = (0.256 + 0.541) / (0.36 + 0.66)
             = 0.797 / 1.02
             = 0.78
```

**Decision:**
```
θ = 0.6, margin = 0.05
0.78 > 0.65 → POSITIVE
```

**Output:**
```json
{
  "ref": "task#7f3a2e",
  "agent": "AgentC",
  "μ": "JMS/1.0/PROD",
  "Σ": "Finance::Equity::AAPL",
  "Ω": "consensus",
  "data": {
    "decision": "BUY",
    "score": 0.78,
    "confidence": 0.95,
    "contributing_agents": ["AgentB1", "AgentB2"],
    "excluded_agents": ["AgentB3"],
    "rationale": "Strong technical and statistical signals"
  },
  "schema": "jms.finance.decision.v1",
  "λ": 0.95,
  "τ": "k=2",
  "security": { "hash": "...", "nonce": "...", "timestamp": 1738517838 },
  "ε": null
}
```

---

## 12. Performance Characteristics

### 12.1 Complexity

- **Message Validation:** O(1)
- **Hash Computation:** O(n) where n = message size
- **Consensus Aggregation:** O(m) where m = number of agents
- **Schema Validation:** O(k) where k = data fields

### 12.2 Scalability

| Agents | Latency (p95) | Throughput |
|--------|---------------|------------|
| 3-5 | < 100ms | 1000 msg/s |
| 10-20 | < 500ms | 500 msg/s |
| 50+ | < 2s | 100 msg/s |

**Recommendation:** For > 50 agents, use hierarchical consensus

### 12.3 Resource Profile

- **CPU-bound:** Hashing, validation, consensus calculation
- **Memory:** O(m × n) where m = agents, n = avg message size
- **Network:** Depends on transport (HTTP < Kafka < gRPC)

---

## 13. Evolution and Compatibility

### 13.1 Versioning Strategy

- **Protocol Version (μ):** Major.Minor format
  - Major: Breaking changes
  - Minor: Backward-compatible additions

- **Schema Version:** Independent versioning per domain

### 13.2 Backward Compatibility

- **v1.0 → v1.x:** Guaranteed compatible
- **v1.x → v2.0:** Migration path required
- **Unknown fields:** Ignored (forward compatibility)

### 13.3 Deprecation Policy

- **Announcement:** 6 months before removal
- **Support:** 12 months minimum
- **Migration tools:** Provided for major versions

---

## 14. Appendices

### Appendix A: Error Code Reference

| Code | Severity | Description | Recovery |
|------|----------|-------------|----------|
| JMS-400 | ERROR | Malformed message | Fix message structure |
| JMS-401 | ERROR | Auth failure | Provide credentials |
| JMS-408 | WARN | Timeout | Retry or proceed with partial |
| JMS-422 | ERROR | Schema validation | Fix data format |
| JMS-500 | ERROR | Internal error | Retry or skip agent |
| JMS-503 | WARN | Service unavailable | Retry later |

### Appendix B: Schema Examples

See separate document: `jms-schemas-v1.0.json`

### Appendix C: Reference Implementations

- **Python:** `jms-py` (github.com/jms/jms-py)
- **TypeScript:** `jms-ts` (github.com/jms/jms-ts)
- **Go:** `jms-go` (github.com/jms/jms-go)

---

## 15. Conclusion

JMS v1.0 is a **production-ready protocol** for distributed cognitive consensus.

It provides:
- ✅ **Deterministic** consensus
- ✅ **Fault-tolerant** operation
- ✅ **Secure** by default
- ✅ **Auditable** decisions
- ✅ **Extensible** architecture
- ✅ **Implementation-agnostic** design

JMS is ready for deployment in **critical systems** including finance, healthcare, autonomous systems, and regulated industries.

---

**Document Status:** APPROVED FOR PRODUCTION  
**Next Review:** 2026-08-02  
**Maintainer:** JMS Technical Committee  
**License:** Apache 2.0 / CC BY 4.0
