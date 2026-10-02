# Testovací strategie

[![Testing](https://img.shields.io/badge/dokument-testování-2563eb)](#testovací-pyramida)
[![Unit](https://img.shields.io/badge/unit-Vitest%20%7C%20Pytest-16a34a)](#unit-testy)
[![Integration](https://img.shields.io/badge/integration-runtime%20adapters-6f42c1)](#integrační-testy)

Testování musí dokazovat planner correctness a failure behavior, ne pouze úspěšné spuštění procesu.

## Testovací pyramida

```text
        end-to-end
      integration
  contract / property
       unit tests
```

Většina planner behavior má být testovatelná bez fyzické GPU pomocí recorded fixtures a capability contracts.

## Unit testy

Pokrývají:

- GGUF metadata parsing,
- memory estimation,
- policy constraints,
- candidate generation,
- candidate rejection,
- scoring a tie-breaks,
- serialization plan contracts,
- error mapping.

Důležité edge cases:

- zero detected GPUs,
- shared-memory/integrated GPU,
- stale hardware snapshot,
- available VRAM výrazně nižší než total VRAM,
- unsupported quantization metadata,
- context size způsobující KV-cache overflow,
- remote node disappearing after planning.

## Contract testy

Backend adapters mají být testovány proti capability fixtures tak, aby unsupported flags nebo semantic changes selhaly viditelně.

## Integrační testy

Integration tests mohou spouštět skutečné runtime processes a ověřovat:

- health checks,
- structured argument translation,
- cancellation,
- timeout behavior,
- runtime metrics collection,
- cleanup after failure.

## Hardware testy

Hardware-specific tests mají být opt-in a jasně tagged. CI nemá vyžadovat NVIDIA hardware, pokud není záměrně nakonfigurován dedicated runner.

## Network testy

Remote-node tests mají simulovat:

- latency,
- low bandwidth,
- disconnects,
- stale capability advertisements,
- authentication failure,
- protocol version mismatch.

## Regression fixtures

Planner bug má přidat minimized fixture, kdykoli je to praktické. Regression fixtures nesmí obsahovat private hostnames, user prompts, access tokens ani model files s omezenou redistributability.

## Definition of done

Behavioral change je hotová, když:

- expected behavior je asserted,
- alespoň jeden relevant failure path je asserted,
- documentation je updated, pokud se změnil public contract,
- performance claims respektují [BENCHMARKING.md](BENCHMARKING.md).
