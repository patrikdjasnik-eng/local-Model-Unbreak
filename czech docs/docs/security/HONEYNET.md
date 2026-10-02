# HoneyNet

[![HoneyNet](https://img.shields.io/badge/security-HoneyNet-b91c1c)](#účel)
[![Deception](https://img.shields.io/badge/deception-safe%20decoys-0f766e)](#decoy-komponenty)
[![Network](https://img.shields.io/badge/network-isolated%20lab-2563eb)](#network-boundary)
[![Status](https://img.shields.io/badge/stav-research-6f42c1)](#limity)

HoneyNet je izolované deception prostředí pro detekci chování, které běžný inference runtime nemá legitimní důvod provádět.

## Účel

HoneyNet řeší otázku:

> Interaguje tento workload se zdroji mimo svou očekávanou inference roli?

Events jsou signály pro investigation, ne automatický důkaz malicious intent.

## Network boundary

```text
runtime
   ↓
SafeCell virtual network
   ├─ approved local API
   ├─ decoy API
   ├─ decoy storage
   ├─ decoy metadata service
   └─ telemetry sink
          ✕
     real LAN / internet
```

Production a personal systémy se nikdy nepoužívají jako honeypot targets.

## Decoy komponenty

Možné decoys:

- fake internal APIs,
- fake object-storage listings,
- fake metadata endpoints,
- synthetic hostnames,
- canary documents,
- fake model registry entries,
- honey credentials bez reálného privilege.

## Canary credentials

Honey credentials musí:

- být synthetic,
- neposkytovat real access,
- být pokud možno unique per session,
- vyvolat security event při použití,
- expirovat se sandboxem.

```text
event: deception.credential_access
credentialId: honey-github-7f12
sourceProcess: runtime-worker
severity: high
```

## Kvalita signálu

High-signal:

- read canary private-key path,
- použití honey tokenu,
- kontakt decoy metadata service,
- enumerace více unrelated decoy služeb.

Low-signal behavior vyžaduje correlation před escalation.

## Telemetrie

Ukládá jen security-relevant metadata: timestamp, session, process identity, decoy ID, action, destination class, policy result, severity a evidence reference.

Prompt/output content není potřeba pro běžnou HoneyNet telemetry.

## Limity

Workload, který se decoy nikdy nedotkne, není automaticky safe. HoneyNet doplňuje isolation, secure runtime dependencies, endpoint protection a authenticated remote protocols.
