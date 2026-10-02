# Documentation

[![Docs](https://img.shields.io/badge/documentation-index-2563eb)](#start-here)
[![Status](https://img.shields.io/badge/status-living%20docs-16a34a)](#maintenance)
[![Project](https://img.shields.io/badge/project-Model%20Unbreak-6f42c1)](../README.md)

This directory contains the technical specification and engineering references for Model Unbreak.

## Start here

| Document | Use it when you need to understand… |
| --- | --- |
| [TECHNICAL_DESIGN.md](TECHNICAL_DESIGN.md) | components, contracts, planner behavior, runtime lifecycle |
| [CONFIGURATION.md](CONFIGURATION.md) | configuration precedence, defaults, validation, secrets |
| [BENCHMARKING.md](BENCHMARKING.md) | how performance numbers are measured and reported |
| [REMOTE_NODES.md](REMOTE_NODES.md) | trusted remote compute and network constraints |
| [THREAT_MODEL.md](THREAT_MODEL.md) | assets, attackers, trust boundaries, mitigations |
| [PRIVACY.md](PRIVACY.md) | local-first data handling and telemetry rules |
| [TESTING.md](TESTING.md) | unit, integration, hardware, network, and regression testing |
| [COMPATIBILITY.md](COMPATIBILITY.md) | planned platform/backend support and compatibility policy |
| [FAQ.md](FAQ.md) | concise answers to common design questions |
| [DECISIONS.md](DECISIONS.md) | why major architecture decisions were made |

Repository-level project documents live one level above this directory:

- [README.md](../README.md)
- [ARCHITECTURE.md](../ARCHITECTURE.md)
- [ROADMAP.md](../ROADMAP.md)
- [CONTRIBUTING.md](../CONTRIBUTING.md)
- [SECURITY.md](../SECURITY.md)
- [GOVERNANCE.md](../GOVERNANCE.md)
- [SUPPORT.md](../SUPPORT.md)
- [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md)
- [CHANGELOG.md](../CHANGELOG.md)


## Product and security specifications

- [MODEL_CATALOG.md](MODEL_CATALOG.md) — curated Free/Premium model menu, quantizations, exact upstream artifacts, licenses, and tier rules.
- [MODEL_ACQUISITION.md](MODEL_ACQUISITION.md) — consent, artifact-level download, partial/resume, quarantine, integrity, and promotion.
- [MODEL_CLONING.md](MODEL_CLONING.md) — Quick/Personal/Deep Clone, explicit data selection, training, and evaluation.
- [FRONTEND_UX_SPEC.md](FRONTEND_UX_SPEC.md) — detailed frontend mockup and click-through product stories.
- [security/README.md](security/README.md) — Security Lab architecture and entry point.
- [security/CREEPING_FROST.md](security/CREEPING_FROST.md) — central capability-aware AI firewall.
- [security/SAFECELL.md](security/SAFECELL.md) — disposable runtime isolation.
- [security/HONEYNET.md](security/HONEYNET.md) — decoy network and canaries.
- [security/THREAT_HUNTING.md](security/THREAT_HUNTING.md) — baselines, rules, correlation, and severity.
- [security/DEFENSE_VALIDATION.md](security/DEFENSE_VALIDATION.md) — authorized non-destructive control validation.
- [security/SUPPLY_CHAIN_SECURITY.md](security/SUPPLY_CHAIN_SECURITY.md) — provenance, hashes, runtime/model trust.
- [security/NODE_ATTESTATION.md](security/NODE_ATTESTATION.md) — remote-node trust evidence.
- [security/DECEPTION_MODE.md](security/DECEPTION_MODE.md) — fake files, credentials, and services.
- [security/INCIDENT_RESPONSE.md](security/INCIDENT_RESPONSE.md) — containment and recovery.
- [security/SECURITY_EVENTS.md](security/SECURITY_EVENTS.md) — normalized security event contract.
- [PRIVATE_MODULE_BOUNDARY.md](PRIVATE_MODULE_BOUNDARY.md) — public/private extension boundary and migration rules.

## Document roles

The documents are intentionally separated:

- **Architecture** explains system boundaries.
- **Technical design** defines intended contracts and flows.
- **Decisions** preserve design rationale.
- **Roadmap** describes delivery order, not architecture truth.
- **Benchmarking** defines evidence requirements.
- **Threat model / privacy** define security boundaries.

## Maintenance

Documentation is treated as part of the implementation contract. A pull request that changes a public contract, trust boundary, planner rule, or benchmark definition should update the relevant document in the same change.
