# Architektura

[![Architecture](https://img.shields.io/badge/dokument-architektura-1d4ed8)](#přehled-systému)
[![Status](https://img.shields.io/badge/stav-návrh-6f42c1)](#stav)
[![Scope](https://img.shields.io/badge/rozsah-GGUF%20runtime%20planning-0f766e)](#hranice-systému)

Tento dokument definuje vysokoúrovňovou architekturu Model Unbreak. Detailní kontrakty patří do [docs/TECHNICAL_DESIGN.md](docs/TECHNICAL_DESIGN.md).

## Přehled systému

```text
                    ┌──────────────────┐
                    │ CLI / Desktop UI │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Orchestrator    │
                    └────────┬─────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
  ┌───────▼────────┐ ┌──────▼───────┐ ┌──────▼────────┐
  │ Hardware Probe │ │ Model Inspect │ │ Policy Engine │
  └───────┬────────┘ └──────┬───────┘ └──────┬────────┘
          └──────────────────┼──────────────────┘
                             ▼
                    ┌──────────────────┐
                    │   Fit Planner    │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │ Plan Validator   │
                    └────────┬─────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
     Local backend      Remote node       Telemetry
      llama.cpp           adapter          collector
```

## Komponenty

### Hardware Probe

Sbírá skutečné schopnosti místo odhadu podle názvu zařízení. Má zjistit CPU, RAM, GPU backendy, celkovou i aktuálně dostupnou VRAM, kompatibilitu driver/runtime a stabilní benchmark výsledky.

### Model Inspector

Čte GGUF metadata bez načtení celých vah do paměti. Má získat architekturu, kvantizaci, tensor metadata, velikost souboru a informace potřebné pro konzervativní odhad paměti.

### Benchmark Engine

Produkuje opakovatelné měření používané plannerem. Benchmarky musí být verzované, vázané na hardware a invalidované, když se změní relevantní runtime podmínky.

### Fit Planner

Vytváří kandidátní execution plány. Plán může zahrnovat lokální GPU offload, CPU/RAM, explicitně důvěryhodný remote node, úpravu context/KV cache nebo odmítnutí, pokud není bezpečná strategie.

### Policy Engine

Aplikuje uživatelská pravidla jako `private`, teplotní limity, allowlist remote nodů, maximální využití paměti nebo výkonnostní cíle.

### Plan Validator

Odmítá plány překračující bezpečnostní rezervu nebo porušující policy. Validace probíhá před spuštěním backendu.

### Backend Adapter

Překládá validovaný plán do runtime-specific argumentů. První adaptér je plánován pro llama.cpp. Adaptéry mají vystavovat capabilities, ne pouštět CLI detaily do planneru.

### Remote Node

Volitelný autentizovaný worker. Node inzeruje naměřené capabilities a přijímá pouze podporované workloady splňující policy. Veřejné neautentizované spuštění je v prvních verzích mimo scope.

### Telemetrie

Sbírá runtime metriky jako prompt throughput, generation throughput, memory pressure, latenci a failures. Telemetrie je ve výchozím stavu lokální a nesmí tiše uploadovat prompty ani modelový obsah.

## Hranice systému

Model Unbreak vlastní:

- inspekci, benchmarkování, plánování, validaci a orchestraci,
- vysvětlení, proč byl plán vybrán,
- backend capability negotiation,
- node discovery v explicitně nakonfigurovaných trust boundaries.

Model Unbreak nevlastní:

- implementaci CUDA kernelů,
- implementaci architektury modelu,
- specifikaci GGUF,
- low-level virtualizaci GPU driveru,
- ekonomiku veřejného GPU marketplace.

## Průběh plánování

```text
inspekce modelu
    ↓
hardware probe
    ↓
načtení benchmark profilu
    ↓
generování kandidátních plánů
    ↓
odhad paměti + throughputu + latence
    ↓
aplikace policy
    ↓
validace rezervy
    ↓
výběr + vysvětlení plánu
    ↓
spuštění backendu
    ↓
měření skutečného runtime
    ↓
aktualizace lokálního benchmark profilu
```

## Neměnné podmínky planneru

- Plán musí ponechat konfigurovatelnou memory headroom.
- Naměřené hodnoty musí být odlišeny od odhadů.
- Remote kapacita se nepočítá, pokud node není autentizovaný a dosažitelný.
- Plán, který se technicky vejde, ale je predikovaný jako nepoužitelně pomalý, může být odmítnut s vysvětlením.
- Backend adaptéry musí při nepodporovaných capabilities failnout bezpečně.
- Privacy policy má přednost před výkonem.

## Stav

Tato architektura je design kontrakt, ne tvrzení, že každá komponenta už existuje. Změny trust boundaries, planner semantics nebo backend contracts mají být zaznamenány v [docs/DECISIONS.md](docs/DECISIONS.md).
