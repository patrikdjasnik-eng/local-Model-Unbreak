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

## Project status

Model Unbreak is currently in the **design and prototype stage**. The documentation defines the intended architecture and safety boundaries before implementation starts.

See [ROADMAP.md](ROADMAP.md) for milestones and [CHANGELOG.md](CHANGELOG.md) for repository history.

## Documentation

| Document | Purpose |
| --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | High-level system architecture and boundaries |
| [docs/TECHNICAL_DESIGN.md](docs/TECHNICAL_DESIGN.md) | Components, interfaces, planner design, and runtime flow |
| [docs/BENCHMARKING.md](docs/BENCHMARKING.md) | Reproducible performance methodology |
| [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md) | Security assumptions and trust boundaries |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Architecture decision record index |
| [ROADMAP.md](ROADMAP.md) | Delivery milestones |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution workflow |
| [SECURITY.md](SECURITY.md) | Vulnerability reporting and security policy |
| [GOVERNANCE.md](GOVERNANCE.md) | Project decision-making model |
| [SUPPORT.md](SUPPORT.md) | Support boundaries and bug-report guidance |

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
