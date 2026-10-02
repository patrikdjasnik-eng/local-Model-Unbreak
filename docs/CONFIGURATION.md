# Configuration

[![Configuration](https://img.shields.io/badge/document-configuration-2563eb)](#principles)
[![Defaults](https://img.shields.io/badge/defaults-safe%20%26%20local--first-0f766e)](#default-policy)
[![Schema](https://img.shields.io/badge/schema-not%20yet%20frozen-6f42c1)](#status)

This document defines configuration principles before the runtime schema is frozen. Examples are illustrative and must not be treated as a stable public API yet.

## Principles

- Safe defaults over maximum utilization.
- Explicit remote-node opt-in.
- No secrets in ordinary project configuration.
- Human-readable configuration with machine validation.
- Environment-specific values remain outside committed files.
- Unknown keys should fail clearly once the schema is stable.

## Precedence

Planned precedence from lowest to highest:

```text
built-in defaults
  ↓
user configuration
  ↓
project configuration
  ↓
environment variables
  ↓
CLI overrides
```

Security policy must not be silently weakened by a lower-priority source.

## Illustrative configuration

```yaml
profile: balanced

memory:
  vramHeadroomMiB: 768
  ramHeadroomMiB: 2048

runtime:
  preferredAdapter: llama.cpp
  contextTokens: 8192

remote:
  enabled: false
  trustedNodes: []

telemetry:
  persistLocalMetrics: true
  logPrompts: false
```

## Default policy

The planned default policy is:

- local execution preferred,
- remote execution disabled until configured,
- non-zero memory headroom required,
- prompt/content logging disabled,
- planner explanations enabled,
- unsupported backend capabilities treated as hard validation errors.

## Secrets

Authentication material for remote nodes must not live in a normal committed YAML/JSON file. A future implementation should use operating-system credential storage or a dedicated secret mechanism.

## Validation

Configuration validation should report:

- exact field path,
- invalid value,
- expected type/range,
- whether the problem is fatal,
- safe remediation where possible.

## Status

The configuration format is intentionally not frozen before the first planner and backend adapter prototypes. Any future stable schema requires a decision record in [DECISIONS.md](DECISIONS.md).
