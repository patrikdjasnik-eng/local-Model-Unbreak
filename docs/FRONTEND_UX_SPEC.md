# Frontend UX Specification

[![Frontend](https://img.shields.io/badge/frontend-detailed%20mockup-2563eb)](#primary-shell)
[![Consent](https://img.shields.io/badge/UX-explicit%20consent-0f766e)](#consent-pattern)
[![Security](https://img.shields.io/badge/security-visible-b91c1c)](#security-lab)
[![Status](https://img.shields.io/badge/status-mockup%20spec-6f42c1)](#mockup-definition-of-done)

The first frontend should be a detailed functional mockup that communicates the entire Model Unbreak product before backend implementation is complete.

Fake data is allowed in the mockup only when clearly labeled as mock/estimated. The UI must never make a prototype state look like measured production data.

## Primary shell

Desktop-first layout:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Model Unbreak                     Security: HARDENED      Node: LOCAL  │
├──────────────┬─────────────────────────────────────────────────────────┤
│ Home         │                                                         │
│ Models       │                 active workspace                        │
│ Planner      │                                                         │
│ Hardware     │                                                         │
│ Benchmarks   │                                                         │
│ Clone Lab    │                                                         │
│ Security Lab │                                                         │
│ Nodes        │                                                         │
│ Settings     │                                                         │
└──────────────┴─────────────────────────────────────────────────────────┘
```

## Home

The home screen answers:

- what is installed,
- what can run now,
- current hardware pressure,
- current security posture,
- whether any remote nodes are trusted,
- recommended next action.

## Model Catalog

Top-level task selector:

```text
What do you want your local AI to do?

[ Coding ] [ Chat ] [ Reasoning ] [ Translation ]
[ Vision ] [ Fastest ] [ Largest model I can run ]
```

Each model card shows:

- model name,
- tier,
- task tags,
- quantization,
- source,
- license,
- download size,
- local hardware fit,
- estimated or measured status,
- install/run action.

Example:

```text
Qwen3 4B                         FREE
General • Reasoning
Q4_K_M • 2.50 GB

Hardware fit: EXCELLENT
Expected mode: LOCAL GPU

Source: ggml-org
License: Apache-2.0

[ Details ] [ Install ]
```

Premium cards are never presented as if Model Unbreak owns the upstream model. Premium badges represent Model Unbreak features/curation.

## Install flow

```text
Model details
    ↓
source + license
    ↓
hardware fit
    ↓
exact artifact
    ↓
consent dialog
    ↓
download progress
    ↓
quarantine checks
    ↓
ready / blocked / needs runtime update
```

Download screen exposes:

- exact bytes transferred,
- total size,
- current throughput,
- ETA,
- source,
- target path,
- pause,
- cancel,
- retry.

## Consent pattern

Any operation that changes trust, downloads large content, sends data to another machine, updates a runtime, or trains on user data uses an explicit consent dialog.

Buttons should use concrete actions:

```text
[ Cancel ]
[ Allow once ]
[ Trust this node ]
```

Avoid vague labels such as “OK”.

## Planner workspace

```text
┌──────────────────┬───────────────────────────┬─────────────────────┐
│ MODEL            │ HARDWARE                  │ PLAN                │
│ Qwen3 8B         │ GPU 8 GB                  │ HYBRID              │
│ Q4_K_M           │ RAM 16 GB                 │ GPU 5.8 GB          │
│ 5.03 GB          │ free VRAM 6.4 GB          │ RAM overflow        │
│                  │ remote node optional      │ headroom 600 MB     │
└──────────────────┴───────────────────────────┴─────────────────────┘

WHY THIS PLAN
✓ avoids predicted OOM
✓ keeps configured VRAM headroom
! throughput is estimated, not measured

[ Compare ] [ Benchmark ] [ Run ]
```

Rejected plans remain visible with a reason.

## Clone Lab

Flow:

```text
Select teacher
      ↓
select clone size / mode
      ↓
choose data sources
      ↓
review dataset
      ↓
estimate training requirements
      ↓
explicit consent
      ↓
train
      ↓
evaluate
      ↓
compare teacher/student
      ↓
approve or reject clone
```

The default dataset source is synthetic only.

## Security Lab

Main status:

```text
SECURITY LAB

Creeping Frost        HARDENED
SafeCell              ACTIVE
Network egress        RESTRICTED
Model provenance      VERIFIED
HoneyNet              STANDBY
Threat Hunter         ACTIVE
Open incidents        0

[ Policies ] [ Threat Hunt ] [ Deception ]
[ Supply Chain ] [ Nodes ] [ Incidents ]
```

Security is not hidden inside settings.

## Creeping Frost prompt

```text
CREEPING FROST

Qwen3 runtime requests:
network.connect

Destination:
huggingface.co

Reason:
approved model acquisition

Policy result:
ASK

[ Deny ] [ Allow once ] [ Always allow for catalog downloads ]
```

For unexpected destinations, the UI shows why the request differs from baseline.

## Incident timeline

```text
14:03:11 model staged in SafeCell
14:03:18 runtime started
14:03:22 model read
14:03:24 honey credential accessed        HIGH
14:03:24 Creeping Frost blocked access
14:03:25 network revoked
14:03:25 runtime isolated
14:03:26 evidence snapshot preserved
```

## Visual semantics

The mockup should visually distinguish:

- measured,
- estimated,
- verified,
- unknown,
- blocked,
- user-approved.

Do not rely on color alone. Use text/icon/state labels.

## Empty states

Examples:

```text
No models installed
[ Browse free models ] [ Import GGUF ]
```

```text
No trusted remote nodes
Your models will remain local.
[ Add node ]
```

## Mockup definition of done

The mockup is complete when a reviewer can click through these stories without backend knowledge:

1. install a free curated model,
2. import a custom GGUF,
3. see an unsupported-runtime recovery prompt,
4. compare local/hybrid/remote plans,
5. create a synthetic Quick Clone,
6. inspect Security Lab,
7. see Creeping Frost deny an unexpected capability,
8. inspect an incident timeline,
9. add a trusted remote node,
10. understand exactly which values are fake/estimated in the mockup.
