# Podpora

[![Support](https://img.shields.io/badge/podpora-community%20issues-2563eb)](#kam-se-obrátit)
[![Bugs](https://img.shields.io/badge/bugy-vyžadují%20reprodukci-0f766e)](#hlášení-chyb)
[![Security](https://img.shields.io/badge/security-použij%20soukromé%20hlášení-b91c1c)](SECURITY.md)

Model Unbreak je experimentální projekt. Podpora je best-effort a má se soustředit na reprodukovatelné chování.

## Kam se obrátit

GitHub Issues používej pro:

- reprodukovatelné bugy,
- hardware-detection failures,
- incorrect GGUF estimates,
- planner behavior odporující dokumentované policy,
- focused feature proposals.

Pokud budou povoleny Discussions, používej je pro open-ended design conversation, hardware results nebo general questions.

Security reports patří do private procesu popsaného v [SECURITY.md](SECURITY.md).

## Hlášení chyb

Užitečný report obsahuje:

```text
Model Unbreak commit/verze:
Operační systém:
CPU:
RAM:
GPU:
VRAM:
Driver/runtime:
Architektura modelu:
GGUF kvantizace:
Velikost modelu:
Context setting:
Vybraný profil:
Očekávané chování:
Pozorované chování:
Minimální reprodukce:
Relevantní sanitizované logy:
```

Nenahrávej proprietary model files, private prompts, API keys, access tokens ani unrelated diagnostic archives.

## Performance reporty

Performance claims mají dodržovat [docs/BENCHMARKING.md](docs/BENCHMARKING.md). Screenshot jediné tokens-per-second hodnoty nestačí k diagnostice planner problému.

## Nepodporovaná očekávání

Projekt nemůže zaručit, že:

- každý GGUF model poběží na každém stroji,
- přidání remote GPU zvýší rychlost,
- model, který se vejde do combined memory, bude interaktivní,
- third-party runtimes se budou chovat identicky napříč driver versions.
