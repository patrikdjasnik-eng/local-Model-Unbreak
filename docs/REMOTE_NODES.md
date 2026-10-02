# Remote Nodes

[![Remote nodes](https://img.shields.io/badge/document-remote%20nodes-2563eb)](#purpose)
[![Trust](https://img.shields.io/badge/trust-explicit-0f766e)](#trust-model)
[![Transport](https://img.shields.io/badge/transport-encrypted%20planned-6f42c1)](#protocol-properties)

Remote nodes extend capacity only when their measured benefit justifies the network cost. They are optional and outside the default local-only trust boundary.

## Purpose

A remote node may provide:

- additional VRAM capacity,
- a faster compatible GPU,
- a model already resident on another trusted machine,
- an alternative execution location when the local device is constrained.

A node is **not** treated as transparent local VRAM.

## Trust model

Early versions support only explicitly approved nodes controlled by the user or a trusted peer/team.

Discovery and trust are separate:

```text
discover candidate
      ↓
inspect identity
      ↓
explicit approval
      ↓
credential establishment
      ↓
authorized capabilities
```

Finding a device on the LAN must never grant execution permission.

## Capability advertisement

A node should expose a minimal structured capability document, for example:

```json
{
  "protocolVersion": "0.x",
  "runtimeAdapters": ["llama.cpp"],
  "gpus": [
    {
      "id": "gpu0",
      "backend": "cuda",
      "totalVramBytes": 12884901888,
      "availableVramBytes": 10737418240
    }
  ]
}
```

The node should avoid exposing unnecessary host details.

## Planner inputs

A remote node is useful only when the planner has both capacity and network observations:

- available VRAM,
- backend compatibility,
- model/runtime availability,
- RTT,
- sustained throughput,
- recent load,
- benchmark confidence/age.

## Protocol properties

The protocol should provide:

- mutual authentication,
- encryption in transit,
- request authorization,
- replay protection,
- cancellation,
- timeouts,
- protocol version negotiation,
- bounded structured messages,
- clear error codes.

## Failure behavior

If a node disappears after planning, the coordinator may:

1. fail the launch before model execution,
2. fall back only to another plan allowed by the same privacy/policy profile,
3. explain the fallback to the user.

It must not silently switch from `private` to a remote plan.

## Performance rule

Remote capacity should be selected because measurements justify it, not because the remote GPU name looks faster. See [BENCHMARKING.md](BENCHMARKING.md).

## Security

Threats and required mitigations are defined in [THREAT_MODEL.md](THREAT_MODEL.md) and [../SECURITY.md](../SECURITY.md).
