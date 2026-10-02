# Frontend UX specifikace

[![Frontend](https://img.shields.io/badge/frontend-detailní%20mockup-2563eb)](#hlavní-shell)
[![Consent](https://img.shields.io/badge/UX-explicitní%20souhlas-0f766e)](#consent-pattern)
[![Security](https://img.shields.io/badge/security-viditelná-b91c1c)](#security-lab)
[![Status](https://img.shields.io/badge/stav-mockup%20spec-6f42c1)](#definition-of-done)

První frontend má být detailní funkční mockup, který komunikuje celý Model Unbreak ještě před dokončením backendu.

Fake data jsou v mockupu povolena jen jasně označená jako mock/estimated. Prototyp nesmí působit, že zobrazuje reálně naměřená production data.

## Hlavní shell

Desktop-first layout:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Model Unbreak                     Security: HARDENED      Node: LOCAL  │
├──────────────┬─────────────────────────────────────────────────────────┤
│ Domů         │                                                         │
│ Modely       │                 active workspace                        │
│ Planner      │                                                         │
│ Hardware     │                                                         │
│ Benchmarky   │                                                         │
│ Clone Lab    │                                                         │
│ Security Lab │                                                         │
│ Nodes        │                                                         │
│ Nastavení    │                                                         │
└──────────────┴─────────────────────────────────────────────────────────┘
```

## Home

Úvodní obrazovka okamžitě odpovídá:

- co je nainstalováno,
- co lze právě spustit,
- jaký je hardware pressure,
- jaký je security posture,
- zda existují trusted remote nodes,
- jaký je doporučený další krok.

## Model Catalog

Task selector:

```text
Co chceš s lokální AI dělat?

[ Coding ] [ Chat ] [ Reasoning ] [ Překlad ]
[ Vision ] [ Nejrychlejší ] [ Největší model, který rozběhnu ]
```

Každá model card ukazuje:

- model name,
- tier,
- task tags,
- quantization,
- source,
- license,
- download size,
- hardware fit,
- estimated/measured state,
- install/run action.

```text
Qwen3 4B                         FREE
General • Reasoning
Q4_K_M • 2.50 GB

Hardware fit: EXCELLENT
Expected mode: LOCAL GPU

Source: ggml-org
License: Apache-2.0

[ Detail ] [ Instalovat ]
```

Premium badge nikdy nesmí vypadat, že Model Unbreak vlastní upstream model. Označuje Model Unbreak features/curation.

## Install flow

```text
detail modelu
    ↓
source + licence
    ↓
hardware fit
    ↓
exact artifact
    ↓
consent dialog
    ↓
download progress
    ↓
quarantine checks
    ↓
ready / blocked / runtime update needed
```

Download view ukazuje:

- exact transferred bytes,
- total size,
- current throughput,
- ETA,
- source,
- target path,
- pause,
- cancel,
- retry.

## Consent pattern

Operace měnící trust, stahující velký obsah, posílající data jinému stroji, aktualizující runtime nebo trénující na user data používá explicitní consent dialog.

Používej konkrétní tlačítka:

```text
[ Zrušit ]
[ Povolit jednou ]
[ Důvěřovat tomuto nodu ]
```

Vyhni se neurčitému „OK“.

## Planner workspace

```text
┌──────────────────┬───────────────────────────┬─────────────────────┐
│ MODEL            │ HARDWARE                  │ PLAN                │
│ Qwen3 8B         │ GPU 8 GB                  │ HYBRID              │
│ Q4_K_M           │ RAM 16 GB                 │ GPU 5.8 GB          │
│ 5.03 GB          │ free VRAM 6.4 GB          │ RAM overflow        │
│                  │ remote node optional      │ headroom 600 MB     │
└──────────────────┴───────────────────────────┴─────────────────────┘

PROČ TENTO PLÁN
✓ vyhne se predicted OOM
✓ zachová configured VRAM headroom
! throughput je estimated, ne measured

[ Porovnat ] [ Benchmark ] [ Spustit ]
```

Rejected plans zůstávají viditelné s důvodem.

## Clone Lab

```text
vybrat teacher
      ↓
vybrat clone size / mode
      ↓
vybrat data sources
      ↓
review datasetu
      ↓
odhadnout training requirements
      ↓
explicit consent
      ↓
train
      ↓
evaluate
      ↓
teacher/student comparison
      ↓
approve / reject clone
```

Default data source je synthetic only.

## Security Lab

```text
SECURITY LAB

Creeping Frost        HARDENED
SafeCell              ACTIVE
Network egress        RESTRICTED
Model provenance      VERIFIED
HoneyNet              STANDBY
Threat Hunter         ACTIVE
Open incidents        0

[ Policies ] [ Threat Hunt ] [ Deception ]
[ Supply Chain ] [ Nodes ] [ Incidents ]
```

Security nesmí být schovaná jen v Settings.

## Creeping Frost prompt

```text
CREEPING FROST

Qwen3 runtime requests:
network.connect

Destination:
huggingface.co

Reason:
approved model acquisition

Policy result:
ASK

[ Deny ] [ Povolit jednou ] [ Vždy povolit pro catalog downloads ]
```

U unexpected destination UI vysvětlí, proč request neodpovídá baseline.

## Incident timeline

```text
14:03:11 model staged in SafeCell
14:03:18 runtime started
14:03:22 model read
14:03:24 honey credential accessed        HIGH
14:03:24 Creeping Frost blocked access
14:03:25 network revoked
14:03:25 runtime isolated
14:03:26 evidence snapshot preserved
```

## Visual semantics

Mockup musí vizuálně odlišit:

- measured,
- estimated,
- verified,
- unknown,
- blocked,
- user-approved.

Nespoléhej pouze na barvu. Použij text/icon/state label.

## Empty states

```text
Žádné modely
[ Procházet Free modely ] [ Importovat GGUF ]
```

```text
Žádné trusted remote nodes
Modely zůstanou lokální.
[ Přidat node ]
```

## Definition of done

Mockup je hotový, když reviewer bez znalosti backendu projde:

1. instalaci free curated modelu,
2. import custom GGUF,
3. unsupported-runtime recovery,
4. porovnání local/hybrid/remote plans,
5. synthetic Quick Clone,
6. Security Lab,
7. Creeping Frost deny unexpected capability,
8. incident timeline,
9. přidání trusted remote nodu,
10. jasné rozlišení fake/estimated hodnot v mockupu.
