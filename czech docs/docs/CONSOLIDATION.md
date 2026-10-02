# Plán sjednocení repozitářů

[![Core](https://img.shields.io/badge/core-sjednocené-2563eb)](#aktuální-stav)
[![Private](https://img.shields.io/badge/private-extension%20boundary-b91c1c)](PRIVATE_MODULE_BOUNDARY.md)
[![Status](https://img.shields.io/badge/stav-active%20migration-0f766e)](#mapa-migrace)

Model Unbreak sjednocuje znovupoužitelné runtime a security základy z našich existujících projektů do jednoho public core. Secret/proprietary moduly zůstávají v oddělených private repozitářích nebo packages.

## Aktuální stav

Public repo už obsahuje skutečný implementační základ pro:

- model provider registry a model router,
- Creeping Frost capability policy engine,
- SafeCell Docker execution boundary,
- workspace path confinement,
- validaci network targetů,
- normalizované Security Events,
- extension registry,
- společný composition root `ModelUnbreakCore`,
- unit testy public-safe core.

Už nejde pouze o dokumentaci architektury.

## Mapa migrace

| Zdrojový projekt | Převzatý koncept | Cíl | Klasifikace |
| --- | --- | --- | --- |
| LLM-rabbithollow | provider registry / model router | `src/model/` | PUBLIC_SAFE |
| LLM-rabbithollow | default-deny policy | `src/security/policy/` | PUBLIC_SAFE / přepsáno |
| LLM-rabbithollow | hardened Docker sandbox | `src/sandbox/` | PUBLIC_SAFE / přepsáno |
| AI-agent | runtime permission/risk model | Creeping Frost rules | PUBLIC_SAFE / přepsáno |
| AI-agent | URL / network safety invariants | `src/security/network/` | PUBLIC_SAFE / přepsáno |
| Rabbithollowcode-security_space | normalized diagnostic pipeline | `src/security/events/` | PUBLIC_SAFE / přepsáno |
| rabbitholl-Ai | workspace path confinement | `src/sandbox/path.ts` | PUBLIC_SAFE / přepsáno |
| deception-analyzer | honeynet/threat/incident domain model | Security Lab specifikace a budoucí persistence | REWRITE_REQUIRED |

Žádný private source repo nekopírujeme celý.

## Composition root

`ModelUnbreakCore` je první společná runtime hranice:

```text
ModelUnbreakCore
├─ ExtensionRegistry
├─ ProviderRegistry
├─ ModelRouter
├─ CreepingFrostEngine
├─ SecurityEventPipeline
└─ DockerSafeCell
```

Budoucí planner, catalog, GGUF inspector, acquisition service, remote-node transport a Clone Lab se na core napojí přes public contracts.

## Private extensions

Secret/proprietary moduly zůstávají mimo public repo.

Doporučený developer layout:

```text
workspace/
├─ local-Model-Unbreak/
└─ model-unbreak-private/
```

Private code se napojuje přes explicit capabilities a public interfaces. Public core musí fungovat i bez private modulů.

Viz [PRIVATE_MODULE_BOUNDARY.md](PRIVATE_MODULE_BOUNDARY.md).

## Pravidlo migrace

Pro každý source module:

1. zkontrolovat dependencies a hidden assumptions,
2. klasifikovat jako `PUBLIC_SAFE`, `PRIVATE_ONLY` nebo `REWRITE_REQUIRED`,
3. reusable behavior přepsat za Model Unbreak contracts,
4. převzít testy bez private secrets/data,
5. zachovat fail-closed behavior,
6. spustit typecheck/testy,
7. zdokumentovat migraci.

## Co záměrně nekopírujeme

- credentials a environment files,
- private signatures/intelligence,
- proprietary heuristics,
- private deployment detaily,
- customer/project data,
- unrelated payment/auth/product code,
- desktop automation nepotřebnou pro Model Unbreak.

## Další implementační slice

1. hardware probe a GGUF inspector,
2. machine-readable model catalog,
3. acquisition/download service,
4. planner contracts a memory estimator,
5. persistent Security Event store,
6. SafeCell platform adapters,
7. volitelný private-extension loader,
8. frontend mockup napojený na stejné public contracts.
