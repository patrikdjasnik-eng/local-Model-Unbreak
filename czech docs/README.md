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


## Produktový zážitek

Model Unbreak by měl působit méně jako low-level inference toolkit a více jako hardware-aware řídicí centrum pro lokální AI.

Uživatelské rozhraní má okamžitě odpovědět na čtyři otázky:

1. **Jaký model se snažím spustit?**
2. **Jaký hardware je právě dostupný?**
3. **Proč se model nevejde nebo neběží dobře?**
4. **Jaký je nejlepší praktický execution plan?**

Frontend proto není plánovaný jako dekorativní dashboard. Má být vizuální vysvětlovací vrstvou planneru.

### Směr frontend mockupu

První detailní frontend mockup by měl stát kolem jednoho hlavního workspace místo mnoha oddělených obrazovek.

```text
┌────────────────────────────────────────────────────────────────────┐
│ Model Unbreak                                      LOCAL / HYBRID  │
├──────────────────┬───────────────────────────┬─────────────────────┤
│ MODEL            │ HARDWARE MAP              │ EXECUTION PLAN      │
│                  │                           │                     │
│ Qwen Coder       │ GPU 0  GTX 1070 Ti        │ HYBRID              │
│ Q4_K_M           │ 8 GB VRAM                 │                     │
│ 18.6 GB          │ 6.4 GB free               │ GPU      6.0 GB     │
│ 32k context      │                           │ RAM      8.2 GB     │
│                  │ RAM 16 GB                 │ Remote   6.0 GB     │
│                  │ CPU i5                    │                     │
├──────────────────┴───────────────────────────┴─────────────────────┤
│ PROČ TENTO PLÁN                                                    │
│ ✓ vyhne se OOM                                                     │
│ ✓ ponechá 768 MB VRAM rezervu                                      │
│ ✓ remote RTT je dost nízké, aby offload dával smysl                │
│ ! throughput je zatím odhad, ne měření                              │
├────────────────────────────────────────────────────────────────────┤
│ [ Inspect ] [ Benchmark ] [ Compare plans ] [ Run selected plan ] │
└────────────────────────────────────────────────────────────────────┘
```

UI má skutečné limity hardwaru ukazovat, ne je schovávat. Memory pressure, network cost, estimated vs measured hodnoty a rejected strategies musí být pochopitelné bez otevírání terminálu.

### Hlavní pohledy

První mockup má obsahovat:

- **Model Inspector** — architektura, kvantizace, velikost, context a odhad runtime memory.
- **Hardware Map** — CPU, RAM, GPU, VRAM, aktuální load a volitelné trusted remote nodes.
- **Fit Planner** — kandidátní strategie s jasným selected/rejected stavem.
- **Proč tento plán?** — human-readable reasoning vytvořený z deterministických planner facts.
- **Benchmark Lab** — opakovatelné prompt/generation throughput, VRAM/RAM usage, RTT a variance.
- **Runtime Monitor** — aktuální placement, memory pressure, token speed, warnings a failures.
- **Privacy Mode** — výrazný indikátor, když je remote execution zakázaný.

### UX principy

1. **Žádná falešná jednoduchost.** Schovávat unnecessary backend syntax, ne skutečné hardware limity.
2. **Measured a estimated hodnoty musí vypadat odlišně.** Uživatel nesmí zaměnit predikci za benchmark.
3. **Každé odmítnutí potřebuje důvod.** „Nelze spustit“ nestačí.
4. **Riziková automatizace vyžaduje explicitní souhlas.** Remote execution a budoucí dynamic migration musí být viditelné akce.
5. **Slabší PC je hlavní use case.** Rozhraní se má navrhovat kolem constrained hardware, ne pouze kolem flagship GPU.
6. **Terminal detaily zůstávají dostupné.** Advanced user si musí umět zobrazit přesnou vygenerovanou runtime konfiguraci.

## První veřejné demo

První působivé demo má být záměrně jednoduché:

```text
1. Uživatel vloží GGUF model do Model Unbreak
2. Hardware se automaticky detekuje
3. Model se bezpečně nevejde do VRAM
4. Model Unbreak porovná realistické strategie
5. UI vysvětlí trade-offs
6. Uživatel spustí vybraný plán
7. Skutečné runtime měření se porovná s predikcí
```

Silné veřejné demo není „podívejte, umí to spustit llama.cpp“. Zajímavá část je:

> **Model Unbreak vysvětlí, proč se model nevejde, najde realistické alternativy a ukáže, proč je jeden execution plan vhodnější pro aktuální počítač.**

To je hlavní produktová hodnota, kterou má frontend komunikovat.


## Vestavěný katalog modelů

Model Unbreak má mít kurátorovaný katalog a současně dovolí **libovolný vlastní GGUF podporovaný aktivním runtime**. Free uživatel nebude blokován před importem velkého local GGUF. Premium znamená orchestration a optimization funkce Model Unbreak, ne vlastnictví upstream open modelu.

### Free

