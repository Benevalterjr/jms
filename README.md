# 📐 JMS — Joint Message System

[![Version](https://img.shields.io/badge/jms-v1.0-blue.svg)](jms-spec/jms_spec_v1.0.md)
[![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)](LICENSE)
[![Stability](https://img.shields.io/badge/stability-production--ready-brightgreen.svg)](jms-spec/jms_spec_v1.0.md)

**JMS (Joint Message System)** is a high-performance, security-first protocol designed for **distributed cognitive consensus** between autonomous agents. 

Unlike traditional messaging systems, JMS focuses on the **emergence of meaning** from independent analytical perspectives through a modular architecture and lambda-weighted consensus with cognitive feedback loops.

---

## 🚀 Key Features

- **🧠 Cognitive Evolution:** Tracks opinion stability, trajectories, and suppresses blind conformity (anti-echo).
- **📦 Modular Architecture:** Decentralized modules for Spec, Core, Transport, Learning, and Agents.
- **λ-Weighted Consensus:** Decisions are weighted by operational confidence (Lambda), refined by cognitive signals.
- **Transport Resilience:** Support for Dead Letter Queues (DLQ) and idempotent retries to handle agent unavailability.
- **Advanced Heuristics:** Highly granular conformity detection using variance, timing, and evolution history.
- **Production-Grade Security:** SHA-256 integrity, nonce-based replay protection, and mandatory timestamps.
- **Implementation Agnostic:** Works over HTTP, Kafka, gRPC, or any transport through the **JMS-T** layer.

---

## 📂 Project Structure

- **[`jms-spec/`](jms-spec/):** Formal protocol specification (v1.0) and normative documents.
- **[`jms-core/`](jms-core/):** Agnostic consensus motor and message primitives.
- **[`jms-learning/`](jms-learning/):** Cognitive intelligence layer (Trajectory, Conformity, Stability).
- **[`jms-transport/`](jms-transport/):** Transport abstraction layer and implementations.
- **[`jms-agents/`](jms-agents/):** Professional agent scaffolding and reference implementations.
- **[`jms-sdk/`](jms-sdk/):** Unified TypeScript entry point and multi-language support.
- **[`examples/`](examples/):** Demos showcasing modularity and cognitive resilience.

---

## 🛠️ Quick Start (Modular)

```bash
# Install dependencies
npm install

# 🎯 RUN MODULAR COGNITIVE DEMO (Recommended)
npx ts-node examples/modular_demo.ts
```

---

## 🧠 Why JMS?

JMS was designed for critical systems where "eventual consistency" isn't enough. It solves the **Cognitive Consensus** problem: how to reach a stable, non-arbitrary truth when multiple agents provide potentially noisy, conflicting, or redundant data.

> "If a decision is made in the chaos, JMS ensures it represents the most credible path."

---

## 📄 License

JMS is licensed under the [Apache License 2.0](LICENSE). 
Documentation is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
