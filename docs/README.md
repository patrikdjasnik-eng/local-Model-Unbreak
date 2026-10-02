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
