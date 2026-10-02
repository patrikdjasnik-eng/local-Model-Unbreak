# SafeCell

[![SafeCell](https://img.shields.io/badge/security-SafeCell-b91c1c)](#purpose)
[![Isolation](https://img.shields.io/badge/isolation-disposable%20runtime-0f766e)](#isolation-boundary)
[![Storage](https://img.shields.io/badge/storage-ephemeral%20sandbox-2563eb)](#virtual-storage)
[![Status](https://img.shields.io/badge/status-design-6f42c1)](#non-goals)

SafeCell is the disposable execution boundary for model inspection, backend smoke tests, cloning jobs, and remote workloads.

Its role is containment and evidence preservation, not magical proof that a workload is harmless.

## Purpose

SafeCell provides:

- restricted filesystem visibility,
- disposable working storage,
- bounded CPU/RAM/GPU allocation,
- explicit process launch contracts,
- policy-based network access,
- runtime telemetry hooks,
- deterministic cleanup.

## Isolation boundary

```text
HOST
├─ personal files             DENY
├─ browser/profile data       DENY
├─ SSH keys                   DENY
├─ developer credentials      DENY
├─ unrelated disks            DENY
│
└─ SafeCell boundary
   ├─ /model                  READ ONLY where possible
   ├─ /runtime                EXECUTION FILES
   ├─ /cache                  CONTROLLED
   ├─ /output                 CONTROLLED
   └─ /tmp                    DISPOSABLE
```

The exact enforcement mechanism may differ by operating system. The contract is stable even if implementation changes.

## Virtual storage

SafeCell may use:

- disposable VHDX,
- image-backed filesystem,
- container filesystem,
- sandbox directory with enforced ACLs,
- another platform-native isolation primitive.

Required properties:

- separate from user data,
- size-limited,
- disposable by default,
- mount/path ownership known to Model Unbreak,
- cleanly unmounted after use,
- snapshot-capable for incident preservation.

A “fake SSD” is a product abstraction for isolated disposable storage.

## Launch contract

SafeCell accepts structured workload definitions, not arbitrary shell strings.

```json
{
  "runtimeAdapter": "llama.cpp",
  "modelId": "local:model-123",
  "resources": {
    "maxRamMiB": 8192,
    "maxVramMiB": 6144
  },
  "networkPolicy": "deny",
  "securityMode": "hardened"
}
```

The adapter translates validated fields into runtime arguments.

## Resource boundaries

Where supported, SafeCell enforces:

- RAM ceiling,
- temporary storage ceiling,
- process lifetime,
- child-process policy,
- GPU/VRAM target allocation,
- network policy,
- CPU scheduling limits.

A control is not marked enforced if the current platform can only observe it.

## Network policies

| Policy | Behavior |
| --- | --- |
| deny | no network access |
| catalog-only | approved model/runtime registries only |
| runtime-local | localhost only |
| allowlist | configured destinations only |
| observe | allowed but monitored; research mode |

Model download and inference are separate phases so inference does not inherit downloader permissions.

## Lifecycle

```text
create
  ↓
apply policy
  ↓
mount isolated storage
  ↓
stage model/runtime
  ↓
launch
  ↓
observe
  ↓
stop
  ↓
collect sanitized telemetry
  ↓
destroy
```

On a high-confidence security event:

```text
observe → freeze/stop → block egress → preserve snapshot → incident record
```

## Fail closed

SafeCell must stop if a required isolation control cannot be applied. The UI states which control failed.

## Non-goals

SafeCell does not claim VM-grade isolation on every OS, protection against a compromised kernel/GPU driver, or safe arbitrary hostile native-code execution in early versions.
