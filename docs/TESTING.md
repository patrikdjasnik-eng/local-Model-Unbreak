# Testing Strategy

[![Testing](https://img.shields.io/badge/document-testing-2563eb)](#test-pyramid)
[![Unit](https://img.shields.io/badge/unit-Vitest%20%7C%20Pytest-16a34a)](#unit-tests)
[![Integration](https://img.shields.io/badge/integration-runtime%20adapters-6f42c1)](#integration-tests)

Testing must prove planner correctness and failure behavior, not only successful process startup.

## Test pyramid

```text
        end-to-end
      integration
  contract / property
       unit tests
```

Most planner behavior should be testable without a physical GPU by using recorded fixtures and capability contracts.

## Unit tests

Cover:

- GGUF metadata parsing,
- memory estimation,
- policy constraints,
- candidate generation,
- candidate rejection,
- scoring and tie-breaks,
- serialization of plan contracts,
- error mapping.

Important edge cases:

- zero detected GPUs,
- shared-memory/integrated GPU,
- stale hardware snapshot,
- available VRAM lower than total VRAM by a large margin,
- unsupported quantization metadata,
- context size causing KV-cache overflow,
- remote node disappearing after planning.

## Contract tests

Backend adapters should be tested against capability fixtures so that unsupported flags or semantic changes fail visibly.

## Integration tests

Integration tests may launch real runtime processes and verify:

- health checks,
- structured argument translation,
- cancellation,
- timeout behavior,
- runtime metrics collection,
- cleanup after failure.

## Hardware tests

Hardware-specific tests should be opt-in and clearly tagged. CI should not require NVIDIA hardware unless a dedicated runner is intentionally configured.

## Network tests

Remote-node tests should simulate:

- latency,
- low bandwidth,
- disconnects,
- stale capability advertisements,
- authentication failure,
- protocol version mismatch.

## Regression fixtures

A planner bug should add a minimized fixture whenever practical. Regression fixtures must not contain private hostnames, user prompts, access tokens, or redistributability-restricted model files.

## Definition of done

A behavioral change is complete when:

- expected behavior is asserted,
- at least one relevant failure path is asserted,
- documentation is updated if a public contract changed,
- performance claims follow [BENCHMARKING.md](BENCHMARKING.md).
