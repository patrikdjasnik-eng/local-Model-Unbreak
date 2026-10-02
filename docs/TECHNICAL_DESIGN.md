# Technical Design

[![Design](https://img.shields.io/badge/document-technical%20design-2563eb)](#design-goals)
[![Runtime](https://img.shields.io/badge/runtime-GGUF%20%2B%20llama.cpp-0f766e)](#backend-contract)
[![Planner](https://img.shields.io/badge/planner-explainable-6f42c1)](#fit-planner)

This document describes the intended technical shape of Model Unbreak. It is normative for prototypes unless superseded by a recorded decision.

## Design goals

- Make constrained hardware usable without requiring manual runtime-flag expertise.
- Prefer measured capability over marketing specifications.
- Keep planning deterministic enough to test and explain.
- Treat memory headroom as a first-class constraint.
- Make remote compute optional and explicitly trusted.
- Keep runtime-specific behavior behind adapters.

## Proposed repository layout

```text
model-unbreak/
├─ apps/
│  ├─ cli/
│  └─ desktop/
├─ packages/
│  ├─ contracts/
│  ├─ planner/
│  ├─ model-inspector/
│  └─ telemetry/
├─ services/
│  ├─ coordinator/
│  └─ node/
├─ adapters/
│  ├─ llama-cpp/
│  └─ ollama/
├─ tests/
│  ├─ unit/
│  ├─ integration/
│  └─ fixtures/
└─ docs/
```

The actual implementation may start smaller, but module boundaries should remain explicit.

## Core contracts

### HardwareSnapshot

A hardware snapshot describes capacity at a point in time.

```ts
export type HardwareSnapshot = {
  capturedAt: string;
  cpu: {
    model: string;
    logicalCores: number;
  };
  memory: {
    totalBytes: number;
    availableBytes: number;
  };
  gpus: Array<{
    id: string;
    name: string;
    backend: "cuda" | "vulkan" | "metal" | "cpu";
    totalVramBytes: number;
    availableVramBytes: number;
    utilization?: number;
  }>;
};
```

A snapshot is not a benchmark. It only describes observed resources.

### ModelProfile

```ts
export type ModelProfile = {
  path: string;
  architecture: string;
  quantization?: string;
  fileBytes: number;
  parameterCount?: number;
  metadata: Record<string, string | number | boolean>;
};
```

The model inspector should not need to load model weights merely to create this profile.

### BenchmarkProfile

```ts
export type BenchmarkProfile = {
  hardwareFingerprint: string;
  backendVersion: string;
  measuredAt: string;
  promptTokensPerSecond?: number;
  generationTokensPerSecond?: number;
  network?: {
    rttMs: number;
    throughputMbps: number;
  };
};
```

### ExecutionPlan

```ts
export type ExecutionPlan = {
  id: string;
  profile: "fast" | "big" | "long-context" | "private" | "balanced";
  placement: Array<{
    resourceId: string;
    role: "weights" | "compute" | "kv-cache" | "overflow";
    estimatedBytes: number;
  }>;
  runtime: {
    adapter: string;
    contextTokens: number;
    settings: Record<string, string | number | boolean>;
  };
  estimates: {
    peakVramBytes?: number;
    peakRamBytes?: number;
    generationTokensPerSecond?: number;
    networkRttMs?: number;
  };
  explanation: string[];
  warnings: string[];
};
```

## Fit Planner

The planner receives:

```text
ModelProfile
+ HardwareSnapshot[]
+ BenchmarkProfile[]
+ UserPolicy
+ BackendCapabilities
```

and returns zero or more validated candidate plans.

A first implementation should use explicit heuristics rather than machine learning. This keeps the planner inspectable and gives the project a baseline against which future strategies can be measured.

### Candidate generation

Candidate strategies may include:

- full local GPU residency when safe,
- partial GPU offload plus system RAM,
- CPU-heavy local execution,
- full execution on a trusted remote node,
- backend-supported multi-device placement.

The planner must never assume that aggregate memory implies aggregate performance.

### Scoring

A conceptual score can be represented as:

```text
score =
  throughputBenefit
  - memoryRisk
  - networkPenalty
  - instabilityPenalty
  - policyPenalty
```

Weights differ by profile. `private`, for example, applies an infinite penalty to remote execution.

No single scalar score should hide hard constraints. A plan that violates policy or memory safety is rejected before ranking.

## Memory estimation

Planning should account for more than GGUF file size:

```text
estimated runtime memory =
  model weights
+ KV cache
+ runtime buffers
+ graph/workspace memory
+ backend overhead
+ configured safety margin
```

Safety margins should be configurable and backend-specific. The default should be conservative until runtime telemetry supports tighter estimates.

## Backend contract

A backend adapter should expose capabilities through a structured interface:

```ts
export interface RuntimeAdapter {
  getCapabilities(): Promise<RuntimeCapabilities>;
  validate(plan: ExecutionPlan): Promise<ValidationResult>;
  launch(plan: ExecutionPlan): Promise<RuntimeSession>;
  stop(sessionId: string): Promise<void>;
}
```

The planner must not construct shell commands directly.

## Runtime lifecycle

```text
plan
 ↓
validate
 ↓
reserve/check resources
 ↓
launch adapter
 ↓
health check
 ↓
serve inference
 ↓
collect telemetry
 ↓
stop / fail
 ↓
persist sanitized results
```

## Failure model

Important failures include:

- stale VRAM snapshot,
- runtime OOM despite estimate,
- backend version mismatch,
- remote node disconnect,
- model metadata unsupported,
- benchmark profile stale or incompatible,
- user policy changed after planning.

The default recovery behavior should be explicit. Silent fallback to a materially different privacy or cost profile is not allowed.

## Remote-node design

A node should advertise capabilities but not arbitrary host details. The coordinator should send a structured workload description, never raw shell text.

Minimum remote protocol properties:

- mutual authentication,
- encryption in transit,
- replay resistance,
- node identity and revocation,
- per-request authorization,
- bounded resource claims,
- protocol version negotiation.

## Observability

Useful runtime metrics include:

- load time,
- time to first token,
- prompt tokens/s,
- generation tokens/s,
- peak VRAM/RAM,
- remote RTT and transfer volume,
- planner prediction error,
- failure reason.

Prompts and generated content should not be logged by default.

## Open design questions

- How should KV-cache memory be estimated consistently across backend versions?
- Which llama.cpp RPC capabilities are stable enough to expose in v0?
- How aggressively should plans adapt to transient GPU pressure?
- What fingerprint invalidates a benchmark profile?
- When is restart-based migration preferable to live migration research?
