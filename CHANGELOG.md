# Changelog

All notable changes to the JMS (Joint Message System) project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-02-03 (Current)

### Added
- **Transport Hardening:** Implementation of Dead Letter Queue (DLQ) in MockTransport.
- **Recovery Mechanism:** New `retryDLQ` functionality for re-sending failed messages.
- **Refined Heuristics:** Granular suspicious similarity detection (Score < 0.01, Time < 100ms, Evolution Length).

### Fixed
- Improved `AgentA` response handling to correctly process final consensus decisions from the unified SDK.
- Fixed TypeScript path resolution errors on Windows.


## [1.1.0] - 2026-02-03

### Added
- **Modular Architecture (JMS-M):** Decentralized project structure (Core, Transport, Learning, Agents, SDK).
- **Opinion Evolution Layer:** Tracking of agent internal states over time.
- **Cognitive Signals:** Integrated metrics for Stability, Trajectory, and Conformity.
- **Anti-Conformity Detection:** Mitigation of "echo chambers" in consensus.
- **Flexible Path Aliases:** TypeScript path mappings for cross-module development.

### Changed
- Refactored `JMSMessage` to support `evolution` history.
- Upgraded `ConsensusEngine` to support complex cognitive aggregator callbacks.
- Migrated specification to its own dedicated module.


## [1.0.0] - 2026-02-02

### Added
- **Normative Specification:** Complete v1.0 protocol definition.
- **Cognitive Consensus:** Lambda-weighted aggregation model.
- **JMS-T Baseline:** HTTP-based transport layer for agents.
- **Production Security:** SHA-256 integrity, Nonce protection, and strict Canonicalization.
- **Reference Implementation:** TypeScript MVP with Credit Approval scenario.
- **Massive Simulation:** 10-agent Three-Body Problem resolver.
- **Regulatory Compliance:** Guidance for MiFID II, GDPR, and SOX.

### Changed
- Evolution from v0.3 conceptual model to v1.0 production standard.
- Hardened hashing rules with fixed float precision and lexicographical sorting.

## [0.3.0] - 2026-01-15
- Initial conceptual specification of the Joint Message System.
- Basic AgentA/B/C architecture proposal.
