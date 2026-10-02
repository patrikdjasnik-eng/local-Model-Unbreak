# Benchmarking

[![Benchmarks](https://img.shields.io/badge/dokument-benchmarking-2563eb)](#principy-benchmarků)
[![Method](https://img.shields.io/badge/metoda-reprodukovatelná-16a34a)](#povinná-metadata)
[![Claims](https://img.shields.io/badge/tvrzení-vyžadují%20důkazy-b45309)](#reportování-výsledků)

Model Unbreak používá benchmarky jako planner input, ne jako marketingovou dekoraci. Výsledky musí být dost reprodukovatelné na to, aby informovaly execution decisions.

## Principy benchmarků

1. Odděluj **kapacitu** od **výkonu**.
2. Reportuj prompt processing a token generation samostatně.
3. Zaznamenávej runtime a driver versions.
4. Před steady-state měřením proveď warm-up.
5. Nesrovnávej rozdílné context sizes, jako by byly ekvivalentní.
6. U remote execution reportuj network conditions.
7. Neuváděj jeden nejlepší run jako reprezentativní výkon.

## Povinná metadata

Každý benchmark record má obsahovat:

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
remote-node topology, pokud je použito
RTT + throughput, pokud je remote
temperature/load notes
```

## Metriky

### Kapacita

- peak VRAM,
- peak RAM,
- free memory před launch,
- model load success/failure.

### Latence

- model load time,
- time to first token,
- remote round-trip latency, pokud je relevantní.

### Throughput

- prompt tokens per second,
- generation tokens per second.

### Stabilita

- OOM count,
- runtime crashes,
- node disconnects,
- throttling events,
- variance napříč opakovanými runs.

## Doporučený postup

1. Zavři známé high-load background workloads, pokud netestuješ contention.
2. Zaznamenej baseline free RAM/VRAM.
3. Proveď alespoň jeden warm-up run.
4. Spusť stejnou benchmark konfiguraci vícekrát.
5. Reportuj median a range; při dostatku samples použij percentiles.
6. Označ run ovlivněný thermal throttling, driver reset nebo network instability.

## Remote benchmarky

Remote výsledky navíc vyžadují:

- node-to-node RTT,
- sustained throughput,
- packet loss, pokud je měřitelný,
- connection type (LAN/WAN/VPN),
- zda byly weights už resident na remote nodu,
- transferred bytes, pokud jsou dostupné.

Remote GPU s větší VRAM není automaticky rychlejší plán. Network overhead musí být součástí výsledku.

## Reportování výsledků

Dobře:

```text
Median generation: 21.4 tok/s
Runs: 5
Range: 20.8–21.9 tok/s
Context: 8k
Model: Q4_K_M
RTT: 6.7 ms
Backend: llama.cpp <commit>
```

Nestačí:

```text
Jednou to dalo 29 tok/s.
```

## Použití v planneru

Planner benchmark profiles mají expirovat, když se změní materially relevant inputs, včetně backend version, driver/runtime, hardware topology nebo network path.
