# Deception Mode

[![Deception](https://img.shields.io/badge/security-Deception%20Mode-b91c1c)](#účel)
[![Canaries](https://img.shields.io/badge/signály-canaries-0f766e)](#decoy-assets)
[![Containment](https://img.shields.io/badge/runtime-SafeCell-2563eb)](#aktivace)
[![Status](https://img.shields.io/badge/stav-research-6f42c1)](#limity)

Deception Mode záměrně ukazuje uvnitř SafeCell synthetic resources, aby se unexpected behavior projevil bez exposure real secrets nebo infrastruktury.

## Účel

Normální inference runtime nepotřebuje číst fake SSH keys, wallet files, browser cookies, credentials, unrelated internal APIs ani decoy model files.

Interakce s nimi poskytuje high-value behavioral evidence.

## Aktivace

Deception Mode stojí nad HARDENED controls.

```text
HARDENED
   +
SafeCell
   +
HoneyNet
   +
synthetic decoys
   +
Threat Hunter
   =
DECEPTION
```

Mode nikdy neoslabuje isolation jen proto, aby decoys působily věrohodněji.

## Decoy assets

```text
/SafeCell/User/
├─ Documents/
│  ├─ passwords.txt
│  ├─ wallet-backup.txt
│  └─ confidential-notes.txt
├─ .ssh/
│  └─ id_rsa
├─ Browser/
│  └─ cookies.db
├─ Models/
│  └─ confidential-model.gguf
└─ .env
```

Všechny files jsou fake, non-privileged a v operator metadata jasně označené.

## Honey credentials

Strukturou mohou připomínat real secrets, ale nikdy nejsou valid production credentials.

Každý obsahuje canary ID, creation timestamp, sandbox/session scope, expected-access=false, expiry a event mapping.

## Decoy services

HoneyNet může nabídnout synthetic metadata API, storage API, registry endpoint, internal status endpoint a local service banners.

Vrací harmless synthetic responses a nikdy neproxyují do real production systems.

## Response policy

Canary interaction může vytvořit Threat Hunter event a požádat Creeping Frost o DENY sensitive capability nebo zpřísnění security profilu.

High-confidence correlation může blocknout egress, freeze/stop runtime, preserve SafeCell snapshot a otevřít incident.

## Operator visibility

UI musí vždy userovi ukázat rozdíl mezi real resources a decoys. Deception míří na sandboxed workload, ne na člověka.

## No retaliation

Deception Mode neútočí, neexploitne, neskenuje ani nereaguje útokem na external systems.

## Limity

Absence canary interaction není proof of safety. Deception Mode doplňuje isolation, supply-chain controls, threat hunting a secure runtime design.