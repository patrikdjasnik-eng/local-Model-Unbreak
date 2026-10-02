# Architecture

[![Architecture](https://img.shields.io/badge/document-architecture-1d4ed8)](#system-overview)
[![Status](https://img.shields.io/badge/status-design-6f42c1)](#status)
[![Scope](https://img.shields.io/badge/scope-GGUF%20runtime%20planning-0f766e)](#system-boundaries)

This document defines the high-level architecture of Model Unbreak. Detailed contracts belong in [docs/TECHNICAL_DESIGN.md](docs/TECHNICAL_DESIGN.md).

## System overview

```text
                    ┌──────────────────┐
                    │ CLI / Desktop UI │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Orchestrator    │
                    └────────┬─────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
  ┌───────▼────────┐ ┌──────▼───────┐ ┌──────▼────────┐
  │ Hardware Probe │ │ Model Inspect │ │ Policy Engine │
  └───────┬────────┘ └──────┬───────┘ └──────┬────────┘
          └──────────────────┼──────────────────┘
                             ▼
                    ┌──────────────────┐
                    │   Fit Planner    │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │ Plan Validator   │
                    └────────┬─────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
     Local backend      Remote node       Telemetry
      llama.cpp           adapter          collector
```

## Components

### Hardware Probe

Collects capability rather than assuming it from a device name. The probe should identify CPU, RAM, GPU backends, total and currently available VRAM, driver/runtime compatibility, and stable benchmark results.

### Model Inspector

Reads GGUF metadata without loading the full model into memory. It should extract architecture, quantization, tensor metadata, file size, and information needed for conservative memory estimates.

### Benchmark Engine

Produces repeatable measurements used by the planner. Benchmarks must be versioned, hardware-scoped, and invalidated when relevant runtime conditions change.

### Fit Planner

Builds candidate execution plans. A plan may include local GPU offload, CPU/RAM participation, an explicitly trusted remote node, context/KV-cache adjustments, or rejection when no safe strategy exists.

### Policy Engine

Applies user constraints such as `private`, temperature limits, remote-node allowlists, maximum memory use, or performance goals.

### Plan Validator

Rejects plans that exceed safety margins or violate policy. Validation happens before launching the backend.

### Backend Adapter

Translates a validated plan into runtime-specific arguments. The initial adapter is planned for llama.cpp. Adapters must expose capabilities rather than leaking CLI details into the planner.

### Remote Node

An optional authenticated worker. A node advertises measured capabilities and accepts only supported, policy-compliant workloads. Public unauthenticated execution is explicitly out of scope for early versions.

### Telemetry

Collects runtime metrics such as prompt throughput, generation throughput, memory pressure, latency, and failures. Telemetry is local by default and must not silently upload prompts or model content.

## System boundaries

Model Unbreak owns:

- inspection, benchmarking, planning, validation, orchestration,
- explaining why a plan was selected,
- backend capability negotiation,
- node discovery within explicitly configured trust boundaries.

Model Unbreak does not own:

- CUDA kernel implementation,
- model architecture implementation,
- GGUF format specification,
- low-level GPU driver virtualization,
- public GPU marketplace economics.

## Planning flow

```text
inspect model
    ↓
probe hardware
    ↓
load benchmark profile
    ↓
generate candidate plans
    ↓
estimate memory + throughput + latency
    ↓
apply policy
    ↓
validate headroom
    ↓
select + explain plan
    ↓
launch backend
    ↓
measure actual runtime
    ↓
update local benchmark profile
```

## Planning invariants

- A plan must reserve configurable memory headroom.
- Measured values must be distinguished from estimates.
- Remote capacity is never counted unless the node is authenticated and reachable.
- A plan that technically fits but is predicted to be unusably slow may be rejected with an explanation.
- Backend adapters must fail closed on unsupported capabilities.
- Privacy policy takes precedence over performance.

## Status

This architecture is a design contract, not a claim that every component is implemented. Changes that alter trust boundaries, planner semantics, or backend contracts should be recorded in [docs/DECISIONS.md](docs/DECISIONS.md).
