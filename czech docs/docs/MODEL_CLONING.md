# Model Clone / Self-Distill

[![Clone](https://img.shields.io/badge/feature-Model%20Clone-6f42c1)](#účel)
[![Consent](https://img.shields.io/badge/data-explicitní%20souhlas-0f766e)](#souhlas-s-daty)
[![Training](https://img.shields.io/badge/training-LoRA%20%7C%20QLoRA%20%7C%20distillation-2563eb)](#režimy-klonu)
[![Status](https://img.shields.io/badge/stav-research-f59e0b)](#stav-implementace)

Model Clone je plánovaný workflow pro vytvoření menšího modelu nebo adapteru specializovaného na reálné workloady uživatele za pomoci většího teacher modelu.

Nejde o byte-for-byte kopii modelu a nesmí se tvrdit, že clone zachovává veškerou inteligenci nebo capabilities teacheru.

## Účel

Velký model může na constrained hardware běžet pomalu, zatímco menší specializovaný model může být pro každodenní práci dostatečně rychlý.

Model Clone řeší otázku:

> Dokáže menší model reprodukovat dost teacher behavior pro úlohy, které uživatel skutečně dělá?

```text
Teacher
Qwen-class 32B
      ↓
selected / synthetic examples
      ↓
kurátorovaný training set
      ↓
student model
3B / 7B
      ↓
LoRA / QLoRA / distillation
      ↓
evaluation
      ↓
optional GGUF export
```

## Režimy klonu

### Quick Clone

Cíl: levná personalizace.

Typicky:

- malý curated dataset,
- LoRA adapter,
- krátký training run,
- focused evaluation.

### Personal Clone

Cíl: menší model optimalizovaný na opakující se user tasks.

Typicky:

- synthetic examples od teacheru,
- explicitně vybrané user examples,
- LoRA/QLoRA nebo obdobný fine-tuning,
- teacher/student evaluation,
- exportable local artifact, pokud backend podporuje.

### Deep Clone

Cíl: research-grade specialization.

Typicky:

- větší dataset,
- více training/evaluation iterací,
- širší benchmark suite,
- vyšší hardware requirements,
- volitelný trusted remote compute.

Deep Clone zůstává research/premium funkcí, dokud není workflow spolehlivý a reprodukovatelný.

## Souhlas s daty

Žádný personal dataset source se nezapíná tiše.

UI musí nabídnout jednotlivé volby:

```text
Zdroje dat

[ ] Pouze synthetic data
[ ] Vybrané konverzace
[ ] Vybrané coding sessions
[ ] Vybrané složky
[ ] Vlastní dataset
[ ] Importovaný benchmark set

[ Zkontrolovat data ] [ Pokračovat ]
```

Default je **Pouze synthetic data**.

Výběr složky dává přístup jen zvolenému scope pro aktuální clone job, pokud uživatel explicitně neuloží permission.

## Minimalizace dat

Před trainingem má uživatel vidět:

- included examples,
- excluded examples,
- detected secrets,
- file types,
- total records,
- estimated token count.

Budoucí scrubber může odstraňovat nebo flagovat API keys, private keys, passwords, access tokens, connection strings a další zjevné secrets před schválením datasetu.

## Teacher-generated data

Synthetic generation musí být auditovatelná:

```text
task template
    ↓
teacher prompt
    ↓
teacher response
    ↓
quality filter
    ↓
dataset candidate
    ↓
user-visible sample / approval policy
```

Reasoning traces se nesmí předpokládat ani vyžadovat. Workflow pracuje pouze s outputs a structured supervision, které teacher/runtime smí vystavit.

## Evaluation

Clone není accepted jen proto, že training doběhl.

Evaluation porovnává:

- task success,
- correctness,
- latency,
- tokens/s,
- memory use,
- regressions mimo target domain,
- teacher/student agreement na held-out setu.

```text
MODEL CLONE RESULT

Teacher: 32B
Student: 7B + LoRA

Coding task pass rate
Teacher    91%
Student    86%

Generation speed
Teacher     7 tok/s
Student    26 tok/s

VRAM target
Teacher    hybrid
Student    local GPU

Doporučení
SUITABLE FOR DAILY CODING
Teacher stále preferovaný pro těžký reasoning.
```

Čísla jsou pouze ilustrativní.

## Stavy artifactu

Clone může být:

- `TRAINING`,
- `EVALUATING`,
- `CANDIDATE`,
- `APPROVED`,
- `REJECTED`,
- `ARCHIVED`.

Uživatel si může ponechat více verzí a porovnávat je.

## Security

Training runs dědí Security Lab policy.

Pokud jsou použita user data:

- remote training vyžaduje explicit approval,
- remote nodes musí být trusted/attested,
- dataset transfer musí být viditelný,
- temporary training data se uklízí podle policy,
- prompts/files nesmí padat do generic telemetry.

## Free / Premium hranice

Plánovaný produktový model:

### Free

- jeden active Quick Clone,
- default synthetic-data-only,
- local LoRA workflow, kde je podporován,
- basic evaluation.

### Premium

- Personal/Deep Clone,
- více clone profiles,
- selected local data sources,
- richer evaluation,
- trusted remote training,
- automatic retraining experiments,
- hlubší planner integration.

Upstream model licence má vždy přednost před product tierem.

## Stav implementace

Toto je design specification. Cloning nesmí být označen jako production-ready bez reprodukovatelných training, evaluation, privacy a cleanup testů.
