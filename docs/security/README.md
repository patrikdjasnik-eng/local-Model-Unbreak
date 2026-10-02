# Model Unbreak Security Lab

[![Security Lab](https://img.shields.io/badge/security-Security%20Lab-b91c1c)](#purpose)
[![Mode](https://img.shields.io/badge/mode-defensive%20only-0f766e)](#operating-principles)
[![Privacy](https://img.shields.io/badge/privacy-local--first-2563eb)](#data-boundaries)
[![Status](https://img.shields.io/badge/status-design-6f42c1)](#implementation-status)

Model Unbreak Security Lab is the defensive security layer for model acquisition, runtime isolation, trusted remote compute, threat hunting, deception, and incident evidence.

> **AI workloads should receive only the machine reality they need — and nothing more.**

The Security Lab is not a general offensive-security framework. Validation features are intended for systems the user owns or is explicitly authorized to test.

## Purpose

The security layer protects:

- the host machine from unexpected model/runtime behavior,
- model and prompt data from unnecessary exposure,
- trusted remote GPU nodes from over-privileged workloads,
- Model Unbreak itself from supply-chain and configuration tampering.

## Architecture

```text
Model source
     ↓
Supply Chain Guard
     ↓
Quarantine
     ↓
SafeCell
     ↓
Creeping Frost AI Firewall
     ↓
Runtime / Remote Node
     ↓
Behavior Monitor
     ↓
Threat Hunter
     ↓
Incident Engine
```

HoneyNet and Deception Mode provide safe decoys around the runtime. Node Attestation supplies trust evidence for remote compute. Creeping Frost is the central enforcement engine.

## Modules

| Module | Purpose |
| --- | --- |
| [CREEPING_FROST.md](CREEPING_FROST.md) | Central capability-aware policy and enforcement engine |
| [SAFECELL.md](SAFECELL.md) | Disposable runtime isolation and virtual-storage boundary |
| [HONEYNET.md](HONEYNET.md) | Isolated decoy network and canary services |
| [THREAT_HUNTING.md](THREAT_HUNTING.md) | Behavioral baselines, rules, and correlation |
| [DEFENSE_VALIDATION.md](DEFENSE_VALIDATION.md) | Authorized defensive validation of security controls |
| [SUPPLY_CHAIN_SECURITY.md](SUPPLY_CHAIN_SECURITY.md) | Provenance, integrity, and runtime/model acquisition policy |
| [NODE_ATTESTATION.md](NODE_ATTESTATION.md) | Trust evidence for remote GPU workers |
| [DECEPTION_MODE.md](DECEPTION_MODE.md) | Fake filesystem, credentials, services, and response policy |
| [INCIDENT_RESPONSE.md](INCIDENT_RESPONSE.md) | Isolation, evidence, recovery, and incident timeline |
| [SECURITY_EVENTS.md](SECURITY_EVENTS.md) | Normalized event contract shared across modules |

## Operating principles

1. **Defensive by design.** Validation targets owned or explicitly authorized systems.
2. **Isolation before trust.** Source reputation alone never bypasses required controls.
3. **Deception is evidence.** Decoys detect unexpected behavior; they do not punish or retaliate.
4. **No real secrets in decoys.** Honey credentials must be synthetic and non-privileged.
5. **Default deny unnecessary egress.** Local inference does not need arbitrary internet access.
6. **Explain every decision.** Every deny, quarantine, or trust state has a reason.
7. **Evidence stays local by default.** Security telemetry does not silently upload prompts or host data.
8. **No security theater.** “Protected” means a defined control is actually enforced.

## Security modes

| Mode | Core behavior |
| --- | --- |
| STANDARD | source/integrity checks, SafeCell where required, basic monitoring |
| PRIVATE | STANDARD plus no remote compute and no inference egress |
| HARDENED | strict filesystem policy, deny-by-default egress, extended monitoring |
| DECEPTION | HARDENED plus canaries, fake services, honey credentials, evidence snapshots |
| AIRGAP | local-only runtime with network disabled |

Security mode changes are explicit. Model Unbreak must not silently downgrade protection to make a workload run.

## Trust states

`UNSEEN` → `QUARANTINED` → `OBSERVED` → `TRUSTED`

Additional terminal states:

- `RESTRICTED`,
- `BLOCKED`,
- `REVOKED`.

Numeric risk scoring may supplement these states but never replace evidence.

## Data boundaries

Security telemetry is separate from prompt/output content.

Default security telemetry may include process identity, runtime hash, filesystem resource class, network destination class, policy decision, canary interaction, and resource metrics.

Prompt text, generated output, and unrelated personal filenames are not collected by default.

## Implementation status

This directory is a design contract, not a claim that the controls already exist. A control becomes `VERIFIED` only after implementation, tests, explicit failure behavior, and reproducible evidence.
