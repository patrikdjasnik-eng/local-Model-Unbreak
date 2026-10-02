# Architektonická rozhodnutí

[![ADR](https://img.shields.io/badge/dokument-architektonická%20rozhodnutí-334155)](#registr-rozhodnutí)
[![Status](https://img.shields.io/badge/stav-živý%20dokument-16a34a)](#jak-přidat-rozhodnutí)
[![Review](https://img.shields.io/badge/review-povinné%20pro%20core%20contracts-6f42c1)](#kdy-je-adr-povinné)

Tento soubor indexuje rozhodnutí, která materiálně formují Model Unbreak. Cílem je uchovat *proč* bylo něco zvoleno, ne jen jak kód aktuálně vypadá.

## Registr rozhodnutí

| ID | Rozhodnutí | Stav |
| --- | --- | --- |
| ADR-001 | Local-first planning je default | Accepted |
| ADR-002 | Planner používá measured capability | Accepted |
| ADR-003 | Backend detaily zůstávají za adaptéry | Accepted |
| ADR-004 | Remote memory není modelována jako magická unified VRAM | Accepted |
| ADR-005 | Remote nodes vyžadují explicit trust | Accepted |
| ADR-006 | Prvním targetem je GGUF s llama.cpp backendem | Proposed |

## ADR-001 — Local-first planning je default

**Rozhodnutí:** Preferovat sufficiently capable local plan, pokud user policy nebo měřitelné requirements neodůvodní jinou strategii.

**Důvod:** Local execution minimalizuje privacy exposure, network dependency a operational complexity.

## ADR-002 — Měřit capability

**Rozhodnutí:** Planner inputs používají observed memory, benchmark a network data místo samotných hardware names.

**Důvod:** Dvě nominálně stejné devices se mohou chovat jinak kvůli driver versions, thermals, power limits, background load a topology.

## ADR-003 — Backend adaptéry

**Rozhodnutí:** Runtime-specific CLI flags vznikají uvnitř adapters.

**Důvod:** Planner logic má přežít backend evolution a zůstat testovatelná bez spuštění processu.

## ADR-004 — Žádná fake unified VRAM

**Rozhodnutí:** Local a remote memory zůstávají v planner modelu oddělené resources.

**Důvod:** Network bandwidth a latency jsou zásadně odlišné od local VRAM interconnects. Pouhé sčítání byte counts by zkreslovalo performance.

## ADR-005 — Explicit trust

**Rozhodnutí:** Early remote nodes jsou authenticated a explicitně approved.

**Důvod:** Anonymous compute mění projekt na hostile multi-tenant execution platform s mnohem větším security scope.

## ADR-006 — Nejprve GGUF + llama.cpp

**Stav:** Proposed.

**Rozhodnutí:** Začít s GGUF inspection a llama.cpp adapterem před přidáním dalších runtimes.

**Důvod:** Narrow initial backend dělá memory estimation, benchmark normalization a planner correctness zvládnutelné.

## Kdy je ADR povinné

Vytvoř nebo aktualizuj decision při změně:

- trust boundaries,
- planner scoring semantics,
- backend contracts,
- persisted configuration formats,
- benchmark validity rules,
- privacy defaults,
- remote protocol behavior.

## Jak přidat rozhodnutí

Použij strukturu:

```text
ADR-XXX — Název
Status: Proposed | Accepted | Superseded
Context
Decision
Alternatives
Consequences
```
