# Changelog

[![Changelog](https://img.shields.io/badge/document-changelog-334155)](#unreleased)
[![Format](https://img.shields.io/badge/format-Keep%20a%20Changelog--inspired-2563eb)](#conventions)
[![Versioning](https://img.shields.io/badge/versioning-semver%20planned-0f766e)](#conventions)

Notable project changes are documented here. The project is pre-release, so entries currently describe repository milestones rather than stable product versions.

## Unreleased

### Added

- Curated Free/Premium GGUF catalog with exact upstream artifacts and quantizations.
- Explicit-consent model acquisition flow with artifact-level downloads, partial/resume state, integrity verification, and quarantine.
- Detailed frontend UX specification for Catalog, Planner, Clone Lab, Security Lab, and remote nodes.
- Model Clone / Self-Distill research specification with synthetic-only default and explicit data consent.
- Security Lab documentation: Creeping Frost AI Firewall v2, SafeCell, HoneyNet, Threat Hunting, Defense Validation, Supply Chain Security, Node Attestation, Deception Mode, Incident Response, and normalized Security Events.

- Initial project definition for explainable GGUF runtime planning.
- Architecture, roadmap, security, governance, support, and contribution documentation.
- Technical design for hardware probing, model inspection, benchmarking, fit planning, validation, and backend adapters.
- Benchmarking and threat-model specifications.

### Changed

- Nothing yet.

### Fixed

- Nothing yet.

### Security

- Defined trusted-node-only baseline for future remote execution.

## Conventions

- Stable releases are expected to use semantic versioning once public versioned behavior exists.
- User-visible changes belong under `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, or `Security`.
- Internal refactors without observable impact do not need individual changelog entries.
- Security fixes should avoid publishing unnecessary exploit details before coordinated disclosure.
