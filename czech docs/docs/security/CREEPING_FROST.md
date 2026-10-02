# Creeping Frost AI Firewall v2

[![Creeping Frost](https://img.shields.io/badge/firewall-Creeping%20Frost-2563eb)](#role)
[![Policy](https://img.shields.io/badge/policy-ALLOW%20%7C%20ASK%20%7C%20DENY-0f766e)](#decision-model)
[![Adaptive](https://img.shields.io/badge/obrana-adaptive-b91c1c)](#adaptive-frost)
[![Status](https://img.shields.io/badge/stav-návrh-6f42c1)](#implementační-hranice)

Creeping Frost je centrální capability-aware enforcement engine Model Unbreak.

Je širší než klasický packet firewall. Rozhoduje, zda runtime, model workflow, remote node nebo systémová komponenta smí použít určitou capability podle aktuální policy.

## Role

```text
                 Creeping Frost
                 Policy Engine
                      │
       ┌──────────────┼──────────────┐
       ↓              ↓              ↓
   SafeCell       Runtime         Remote Nodes
       ↓              ↓              ↓
   HoneyNet       GPU / RAM       Attestation
       └──────────────┼──────────────┘
                      ↓
                 Threat Hunter
                      ↓
                 Incident Engine
```

Creeping Frost je enforcement point. Threat Hunter detekuje a koreluje. HoneyNet dodává decoys. SafeCell izoluje execution.

## Decision model

Základní vocabulary zůstává jednoduchá:

- `ALLOW`
- `ASK`
- `DENY`

ALLOW lze zpřesnit restrictions:

```json
{
  "decision": "ALLOW",
  "restrictions": {
    "safeCellRequired": true,
    "network": "allowlist",
    "maxRamMiB": 8192,
    "maxVramMiB": 6144,
    "childProcesses": false
  }
}
```

Je to čitelnější než zavádět mnoho nejasných decision states.

## Capabilities

### Model acquisition

- model.download,
- runtime.download,
- registry.read,
- artifact.write,
- license.accept.

### Filesystem

- model.read,
- cache.write,
- host.read,
- host.write,
- canary.read,
- quarantine.promote.

### Process

- runtime.start,
- process.spawn,
- shell.execute,
- externalBinary.load.

### Network

- localhost.bind,
- registry.connect,
- remoteNode.connect,
- lan.connect,
- internet.connect.

### AI compute

- vram.allocate,
- ram.allocate,
- remoteInference.execute,
- multiNode.execute,
- clone.train.

### Security

- safeCell.mount,
- honeyNet.enable,
- deception.enable,
- evidence.snapshot,
- node.trust.

## Policy inputs

Decision může používat:

- user-selected security mode,
- model ID/hash/trust state,
- runtime ID/hash/version,
- source/publisher,
- requested capability,
- destination class,
- remote node identity,
- current hardware state,
- threat signals,
- saved user policy,
- one-time consent.

Decision engine musí zůstat vysvětlitelný.

## Příklady

Approved catalog download:

```text
request: registry.connect
destination: huggingface.co
purpose: approved artifact acquisition
decision: ALLOW
scope: acquisition job only
```

Unknown runtime egress:

```text
request: internet.connect
destination: unknown external host
baseline: no network required
decision: DENY
reason: destination not in runtime policy
```

Trusted remote GPU:

```text
request: remoteInference.execute
node: rabbit-node-01
attestation: valid
user policy: ASK
decision: ASK
```

## Security profily

| Profil | Síť | Filesystem | Remote compute | Deception |
| --- | --- | --- | --- | --- |
| STANDARD | policy-based | scoped | ASK | off |
| PRIVATE | inference deny | scoped | DENY | off |
| HARDENED | allowlist | strict SafeCell | ASK | standby |
| DECEPTION | deny/decoy only | strict + canaries | ASK | on |
| AIRGAP | DENY | local scoped | DENY | optional local |

## Adaptive Frost

Threat Hunter může požádat o zpřísnění policy.

```text
STANDARD
   ↓ suspicious event
HARDENED
   ↓ high-confidence canary access
DECEPTION
   ↓ confirmed containment violation
ISOLATED SESSION
```

Adaptive Frost smí automaticky zpřísnit restrictions, pokud to policy předem dovoluje.

Po threat eventu nesmí bezpečnost automaticky oslabit.

## Frost Memory

Creeping Frost udržuje local security reputation pro kombinace:

- model hash,
- runtime hash,
- adapter version,
- publisher/source,
- node identity,
- prior clean runs,
- previous security events.

```text
Model hash: verified
Runtime hash: changed

Previous trust: TRUSTED
New state: OBSERVED
Reason: runtime binary changed
```

Reputation podporuje decision, ale není záruka safety.

## Compute firewall

Creeping Frost může enforceovat i resource policy.

```text
VRAM request: 6.8 GB
Policy max:   6.0 GB
Headroom:     0.75 GB

Decision: DENY / REPLAN
Suggested plan: 5.8 GB GPU + RAM overflow
```

Controls mohou zahrnovat RAM/VRAM ceilings, process lifetime, remote compute permission, thermal policy tam, kde existuje reliable telemetry/control, a child-process restrictions.

## User prompts

ASK dialog musí ukázat:

- requester,
- capability,
- destination/resource,
- důvod,
- data, která mohou opustit zařízení,
- duration/scope,
- dostupná rozhodnutí.

„Povolit jednou“ je vždy užší než persistent trust.

## Fail closed

Pokud Creeping Frost nedokáže security-critical capability vyhodnotit kvůli chybějící identity nebo policy data, použije DENY nebo ASK podle explicitně nakonfigurovaného fallbacku.

## Implementační hranice

Creeping Frost nenahrazuje OS firewall, endpoint protection, secure coding ani sandbox. Koordinuje Model Unbreak-specific capabilities a deleguje enforcement platform backendům.
