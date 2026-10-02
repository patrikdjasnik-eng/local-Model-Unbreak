# Threat Hunting

[![Threat Hunting](https://img.shields.io/badge/security-Threat%20Hunting-b91c1c)](#purpose)
[![Signals](https://img.shields.io/badge/signals-behavioral-0f766e)](#signal-sources)
[![Privacy](https://img.shields.io/badge/privacy-content%20minimized-2563eb)](#privacy-boundary)
[![Status](https://img.shields.io/badge/status-design-6f42c1)](#hunt-workflow)

Threat Hunting correlates runtime behavior with expected AI-inference behavior to surface anomalies worth investigating.

## Purpose

It answers:

- what did the runtime actually do,
- was it expected for this adapter/version,
- did it cross a policy boundary,
- did several weak signals combine into a meaningful incident,
- is the event reproducible.

## Signal sources

Potential signals:

- process start/exit,
- child-process creation,
- filesystem reads/writes,
- SafeCell canary interactions,
- network/DNS attempts,
- runtime library loading,
- local API binding,
- resource spikes,
- repeated launch failures,
- denied operations,
- node trust changes.

Unsupported visibility is reported as unavailable, never silently assumed.

## Behavioral baseline

```text
llama.cpp baseline
────────────────────────────
read approved .gguf          expected
allocate RAM/VRAM            expected
bind configured localhost    expected
write approved cache         expected

read browser cookies         unexpected
read SSH private keys        unexpected
spawn shell process          unexpected unless required
enumerate unrelated drives   unexpected
contact unknown internet IP  unexpected
```

Baselines are versioned with adapters.

## Hunt rules

Rules are explainable and defensive.

```yaml
id: MU-HUNT-001
title: Runtime accessed credential-like decoy
when:
  eventType: filesystem.read
  resourceClass: deception.credential
action:
  severity: high
  isolateSession: true
  preserveEvidence: true
```

## Correlation

```text
unexpected child process
        +
credential decoy access
        +
blocked outbound connection
        ↓
high-confidence incident
```

Original events are preserved so operators can inspect why severity changed.

## Severity

| Severity | Meaning |
| --- | --- |
| info | expected or diagnostic |
| low | unusual, low impact |
| medium | policy-relevant anomaly |
| high | strong evidence of unexpected sensitive access |
| critical | active boundary violation or containment failure |

Severity describes evidence and impact, not attacker identity or motive.

## Privacy boundary

Ordinary threat hunting does not require prompt text.

Default telemetry minimizes:

- prompt/output content,
- raw personal filenames,
- unrelated process arguments,
- full network payloads.

Deeper capture for an authorized investigation requires explicit user-visible configuration.

## False positives

Every rule should support reasoned suppression, scope, expiry, adapter/version targeting, a test fixture, and an allowlist rationale.

Permanent “allow forever” is not the default answer to a noisy rule.
