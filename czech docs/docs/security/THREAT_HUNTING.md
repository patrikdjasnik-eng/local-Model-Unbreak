# Threat Hunting

[![Threat Hunting](https://img.shields.io/badge/security-Threat%20Hunting-b91c1c)](#účel)
[![Signals](https://img.shields.io/badge/signály-behavioral-0f766e)](#zdroje-signálů)
[![Privacy](https://img.shields.io/badge/privacy-content%20minimized-2563eb)](#privacy-boundary)
[![Status](https://img.shields.io/badge/stav-návrh-6f42c1)](#hunt-workflow)

Threat Hunting koreluje runtime behavior s očekávaným AI-inference behavior a hledá anomalies vhodné k investigation.

## Účel

Odpovídá:

- co runtime skutečně udělal,
- zda je to expected pro daný adapter/version,
- zda překročil policy boundary,
- zda více slabých signals tvoří meaningful incident,
- zda je event reproducible.

## Zdroje signálů

Možné signals:

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

Unsupported visibility se označí jako unavailable, nikdy se nepředpokládá.

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

Baselines jsou versioned společně s adapters.

## Hunt rules

Rules jsou explainable a defensive.

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

Original events zůstávají uložené, aby bylo vidět, proč severity vzrostla.

## Severity

| Severity | Význam |
| --- | --- |
| info | expected / diagnostic |
| low | unusual, low impact |
| medium | policy-relevant anomaly |
| high | strong evidence unexpected sensitive access |
| critical | active boundary violation nebo containment failure |

Severity popisuje evidence a impact, ne identity nebo motive útočníka.

## Privacy boundary

Běžný threat hunting nepotřebuje prompt text.

Default telemetry minimalizuje prompt/output content, personal filenames, unrelated process args a full network payloads.

Deep capture pro authorized investigation vyžaduje explicitní user-visible config.

## False positives

Každé pravidlo podporuje reasoned suppression, scope, expiry, adapter/version targeting, test fixture a allowlist rationale.

Permanentní „allow forever“ není default řešení noisy rule.
