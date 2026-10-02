# Remote Node Attestation

[![Nodes](https://img.shields.io/badge/security-remote%20nodes-b91c1c)](#purpose)
[![Identity](https://img.shields.io/badge/identity-explicit%20trust-0f766e)](#trust-establishment)
[![Attestation](https://img.shields.io/badge/attestation-evidence%20based-2563eb)](#attestation-record)
[![Status](https://img.shields.io/badge/status-design-6f42c1)](#limitations)

Node Attestation provides evidence about a remote GPU worker before Model Unbreak sends it workloads or sensitive inference data.

## Purpose

The coordinator should not trust a node merely because it advertises an RTX-class GPU.

Relevant evidence includes:

- node identity,
- worker binary/version/hash,
- protocol version,
- runtime adapter/version,
- active security mode,
- SafeCell capability,
- current policy version,
- certificate/credential state,
- revocation state.

## Trust establishment

```text
discover candidate
      ↓
display node identity
      ↓
user verifies / approves
      ↓
establish credentials
      ↓
attestation exchange
      ↓
Creeping Frost policy
      ↓
TRUSTED / RESTRICTED / DENY
```

Discovery never grants trust automatically.

## Attestation record

```json
{
  "nodeId": "rabbit-node-01",
  "workerVersion": "0.x",
  "workerHash": "<sha256>",
  "protocolVersion": "0.x",
  "runtimeAdapters": ["llama.cpp"],
  "safeCell": true,
  "securityMode": "hardened",
  "credentialState": "valid",
  "observedAt": "<timestamp>"
}
```

## Drift

A meaningful node change lowers trust until reevaluated.

Examples:

- worker hash changed,
- runtime version changed,
- SafeCell no longer available,
- certificate rotated unexpectedly,
- policy version incompatible.

Example:

```text
Previous: TRUSTED
Observed: worker hash changed
New state: OBSERVED
Action: ASK before next remote workload
```

## Data disclosure

Before remote execution, the UI states what data may leave the local machine:

- prompt/context,
- model artifact or model identifier,
- KV/cache/state if applicable,
- tool inputs when supported,
- runtime metadata.

A remote node cannot be selected under the `private` profile.

## Revocation

User can revoke a node identity.

Revocation must:

- prevent new jobs,
- terminate or refuse session renewal according to policy,
- remove saved trust,
- preserve security history,
- require a fresh trust ceremony before reuse.

## Limitations

Attestation provides evidence, not proof that the remote operating system is uncompromised.

Hardware-rooted attestation may be explored later, but early versions should report exactly what they can and cannot verify.
