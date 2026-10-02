# Threat Model

[![Threat model](https://img.shields.io/badge/document-threat%20model-b91c1c)](#assets)
[![Trust](https://img.shields.io/badge/trust-explicit%20nodes%20only-0f766e)](#trust-boundaries)
[![Phase](https://img.shields.io/badge/phase-design-6f42c1)](#assumptions)

This threat model covers the planned local-first coordinator and explicitly trusted remote-node architecture.

## Assets

Assets worth protecting include:

- local model files,
- prompts and generated content,
- node credentials,
- host filesystem integrity,
- GPU/CPU availability,
- planner configuration,
- benchmark history,
- network topology and host metadata.

## Actors

### Local user

Controls the coordinator and is trusted to configure the system.

### Trusted remote node

Authenticated and explicitly approved, but still treated as a separate security boundary.

### Network attacker

Can observe, delay, replay, or modify traffic when encryption/authentication is absent or broken.

### Malicious model/config input

A crafted file or configuration may attempt parser abuse, path traversal, command injection, resource exhaustion, or unexpected backend behavior.

## Trust boundaries

```text
user / CLI
    │
    ▼
coordinator process
    │
    ├── local filesystem
    ├── runtime adapter → backend process
    │
    └── encrypted authenticated channel
                   │
                   ▼
              remote node
                   │
                   ▼
              runtime backend
```

Each arrow crossing a process, machine, or parser boundary requires input validation.

## Primary threats

| Threat | Impact | Required mitigation |
| --- | --- | --- |
| Command injection through model/path/config | Host compromise | Structured arguments; no shell interpolation |
| Unauthorized node access | Compute theft / data exposure | Mutual authentication and authorization |
| Malicious node response | Corrupted result / misleading telemetry | Identity, validation, bounded trust in telemetry |
| Prompt/model interception | Confidentiality loss | Encrypted transport |
| Replay of authorized requests | Resource abuse | Nonces/session binding/replay protection |
| Path traversal | File disclosure/overwrite | Canonicalized allowlisted paths |
| Resource exhaustion | Availability loss | Quotas, timeouts, bounded allocations |
| Sensitive telemetry | Privacy loss | Data minimization and local-default logging |

## Remote execution rules

- Never accept arbitrary remote shell commands.
- Use structured workload schemas.
- Require explicit node trust establishment.
- Support credential revocation.
- Bind authorization to node identity and requested capability.
- Limit model and temporary-file paths.
- Apply timeouts and resource ceilings.
- Do not log prompts by default.

## Discovery

Local network discovery, if implemented, must only discover candidates. Discovery must not itself establish trust or grant execution rights.

## Model files

Model metadata parsers operate on untrusted input. Parsing should be bounded, validate lengths/offsets, and avoid allocating memory based solely on unchecked file metadata.

## Denial of service

The system should expect:

- intentionally huge model metadata,
- repeated failed job submissions,
- fake capacity advertisement,
- slow or stalled remote nodes,
- backend processes that fail to terminate.

Timeouts, cancellation, bounded queues, and process supervision are required.

## Assumptions

- The local operating system is not fully compromised.
- GPU drivers and the selected inference backend are trusted dependencies, not security sandboxes.
- Early releases do not provide hardened hostile multi-tenancy.
- Remote nodes are explicitly trusted rather than anonymously sourced.

## Security review triggers

Update this document before merging features that add:

- public node discovery,
- multi-tenant workloads,
- remote model upload,
- credential storage changes,
- automatic execution of downloaded artifacts,
- new network-facing endpoints.
