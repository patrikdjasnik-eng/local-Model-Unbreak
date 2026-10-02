# Kompatibilita

[![Compatibility](https://img.shields.io/badge/dokument-kompatibilita-2563eb)](#úrovně-stavu)
[![Models](https://img.shields.io/badge/formát%20modelu-GGUF%20první-0f766e)](#formáty-modelů)
[![Backends](https://img.shields.io/badge/backend-llama.cpp%20první-6f42c1)](#runtime-backendy)

Tento dokument odděluje planned support od verified support. Dokud neexistuje implementace a CI, položky označené `Planned` jsou pouze design intent.

## Úrovně stavu

| Stav | Význam |
| --- | --- |
| `Verified` | Pokryto automatizovaným nebo reprodukovatelným hardware testováním |
| `Experimental` | Implementováno, ale zatím ne široce validováno |
| `Planned` | Zamýšleno, ale zatím neimplementováno |
| `Out of scope` | Aktuálně není cílem |

## Formáty modelů

| Formát | Stav | Poznámka |
| --- | --- | --- |
| GGUF | Planned | Primární počáteční target |
| SafeTensors | Out of scope | Může být později přehodnoceno přes adaptéry |
| ONNX | Out of scope | Není součástí prvního planner contract |

## Runtime backendy

| Backend | Stav | Role |
| --- | --- | --- |
| llama.cpp | Planned | Primární execution adapter |
| Ollama | Planned | Optional compatibility/integration adapter |
| Direct CUDA runtime virtualization | Out of scope | Model Unbreak má orchestravat, ne reimplementovat CUDA-over-IP |

## Operační systémy

| Platforma | Stav | Poznámka |
| --- | --- | --- |
| Windows 10/11 | Planned | Důležitý target pro consumer GPU setups |
| Linux | Planned | Důležitý pro llama.cpp nodes a development |
| macOS | Planned | Závisí na backend capability a Metal testing |

## Compute backendy

| Compute path | Stav | Poznámka |
| --- | --- | --- |
| CPU | Planned | Fallback a hybrid execution |
| NVIDIA CUDA | Planned | Priorita consumer GPU |
| Vulkan | Planned | Závisí na runtime adapter capabilities |
| Apple Metal | Planned | macOS-specific path |
| AMD ROCm | Planned | Vyžaduje dedicated compatibility testing |

## Remote topology

| Topologie | Stav | Poznámka |
| --- | --- | --- |
| Jeden lokální stroj | Planned | První implementační milestone |
| Trusted LAN node | Planned | První remote target |
| Trusted WAN node | Research | Network penalty a security vyžadují evidence |
| Anonymous public node pool | Out of scope | Výrazně rozšiřuje threat model |

## Compatibility rule

Zařízení, backend ani platforma nejsou označeny jako `Verified` jen proto, že upstream software tvrdí podporu. Model Unbreak verification vyžaduje úspěšný planner behavior, launch, inference, metrics collection a failure cleanup pod dokumentovanou konfigurací.

## GGUF compatibility policy

Model Unbreak nemá tvrdit podporu „každého GGUF, který kdy vznikl“. GGUF je container format; active runtime musí znát model architecture a required tensor/runtime features.

Compatibility se vyhodnocuje po vrstvách:

```text
GGUF container readable?
      ↓
architecture known to runtime?
      ↓
required backend capability available?
      ↓
Model Unbreak policy/test status?
      ↓
SUPPORTED / EXPERIMENTAL / VERIFIED / UNSUPPORTED
```

User může importovat libovolný GGUF. Pokud active runtime architecture neumí, Model Unbreak může nabídnout samostatně consented runtime update, pokud approved newer runtime support má.

## Curated catalog compatibility

Built-in model menu je v [MODEL_CATALOG.md](MODEL_CATALOG.md). Catalog entry ukládá exact source, artifact, quantization a license. Přítomnost v catalogu neznamená, že model poběží na každém hardware.

Free/Premium je product-feature boundary, ne file-format compatibility boundary.
