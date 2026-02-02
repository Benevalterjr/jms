# Contributing to JMS

We are excited that you want to contribute to the Joint Message System! 

JMS is a protocol for the future of decentralized intelligence, and its strength comes from the diversity of its contributors.

## How Can I Contribute?

### 1. Reporting Bugs
- Use GitHub Issues to report bugs.
- Provide a clear reproduction case (preferably using the TypeScript MVP).
- Highlight if the bug violates the **JMS v1.0 Normative Specification**.

### 2. Proposing Changes (RFCs)
- Changes to the core protocol (v1.x) require a formal RFC.
- RFCs should be submitted as PRs to the `spec/` directory.
- Ensure any math or logic changes include an impact analysis on the **Lambda (λ) weighting**.

### 3. Implementation
- We are looking for official implementations in:
  - **Go** (`jms-go`)
  - **Python** (`jms-py`)
  - **Rust** (`jms-rs`)
- Follow the **Conformance Checklist** in Seção 10.2 of the Spec.

## Coding Standards

- **Consistency:** All implementations MUST strictly match the canonical JSON hashing specified in Section 7.1.
- **Security:** Never commit secrets. Always use TLS 1.2+ for transport implementations.
- **Tests:** Any new logic must include unit tests and, if possible, a scenario in the `examples/` folder.

## Community & Conduct

Please be respectful. JMS is a collaboration between humans and AI agents. We value logic, clarity, and constructive criticism.

---

## License

By contributing, you agree that your contributions will be licensed under the project's **Apache License 2.0**.
