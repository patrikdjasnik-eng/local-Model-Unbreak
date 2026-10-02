# Model Unbreak Security Lab

[![Security Lab](https://img.shields.io/badge/security-Security%20Lab-b91c1c)](#účel)
[![Mode](https://img.shields.io/badge/režim-pouze%20obranný-0f766e)](#principy)
[![Privacy](https://img.shields.io/badge/privacy-local--first-2563eb)](#datové-hranice)
[![Status](https://img.shields.io/badge/stav-návrh-6f42c1)](#stav-implementace)

Model Unbreak Security Lab je obranná security vrstva pro získávání modelů, runtime isolation, trusted remote compute, threat hunting, deception a incident evidence.

> **AI workload má vidět jen tolik reality počítače, kolik skutečně potřebuje — a nic navíc.**

Security Lab není obecný offensive-security framework. Validation funkce jsou určeny pro systémy, které uživatel vlastní nebo má explicitní oprávnění testovat.

## Účel

Security vrstva chrání:

- host machine před unexpected model/runtime behavior,
- model a prompt data před zbytečným exposure,
- trusted remote GPU nodes před over-privileged workloady,
- Model Unbreak před supply-chain a configuration tampering.

## Architektura

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

HoneyNet a Deception Mode vytvářejí kolem runtime bezpečné decoys. Node Attestation dodává trust evidence pro remote compute. Creeping Frost je centrální enforcement engine.

## Moduly

| Modul | Účel |
| --- | --- |
| [CREEPING_FROST.md](CREEPING_FROST.md) | Centrální capability-aware policy a enforcement |
| [SAFECELL.md](SAFECELL.md) | Disposable runtime isolation a virtual-storage boundary |
| [HONEYNET.md](HONEYNET.md) | Izolovaná decoy síť a canary služby |
| [THREAT_HUNTING.md](THREAT_HUNTING.md) | Behavior baseline, pravidla a correlation |
| [DEFENSE_VALIDATION.md](DEFENSE_VALIDATION.md) | Autorizované obranné ověřování security controls |
| [SUPPLY_CHAIN_SECURITY.md](SUPPLY_CHAIN_SECURITY.md) | Provenance, integrita a acquisition policy |
| [NODE_ATTESTATION.md](NODE_ATTESTATION.md) | Trust evidence pro remote GPU workers |
| [DECEPTION_MODE.md](DECEPTION_MODE.md) | Fake filesystem, credentials, services a response policy |
| [INCIDENT_RESPONSE.md](INCIDENT_RESPONSE.md) | Isolation, evidence, recovery a incident timeline |
| [SECURITY_EVENTS.md](SECURITY_EVENTS.md) | Normalizovaný event kontrakt mezi moduly |

## Principy

1. **Defensive by design.** Validation míří na owned nebo explicitně authorized systémy.
2. **Isolation before trust.** Reputace source sama neobchází required controls.
3. **Deception je evidence.** Decoys detekují unexpected behavior; nereagují útokem.
4. **Žádné real secrets v decoys.** Honey credentials jsou synthetic a non-privileged.
5. **Default deny unnecessary egress.** Local inference nepotřebuje arbitrary internet access.
6. **Každé rozhodnutí vysvětlit.** Deny, quarantine i trust state mají důvod.
7. **Evidence defaultně zůstává lokálně.** Security telemetry tiše neuploaduje prompts ani host data.
8. **Žádný security theater.** „Protected“ znamená reálně enforced control.

## Security modes

| Mode | Chování |
| --- | --- |
| STANDARD | source/integrity checks, SafeCell podle policy, basic monitoring |
| PRIVATE | STANDARD + žádný remote compute a žádný inference egress |
| HARDENED | strict filesystem policy, deny-by-default egress, extended monitoring |
| DECEPTION | HARDENED + canaries, fake services, honey credentials, evidence snapshots |
| AIRGAP | local-only runtime s vypnutou sítí |

Změna režimu je explicitní. Model Unbreak nesmí tiše snížit protection jen proto, aby workload běžel.

## Trust states

`UNSEEN` → `QUARANTINED` → `OBSERVED` → `TRUSTED`

Další koncové stavy:

- `RESTRICTED`,
- `BLOCKED`,
- `REVOKED`.

Numeric risk score může stav doplnit, ale nikdy nenahrazuje evidence.

## Datové hranice

Security telemetry je oddělená od prompt/output content.

Default telemetry může obsahovat process identity, runtime hash, filesystem resource class, network destination class, policy decision, canary interaction a resource metrics.

Prompt text, generated output a unrelated personal filenames se defaultně nesbírají.

## Stav implementace

Tato složka je design contract, ne tvrzení, že controls už existují. Control se stává `VERIFIED` až po implementaci, testech, explicit failure behavior a reprodukovatelné evidence.
