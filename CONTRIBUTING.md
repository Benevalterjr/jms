# Contributing to JMS

We are excited that you want to contribute to the **Joint Message System (JMS)**! 

## Philosophy

JMS is a protocol designed for high-trust, decentralized cognitive consensus. Our development philosophy is:
- **Modularity:** Keep core logic independent of transport and specific agent logic.
- **Security-First:** Every protocol change must be analyzed for integrity and resilience.
- **Auditable:** Decisions and analytical paths must be clear and traceable.

## Project Structure

- `jms-spec/`: Normative documents. Changes here require an RFC process.
- `jms-core/`: The heart of the protocol. Changes must preserve consensus determinism.
- `jms-learning/`: Experiments with cognitive analysis and learning signals.
- `jms-transport/`: Interface-based transport adapters.
- `jms-agents/`: Optimized scaffolding for building your own agents.

## Development Workflow

1. **Fork the repository** and create your branch from `main`.
2. **Implement your changes** following the modular pattern.
3. **Verify with demos**: Ensure your changes don't break the cognitive resilence demos in `examples/`.
4. **Submit a Pull Request** describing the impact on the protocol semantics.

## Coding Standards

- Use **TypeScript** for the reference implementation.
- Avoid external and opaque dependencies in the `jms-core`.
- Maintain clean, descriptive, and Greek-letter-friendly (`λ`, `Σ`, `Ω`, `τ`, `ε`) naming conventions where appropriate to align with the core spec.

## Licensing

By contributing, you agree that your contributions will be licensed under the **Apache License 2.0**.
