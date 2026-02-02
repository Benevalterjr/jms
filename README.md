# 📐 JMS — Joint Message System

[![Version](https://img.shields.io/badge/jms-v1.0-blue.svg)](https://github.com/jms-protocol/spec)
[![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)](LICENSE)
[![Stability](https://img.shields.io/badge/stability-mvp--ready-brightgreen.svg)](https://github.com/jms-protocol/spec)

**JMS (Joint Message System)** is a high-performance, security-first protocol designed for **distributed cognitive consensus** between autonomous agents. 

Unlike traditional messaging systems, JMS focuses on the **emergence of meaning** from independentanalytical perspectives through a lambda-weighted consensus model.

---

## 🚀 Key Features

- **λ-Weighted Consensus:** Decisions are weighted by operational confidence (Lambda), not just majority.
- **Production-Grade Security:** SHA-256 integrity, nonce-based replay protection, and mandatory timestamps.
- **Semantic Contracts:** Every message follows strict domain (`Σ`) and operation (`Ω`) definitions.
- **Fault-Tolerant by Design:** Integrated error handling (`ε`) and configurable quorum/deadline mechanisms.
- **Implementation Agnostic:** Works over HTTP, Kafka, gRPC, or any transport through the **JMS-T** layer.

---

## 📂 Project Structure

- **[`spec/`](jms_spec_v1.0.md):** Formal protocol specification (v1.0).
- **[`jms-mvp/`](jms-mvp/):** Reference TypeScript implementation.
  - **[Deep Resilience Demo](jms-mvp/src/deep_demo.ts):** Async transport + Strict validation (Gold Standard).
  - [Credit Approval MVP](jms-mvp/src/example.ts): Business logic simulation.
  - [Massive 10-Agent Three-Body Simulation](jms-mvp/src/3body.ts): Stress test.
- **[`reports/`](jms_final_report.md):** Experimental data and validation reports.

---

## 🛠️ Quick Start (TypeScript)

```bash
cd jms-mvp
npm install

# 🎯 RUN DEEP RESILIENCE DEMO (Recommended)
npx ts-node src/deep_demo.ts

# Run business logic scenarios
npm run dev
```

---

## 🧠 Why JMS?

JMS was designed for critical systems where "eventual consistency" isn't enough. It solves the **Cognitive Consensus** problem: how to reach a stable, non-arbitrary truth when multiple agents provide potentially noisy or conflicting data.

> "If a decision is made in the chaos, JMS ensures it represents the most credible path."

---

## 🤝 Contributing

We welcome collaborators! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

---

## 📄 License

JMS is licensed under the [Apache License 2.0](LICENSE). 
Documentation is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
