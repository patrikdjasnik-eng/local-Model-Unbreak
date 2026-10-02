# Roadmapa

[![Roadmap](https://img.shields.io/badge/dokument-roadmapa-2563eb)](#milníky)
[![Stage](https://img.shields.io/badge/fáze-návrh%20→%20prototyp-6f42c1)](#aktuální-zaměření)
[![Priority](https://img.shields.io/badge/priorita-správnost%20před%20automatizací-0f766e)](#inženýrská-pravidla)

Roadmapa je založena na milnících. Termíny jsou záměrně vynechány, dokud nebude existovat první implementační baseline.

## Aktuální zaměření

Definovat důvěryhodný plánovací model ještě před budováním automatického remote execution.

## Milníky

### M0 — Základ specifikace

- [x] Definovat scope produktu a non-goals
- [x] Definovat vysokoúrovňovou architekturu
- [x] Definovat security a threat-model dokumentaci
- [x] Definovat reprodukovatelnou benchmark metodiku
- [ ] Zmrazit v0 planner input/output schema
- [ ] Vybrat public-source licenci

Výstupní kritérium: contributors mohou implementovat komponenty bez hádání, co má projekt optimalizovat.

### M1 — Lokální hardware a inspekce modelu

- [ ] Detekovat CPU, RAM, GPU backendy a VRAM
- [ ] Parsovat GGUF metadata
- [ ] Odhadovat model + KV-cache memory
- [ ] Vytvořit čitelný capability report
- [ ] Přidat unit testy pro unsupported a partial hardware

Výstupní kritérium: `model-unbreak inspect model.gguf` vysvětlí, co model potřebuje a co stroj poskytuje.

### M2 — Reprodukovatelný lokální benchmark engine

- [ ] Benchmarkovat lokální CPU/GPU cesty
- [ ] Ukládat benchmark profily s runtime verzemi
- [ ] Oddělit prefill a generation throughput
- [ ] Detekovat thermal nebo background-load contamination
- [ ] Exportovat machine-readable benchmark výsledky

Výstupní kritérium: opakované benchmark běhy zůstávají na stejném stabilním stroji v dokumentované varianci.

### M3 — Fit Planner v0

- [ ] Generovat lokální candidate plans
- [ ] Aplikovat VRAM/RAM safety margins
- [ ] Řadit plány podle explicitního profilu
- [ ] Vysvětlovat odmítnuté alternativy
- [ ] Překládat validovaný plán do llama.cpp argumentů

Výstupní kritérium: planner vybere mezi realistickými lokálními CPU/GPU offload strategiemi bez ručního ladění flags.

### M4 — Runtime feedback

- [ ] Zachytit skutečné VRAM/RAM využití
- [ ] Zachytit prompt a generation throughput
- [ ] Porovnat predicted vs observed behavior
- [ ] Aktualizovat lokální planner calibration
- [ ] Detekovat unstable nebo opakovaně failing plans

Výstupní kritérium: planner zlepšuje lokální predikce z observed runs bez tiché změny user policy.

### M5 — Důvěryhodný vzdálený uzel

- [ ] Mutual authentication
- [ ] Capability advertisement
- [ ] RTT a throughput benchmark
- [ ] Remote llama.cpp execution adapter
- [ ] Encrypted transport
- [ ] Explicit allowlist a revocation

Výstupní kritérium: dva trusted machines spustí model vzdáleně s měřitelným, vysvětlitelným routing decision.

### M6 — Hybridní plánování

- [ ] Porovnávat local, remote a podporované hybrid strategies
- [ ] Zahrnout network cost do plan scoring
- [ ] Odmítat remote paths, které zvyšují latenci bez užitečného capacity gain
- [ ] Přidat context/KV-cache-aware planning

Výstupní kritérium: multi-node plan se vybere pouze tehdy, když ho podporují naměřená data.

### M7 — Výzkum Elastic Overflow

- [ ] Prozkoumat safe runtime re-planning
- [ ] Detekovat VRAM pressure od competing applications
- [ ] Vyhodnotit pause/restart vs live migration trade-offs
- [ ] Prototypovat session checkpoint compatibility

Výstupní kritérium: před prezentací dynamic migration jako production-ready publikovat benchmark evidence.


### M0.5 — Product surface a catalog contract

- [x] Definovat kurátorovaný Free/Premium model catalog
- [x] Definovat exact artifact/source a quantization records
- [x] Definovat artifact-level acquisition místo full-repo clone jako default
- [x] Definovat explicit consent, partial/resume, quarantine a integrity flow
- [x] Definovat detailní frontend mockup contract
- [ ] Zmrazit machine-readable catalog manifest schema

Exit criterion: frontend a budoucí backend používají stejná model IDs, sources, artifacts a trust states.

### M4.5 — Security Lab foundation

- [x] Definovat Creeping Frost AI Firewall v2 policy model
- [x] Definovat SafeCell isolation contract
- [x] Definovat HoneyNet a Deception Mode
- [x] Definovat Threat Hunting a normalized events
- [x] Definovat supply-chain security a remote-node attestation
- [x] Definovat defense validation a incident response
- [ ] Implementovat platform-specific enforcement backends
- [ ] Přidat security integration tests a evidence fixtures

Exit criterion: každý security badge v UI odpovídá testovatelnému control s explicit failure behavior.

### M6.5 — Model Clone research

- [x] Definovat Quick / Personal / Deep Clone workflow
- [x] Definovat data-consent boundary
- [x] Definovat teacher/student evaluation contract
- [ ] Prototypovat local synthetic-only Quick Clone
- [ ] Přidat secret-scrubbing a dataset review
- [ ] Validovat GGUF/export path pro supported student runtimes

Exit criterion: menší clone lze vytvořit a vyhodnotit reprodukovatelně bez silent reading user dat.

## Pozdější výzkum

- speculative local/remote decoding,
- topology-aware multi-node execution,
- backend support nad rámec llama.cpp,
- desktop UI,
- offline-first historie hardware profilů,
- shared team compute pools s explicit trust.

## Inženýrská pravidla

1. Funkce není hotová bez testů a failure behavior.
2. Benchmark claims vyžadují reprodukovatelná data.
3. Security-sensitive remote features vyžadují update threat modelu.
4. Planner decisions musí být vysvětlitelné.
5. Větší podporovaný model není automaticky zlepšení, pokud se zhroutí použitelnost.
