# Privacy Principles

[![Privacy](https://img.shields.io/badge/document-privacy-2563eb)](#default-posture)
[![Prompts](https://img.shields.io/badge/prompts-not%20logged%20by%20default-0f766e)](#content-handling)
[![Telemetry](https://img.shields.io/badge/telemetry-local%20by%20default-6f42c1)](#telemetry)

Model Unbreak is designed around local inference, so privacy defaults must not undermine the reason users choose local models in the first place.

## Default posture

- Local execution is preferred when practical.
- Remote execution requires explicit configuration.
- Prompts and generated content are not logged by default.
- Benchmark data should describe hardware/runtime behavior without containing user content.
- No analytics upload should be enabled silently.

## Content handling

Prompt text, generated output, retrieved documents, tool results, and model inputs may be sensitive. Components should pass only the data required for execution and should avoid persisting content unless a user-enabled feature requires it.

## Telemetry

Safe default telemetry includes technical measurements such as:

- tokens per second,
- memory use,
- runtime errors,
- network RTT,
- adapter version,
- planner prediction error.

Telemetry should avoid:

- prompt text,
- generated text,
- private filenames where not needed,
- API keys/tokens,
- unnecessary hostnames/IP addresses in exported reports.

## Remote nodes

A remote execution plan necessarily expands the data boundary. Before a remote plan starts, the user-facing explanation should make clear that inference data may leave the local machine.

The `private` profile must reject remote execution rather than merely deprioritize it.

## Exported diagnostics

Diagnostic bundles should be sanitized by construction. Where identifiers are needed for correlation, use generated IDs instead of raw secrets or private host metadata.

## Future services

If the project later introduces optional hosted services, public relays, or cloud coordination, those features require a separate privacy review and explicit opt-in.

## Model acquisition privacy

Catalog browsing may require network access to upstream registries. Model download consent must show the selected upstream provider and artifact.

Inference permissions are separate from download permissions: allowing a download from a registry does not grant the model runtime general internet access.

## Model Clone privacy

Clone jobs default to synthetic-only data.

The following require explicit selection:

- conversations,
- coding sessions,
- local folders,
- custom datasets,
- remote training.

The user should be able to review included records and detected secrets before training begins.

## Security telemetry privacy

Security Lab stores behavioral metadata locally by default. Canary IDs, event types, policy results, hashes, and resource classes are preferred over raw personal content.

Deception assets are synthetic. Real credentials must never be copied into HoneyNet to make decoys look realistic.
