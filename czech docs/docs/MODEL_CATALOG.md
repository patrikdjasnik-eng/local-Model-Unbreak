# Katalog modelů

[![Catalog](https://img.shields.io/badge/modely-kurátorované%20GGUF-2563eb)](#pravidla-katalogu)
[![Free](https://img.shields.io/badge/tier-free-16a34a)](#free-tier)
[![Premium](https://img.shields.io/badge/tier-premium-6f42c1)](#premium-tier)
[![Source](https://img.shields.io/badge/zdroj-Hugging%20Face-f59e0b)](#download-kontrakt)

Katalog Model Unbreak je kurátorovaná vrstva nad runtime podporujícími GGUF. Upstream open modely se tím **nestávají proprietárními**. Free uživatel může vždy importovat vlastní kompatibilní GGUF. Premium má odemykat silnější kurátorství, automatické plánování, remote/hybrid compute, cloning workflow a pokročilé optimalizace — ne vlastnictví upstream modelu.

## Pravidla katalogu

Každá položka obsahuje:

- stabilní interní ID,
- zamýšlený use case,
- tier,
- upstream repository ID,
- přesný filename nebo Hugging Face alias,
- preferovanou kvantizaci,
- typ licence,
- způsob stažení,
- compatibility state,
- případné companion soubory, například multimodální projector.

Stavy:

| Stav | Význam |
| --- | --- |
| SOURCE_VERIFIED | Upstream repo/file byl ověřen a zaznamenán |
| RUNTIME_SUPPORTED | Aktivní runtime hlásí podporu architektury |
| VERIFIED | Model prošel test matrix Model Unbreak |
| EXPERIMENTAL | Upstream podporován, ale ne plně validován Model Unbreak |
| UNSUPPORTED | Aktivní runtime architekturu neumí načíst |
| BLOCKED | Instalaci blokuje security/licence/policy |

Níže uvedený počáteční katalog je **source-verified design data**. Není to zatím tvrzení, že Model Unbreak všechny položky benchmarkoval.

## Free tier

| ID | Model | Použití | Kvant | Upstream repo | Přesný artifact | Přibl. velikost | Licence |
| --- | --- | --- | --- | --- | --- | ---: | --- |
| free-qwen35-08b | Qwen3.5 0.8B | lehký chat / general | Q8_0 | ggml-org/Qwen3.5-0.8B-GGUF | Qwen3.5-0.8B-Q8_0.gguf | 834 MB | Apache-2.0 |
| free-qwen3-17b | Qwen3 1.7B | general / reasoning | Q4_K_M | ggml-org/Qwen3-1.7B-GGUF | Qwen3-1.7B-Q4_K_M.gguf | 1.28 GB | Apache-2.0 |
| free-smollm3-3b | SmolLM3 3B | lehký vícejazyčný chat | Q4_K_M | ggml-org/SmolLM3-3B-GGUF | SmolLM3-Q4_K_M.gguf | 1.92 GB | Apache-2.0 |
| free-qwen3-4b | Qwen3 4B | silnější general / reasoning | Q4_K_M | ggml-org/Qwen3-4B-GGUF | Qwen3-4B-Q4_K_M.gguf | 2.50 GB | Apache-2.0 |
| free-qwen25coder-15b | Qwen2.5-Coder 1.5B Instruct | lehký coding | Q4_K_M | tensorblock/Qwen2.5-Coder-1.5B-Instruct-GGUF | Qwen2.5-Coder-1.5B-Instruct-Q4_K_M.gguf | 0.986 GB | Apache-2.0 upstream family |

Free tier je navržen pro slabší PC, CPU fallback a malé GPU. Při ručním importu stejné model family může Model Unbreak doporučit jinou kvantizaci.

## Premium tier

| ID | Model | Použití | Kvant | Upstream repo | Přesný artifact | Přibl. velikost | Licence |
| --- | --- | --- | --- | --- | --- | ---: | --- |
| pro-qwen3-8b | Qwen3 8B | silnější general / reasoning | Q4_K_M | Qwen/Qwen3-8B-GGUF | Qwen3-8B-Q4_K_M.gguf | 5.03 GB | Apache-2.0 |
| pro-qwen25coder-7b | Qwen2.5-Coder 7B Instruct | coding | Q8_0 | ggml-org/Qwen2.5-Coder-7B-Instruct-Q8_0-GGUF | qwen2.5-coder-7b-instruct-q8_0.gguf | 8.1 GB repo | Apache-2.0 |
| pro-gptoss-20b | gpt-oss 20B | velký general/reasoning | MXFP4 | ggml-org/gpt-oss-20b-GGUF | gpt-oss-20b-MXFP4.gguf | 12.1 GB | Apache-2.0 |
| pro-gemma3-12b | Gemma 3 12B IT | multimodal / general | Q4_K_M | ggml-org/gemma-3-12b-it-GGUF | gemma-3-12b-it-Q4_K_M.gguf | 7.3 GB | Gemma |
| pro-gemma3-27b | Gemma 3 27B IT | velký multimodal / general | Q4_K_M | ggml-org/gemma-3-27b-it-GGUF | gemma-3-27b-it-Q4_K_M.gguf | 16.5 GB | Gemma |

Gemma položky mohou pro vision workflow vyžadovat také `mmproj-model-f16.gguf`. Katalog musí před downloadem zobrazit Gemma terms, pokud licence vyžaduje souhlas uživatele.

## Download kontrakt

Katalog používá přímé stažení konkrétního artifactu, ne slepé clone celého repozitáře.

Kanonický URI:

```text
hf://<repo-id>/<filename>
```

Příklady:

```text
hf://ggml-org/Qwen3-4B-GGUF/Qwen3-4B-Q4_K_M.gguf
hf://Qwen/Qwen3-8B-GGUF/Qwen3-8B-Q4_K_M.gguf
hf://ggml-org/gemma-3-12b-it-GGUF/gemma-3-12b-it-Q4_K_M.gguf
```

Preferovaná implementace:

```python
hf_hub_download(
    repo_id=entry.repo_id,
    filename=entry.filename,
    revision=entry.pinned_revision,
    local_dir=download_staging_dir,
)
```

Catalog release má po review pinovat immutable upstream revision. Sledování `main` je přijatelné jen při vývoji katalogu.

## Proč ne git clone?

Velká modelová repa běžně používají Xet/Git LFS a mohou obsahovat více kvantizací, BF16 weights, multimodal projectory a metadata. Clone celého repa by často stáhl mnohem víc, než uživatel vybral.

Model Unbreak proto stahuje přesný artifact potřebný pro zvolený plán. Git/Git LFS zůstává fallback adapter pro zdroje bez artifact-level API.

## Souhlas uživatele

Před instalací UI ukáže:

```text
INSTALACE MODELU

Qwen3 4B
Kvantizace: Q4_K_M

Publisher/source:
ggml-org/Qwen3-4B-GGUF

Artifact:
Qwen3-4B-Q4_K_M.gguf

Download:
~2.50 GB

Cíl:
<ModelUnbreakData>/models/qwen3-4b/q4_k_m/

Licence:
Apache-2.0

Model Unbreak provede:
✓ stažení pouze vybraného artifactu
✓ kontrolu source metadata a integrity
✓ přesun do quarantine
✓ inspekci GGUF metadata
✓ kontrolu runtime compatibility
✓ promotion až po policy checks

[ Zrušit ] [ Povolit stažení ]
```

Bez explicitního souhlasu se catalog artifact nestahuje.

## Lokální úložiště

Logická struktura je platform-independent:

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

Skutečný base path se určí podle OS a před instalací se zobrazí uživateli.

## Vlastní GGUF

User-provided model obchází curated tier gate, ale **ne** bezpečnostní a compatibility kontroly.

```text
Vybrat local GGUF
      ↓
přečíst metadata
      ↓
runtime architecture check
      ↓
Supply Chain / local-source record
      ↓
SafeCell smoke test podle policy
      ↓
Fit Planner
```

Free uživatel může importovat i velké GGUF. Premium může optimalizovat nebo distribuovat jejich běh, ale upstream model samotný není placený asset Model Unbreak.

## Selection UX

Uživatel může místo modelu vybrat úkol:

```text
Co chceš s lokální AI dělat?

[ Coding ]
[ Chat ]
[ Reasoning ]
[ Překlad ]
[ Vision ]
[ Nejrychlejší ]
[ Největší model, který rozběhnu ]
```

Recommender filtruje katalog podle capabilities, licence, tieru, hardware fit a measured/estimated performance.

## Catalog manifest

Budoucí machine-readable manifest má minimálně obsahovat:

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

Checksum získaný po downloadu se uloží k lokálnímu catalog recordu a kontroluje při budoucích integrity checks.
