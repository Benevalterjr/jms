# JMS TypeScript MVP

Reference implementation of the **Joint Message System (JMS) Protocol v1.0**.

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Running the Demos

#### 1. Deep Resilience Demo (Recommendation)
This is the most advanced demo. It showcases:
- **Asynchronous Transport (JMS-T):** Real network simulation.
- **Strict Validation:** AJV-powered JSON Schema enforcement.
- **Resilience:** Automatic filtering of malicious noise (`AgentChaos`).
```bash
npx ts-node src/deep_demo.ts
```

#### 2. Business Logic Demo
The classic 4-scenario credit approval process.
```bash
npx ts-node src/example.ts
```

#### 3. Massive Scale Simulation (Three-Body Problem)
Simulation of 10 agents solving a chaotic physics system.
```bash
npx ts-node src/3body.ts
```

## 🏗️ Architecture

- **`src/core/`**: Protocol primitives (Message, Security, Consensus).
- **`src/agents/`**: Reference agent implementations.
- **`src/schemas/`**: Formal contract definitions.
- **`src/types/`**: Protocol's semantic types (Σ, Ω, λ, τ).

## 🛡️ Security
All messages use **SHA-256** integrity hashes and **Nonce/Timestamp** replay protection as mandated by JMS Level 1 Conformance.
