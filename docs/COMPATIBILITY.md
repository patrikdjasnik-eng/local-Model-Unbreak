# Compatibility

[![Compatibility](https://img.shields.io/badge/document-compatibility-2563eb)](#status-levels)
[![Models](https://img.shields.io/badge/model%20format-GGUF%20first-0f766e)](#model-formats)
[![Backends](https://img.shields.io/badge/backend-llama.cpp%20first-6f42c1)](#runtime-backends)

This document separates planned support from verified support. Until implementation and CI exist, entries marked `Planned` are design intent only.

## Status levels

| Status | Meaning |
| --- | --- |
| `Verified` | Covered by automated or reproducible hardware testing |
| `Experimental` | Implemented but not yet broadly validated |
| `Planned` | Intended but not implemented |
| `Out of scope` | Not currently targeted |

## Model formats

| Format | Status | Notes |
| --- | --- | --- |
| GGUF | Planned | Primary initial target |
| SafeTensors | Out of scope | May be reconsidered through future adapters |
| ONNX | Out of scope | Not part of the first planner contract |

## Runtime backends

| Backend | Status | Role |
| --- | --- | --- |
| llama.cpp | Planned | Primary execution adapter |
| Ollama | Planned | Optional compatibility/integration adapter |
| Direct CUDA runtime virtualization | Out of scope | Model Unbreak should orchestrate, not reimplement CUDA-over-IP |

## Operating systems

| Platform | Status | Notes |
| --- | --- | --- |
| Windows 10/11 | Planned | Important target for consumer GPU setups |
| Linux | Planned | Important for llama.cpp nodes and development |
| macOS | Planned | Subject to backend capability and Metal testing |

## Compute backends

| Compute path | Status | Notes |
| --- | --- | --- |
| CPU | Planned | Fallback and hybrid execution |
| NVIDIA CUDA | Planned | Consumer GPU priority |
| Vulkan | Planned | Depends on runtime adapter capabilities |
| Apple Metal | Planned | macOS-specific path |
| AMD ROCm | Planned | Requires dedicated compatibility testing |

## Remote topology

| Topology | Status | Notes |
| --- | --- | --- |
| Single local machine | Planned | First implementation milestone |
| Trusted LAN node | Planned | First remote target |
| Trusted WAN node | Research | Network penalty and security require evidence |
| Anonymous public node pool | Out of scope | Expands threat model substantially |

## Compatibility rule

A device, backend, or platform is not marked `Verified` merely because upstream software claims support. Model Unbreak verification requires successful planner behavior, launch, inference, metrics collection, and failure cleanup under a documented configuration.
