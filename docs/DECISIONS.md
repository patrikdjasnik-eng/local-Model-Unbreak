# Architecture Decisions

[![ADR](https://img.shields.io/badge/document-architecture%20decisions-334155)](#decision-log)
[![Status](https://img.shields.io/badge/status-living%20document-16a34a)](#how-to-add-a-decision)
[![Review](https://img.shields.io/badge/review-required%20for%20core%20contracts-6f42c1)](#when-an-adr-is-required)

This file indexes decisions that materially shape Model Unbreak. The goal is to preserve *why* a design was chosen, not only what the code currently does.

## Decision log

| ID | Decision | Status |
| --- | --- | --- |
| ADR-001 | Local-first planning is the default | Accepted |
| ADR-002 | Use measured capability as planner input | Accepted |
| ADR-003 | Keep backend details behind adapters | Accepted |
| ADR-004 | Do not model remote memory as magical unified VRAM | Accepted |
| ADR-005 | Remote nodes require explicit trust | Accepted |
| ADR-006 | Initial model target is GGUF with llama.cpp backend | Proposed |

## ADR-001 — Local-first planning is the default

**Decision:** Prefer a sufficiently capable local plan unless user policy or measurable requirements justify another strategy.

**Reason:** Local execution minimizes privacy exposure, network dependency, and operational complexity.

## ADR-002 — Measure capability

**Decision:** Planner inputs use observed memory, benchmark, and network data rather than hardware names alone.

**Reason:** Two nominally identical devices can behave differently because of driver versions, thermals, power limits, background load, and topology.

## ADR-003 — Backend adapters

**Decision:** Runtime-specific CLI flags are generated inside adapters.

**Reason:** Planner logic should survive backend evolution and remain testable without launching a process.

## ADR-004 — No fake unified VRAM

**Decision:** Local and remote memory remain separate resources in the planner model.

**Reason:** Network bandwidth and latency are fundamentally different from local VRAM interconnects. Aggregating byte counts would misrepresent performance.

## ADR-005 — Explicit trust

**Decision:** Early remote nodes are authenticated and explicitly approved.

**Reason:** Anonymous compute changes the project into a hostile multi-tenant execution platform with a much larger security scope.

## ADR-006 — GGUF + llama.cpp first

**Status:** Proposed.

**Decision:** Start with GGUF inspection and a llama.cpp adapter before adding additional runtimes.

**Reason:** A narrow initial backend makes memory estimation, benchmark normalization, and planner correctness tractable.


## ADR-007 — Artifact-level model acquisition

**Status:** Accepted.

**Decision:** Download the exact model artifact selected by the catalog/planner instead of cloning an entire model repository by default.

**Reason:** Model repositories may contain many quantizations, BF16 weights, projector files, and large LFS/Xet objects. Exact artifact retrieval minimizes bandwidth, disk usage, and accidental trust expansion.

## ADR-008 — Free users may import compatible GGUF files

**Status:** Accepted.

**Decision:** Product tier does not block users from importing their own GGUF model when the active runtime supports it.

**Reason:** Premium value belongs in orchestration, planning, remote compute, cloning, and automation rather than artificial ownership of upstream open models.

## ADR-009 — Creeping Frost is the central security enforcement engine

**Status:** Accepted.

**Decision:** Security-sensitive capabilities are evaluated through a shared `ALLOW / ASK / DENY` policy model with optional restrictions.

**Reason:** Network, filesystem, processes, VRAM/RAM, remote compute, acquisition, and clone training need consistent policy semantics and explanations.

## ADR-010 — Basic security is not a premium-only feature

**Status:** Accepted.

**Decision:** Baseline artifact integrity, quarantine, SafeCell policy, and essential Creeping Frost enforcement are product safety controls available regardless of tier.

**Reason:** Security should not become weaker because a user has not purchased advanced orchestration features.

## ADR-011 — Model Clone requires explicit data-source consent

**Status:** Accepted.

**Decision:** Clone jobs default to synthetic-only data. Conversations, coding sessions, folders, and custom datasets require explicit per-job selection/approval.

**Reason:** Personalization must not silently convert unrelated user data into training data.

## When an ADR is required

Create or update a decision when changing:

- trust boundaries,
- planner scoring semantics,
- backend contracts,
- persisted configuration formats,
- benchmark validity rules,
- privacy defaults,
- remote protocol behavior.

## How to add a decision

Use this structure:

```text
ADR-XXX — Title
Status: Proposed | Accepted | Superseded
Context
Decision
Alternatives
Consequences
```
