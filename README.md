# Model Unbreak

[![Status](https://img.shields.io/badge/status-design%20%26%20prototype-6f42c1)](#project-status)
[![Models](https://img.shields.io/badge/models-GGUF-2563eb)](#scope)
[![Runtime](https://img.shields.io/badge/runtime-local--first-0f766e)](#principles)
[![Backend](https://img.shields.io/badge/backend-llama.cpp%20planned-374151)](docs/TECHNICAL_DESIGN.md)
[![Docs](https://img.shields.io/badge/docs-architecture%20%7C%20security%20%7C%20benchmarks-334155)](ARCHITECTURE.md)

> Run the model you want on the hardware you actually have.

Model Unbreak is an experimental local-first runtime planner for GGUF inference on constrained consumer hardware. It is designed to inspect the hardware that is actually available, benchmark it, explain its limits, and choose a practical execution strategy instead of forcing the user to manually tune GPU offload, RAM spillover, remote nodes, context size, KV-cache format, and backend flags.

The project does **not** pretend several devices are one magical GPU. It treats local GPU, system RAM, CPU, and explicitly trusted remote nodes as separate resources and plans inference around their real constraints.

## Why

Running GGUF models on 4–12 GB GPUs often turns into trial and error:

- the model fits on disk but not in VRAM,
- a higher context window causes an unexpected out-of-memory failure,
- CPU offload works but is unnecessarily slow,
- a remote GPU has enough memory but network latency removes the expected speedup,
- an apparently reasonable tensor split performs worse than a smaller local model,
- users must understand low-level runtime flags before they can answer a simple question: *what will run well on this machine?*

Model Unbreak aims to make that decision measurable and explainable.

## Core idea

```text
GGUF model
    │
    ▼
model inspection
    │
    ▼
hardware probe ── benchmark
    │                 │
    └──────┬──────────┘
           ▼
      Fit Planner
           │
    ┌──────┼───────────┐
    ▼      ▼           ▼
  local   hybrid     remote
 GPU/RAM  offload     node
    └──────┬───────────┘
           ▼
 explainable execution plan
```

A future command should feel closer to:

```bash
model-unbreak run ./models/qwen.gguf --profile balanced
```

than to manually assembling a long list of backend-specific flags.

## Planned profiles

| Profile | Goal | Typical decision bias |
| --- | --- | --- |
| `fast` | Maximize interactive throughput | Prefer GPU-resident execution and low network overhead |
| `big` | Run the largest practical model | Allow RAM/remote capacity when needed |
| `long-context` | Preserve useful context length | Budget KV cache before model placement |
| `private` | Keep inference on the local machine | Disable remote execution |
| `balanced` | Good speed without fragile tuning | Trade throughput, memory headroom, and stability |

## Scope

The first supported model format is planned to be **GGUF**, with **llama.cpp** as the primary execution backend. Ollama-compatible integration may be added as an adapter, not as the core scheduling layer.

The planner is expected to reason about:

- model size and quantization,
- available VRAM and headroom,
- RAM capacity and bandwidth,
- CPU capability,
- KV-cache requirements,
- context length,
- local GPU utilization,
- remote-node memory and compute,
- network RTT and throughput,
- expected tokens per second,
- privacy constraints.

## Principles

1. **Local first.** A useful local plan should be preferred when it is sufficiently capable.
2. **Measure before deciding.** Hardware labels are not enough; the planner should use observed capability.
3. **Explain every plan.** Users should see why a strategy was selected.
4. **Fail safely.** Memory headroom is more valuable than an optimistic plan that crashes.
5. **Remote is explicit.** No machine becomes a compute node without opt-in and authentication.
6. **Backend details stay behind adapters.** The planner should not be coupled to one CLI forever.

## Example plan

```text
Model: Qwen coder GGUF
Goal: balanced

Local GPU:          8 GB
Usable VRAM:        6.9 GB
System RAM:        16 GB
Remote node:       12 GB
Network RTT:        7 ms

Tested strategies:
  local GPU + RAM      10.8 tok/s
  full remote          17.3 tok/s
  hybrid               21.1 tok/s

Selected: HYBRID
Reason: model fits with safe headroom and measured network overhead remains below the expected compute gain.
```

Numbers above are illustrative only. Model Unbreak should report measured or modelled values clearly, never fabricate benchmark results.


## Product experience

Model Unbreak should feel less like a low-level inference toolkit and more like a hardware-aware control center for local AI.

The user experience should answer four questions immediately:

1. **What model am I trying to run?**
2. **What hardware is available right now?**
3. **Why does the model not fit or perform well?**
4. **What is the best practical execution plan?**

The frontend is therefore not planned as a decorative dashboard. It is a visual explanation layer for the planner.

### Frontend mockup direction

The first detailed frontend mockup should revolve around one main workspace rather than many disconnected screens.

```text
┌────────────────────────────────────────────────────────────────────┐
│ Model Unbreak                                      LOCAL / HYBRID  │
├──────────────────┬───────────────────────────┬─────────────────────┤
│ MODEL            │ HARDWARE MAP              │ EXECUTION PLAN      │
│                  │                           │                     │
│ Qwen Coder       │ GPU 0  GTX 1070 Ti        │ HYBRID              │
│ Q4_K_M           │ 8 GB VRAM                 │                     │
│ 18.6 GB          │ 6.4 GB free               │ GPU      6.0 GB     │
│ 32k context      │                           │ RAM      8.2 GB     │
│                  │ RAM 16 GB                 │ Remote   6.0 GB     │
│                  │ CPU i5                    │                     │
├──────────────────┴───────────────────────────┴─────────────────────┤
│ WHY THIS PLAN                                                      │
│ ✓ avoids OOM                                                       │
│ ✓ keeps 768 MB VRAM headroom                                       │
│ ✓ remote RTT is low enough to justify offload                      │
│ ! estimated throughput, not yet measured                           │
├────────────────────────────────────────────────────────────────────┤
│ [ Inspect ] [ Benchmark ] [ Compare plans ] [ Run selected plan ] │
└────────────────────────────────────────────────────────────────────┘
```

The UI should make local constraints visible instead of hiding them. Memory pressure, network cost, estimated versus measured values, and rejected strategies should be understandable without opening a terminal.

### Primary views

The first mockup should include:

- **Model Inspector** — architecture, quantization, file size, context, estimated runtime memory.
- **Hardware Map** — CPU, RAM, GPU, VRAM, current load, and optional trusted remote nodes.
- **Fit Planner** — candidate strategies with clear selected/rejected states.
- **Why this plan?** — human-readable reasoning generated from deterministic planner facts.
- **Benchmark Lab** — repeatable prompt/generation throughput, VRAM/RAM usage, RTT, and variance.
- **Runtime Monitor** — current placement, memory pressure, token speed, warnings, and failures.
- **Privacy Mode** — an obvious indicator when remote execution is forbidden.

### UX principles

1. **No fake simplicity.** Hide unnecessary backend syntax, not real hardware limits.
2. **Measured and estimated values must look different.** The user should never confuse a prediction with a benchmark.
3. **Every rejection needs a reason.** “Cannot run” is not enough.
4. **Dangerous automation requires explicit consent.** Remote execution and future dynamic migration must be visible actions.
5. **The weak-PC case is the hero case.** The interface should be designed around constrained hardware, not only flagship GPUs.
6. **Terminal details remain available.** Advanced users should be able to inspect the exact generated runtime configuration.

## First public demo

The first compelling demo should be intentionally simple:

```text
1. Drop a GGUF model into Model Unbreak
2. Hardware is detected automatically
3. The model does not safely fit in VRAM
4. Model Unbreak compares realistic strategies
5. The UI explains the trade-offs
6. The user launches the selected plan
7. Actual runtime measurements are compared with the prediction
```

A strong public demo is not “look, it can launch llama.cpp.” The interesting part is:

> **Model Unbreak explains why the model does not fit, finds realistic alternatives, and shows why one execution plan is better suited to the current machine.**

That is the core product value the frontend should communicate.


## Built-in model catalog

Model Unbreak is planned to ship with a curated catalog while still allowing **any user-provided GGUF supported by the active runtime**. Free users are not blocked from importing a large local GGUF. Premium represents Model Unbreak orchestration and optimization features, not ownership of upstream open models.

### Free

| Model | Quant | Source | Primary use |
| --- | --- | --- | --- |
| Qwen3.5 0.8B | Q8_0 | `ggml-org/Qwen3.5-0.8B-GGUF` | lightweight general |
| Qwen3 1.7B | Q4_K_M | `ggml-org/Qwen3-1.7B-GGUF` | general / reasoning |
| SmolLM3 3B | Q4_K_M | `ggml-org/SmolLM3-3B-GGUF` | lightweight multilingual chat |
| Qwen3 4B | Q4_K_M | `ggml-org/Qwen3-4B-GGUF` | stronger general / reasoning |
| Qwen2.5-Coder 1.5B Instruct | Q4_K_M | `tensorblock/Qwen2.5-Coder-1.5B-Instruct-GGUF` | lightweight coding |

### Premium-curated

| Model | Quant | Source | Primary use |
| --- | --- | --- | --- |
| Qwen3 8B | Q4_K_M | `Qwen/Qwen3-8B-GGUF` | stronger general / reasoning |
| Qwen2.5-Coder 7B Instruct | Q8_0 | `ggml-org/Qwen2.5-Coder-7B-Instruct-Q8_0-GGUF` | coding |
| gpt-oss 20B | MXFP4 | `ggml-org/gpt-oss-20b-GGUF` | large general / reasoning |
| Gemma 3 12B IT | Q4_K_M | `ggml-org/gemma-3-12b-it-GGUF` | multimodal / general |
| Gemma 3 27B IT | Q4_K_M | `ggml-org/gemma-3-27b-it-GGUF` | large multimodal / general |

Exact filenames, sizes, license handling, source URIs, and acquisition rules are defined in [docs/MODEL_CATALOG.md](docs/MODEL_CATALOG.md).

### Download without model-repository complexity

The user should not need to understand Git LFS, Xet, repository layouts, or quantization filenames.

The default flow is:

```text
choose task/model
      ↓
hardware fit
      ↓
exact artifact + license
      ↓
explicit user approval
      ↓
artifact-level download
      ↓
integrity check
      ↓
quarantine
      ↓
GGUF/runtime compatibility
      ↓
trusted local model store
```

Model Unbreak prefers exact Hugging Face artifact retrieval through `huggingface_hub` instead of cloning an entire model repository. Git/Git LFS is a fallback when artifact-level retrieval is unavailable.

Downloads support a staging/partial state so pause, resume, cancel, retry, and cleanup can be implemented without treating incomplete files as installed models. See [docs/MODEL_ACQUISITION.md](docs/MODEL_ACQUISITION.md).

## Model Clone

A future **Model Clone / Self-Distill** workflow can use a larger teacher to create a smaller specialized student or adapter.

```text
large teacher
     ↓
synthetic or explicitly selected data
     ↓
LoRA / QLoRA / distillation
     ↓
evaluation
     ↓
smaller local clone
```

Personal conversations, coding sessions, folders, or datasets are never selected silently. The default clone data source is synthetic-only. See [docs/MODEL_CLONING.md](docs/MODEL_CLONING.md).

## Security Lab

Security is designed as a visible product surface rather than a hidden checkbox.

The planned Security Lab combines:

- **Creeping Frost AI Firewall v2** — central `ALLOW / ASK / DENY` capability policy and enforcement,
- **SafeCell** — disposable runtime isolation and virtual/fake-storage boundary,
- **HoneyNet** — isolated decoy services and canary resources,
- **Threat Hunting** — behavioral baselines, rules, and event correlation,
- **Defense Validation** — non-destructive verification of controls on owned/authorized systems,
- **Supply Chain Guard** — source, revision, license, hash, quarantine, and promotion policy,
- **Node Attestation** — trust evidence for remote GPU workers,
- **Deception Mode** — fake credentials/files/services that expose unexpected runtime behavior,
- **Incident Response** — containment, evidence, recovery, and incident timeline.

```text
Model source
     ↓
Supply Chain Guard
     ↓
Quarantine
     ↓
SafeCell
     ↓
Creeping Frost
     ↓
Runtime / Remote Node
     ↓
Threat Hunter + HoneyNet
     ↓
Incident Engine
```

Security modes are planned as `STANDARD`, `PRIVATE`, `HARDENED`, `DECEPTION`, and `AIRGAP`.

Creeping Frost is capability-aware: it can govern network, filesystem, processes, model acquisition, RAM/VRAM allocation, remote compute, clone training, and security actions. Threat signals may automatically **tighten** a pre-authorized policy, but never silently weaken it.

The full security design starts at [docs/security/README.md](docs/security/README.md).

## Frontend specification

The detailed mockup contract is documented in [docs/FRONTEND_UX_SPEC.md](docs/FRONTEND_UX_SPEC.md). The frontend includes Model Catalog, Planner, Hardware, Benchmarks, Clone Lab, Security Lab, Nodes, and Settings, with explicit consent and clear measured-vs-estimated states.

## M1 implementation

The first local-inspection implementation is being developed on `feature/m1-local-inspector`.

Implemented in that branch:

- CPU/RAM probe with CPU-only fallback,
- NVIDIA VRAM probe through `nvidia-smi` without shell execution,
- bounded GGUF v2/v3 metadata reader,
- common `general.file_type` quantization mapping,
- KV-cache/runtime/safety memory estimator with explicit confidence,
- local `FULL_GPU`, `GPU_RAM_OFFLOAD`, `CPU_ONLY`, and `UNSUPPORTED` planning,
- Creeping Frost gates for read-only model/hardware inspection,
- `model-unbreak inspect <model.gguf>` with text and `--json` output,
- synthetic GGUF and hardware/planner unit tests.

The implementation intentionally labels unknown data instead of inventing precision. Remote execution and automatic model download are not part of M1.

Validation is still required before merging: the repository's GitHub Actions jobs currently terminate before a runner starts, so the branch is not considered green yet.

## Project status

Model Unbreak is currently in the **design and prototype stage**. The documentation defines the intended architecture and safety boundaries before implementation starts.

See [ROADMAP.md](ROADMAP.md) for milestones and [CHANGELOG.md](CHANGELOG.md) for repository history.

## Documentation

| Document | Purpose |
| --- | --- |
| [docs/README.md](docs/README.md) | Documentation index and reading map |
| [ARCHITECTURE.md](ARCHITECTURE.md) | High-level system architecture and boundaries |
| [docs/TECHNICAL_DESIGN.md](docs/TECHNICAL_DESIGN.md) | Components, interfaces, planner design, and runtime flow |
| [docs/CONFIGURATION.md](docs/CONFIGURATION.md) | Configuration precedence, defaults, validation, and secrets |
| [docs/BENCHMARKING.md](docs/BENCHMARKING.md) | Reproducible performance methodology |
| [docs/REMOTE_NODES.md](docs/REMOTE_NODES.md) | Trusted remote compute design and network behavior |
| [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md) | Security assumptions and trust boundaries |
| [docs/PRIVACY.md](docs/PRIVACY.md) | Local-first privacy and telemetry principles |
| [docs/TESTING.md](docs/TESTING.md) | Unit, integration, hardware, and network test strategy |
| [docs/COMPATIBILITY.md](docs/COMPATIBILITY.md) | Planned and verified platform/backend support |
| [docs/FAQ.md](docs/FAQ.md) | Concise answers to common design questions |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Architecture decision record index |
| [ROADMAP.md](ROADMAP.md) | Delivery milestones |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution workflow and commit convention |
| [SECURITY.md](SECURITY.md) | Vulnerability reporting and security policy |
| [GOVERNANCE.md](GOVERNANCE.md) | Project decision-making model |
| [SUPPORT.md](SUPPORT.md) | Support boundaries and bug-report guidance |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | Community behavior expectations |
| [CHANGELOG.md](CHANGELOG.md) | Notable repository and release changes |

## Non-goals

Model Unbreak is not intended to:

- emulate one physically unified VRAM address space across the public internet,
- hide impossible latency or bandwidth constraints,
- execute untrusted public workloads on volunteer GPUs in the first releases,
- replace CUDA, llama.cpp, or a model runtime,
- promise that a larger model will always be faster or better,
- mine cryptocurrency or introduce a token/coin economy.

## Contributing

The project is intentionally documentation-first while the runtime contract is being defined. Design reviews, reproducible benchmark data, hardware edge cases, and focused implementation proposals are welcome.

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## Security

Remote execution changes the trust model substantially. Do not expose experimental compute nodes directly to the public internet. See [SECURITY.md](SECURITY.md) and [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md).

## License

A public-source license has not been selected yet. Until a license is added, the repository should not be assumed to grant reuse rights beyond GitHub's normal viewing and forking functionality.
