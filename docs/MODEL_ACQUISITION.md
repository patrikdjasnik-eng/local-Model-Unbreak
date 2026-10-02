# Model Acquisition

[![Download](https://img.shields.io/badge/models-explicit%20consent-2563eb)](#consent-gate)
[![Integrity](https://img.shields.io/badge/integrity-verify%20before%20promote-16a34a)](#integrity)
[![Quarantine](https://img.shields.io/badge/security-quarantine-b91c1c)](#acquisition-pipeline)

This document defines how Model Unbreak retrieves model artifacts safely and predictably.

## Acquisition pipeline

```text
catalog / source URL
       ↓
resolve exact artifact
       ↓
license + consent gate
       ↓
disk-space preflight
       ↓
download to partial staging
       ↓
integrity metadata
       ↓
quarantine
       ↓
GGUF parser validation
       ↓
runtime compatibility check
       ↓
optional SafeCell smoke test
       ↓
trusted local model store
```

## Consent gate

Before network transfer, the UI must display source, publisher/organization, exact artifact, quantization, expected size, destination, license, companion files, and what Model Unbreak will do next.

Consent is scoped to the selected operation. “Allow once” does not become permanent repository trust.

## Download adapters

Preferred order:

1. Hugging Face artifact API through `huggingface_hub`,
2. provider-specific artifact API,
3. HTTPS direct file with integrity metadata,
4. Git LFS/Xet-aware retrieval where required,
5. full Git clone only when artifact-level retrieval is unavailable and the user explicitly approves the larger operation.

## Partial download state

Downloads should use a staging area:

```text
downloads/partial/<job-id>/
├─ artifact.part
├─ acquisition.json
└─ progress.json
```

Supported actions:

- pause,
- resume,
- cancel,
- retry,
- remove partial data.

A canceled partial download must not appear in the trusted model library.

## Disk preflight

Before download:

```text
required =
  artifact bytes
+ companion artifacts
+ temporary overhead
+ configured safety reserve
```

If insufficient disk space is available, Model Unbreak must stop before transfer and explain the shortfall.

## Integrity

Model Unbreak should record:

- provider repository,
- exact filename,
- revision/commit,
- provider-reported hash when available,
- locally computed SHA-256,
- size,
- acquisition timestamp.

A source-provided hash is not a substitute for locally verifying the bytes after download.

## Quarantine

New artifacts enter `quarantine/` first.

Quarantine does not mean “malicious.” It means “not promoted yet.”

Promotion requires all policy-required checks to complete.

## GGUF validation

Validation should include:

- GGUF magic/version,
- bounded metadata parsing,
- tensor metadata sanity,
- architecture detection,
- quantization detection,
- file-size consistency,
- companion-file requirements when applicable.

The parser treats the file as untrusted input.

## Runtime compatibility recovery

If the active runtime does not support the model architecture:

```text
UNSUPPORTED BY CURRENT RUNTIME
          ↓
check approved runtime catalog
          ↓
newer compatible runtime exists?
      ┌───┴───┐
     no      yes
     │        │
   stop      ASK
              │
       "Update runtime?"
```

A runtime update is a separate consented action and passes through the same supply-chain policy.

## Promotion

After checks, a model may move from quarantine to:

```text
models/<model-id>/<quantization>/
```

The local manifest records its trust state and evidence.

## Removal

Removing a catalog model deletes local model artifacts only after confirmation. Shared caches and companion files still referenced by another installed model must not be deleted accidentally.
