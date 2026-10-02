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
