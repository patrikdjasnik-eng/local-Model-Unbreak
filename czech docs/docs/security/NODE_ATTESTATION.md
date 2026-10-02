# Remote Node Attestation

[![Nodes](https://img.shields.io/badge/security-remote%20nodes-b91c1c)](#účel)
[![Identity](https://img.shields.io/badge/identity-explicit%20trust-0f766e)](#navázání-trustu)
[![Attestation](https://img.shields.io/badge/attestation-evidence%20based-2563eb)](#attestation-record)
[![Status](https://img.shields.io/badge/stav-návrh-6f42c1)](#limity)

Node Attestation dodává evidence o remote GPU workeru před tím, než mu Model Unbreak pošle workload nebo sensitive inference data.

## Účel

Coordinator nesmí trusted node odvozovat jen z toho, že device hlásí RTX-class GPU.

Relevant evidence:

- node identity,
- worker binary/version/hash,
- protocol version,
- runtime adapter/version,
- active security mode,
- SafeCell capability,
- current policy version,
- certificate/credential state,
- revocation state.

## Navázání trustu

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

Discovery nikdy automaticky nedává trust.

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

Významná změna nodu snižuje trust do re-evaluation.

Příklady:

- changed worker hash,
- changed runtime version,
- SafeCell unavailable,
- unexpected certificate rotation,
- incompatible policy version.

```text
Previous: TRUSTED
Observed: worker hash changed
New state: OBSERVED
Action: ASK before next remote workload
```

## Data disclosure

Před remote execution UI ukáže, co může opustit local machine:

- prompt/context,
- model artifact nebo model identifier,
- KV/cache/state podle režimu,
- tool inputs, pokud jsou podporovány,
- runtime metadata.

Remote node nelze vybrat v `private` profilu.

## Revocation

User může revoke node identity.

Revocation:

- block new jobs,
- terminate/refuse session renewal podle policy,
- remove saved trust,
- preserve security history,
- require fresh trust ceremony před reuse.

## Limity

Attestation je evidence, ne důkaz, že remote OS není compromised.

Hardware-rooted attestation lze zkoumat později; early version musí přesně ukazovat, co umí a neumí verify.
