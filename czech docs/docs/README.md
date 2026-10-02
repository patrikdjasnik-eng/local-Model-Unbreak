# Dokumentace

[![Docs](https://img.shields.io/badge/dokumentace-index-2563eb)](#začni-zde)
[![Status](https://img.shields.io/badge/stav-živá%20dokumentace-16a34a)](#údržba)
[![Project](https://img.shields.io/badge/projekt-Model%20Unbreak-6f42c1)](../README.md)

Tato složka obsahuje technickou specifikaci a engineering reference pro Model Unbreak.

## Začni zde

| Dokument | Použij, když potřebuješ pochopit… |
| --- | --- |
| [TECHNICAL_DESIGN.md](TECHNICAL_DESIGN.md) | komponenty, kontrakty, planner behavior a runtime lifecycle |
| [CONFIGURATION.md](CONFIGURATION.md) | precedence konfigurace, defaults, validaci a secrets |
| [BENCHMARKING.md](BENCHMARKING.md) | jak se měří a reportují performance čísla |
| [REMOTE_NODES.md](REMOTE_NODES.md) | trusted remote compute a network constraints |
| [THREAT_MODEL.md](THREAT_MODEL.md) | assets, attackers, trust boundaries a mitigations |
| [PRIVACY.md](PRIVACY.md) | local-first data handling a telemetry rules |
| [TESTING.md](TESTING.md) | unit, integration, hardware, network a regression testing |
| [COMPATIBILITY.md](COMPATIBILITY.md) | plánovanou platform/backend podporu a compatibility policy |
| [FAQ.md](FAQ.md) | stručné odpovědi na běžné design otázky |
| [DECISIONS.md](DECISIONS.md) | proč byla hlavní architektonická rozhodnutí přijata |

Repository-level projektové dokumenty jsou o úroveň výše:

- [README.md](../README.md)
- [ARCHITECTURE.md](../ARCHITECTURE.md)
- [ROADMAP.md](../ROADMAP.md)
- [CONTRIBUTING.md](../CONTRIBUTING.md)
- [SECURITY.md](../SECURITY.md)
- [GOVERNANCE.md](../GOVERNANCE.md)
- [SUPPORT.md](../SUPPORT.md)
- [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md)
- [CHANGELOG.md](../CHANGELOG.md)


## Produktové a bezpečnostní specifikace

- [MODEL_CATALOG.md](MODEL_CATALOG.md) — Free/Premium model menu, kvantizace, přesné upstream artifacty, licence a tier rules.
- [MODEL_ACQUISITION.md](MODEL_ACQUISITION.md) — consent, artifact-level download, partial/resume, quarantine, integrity a promotion.
- [MODEL_CLONING.md](MODEL_CLONING.md) — Quick/Personal/Deep Clone, explicitní výběr dat, training a evaluation.
- [FRONTEND_UX_SPEC.md](FRONTEND_UX_SPEC.md) — detailní frontend mockup a click-through stories.
- [security/README.md](security/README.md) — vstupní bod Security Lab architektury.
- [security/CREEPING_FROST.md](security/CREEPING_FROST.md) — centrální capability-aware AI firewall.
- [security/SAFECELL.md](security/SAFECELL.md) — disposable runtime isolation.
- [security/HONEYNET.md](security/HONEYNET.md) — decoy network a canaries.
- [security/THREAT_HUNTING.md](security/THREAT_HUNTING.md) — baselines, rules, correlation a severity.
- [security/DEFENSE_VALIDATION.md](security/DEFENSE_VALIDATION.md) — autorizovaná non-destructive validation controls.
- [security/SUPPLY_CHAIN_SECURITY.md](security/SUPPLY_CHAIN_SECURITY.md) — provenance, hashes a runtime/model trust.
- [security/NODE_ATTESTATION.md](security/NODE_ATTESTATION.md) — remote-node trust evidence.
- [security/DECEPTION_MODE.md](security/DECEPTION_MODE.md) — fake files, credentials a services.
- [security/INCIDENT_RESPONSE.md](security/INCIDENT_RESPONSE.md) — containment a recovery.
- [security/SECURITY_EVENTS.md](security/SECURITY_EVENTS.md) — normalized security event contract.
- [PRIVATE_MODULE_BOUNDARY.md](PRIVATE_MODULE_BOUNDARY.md) — hranice public/private extensions a pravidla migrace.
- [CONSOLIDATION.md](CONSOLIDATION.md) — mapa migrace existujících runtime/security projektů do sjednoceného core.

## Role dokumentů

Dokumenty jsou záměrně oddělené:

- **Architektura** vysvětluje hranice systému.
- **Technical design** definuje zamýšlené kontrakty a flow.
- **Decisions** uchovávají design rationale.
- **Roadmap** popisuje pořadí delivery, ne architecture truth.
- **Benchmarking** definuje požadavky na evidence.
- **Threat model / privacy** definují security boundaries.

## Údržba

Dokumentace je součást implementačního kontraktu. Pull request, který mění public contract, trust boundary, planner rule nebo benchmark definici, má ve stejné změně aktualizovat relevantní dokument.
