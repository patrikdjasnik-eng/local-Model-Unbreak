# Model Unbreak

[![Status](https://img.shields.io/badge/status-návrh%20%26%20prototyp-6f42c1)](#stav-projektu)
[![Models](https://img.shields.io/badge/modely-GGUF-2563eb)](#rozsah)
[![Runtime](https://img.shields.io/badge/runtime-local--first-0f766e)](#principy)
[![Backend](https://img.shields.io/badge/backend-llama.cpp%20plánováno-374151)](docs/TECHNICAL_DESIGN.md)
[![Docs](https://img.shields.io/badge/docs-architektura%20%7C%20bezpečnost%20%7C%20benchmarky-334155)](ARCHITECTURE.md)

> Spusť model, který chceš, na hardwaru, který skutečně máš.

Model Unbreak je experimentální local-first runtime planner pro GGUF inference na omezeném spotřebitelském hardwaru. Je navržen tak, aby zjistil reálně dostupný hardware, změřil ho, vysvětlil jeho limity a zvolil praktickou strategii spuštění namísto toho, aby uživatel musel ručně ladit GPU offload, přesun do RAM, vzdálené uzly, velikost kontextu, formát KV cache a backendové přepínače.

Projekt **nepředstírá, že několik zařízení tvoří jednu magickou GPU**. Lokální GPU, systémovou RAM, CPU a explicitně důvěryhodné vzdálené uzly považuje za samostatné zdroje a plánuje inference podle jejich skutečných omezení.

## Proč

Spouštění GGUF modelů na GPU se 4–12 GB VRAM často končí metodou pokus–omyl:

- model se vejde na disk, ale ne do VRAM,
- vyšší context window způsobí neočekávané out-of-memory selhání,
- CPU offload funguje, ale je zbytečně pomalý,
- vzdálená GPU má dost paměti, ale síťová latence smaže očekávané zrychlení,
- zdánlivě rozumný tensor split běží hůř než menší lokální model,
- uživatel musí znát low-level runtime přepínače, než vůbec zjistí odpověď na jednoduchou otázku: *co na tomto stroji poběží dobře?*

Model Unbreak má toto rozhodování převést na měřitelný a vysvětlitelný proces.

## Základní myšlenka

```text
GGUF model
    │
    ▼
inspekce modelu
    │
    ▼
hardware probe ── benchmark
    │                 │
    └──────┬──────────┘
           ▼
      Fit Planner
           │
    ┌──────┼───────────┐
    ▼      ▼           ▼
 lokálně  hybridně   vzdáleně
 GPU/RAM   offload      uzel
    └──────┬───────────┘
           ▼
 vysvětlitelný plán spuštění
```

Budoucí příkaz by měl působit spíš takto:

```bash
model-unbreak run ./models/qwen.gguf --profile balanced
```

než jako ruční skládání dlouhé řady backend-specific parametrů.

## Plánované profily

| Profil | Cíl | Typická preference planneru |
| --- | --- | --- |
| `fast` | Maximalizovat interaktivní throughput | Preferovat GPU-resident execution a nízkou síťovou režii |
| `big` | Spustit co největší praktický model | Povolit RAM / remote kapacitu, když je potřeba |
| `long-context` | Zachovat užitečnou délku kontextu | Nejdřív vyhradit KV cache |
| `private` | Udržet inference na lokálním stroji | Zakázat vzdálené spuštění |
| `balanced` | Dobrá rychlost bez křehkého ladění | Vyvážit throughput, memory headroom a stabilitu |

## Rozsah

Prvním podporovaným formátem modelů má být **GGUF**, s **llama.cpp** jako primárním execution backendem. Integrace kompatibilní s Ollama může být přidána jako adaptér, ne jako jádro plánovací vrstvy.

Planner má pracovat například s:

- velikostí modelu a kvantizací,
- dostupnou VRAM a rezervou,
- kapacitou a propustností RAM,
- možnostmi CPU,
- požadavky KV cache,
- délkou kontextu,
- aktuálním využitím lokální GPU,
- pamětí a výkonem vzdálených uzlů,
- RTT a propustností sítě,
- očekávanými tokeny za sekundu,
- privacy omezeními.

## Principy

1. **Local first.** Pokud je lokální plán dostatečně schopný, má mít přednost.
2. **Nejdřív měřit, potom rozhodovat.** Název hardwaru sám o sobě nestačí.
3. **Každý plán vysvětlit.** Uživatel má vidět, proč byla strategie zvolena.
4. **Selhávat bezpečně.** Rezerva paměti je cennější než optimistický plán, který spadne.
5. **Remote je explicitní.** Žádný počítač se nestane compute nodem bez opt-in a autentizace.
6. **Detaily backendu patří do adaptérů.** Planner nemá být navždy svázaný s jedním CLI.

## Příklad plánu

```text
Model: Qwen coder GGUF
Cíl: balanced

Lokální GPU:        8 GB
Použitelná VRAM:    6.9 GB
Systémová RAM:     16 GB
Vzdálený uzel:     12 GB
Síťová RTT:          7 ms

Testované strategie:
  lokální GPU + RAM     10.8 tok/s
  plně vzdáleně         17.3 tok/s
  hybridně              21.1 tok/s

Vybráno: HYBRID
Důvod: model se vejde s bezpečnou rezervou a naměřená síťová režie zůstává pod očekávaným přínosem výpočtu.
```

Čísla výše jsou pouze ilustrační. Model Unbreak musí naměřené nebo modelované hodnoty jasně označovat a nikdy nevymýšlet benchmark výsledky.

## Stav projektu

Model Unbreak je nyní ve fázi **návrhu a prototypu**. Dokumentace definuje zamýšlenou architekturu a bezpečnostní hranice ještě před implementací.

Milníky jsou v [ROADMAP.md](ROADMAP.md), historii změn najdeš v [CHANGELOG.md](CHANGELOG.md).

## Dokumentace

| Dokument | Účel |
| --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Vysokoúrovňová architektura systému a hranice |
| [docs/TECHNICAL_DESIGN.md](docs/TECHNICAL_DESIGN.md) | Komponenty, rozhraní, planner a runtime flow |
| [docs/BENCHMARKING.md](docs/BENCHMARKING.md) | Reprodukovatelná metodika výkonu |
| [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md) | Bezpečnostní předpoklady a trust boundaries |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Registr architektonických rozhodnutí |
| [ROADMAP.md](ROADMAP.md) | Milníky vývoje |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Workflow pro příspěvky |
| [SECURITY.md](SECURITY.md) | Hlášení zranitelností a bezpečnostní pravidla |
| [GOVERNANCE.md](GOVERNANCE.md) | Model rozhodování projektu |
| [SUPPORT.md](SUPPORT.md) | Hranice podpory a návod pro bug reporty |

## Co projekt není

Model Unbreak nemá za cíl:

- emulovat jednu fyzicky sjednocenou VRAM přes veřejný internet,
- skrývat nemožná omezení latence nebo propustnosti,
- v prvních verzích spouštět nedůvěryhodné veřejné workloady na dobrovolnických GPU,
- nahrazovat CUDA, llama.cpp nebo samotný model runtime,
- slibovat, že větší model bude vždy rychlejší nebo lepší,
- těžit kryptoměny nebo zavádět token/coin ekonomiku.

## Přispívání

Projekt je v této fázi záměrně documentation-first. Vítané jsou design review, reprodukovatelná benchmark data, hardware edge cases a úzce zaměřené implementační návrhy.

Před otevřením pull requestu si přečti [CONTRIBUTING.md](CONTRIBUTING.md).

## Bezpečnost

Remote execution výrazně mění trust model. Experimentální compute nody nevystavuj přímo veřejnému internetu. Viz [SECURITY.md](SECURITY.md) a [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md).

## Licence

Veřejná licence zatím nebyla zvolena. Dokud nebude přidána, nelze předpokládat oprávnění k dalšímu použití nad rámec běžného prohlížení a forkování na GitHubu.
