# Získávání modelů

[![Download](https://img.shields.io/badge/modely-explicitní%20souhlas-2563eb)](#souhlas)
[![Integrity](https://img.shields.io/badge/integrita-ověřit%20před%20promotion-16a34a)](#integrita)
[![Quarantine](https://img.shields.io/badge/security-quarantine-b91c1c)](#pipeline)

Tento dokument definuje, jak Model Unbreak bezpečně a předvídatelně získává model artifacts.

## Pipeline

```text
catalog / source URL
       ↓
resolve přesného artifactu
       ↓
license + consent gate
       ↓
kontrola místa na disku
       ↓
download do partial staging
       ↓
integrity metadata
       ↓
quarantine
       ↓
GGUF parser validation
       ↓
runtime compatibility check
       ↓
volitelný SafeCell smoke test
       ↓
trusted local model store
```

## Souhlas

Před network transferem musí UI zobrazit source, publisher/organization, přesný artifact, quantization, očekávanou velikost, destination, licenci, companion files a další kroky Model Unbreak.

Souhlas platí jen pro zvolenou operaci. „Povolit jednou“ se nesmí změnit na permanent repository trust.

## Download adaptéry

Preferované pořadí:

1. Hugging Face artifact API přes `huggingface_hub`,
2. provider-specific artifact API,
3. HTTPS direct file s integrity metadata,
4. Git LFS/Xet-aware retrieval podle potřeby,
5. full Git clone jen pokud artifact-level retrieval není dostupné a uživatel explicitně schválí větší operaci.

## Partial download

```text
downloads/partial/<job-id>/
├─ artifact.part
├─ acquisition.json
└─ progress.json
```

Podporované akce:

- pause,
- resume,
- cancel,
- retry,
- odstranění partial dat.

Zrušený partial download se nesmí objevit v trusted model library.

## Kontrola místa

Před downloadem:

```text
required =
  artifact bytes
+ companion artifacts
+ temporary overhead
+ configured safety reserve
```

Při nedostatku místa se transfer nespustí a UI vysvětlí, kolik prostoru chybí.

## Integrita

Model Unbreak ukládá:

- provider repository,
- exact filename,
- revision/commit,
- provider-reported hash, pokud existuje,
- lokálně vypočtený SHA-256,
- velikost,
- acquisition timestamp.

Provider hash nenahrazuje lokální kontrolu skutečně stažených bytes.

## Quarantine

Nový artifact nejdřív vstoupí do `quarantine/`.

Quarantine neznamená „malware“. Znamená „zatím nepovýšeno na trusted“.

Promotion vyžaduje dokončení všech policy-required checks.

## GGUF validace

Kontroly zahrnují:

- GGUF magic/version,
- bounded metadata parsing,
- sanity tensor metadata,
- detekci architektury,
- detekci kvantizace,
- file-size consistency,
- companion-file requirements.

Parser považuje soubor za untrusted input.

## Runtime compatibility recovery

Pokud aktivní runtime neumí architekturu:

```text
UNSUPPORTED BY CURRENT RUNTIME
          ↓
kontrola approved runtime catalogu
          ↓
existuje novější compatible runtime?
      ┌───┴───┐
     ne       ano
     │         │
   stop       ASK
               │
       "Aktualizovat runtime?"
```

Runtime update je samostatná consented operace a prochází stejnou supply-chain policy.

## Promotion

Po kontrolách se model může přesunout do:

```text
models/<model-id>/<quantization>/
```

Local manifest uloží trust state a evidence.

## Odstranění

Při odstranění catalog modelu se po potvrzení smažou jeho local artifacts. Shared cache a companion soubory používané jinou instalací se nesmí odstranit omylem.
