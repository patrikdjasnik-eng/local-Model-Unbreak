# Supply Chain Security

[![Supply Chain](https://img.shields.io/badge/security-supply%20chain-b91c1c)](#účel)
[![Integrity](https://img.shields.io/badge/integrita-hash%20%2B%20provenance-0f766e)](#artifact-record)
[![Downloads](https://img.shields.io/badge/downloads-přesné%20artifacty-2563eb)](#acquisition-policy)
[![Status](https://img.shields.io/badge/stav-návrh-6f42c1)](#promotion-policy)

Supply Chain Security chrání cestu od upstream model/runtime source až po lokálně trusted execution.

## Účel

Za supply-chain objekty považujeme:

- GGUF model artifacts,
- multimodal projector files,
- llama.cpp/runtime binaries,
- Model Unbreak adapters,
- catalog manifests,
- remote-node worker binaries,
- budoucí training adapters a clone artifacts.

Známé jméno repozitáře samo o sobě nestačí jako evidence.

## Acquisition policy

Preferovaný flow:

```text
approved source record
      ↓
exact artifact + revision
      ↓
user consent / license gate
      ↓
download do staging
      ↓
local hash
      ↓
quarantine
      ↓
format/runtime checks
      ↓
policy decision
      ↓
promotion
```

Whole-repository clone není default pro velká modelová repa.

## Artifact record

Každý installed object ukládá:

```json
{
  "provider": "huggingface",
  "repoId": "ggml-org/Qwen3-4B-GGUF",
  "filename": "Qwen3-4B-Q4_K_M.gguf",
  "revision": "<immutable revision>",
  "sizeBytes": 0,
  "sha256": "<local hash>",
  "license": "apache-2.0",
  "acquiredAt": "<timestamp>",
  "trustState": "QUARANTINED"
}
```

Size se vyplní z verified metadata/local bytes, ne odhadem.

## Source classes

- `CURATED_UPSTREAM` — explicitně v Model Unbreak catalogu,
- `USER_APPROVED` — user schválil URL/repo,
- `LOCAL_FILE` — import z disku,
- `UNKNOWN_REMOTE` — remote source bez trustu.

Source class mění defaults policy, ale nevypíná parser safety.

## Runtime updates

Runtime update je security-sensitive, protože mění execution boundary.

```text
new runtime available
      ↓
release/source metadata
      ↓
user approval
      ↓
download + hash
      ↓
staged verification
      ↓
smoke test
      ↓
Creeping Frost trust reset:
TRUSTED → OBSERVED
      ↓
promotion after policy
```

## Catalog integrity

Catalog manifest má být versioned a později signed nebo jinak integrity-protected.

Catalog metadata nesmí tiše změnit already installed artifact na jiný upstream file bez nového acquisition decision.

## License policy

Installer před transferem ukáže upstream license.

Pokud licence vyžaduje acceptance:

- acceptance je explicitní,
- scope se zaznamená,
- model zůstane unavailable do acceptance,
- Model Unbreak neschovává ani nepřepisuje upstream terms.

## Integrity mismatch

Při mismatch:

```text
BLOCKED
reason: integrity mismatch
artifact remains quarantined
runtime launch denied
```

Primární actions jsou re-download nebo remove, ne „run anyway“.

## Promotion policy

Promotion z quarantine vyžaduje všechny controls požadované selected security profilem.

I source-verified artifact může zůstat `RESTRICTED` nebo `BLOCKED`, pokud selže runtime compatibility, license nebo security check.
