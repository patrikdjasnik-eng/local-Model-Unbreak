# Creeping Frost AI Firewall v2

[![Creeping Frost](https://img.shields.io/badge/firewall-Creeping%20Frost-2563eb)](#role)
[![Policy](https://img.shields.io/badge/policy-ALLOW%20%7C%20ASK%20%7C%20DENY-0f766e)](#decision-model)
[![Adaptive](https://img.shields.io/badge/defense-adaptive-b91c1c)](#adaptive-frost)
[![Status](https://img.shields.io/badge/status-design-6f42c1)](#implementation-boundary)

Creeping Frost is the central capability-aware enforcement engine for Model Unbreak.

It is broader than a classic packet firewall. It decides whether a runtime, model workflow, remote node, or system component may use a capability under the current policy.

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

Creeping Frost is the enforcement point. Threat Hunter detects/correlates. HoneyNet provides decoys. SafeCell contains execution.

## Decision model

The primary decision vocabulary stays simple:

- `ALLOW`
- `ASK`
- `DENY`

Restrictions can refine an ALLOW:

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

This is preferable to inventing many ambiguous decision states.

## Capabilities

Creeping Frost can reason about:

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

A decision may use:

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

The decision engine must remain explainable.

## Example decisions

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

## Security profiles

| Profile | Network | Filesystem | Remote compute | Deception |
| --- | --- | --- | --- | --- |
| STANDARD | policy-based | scoped | ASK | off |
| PRIVATE | inference deny | scoped | DENY | off |
| HARDENED | allowlist | strict SafeCell | ASK | standby |
| DECEPTION | deny/decoy only | strict + canaries | ASK | on |
| AIRGAP | DENY | local scoped | DENY | optional local |

## Adaptive Frost

Threat Hunter may request a stricter policy.

Example transition:

```text
STANDARD
   ↓ suspicious event
HARDENED
   ↓ high-confidence canary access
DECEPTION
   ↓ confirmed containment violation
ISOLATED SESSION
```

Adaptive Frost may automatically tighten restrictions when pre-authorized by policy.

It must **not** automatically loosen security after a threat event.

## Frost Memory

Creeping Frost keeps local security reputation for combinations of:

- model hash,
- runtime hash,
- adapter version,
- publisher/source,
- node identity,
- prior clean runs,
- prior security events.

Example:

```text
Model hash: verified
Runtime hash: changed

Previous trust: TRUSTED
New state: OBSERVED
Reason: runtime binary changed
```

Reputation is evidence support, not a guarantee of safety.

## Compute firewall

Creeping Frost can enforce resource policy as well as network/filesystem policy.

Example:

```text
VRAM request: 6.8 GB
Policy max:   6.0 GB
Headroom:     0.75 GB

Decision: DENY / REPLAN
Suggested plan: 5.8 GB GPU + RAM overflow
```

Possible controls include RAM/VRAM ceilings, process lifetime, remote compute permission, thermal policy where reliable telemetry/control exists, and child-process restrictions.

## User prompts

An ASK dialog must show:

- requester,
- capability,
- destination/resource,
- reason,
- data that may leave the device,
- duration/scope,
- available decisions.

“Allow once” is always narrower than persistent trust.

## Fail-closed behavior

If Creeping Frost cannot evaluate a security-critical capability because required identity or policy data is missing, the default is DENY or ASK according to the explicitly configured fallback.

## Implementation boundary

Creeping Frost does not replace the operating-system firewall, endpoint protection, secure coding, or sandboxing. It coordinates Model Unbreak-specific capabilities and delegates enforcement to platform backends.
