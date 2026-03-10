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


## 📈 Quick Test with yfinance (Market Assets)

Use Python + `yfinance` to fetch real asset snapshots and run JMS consensus:

```bash
# 1) install Python dependency
pip install yfinance

# 2) fetch asset snapshots (examples for Brazil + US)
python examples/yfinance_fetch.py --symbols PETR4.SA VALE3.SA ITUB4.SA AAPL MSFT

# 3) run JMS consensus on generated data
npx ts-node examples/yfinance_assets_demo.ts examples/data/assets.json
```

This demo combines three analysis agents (trend, risk, momentum) and consolidates a final weighted decision with AgentC.

---

## 🧠 Why JMS?

> "If a decision is made in the chaos, JMS ensures it represents the most credible path."

---

## 📊 Benchmark Summary (v1.1)

JMS has been empirically proven to outperform traditional consensus models:

| Scenario | Result | Payload |
|----------|--------|---------|
| **Adversarial Noise** | **WIN** | 23.4% better accuracy vs Simple Average. |
| **Echo Chamber** | **WIN** | Successfully neutralized 4-agent collusion. |
| **Expert Divergence** | **WIN** | Correctly prioritized stable expert signal. |

Run the benchmarks yourself: `npx ts-node examples/benchmark_suite.ts`

---

---

## 📄 License

JMS is licensed under the [Apache License 2.0](LICENSE). 
Documentation is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
