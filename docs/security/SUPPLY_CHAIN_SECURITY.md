# Supply Chain Security

[![Supply Chain](https://img.shields.io/badge/security-supply%20chain-b91c1c)](#purpose)
[![Integrity](https://img.shields.io/badge/integrity-hash%20%2B%20provenance-0f766e)](#artifact-record)
[![Downloads](https://img.shields.io/badge/downloads-exact%20artifacts-2563eb)](#acquisition-policy)
[![Status](https://img.shields.io/badge/status-design-6f42c1)](#promotion-policy)

Supply Chain Security protects the path from upstream model/runtime source to locally trusted execution.

## Purpose

The project treats these as supply-chain objects:

- GGUF model artifacts,
- multimodal projector files,
- llama.cpp/runtime binaries,
- Model Unbreak adapters,
- catalog manifests,
- remote-node worker binaries,
- future training adapters and clone artifacts.

A familiar repository name is not sufficient evidence by itself.

## Acquisition policy

Preferred flow:

```text
approved source record
      ↓
exact artifact + revision
      ↓
user consent / license gate
      ↓
download to staging
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

Whole-repository clone is not the default for large model repositories.

## Artifact record

Each installed object should record:

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

Size is populated from verified metadata/local bytes, not guessed.

## Source classes

Suggested source classes:

- `CURATED_UPSTREAM` — explicitly listed in Model Unbreak catalog,
- `USER_APPROVED` — user supplied a known URL/repo,
- `LOCAL_FILE` — imported from local disk,
- `UNKNOWN_REMOTE` — remote source not yet trusted.

Source class changes policy defaults but never disables parser safety.

## Runtime updates

A runtime update is security-sensitive because a new binary changes the execution boundary.

Update flow:

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

The catalog manifest should be versioned and eventually signed or otherwise integrity-protected.

Catalog metadata must never silently change an already installed artifact to a different upstream file without a new acquisition decision.

## License policy

The installer displays the upstream license state before transfer.

For licenses requiring acceptance:

- acceptance must be explicit,
- acceptance scope is recorded,
- the model remains unavailable until accepted,
- Model Unbreak does not rewrite or obscure upstream terms.

## Integrity mismatch

If expected and observed hashes differ:

```text
BLOCKED
reason: integrity mismatch
artifact remains quarantined
runtime launch denied
```

The UI offers re-download or remove, not “run anyway” as the primary action.

## Promotion policy

Promotion from quarantine requires all controls required by the selected security profile.

A source-verified artifact can still remain `RESTRICTED` or `BLOCKED` if runtime compatibility, license, or security checks fail.
