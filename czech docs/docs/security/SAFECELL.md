# SafeCell

[![SafeCell](https://img.shields.io/badge/security-SafeCell-b91c1c)](#účel)
[![Isolation](https://img.shields.io/badge/isolation-disposable%20runtime-0f766e)](#isolation-boundary)
[![Storage](https://img.shields.io/badge/storage-ephemeral%20sandbox-2563eb)](#virtual-storage)
[![Status](https://img.shields.io/badge/stav-návrh-6f42c1)](#non-goals)

SafeCell je disposable execution boundary pro model inspection, backend smoke tests, cloning jobs a remote workloads.

Jeho role je containment a evidence preservation, ne magický důkaz, že workload je harmless.

## Účel

SafeCell poskytuje:

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

Konkrétní enforcement mechanism se může lišit podle OS. Kontrakt zůstává stabilní.

## Virtual storage

SafeCell může použít:

- disposable VHDX,
- image-backed filesystem,
- container filesystem,
- sandbox directory s enforced ACL,
- jiný platform-native isolation primitive.

Požadované vlastnosti:

- oddělení od user data,
- size limit,
- disposable by default,
- známé mount/path ownership,
- čistý unmount,
- snapshot capability pro incident preservation.

„Fake SSD“ je product abstraction pro isolated disposable storage.

## Launch contract

SafeCell přijímá structured workload definitions, ne arbitrary shell strings.

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

Adapter překládá validovaná pole do runtime arguments.

## Resource boundaries

Pokud to platforma umí, SafeCell enforceuje:

- RAM ceiling,
- temporary storage ceiling,
- process lifetime,
- child-process policy,
- GPU/VRAM target allocation,
- network policy,
- CPU scheduling limits.

Control se neoznačí jako enforced, pokud jej platforma umí pouze observe.

## Network policies

| Policy | Chování |
| --- | --- |
| deny | žádný network access |
| catalog-only | pouze approved model/runtime registries |
| runtime-local | pouze localhost |
| allowlist | jen nakonfigurované destinations |
| observe | povoleno, ale monitorováno; research |

Model download a inference jsou oddělené fáze, aby inference nedědila downloader permissions.

## Lifecycle

```text
create → apply policy → mount storage → stage → launch
      → observe → stop → collect sanitized telemetry → destroy
```

Při high-confidence security event:

```text
observe → freeze/stop → block egress → preserve snapshot → incident record
```

## Fail closed

SafeCell musí zastavit workflow, pokud required isolation control nejde aplikovat. UI vypíše přesně, který control selhal.

## Non-goals

SafeCell netvrdí VM-grade isolation na každém OS, ochranu proti compromised kernel/GPU driveru ani safe arbitrary hostile native-code execution v prvních verzích.
