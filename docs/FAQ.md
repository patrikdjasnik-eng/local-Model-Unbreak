# FAQ

[![FAQ](https://img.shields.io/badge/document-FAQ-2563eb)](#what-is-model-unbreak)
[![Focus](https://img.shields.io/badge/focus-constrained%20hardware-0f766e)](#who-is-it-for)
[![Scope](https://img.shields.io/badge/scope-GGUF%20planning-6f42c1)](#does-it-create-more-vram)

## What is Model Unbreak?

Model Unbreak is a planned local-first GGUF runtime planner. It inspects a model and available hardware, benchmarks relevant resources, and chooses an explainable execution strategy.

## Who is it for?

Primarily users with consumer hardware where VRAM, RAM, context size, and runtime tuning matter: older gaming GPUs, 4–12 GB cards, mixed desktop/laptop setups, and small trusted multi-PC environments.

## Does it create more VRAM?

No. It does not turn separate memory devices into physically unified VRAM. It plans around real local and remote resources and respects network cost.

## Is this CUDA-over-IP?

No. Existing projects already explore remote CUDA and low-level GPU forwarding. Model Unbreak aims to sit above runtimes such as llama.cpp and make placement/tuning decisions rather than reimplement GPU drivers.

## Why not just use automatic settings from llama.cpp or Ollama?

Those runtimes execute models well, but Model Unbreak is intended to add a higher-level layer that combines model inspection, hardware benchmarking, policy, alternative strategy comparison, remote-node cost, and human-readable reasoning.

## Will adding another GPU always make inference faster?

No. Additional memory may let a larger model run while still reducing throughput because network or synchronization overhead dominates.

## What does `local-first` mean?

The planner prefers a sufficiently capable local plan and does not silently send inference data to another machine. Remote execution is explicit and policy-controlled.

## What is Elastic Overflow?

It is a research direction for reacting to changing local memory pressure. The project must first measure whether restart, re-planning, or state migration is actually practical before presenting it as a normal feature.

## Will the project support only GGUF forever?

Not necessarily. GGUF is the intended first target because narrowing the format/backend scope makes the first planner testable. Future formats should enter through explicit adapters and decision records.

## Is there a cryptocurrency or token?

No. A coin or mining economy is not part of the project goals.

## Is remote execution safe?

It can be made safer, but it changes the trust boundary. Early designs assume explicitly trusted nodes, authenticated encrypted transport, structured workloads, and no anonymous public execution.

## Where should I start contributing?

Read [../CONTRIBUTING.md](../CONTRIBUTING.md), then look for a small measurable problem: GGUF metadata parsing, memory estimation fixtures, planner edge cases, benchmark reproducibility, or security review.
