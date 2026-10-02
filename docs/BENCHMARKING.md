# Benchmarking

[![Benchmarks](https://img.shields.io/badge/document-benchmarking-2563eb)](#benchmark-principles)
[![Method](https://img.shields.io/badge/method-reproducible-16a34a)](#required-metadata)
[![Claims](https://img.shields.io/badge/claims-evidence%20required-b45309)](#reporting-results)

Model Unbreak uses benchmarks as planner input, not as marketing decoration. Results must be reproducible enough to inform execution decisions.

## Benchmark principles

1. Separate **capacity** from **performance**.
2. Report prompt processing and token generation independently.
3. Record runtime and driver versions.
4. Warm up before collecting steady-state measurements.
5. Avoid comparing different context sizes as if they were equivalent.
6. Report network conditions for remote execution.
7. Never present one best run as representative performance.

## Required metadata

Every benchmark record should include:

```text
timestamp
OS + version
CPU
RAM
GPU(s)
VRAM
driver/runtime version
backend + commit/version
model architecture
GGUF quantization
model file size
context length
batch settings
GPU offload/device split
KV-cache format
remote-node topology if used
RTT + throughput if remote
temperature/load notes
```

## Metrics

### Capacity

- peak VRAM,
- peak RAM,
- free memory before launch,
- model load success/failure.

### Latency

- model load time,
- time to first token,
- remote round-trip latency where applicable.

### Throughput

- prompt tokens per second,
- generation tokens per second.

### Stability

- OOM count,
- runtime crashes,
- node disconnects,
- throttling events,
- variance across repeated runs.

## Recommended procedure

1. Close known high-load background workloads unless testing contention.
2. Record baseline free RAM/VRAM.
3. Perform at least one warm-up run.
4. Run the same benchmark configuration multiple times.
5. Report median and range; use percentiles when enough samples exist.
6. Mark any run affected by thermal throttling, driver reset, or network instability.

## Remote benchmarks

Remote results additionally require:

- node-to-node RTT,
- sustained throughput,
- packet loss if measurable,
- connection type (LAN/WAN/VPN),
- whether weights were already resident on the remote node,
- transferred bytes when available.

A remote GPU with more VRAM is not automatically a faster plan. Network overhead must be included in the result.

## Reporting results

Good:

```text
Median generation: 21.4 tok/s
Runs: 5
Range: 20.8–21.9 tok/s
Context: 8k
Model: Q4_K_M
RTT: 6.7 ms
Backend: llama.cpp <commit>
```

Not sufficient:

```text
It hit 29 tok/s once.
```

## Planner use

Planner benchmark profiles should expire when materially relevant inputs change, including backend version, driver/runtime, hardware topology, or network path.
