# Model Catalog

[![Catalog](https://img.shields.io/badge/models-curated%20GGUF-2563eb)](#catalog-policy)
[![Free](https://img.shields.io/badge/tier-free-16a34a)](#free-tier)
[![Premium](https://img.shields.io/badge/tier-premium-6f42c1)](#premium-tier)
[![Source](https://img.shields.io/badge/source-Hugging%20Face-f59e0b)](#download-contract)

The Model Unbreak catalog is a curated layer above GGUF-compatible runtimes. It does **not** make upstream open models proprietary. Free users may always import their own compatible GGUF files. Premium is intended to unlock stronger curation, automated planning, remote/hybrid compute, cloning workflows, and advanced optimization—not ownership of an upstream model.

## Catalog policy

Every catalog entry has:

- a stable internal ID,
- intended use case,
- tier,
- upstream repository ID,
- exact artifact filename or Hugging Face alias,
- preferred quantization,
- license class,
- expected download method,
- compatibility state,
- optional companion artifacts such as multimodal projectors.

Catalog states:

| State | Meaning |
| --- | --- |
| SOURCE_VERIFIED | Upstream repo/file was checked and recorded |
| RUNTIME_SUPPORTED | Current runtime reports architecture support |
| VERIFIED | Model Unbreak test matrix passed |
| EXPERIMENTAL | Supported upstream, not fully validated by Model Unbreak |
| UNSUPPORTED | Active runtime cannot load the architecture |
| BLOCKED | Security/license/policy prevents installation |

The initial catalog below is **source-verified design data**. It is not yet a claim that Model Unbreak has benchmarked every entry.

## Free tier

| ID | Model | Use | Quant | Upstream repo | Exact artifact | Approx. file size | License |
| --- | --- | --- | --- | --- | --- | ---: | --- |
| free-qwen35-08b | Qwen3.5 0.8B | lightweight chat / general | Q8_0 | ggml-org/Qwen3.5-0.8B-GGUF | Qwen3.5-0.8B-Q8_0.gguf | 834 MB | Apache-2.0 |
| free-qwen3-17b | Qwen3 1.7B | general / reasoning | Q4_K_M | ggml-org/Qwen3-1.7B-GGUF | Qwen3-1.7B-Q4_K_M.gguf | 1.28 GB | Apache-2.0 |
| free-smollm3-3b | SmolLM3 3B | lightweight multilingual chat | Q4_K_M | ggml-org/SmolLM3-3B-GGUF | SmolLM3-Q4_K_M.gguf | 1.92 GB | Apache-2.0 |
| free-qwen3-4b | Qwen3 4B | stronger general / reasoning | Q4_K_M | ggml-org/Qwen3-4B-GGUF | Qwen3-4B-Q4_K_M.gguf | 2.50 GB | Apache-2.0 |
| free-qwen25coder-15b | Qwen2.5-Coder 1.5B Instruct | lightweight coding | Q4_K_M | tensorblock/Qwen2.5-Coder-1.5B-Instruct-GGUF | Qwen2.5-Coder-1.5B-Instruct-Q4_K_M.gguf | 0.986 GB | Apache-2.0 upstream family |

The free tier is designed for weak PCs, CPU fallback, and small GPUs. Model Unbreak may recommend a different quantization when the user imports the same model family manually.

## Premium tier

| ID | Model | Use | Quant | Upstream repo | Exact artifact | Approx. file size | License |
| --- | --- | --- | --- | --- | --- | ---: | --- |
| pro-qwen3-8b | Qwen3 8B | stronger general / reasoning | Q4_K_M | Qwen/Qwen3-8B-GGUF | Qwen3-8B-Q4_K_M.gguf | 5.03 GB | Apache-2.0 |
| pro-qwen25coder-7b | Qwen2.5-Coder 7B Instruct | coding | Q8_0 | ggml-org/Qwen2.5-Coder-7B-Instruct-Q8_0-GGUF | qwen2.5-coder-7b-instruct-q8_0.gguf | 8.1 GB repo | Apache-2.0 |
| pro-gptoss-20b | gpt-oss 20B | large general/reasoning | MXFP4 | ggml-org/gpt-oss-20b-GGUF | gpt-oss-20b-MXFP4.gguf | 12.1 GB | Apache-2.0 |
| pro-gemma3-12b | Gemma 3 12B IT | multimodal / general | Q4_K_M | ggml-org/gemma-3-12b-it-GGUF | gemma-3-12b-it-Q4_K_M.gguf | 7.3 GB | Gemma |
| pro-gemma3-27b | Gemma 3 27B IT | large multimodal / general | Q4_K_M | ggml-org/gemma-3-27b-it-GGUF | gemma-3-27b-it-Q4_K_M.gguf | 16.5 GB | Gemma |

Gemma entries may additionally require `mmproj-model-f16.gguf` for vision workflows. The catalog must present the Gemma terms before downloading artifacts whose license requires user acceptance.

## Download contract

Catalog downloads use direct artifact retrieval, not blind repository cloning.

Canonical source URI:

```text
hf://<repo-id>/<filename>
```

Examples:

```text
hf://ggml-org/Qwen3-4B-GGUF/Qwen3-4B-Q4_K_M.gguf
hf://Qwen/Qwen3-8B-GGUF/Qwen3-8B-Q4_K_M.gguf
hf://ggml-org/gemma-3-12b-it-GGUF/gemma-3-12b-it-Q4_K_M.gguf
```

Preferred implementation:

```python
hf_hub_download(
    repo_id=entry.repo_id,
    filename=entry.filename,
    revision=entry.pinned_revision,
    local_dir=download_staging_dir,
)
```

A catalog release should pin an immutable upstream revision after review. Tracking `main` is acceptable only during catalog development.

## Why not git clone?

Large model repositories commonly use Xet/Git LFS and can contain multiple quantizations, BF16 weights, multimodal projectors, and metadata. Cloning the whole repository can download much more than the user selected.

Model Unbreak therefore downloads the exact artifact required by the selected plan. Git/Git LFS remains a fallback adapter for sources that cannot provide artifact-level download APIs.

## User consent

Before installation, show:

```text
MODEL INSTALL

Qwen3 4B
Quantization: Q4_K_M

Publisher/source:
ggml-org/Qwen3-4B-GGUF

Artifact:
Qwen3-4B-Q4_K_M.gguf

Download:
~2.50 GB

Destination:
<ModelUnbreakData>/models/qwen3-4b/q4_k_m/

License:
Apache-2.0

Model Unbreak will:
✓ download the selected artifact only
✓ verify source metadata and integrity
✓ place it in quarantine
✓ inspect GGUF metadata
✓ check runtime compatibility
✓ promote it only after policy checks

[ Cancel ] [ Allow download ]
```

No catalog artifact is downloaded before explicit approval.

## Local storage layout

The logical layout is platform-independent:

```text
<ModelUnbreakData>/
├─ downloads/
│  └─ partial/
├─ quarantine/
├─ models/
│  └─ <model-id>/
│     └─ <quant>/
├─ runtimes/
├─ cache/
└─ security/
```

The actual base path is resolved per operating system and is shown to the user before installation.

## User-provided GGUF

A user-provided model bypasses the curated tier gate but **not** safety or compatibility checks.

Flow:

```text
Select local GGUF
      ↓
read metadata
      ↓
runtime architecture check
      ↓
Supply Chain / local-source record
      ↓
SafeCell smoke test when required
      ↓
Fit Planner
```

Free users remain allowed to import large GGUF files. Premium features may optimize or distribute them, but Model Unbreak must not pretend the upstream model itself is a paid asset.

## Selection UX

The user may choose a task instead of a model:

```text
What do you want to do?

[ Coding ]
[ Chat ]
[ Reasoning ]
[ Translation ]
[ Vision ]
[ Fastest ]
[ Largest model I can run ]
```

The recommender filters the catalog by capability, license state, tier, hardware fit, and measured/estimated performance.

## Catalog manifest

The future machine-readable manifest should contain at least:

```json
{
  "id": "free-qwen3-4b",
  "tier": "free",
  "family": "qwen3",
  "taskTags": ["chat", "reasoning"],
  "format": "gguf",
  "quantization": "Q4_K_M",
  "source": {
    "provider": "huggingface",
    "repoId": "ggml-org/Qwen3-4B-GGUF",
    "filename": "Qwen3-4B-Q4_K_M.gguf",
    "revision": "<pinned-commit>"
  },
  "license": {
    "id": "apache-2.0",
    "requiresAcceptance": false
  }
}
```

Checksums obtained after download are stored with the local catalog record and compared on future integrity checks.
