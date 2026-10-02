# Repository Consolidation Plan

[![Core](https://img.shields.io/badge/core-unified-2563eb)](#current-state)
[![Private](https://img.shields.io/badge/private-extension%20boundary-b91c1c)](PRIVATE_MODULE_BOUNDARY.md)
[![Status](https://img.shields.io/badge/status-active%20migration-0f766e)](#migration-map)

Model Unbreak is consolidating reusable runtime and security foundations from the maintainer's existing projects into one public core while keeping secret/proprietary modules in separate private repositories or packages.

## Current state

The public repository now contains real implementation foundations for:

- model provider registry and model router,
- Creeping Frost capability policy engine,
- SafeCell Docker execution boundary,
- workspace path confinement,
- network target validation,
- normalized Security Events,
- extension registry,
- a single `ModelUnbreakCore` composition root,
- unit-test coverage for the public-safe core.

This is implementation code, not only architecture documentation.

## Migration map

| Source project | Reused concept | Destination | Classification |
| --- | --- | --- | --- |
| LLM-rabbithollow | provider registry / model router | `src/model/` | PUBLIC_SAFE |
| LLM-rabbithollow | default-deny policy | `src/security/policy/` | PUBLIC_SAFE / rewritten |
| LLM-rabbithollow | hardened Docker sandbox | `src/sandbox/` | PUBLIC_SAFE / rewritten |
| AI-agent | runtime permission/risk model | Creeping Frost rules | PUBLIC_SAFE / rewritten |
| AI-agent | URL / network safety invariants | `src/security/network/` | PUBLIC_SAFE / rewritten |
| Rabbithollowcode-security_space | normalized diagnostic pipeline | `src/security/events/` | PUBLIC_SAFE / rewritten |
| rabbitholl-Ai | workspace path confinement | `src/sandbox/path.ts` | PUBLIC_SAFE / rewritten |
| deception-analyzer | honeynet/threat/incident domain model | Security Lab specifications and future persistence | REWRITE_REQUIRED |

No private source repository is vendored wholesale.

## Composition root

`ModelUnbreakCore` is the initial shared runtime boundary:

```text
ModelUnbreakCore
├─ ExtensionRegistry
├─ ProviderRegistry
├─ ModelRouter
├─ CreepingFrostEngine
├─ SecurityEventPipeline
└─ DockerSafeCell
```

Future planner, catalog, GGUF inspector, acquisition service, remote-node transport and Clone Lab modules attach to this core through public contracts.

## Private extensions

Secret/proprietary modules remain outside this repository.

The intended developer layout is:

```text
workspace/
├─ local-Model-Unbreak/
└─ model-unbreak-private/
```

Private code integrates through explicit capabilities and public interfaces. The public core must run without private modules installed.

See [PRIVATE_MODULE_BOUNDARY.md](PRIVATE_MODULE_BOUNDARY.md).

## Migration rule

For every source module:

1. inspect dependencies and hidden assumptions,
2. classify as `PUBLIC_SAFE`, `PRIVATE_ONLY`, or `REWRITE_REQUIRED`,
3. rewrite reusable behavior behind Model Unbreak contracts,
4. port tests without copying private secrets/data,
5. keep fail-closed behavior,
6. run typecheck/tests,
7. document the migration.

## What is intentionally not copied

- credentials and environment files,
- private signatures/intelligence,
- proprietary heuristics,
- private deployment details,
- customer/project data,
- unrelated payment/auth/product code,
- desktop automation not required by Model Unbreak.

## Next implementation slice

1. hardware probe and GGUF inspector,
2. machine-readable model catalog,
3. acquisition/download service,
4. planner contracts and memory estimator,
5. persistent Security Event store,
6. SafeCell platform adapters,
7. optional private-extension loader,
8. frontend mockup wired to the same public contracts.