| Model | Kvant | Source | Hlavní použití |
| --- | --- | --- | --- |
| Qwen3.5 0.8B | Q8_0 | `ggml-org/Qwen3.5-0.8B-GGUF` | lehký general |
| Qwen3 1.7B | Q4_K_M | `ggml-org/Qwen3-1.7B-GGUF` | general / reasoning |
| SmolLM3 3B | Q4_K_M | `ggml-org/SmolLM3-3B-GGUF` | lehký multilingual chat |
| Qwen3 4B | Q4_K_M | `ggml-org/Qwen3-4B-GGUF` | silnější general / reasoning |
| Qwen2.5-Coder 1.5B Instruct | Q4_K_M | `tensorblock/Qwen2.5-Coder-1.5B-Instruct-GGUF` | lehký coding |

### Premium-curated

| Model | Kvant | Source | Hlavní použití |
| --- | --- | --- | --- |
| Qwen3 8B | Q4_K_M | `Qwen/Qwen3-8B-GGUF` | silnější general / reasoning |
| Qwen2.5-Coder 7B Instruct | Q8_0 | `ggml-org/Qwen2.5-Coder-7B-Instruct-Q8_0-GGUF` | coding |
| gpt-oss 20B | MXFP4 | `ggml-org/gpt-oss-20b-GGUF` | velký general / reasoning |
| Gemma 3 12B IT | Q4_K_M | `ggml-org/gemma-3-12b-it-GGUF` | multimodal / general |
| Gemma 3 27B IT | Q4_K_M | `ggml-org/gemma-3-27b-it-GGUF` | velký multimodal / general |

Přesné filenames, sizes, licence, source URI a acquisition pravidla jsou v [docs/MODEL_CATALOG.md](docs/MODEL_CATALOG.md).

### Download bez složité práce s model repem

User nemusí znát Git LFS, Xet, repository layout ani quant filename.

```text
výběr task/model
      ↓
hardware fit
      ↓
exact artifact + licence
      ↓
explicitní souhlas
      ↓
artifact-level download
      ↓
integrity check
      ↓
quarantine
      ↓
GGUF/runtime compatibility
      ↓
trusted local model store
```

Model Unbreak preferuje přesné stažení artifactu z Hugging Face přes `huggingface_hub` místo clone celého model repository. Git/Git LFS je fallback tam, kde artifact-level retrieval není dostupné.

Download používá partial/staging stav, takže lze bezpečně implementovat pause, resume, cancel, retry a cleanup bez toho, aby incomplete file vypadal jako installed model. Viz [docs/MODEL_ACQUISITION.md](docs/MODEL_ACQUISITION.md).

## Model Clone

Budoucí **Model Clone / Self-Distill** může použít větší teacher model k vytvoření menšího specializovaného student modelu nebo adapteru.

```text
velký teacher
     ↓
synthetic nebo explicitně vybraná data
     ↓
LoRA / QLoRA / distillation
     ↓
evaluation
     ↓
menší local clone
```

Personal conversations, coding sessions, folders ani datasety se nikdy nevyberou tiše. Default je synthetic-only. Viz [docs/MODEL_CLONING.md](docs/MODEL_CLONING.md).

## Security Lab

Security je viditelná část produktu, ne schovaný checkbox.

Plánovaný Security Lab spojuje:

- **Creeping Frost AI Firewall v2** — centrální `ALLOW / ASK / DENY` capability policy a enforcement,
- **SafeCell** — disposable runtime isolation a virtual/fake-storage boundary,
- **HoneyNet** — izolované decoy services a canary resources,
- **Threat Hunting** — behavior baseline, rules a correlation,
- **Defense Validation** — non-destructive ověřování controls na owned/authorized systems,
- **Supply Chain Guard** — source, revision, licence, hash, quarantine a promotion,
- **Node Attestation** — trust evidence remote GPU workers,
- **Deception Mode** — fake credentials/files/services pro detection unexpected behavior,
- **Incident Response** — containment, evidence, recovery a incident timeline.

```text
Model source
     ↓
Supply Chain Guard
     ↓
Quarantine
     ↓
SafeCell
     ↓
Creeping Frost
     ↓
Runtime / Remote Node
     ↓
Threat Hunter + HoneyNet
     ↓
Incident Engine
```

Security modes: `STANDARD`, `PRIVATE`, `HARDENED`, `DECEPTION`, `AIRGAP`.

Creeping Frost je capability-aware: řídí network, filesystem, processes, model acquisition, RAM/VRAM allocation, remote compute, clone training a security actions. Threat signals mohou policy automaticky **zpřísnit**, pokud je to předem povolené, ale nikdy ji tiše neoslabí.

Celý návrh je v [docs/security/README.md](docs/security/README.md).

## Frontend specifikace

Detailní mockup kontrakt je v [docs/FRONTEND_UX_SPEC.md](docs/FRONTEND_UX_SPEC.md). Frontend zahrnuje Model Catalog, Planner, Hardware, Benchmarks, Clone Lab, Security Lab, Nodes a Settings s explicit consent a jasným rozlišením measured vs estimated dat.

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
