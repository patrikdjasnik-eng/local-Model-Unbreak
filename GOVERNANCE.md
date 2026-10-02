# Governance

[![Governance](https://img.shields.io/badge/document-governance-334155)](#decision-making)
[![Model](https://img.shields.io/badge/model-maintainer--led-2563eb)](#roles)
[![Transparency](https://img.shields.io/badge/decisions-documented-0f766e)](docs/DECISIONS.md)

Model Unbreak currently uses a lightweight maintainer-led governance model suitable for an early-stage open-source project.

## Roles

### Maintainer

The maintainer is responsible for repository direction, release integrity, security response, merge decisions, and resolving architecture disputes.

### Contributor

A contributor proposes code, documentation, benchmark data, tests, or design feedback. Repeated high-quality contribution may lead to broader review responsibility later.

## Decision-making

Routine implementation decisions are made through pull-request review.

Changes affecting any of the following require explicit design discussion and a decision record:

- trust boundaries,
- planner scoring semantics,
- persisted configuration formats,
- remote protocol compatibility,
- backend adapter contracts,
- privacy defaults,
- benchmark methodology.

Decision records are indexed in [docs/DECISIONS.md](docs/DECISIONS.md).

## Project priorities

When goals conflict, the project prefers:

1. safety over aggressive automation,
2. reproducibility over impressive isolated numbers,
3. explainability over opaque heuristics,
4. local privacy over convenience,
5. maintainable adapters over backend-specific shortcuts.

## Changes to governance

Governance may evolve if the contributor base grows. Any material change should be documented in this file and recorded as an architecture/project decision.
