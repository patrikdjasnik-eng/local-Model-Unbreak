# Security Policy

[![Security](https://img.shields.io/badge/security-report%20privately-b91c1c)](#reporting-a-vulnerability)
[![Remote nodes](https://img.shields.io/badge/remote%20nodes-trusted%20only-0f766e)](#security-baseline)
[![Status](https://img.shields.io/badge/status-pre--release-6f42c1)](#supported-versions)

Security is a core design constraint because Model Unbreak may eventually orchestrate model files, local hardware, network-connected compute nodes, and runtime processes.

## Supported versions

The project is pre-release. Until the first tagged release exists, security fixes target the default branch.

## Reporting a vulnerability

Do **not** publish exploitable details in a public issue.

If GitHub private vulnerability reporting is enabled for this repository, use it. Otherwise contact the maintainer privately through an established private channel and include:

- affected commit or version,
- impact,
- minimal reproduction,
- required attacker position,
- relevant logs with secrets removed,
- suggested mitigation if known.

Do not include real API tokens, private model content, user prompts, or unrelated personal data in a report.

## Security baseline

Early remote-node support must follow these rules:

- nodes are opt-in,
- nodes authenticate each other,
- transport is encrypted,
- remote capabilities are allowlisted,
- the coordinator does not accept arbitrary shell commands as workload definitions,
- runtime arguments are generated from validated structured plans,
- secrets are never written to benchmark output,
- nodes are not exposed as unauthenticated public services.

## Sensitive surfaces

The project treats the following as high risk:

- remote execution adapters,
- model/path handling,
- subprocess invocation,
- backend CLI argument construction,
- node authentication and authorization,
- local discovery protocols,
- telemetry and logs,
- configuration import/export.

## Out of scope for early releases

The following are intentionally not security promises of the initial project:

- safely executing arbitrary third-party workloads,
- anonymous public compute sharing,
- multi-tenant isolation equivalent to a hardened cloud provider,
- protection against a fully compromised operating system or GPU driver.

## Disclosure

Once a vulnerability is fixed, the project may publish a concise advisory describing affected versions, severity, mitigation, and upgrade guidance without exposing unnecessary exploit detail.

For architecture-specific risks, see [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md).
