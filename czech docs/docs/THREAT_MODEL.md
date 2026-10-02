# Threat Model

[![Threat model](https://img.shields.io/badge/dokument-threat%20model-b91c1c)](#assets)
[![Trust](https://img.shields.io/badge/trust-pouze%20explicitní%20nody-0f766e)](#trust-boundaries)
[![Phase](https://img.shields.io/badge/fáze-návrh-6f42c1)](#předpoklady)

Tento threat model pokrývá plánovaný local-first coordinator a explicitně trusted remote-node architecture.

## Assets

Chránit je potřeba zejména:

- lokální model files,
- prompty a generated content,
- node credentials,
- integritu host filesystem,
- GPU/CPU availability,
- planner configuration,
- benchmark history,
- network topology a host metadata.

## Actors

### Lokální uživatel

Ovládá coordinator a je trusted pro konfiguraci systému.

### Trusted remote node

Je autentizovaný a explicitně schválený, ale stále tvoří samostatnou security boundary.

### Network attacker

Může traffic pozorovat, zdržovat, replayovat nebo modifikovat, pokud encryption/authentication chybí nebo selže.

### Malicious model/config input

Crafted file nebo konfigurace se může pokusit o parser abuse, path traversal, command injection, resource exhaustion nebo unexpected backend behavior.

## Trust boundaries

```text
user / CLI
    │
    ▼
coordinator process
    │
    ├── local filesystem
    ├── runtime adapter → backend process
    │
    └── encrypted authenticated channel
                   │
                   ▼
              remote node
                   │
                   ▼
              runtime backend
```

Každá šipka překračující process, machine nebo parser boundary vyžaduje input validation.

## Primární hrozby

| Hrozba | Dopad | Povinná mitigace |
| --- | --- | --- |
| Command injection přes model/path/config | Host compromise | Structured arguments; žádná shell interpolation |
| Unauthorized node access | Compute theft / data exposure | Mutual authentication a authorization |
| Malicious node response | Corrupted result / misleading telemetry | Identity, validation, bounded trust v telemetry |
| Prompt/model interception | Confidentiality loss | Encrypted transport |
| Replay authorized requests | Resource abuse | Nonces/session binding/replay protection |
| Path traversal | File disclosure/overwrite | Canonicalized allowlisted paths |
| Resource exhaustion | Availability loss | Quotas, timeouts, bounded allocations |
| Sensitive telemetry | Privacy loss | Data minimization a local-default logging |

## Pravidla remote execution

- Nikdy nepřijímat arbitrary remote shell commands.
- Používat structured workload schemas.
- Vyžadovat explicit node trust establishment.
- Podporovat credential revocation.
- Vázat authorization na node identity a requested capability.
- Omezit model a temporary-file paths.
- Používat timeouts a resource ceilings.
- Defaultně nelogovat prompty.

## Discovery

Local network discovery, pokud vznikne, smí pouze najít kandidáty. Discovery samo o sobě nesmí vytvořit trust ani execution rights.

## Model files

Model metadata parser pracuje s untrusted input. Parsing má být bounded, validovat lengths/offsets a nealokovat paměť jen podle unchecked file metadata.

## Denial of service

Systém má počítat s:

- záměrně huge model metadata,
- repeated failed job submissions,
- fake capacity advertisement,
- slow nebo stalled remote nodes,
- backend processes, které se nepodaří ukončit.

Jsou vyžadovány timeouts, cancellation, bounded queues a process supervision.

## Předpoklady

- Lokální operating system není plně compromised.
- GPU drivers a vybraný inference backend jsou trusted dependencies, ne security sandbox.
- Early releases neposkytují hardened hostile multi-tenancy.
- Remote nodes jsou explicitně trusted, ne anonymně získané.

## Triggery security review

Aktualizuj tento dokument před merge feature, která přidá:

- public node discovery,
- multi-tenant workloads,
- remote model upload,
- změny credential storage,
- automatic execution downloaded artifacts,
- nové network-facing endpoints.

## Rozšířené threats

### Model/runtime supply chain

Threats: artifact substitution, mutable upstream refs, malformed GGUF metadata, compromised runtime binary, license-state confusion a incomplete download promoted jako valid artifact.

Mitigace: exact artifact records, revision pinning pro catalog release, local hashing, quarantine, bounded parsing, SafeCell smoke test a Creeping Frost promotion policy.

### Clone-data exposure

Threats: accidental inclusion secrets, širší folder scope než intended, silent conversation reuse nebo remote training na untrusted nodu.

Mitigace: synthetic-only default, explicit data-source scope, preview/scrubbing, local-first training, attested nodes a visible transfer consent.

### Deception misuse

Threat: real credentials nebo production systems omylem použité jako decoys.

Mitigace: pouze synthetic non-privileged canaries; žádná retaliation ani external targeting.

### Policy bypass

Threat: component spustí runtime/network operation bez Creeping Frost evaluation.

Mitigace: central capability contract, integration tests, fail-closed enforcement a event auditing.

### Attestation drift

Threat: previously trusted node změní worker/runtime/security state.

Mitigace: attestation snapshots, hash/version comparison, automatic trust downgrade na `OBSERVED` a fresh approval podle policy.
