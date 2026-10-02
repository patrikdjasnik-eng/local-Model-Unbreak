# Roadmap

[![Roadmap](https://img.shields.io/badge/document-roadmap-2563eb)](#milestones)
[![Stage](https://img.shields.io/badge/stage-design%20→%20prototype-6f42c1)](#current-focus)
[![Priority](https://img.shields.io/badge/priority-correctness%20before%20automation-0f766e)](#engineering-rules)

The roadmap is milestone-based. Dates are intentionally omitted until the first implementation baseline exists.

## Current focus

Define a trustworthy planning model before building automatic remote execution.

## Milestones

### M0 — Specification baseline

- [x] Define product scope and non-goals
- [x] Define high-level architecture
- [x] Define security and threat-model documents
- [x] Define reproducible benchmark methodology
- [ ] Freeze v0 planner input/output schema
- [ ] Choose public-source license

Exit criterion: contributors can implement components without guessing what the project is trying to optimize.

### M1 — Local hardware and model inspection

- [ ] Detect CPU, RAM, GPU backends and VRAM
- [ ] Parse GGUF metadata
- [ ] Estimate model + KV-cache memory
- [ ] Produce a human-readable capability report
- [ ] Add unit tests for unsupported and partial hardware

Exit criterion: `model-unbreak inspect model.gguf` explains what the model needs and what the machine provides.

### M2 — Reproducible local benchmark engine

- [ ] Benchmark local CPU/GPU paths
- [ ] Persist benchmark profiles with runtime versions
- [ ] Separate prefill and generation throughput
- [ ] Detect thermal or background-load contamination
- [ ] Export machine-readable benchmark results

Exit criterion: repeated benchmark runs stay within documented variance on the same stable machine.

### M3 — Fit Planner v0

- [ ] Generate local candidate plans
- [ ] Apply VRAM/RAM safety margins
- [ ] Rank plans by explicit profile
- [ ] Explain rejected alternatives
- [ ] Translate a validated plan to llama.cpp arguments

Exit criterion: the planner can choose between realistic local CPU/GPU offload strategies without manual flag tuning.

### M4 — Runtime feedback

- [ ] Capture actual VRAM/RAM use
- [ ] Capture prompt and generation throughput
- [ ] Compare predicted vs observed behavior
- [ ] Update local planner calibration
- [ ] Detect unstable or repeatedly failing plans

Exit criterion: the planner improves its local predictions from observed runs without silently changing user policy.

### M5 — Trusted remote node

- [ ] Mutual authentication
- [ ] Capability advertisement
- [ ] RTT and throughput benchmark
- [ ] Remote llama.cpp execution adapter
- [ ] Encrypted transport
- [ ] Explicit allowlist and revocation

Exit criterion: two trusted machines can execute a model remotely with measurable, explainable routing decisions.

### M6 — Hybrid planning

- [ ] Compare local, remote, and supported hybrid strategies
- [ ] Include network cost in plan scoring
- [ ] Reject remote paths that increase latency without useful capacity gain
- [ ] Add context/KV-cache-aware planning

Exit criterion: a multi-node plan is selected only when measured data supports it.

### M7 — Elastic overflow research

- [ ] Investigate safe runtime re-planning
- [ ] Detect VRAM pressure from competing applications
- [ ] Evaluate pause/restart vs live migration trade-offs
- [ ] Prototype session checkpoint compatibility

Exit criterion: publish benchmark evidence before presenting dynamic migration as production-ready.


### M0.5 — Product surface and catalog contract

- [x] Define curated Free/Premium model catalog
- [x] Define exact artifact/source and quantization records
- [x] Define artifact-level acquisition instead of full-repo clone by default
- [x] Define explicit consent, partial/resume, quarantine, and integrity flow
- [x] Define detailed frontend mockup contract
- [ ] Freeze machine-readable catalog manifest schema

Exit criterion: the frontend and future backend can refer to the same model IDs, sources, artifacts, and trust states.

### M4.5 — Security Lab foundation

- [x] Define Creeping Frost AI Firewall v2 policy model
- [x] Define SafeCell isolation contract
- [x] Define HoneyNet and Deception Mode
- [x] Define Threat Hunting and normalized events
- [x] Define supply-chain security and remote-node attestation
- [x] Define defense validation and incident response
- [ ] Implement platform-specific enforcement backends
- [ ] Add security integration tests and evidence fixtures

Exit criterion: every security badge shown in the UI maps to a testable control with explicit failure behavior.

### M6.5 — Model Clone research

- [x] Define Quick / Personal / Deep Clone workflow
- [x] Define data-consent boundary
- [x] Define teacher/student evaluation contract
- [ ] Prototype local synthetic-only Quick Clone
- [ ] Add secret-scrubbing and dataset review
- [ ] Validate GGUF/export path for supported student runtimes

Exit criterion: a smaller clone can be created and evaluated reproducibly without silently reading user data.

## Later research

- speculative local/remote decoding,
- topology-aware multi-node execution,
- backend support beyond llama.cpp,
- desktop UI,
- offline-first hardware profile history,
- shared team compute pools with explicit trust.

## Engineering rules

1. A feature is not complete without tests and failure behavior.
2. Benchmark claims require reproducible data.
3. Security-sensitive remote features require threat-model updates.
4. Planner decisions must be explainable.
5. A larger supported model is not automatically considered an improvement if usability collapses.
