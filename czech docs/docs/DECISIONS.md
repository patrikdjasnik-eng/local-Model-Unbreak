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


## ADR-007 — Artifact-level model acquisition

**Status:** Accepted.

**Rozhodnutí:** Defaultně stahovat přesný artifact vybraný catalog/plannerem místo clone celého model repository.

**Důvod:** Model repa mohou obsahovat mnoho quantizations, BF16 weights, projector files a velké LFS/Xet objekty. Exact artifact retrieval minimalizuje bandwidth, disk usage a trust expansion.

## ADR-008 — Free user může importovat compatible GGUF

**Status:** Accepted.

**Rozhodnutí:** Product tier neblokuje import vlastního GGUF, pokud jej active runtime podporuje.

**Důvod:** Premium value patří do orchestration, planning, remote compute, cloning a automation, ne do umělého vlastnictví upstream open modelu.

## ADR-009 — Creeping Frost je centrální security enforcement engine

**Status:** Accepted.

**Rozhodnutí:** Security-sensitive capabilities používají společný `ALLOW / ASK / DENY` policy model s volitelnými restrictions.

**Důvod:** Network, filesystem, processes, VRAM/RAM, remote compute, acquisition a clone training potřebují consistent policy semantics a explanations.

## ADR-010 — Basic security není premium-only feature

**Status:** Accepted.

**Rozhodnutí:** Baseline artifact integrity, quarantine, SafeCell policy a essential Creeping Frost enforcement jsou safety controls dostupné bez ohledu na tier.

**Důvod:** Security nemá být slabší jen proto, že user nekoupil advanced orchestration features.

## ADR-011 — Model Clone vyžaduje explicitní data-source consent

**Status:** Accepted.

**Rozhodnutí:** Clone jobs defaultují na synthetic-only data. Conversations, coding sessions, folders a custom datasets vyžadují explicitní per-job selection/approval.

**Důvod:** Personalization nesmí tiše změnit unrelated user data na training data.

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
