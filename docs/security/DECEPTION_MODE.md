# Deception Mode

[![Deception](https://img.shields.io/badge/security-Deception%20Mode-b91c1c)](#purpose)
[![Canaries](https://img.shields.io/badge/signals-canaries-0f766e)](#decoy-assets)
[![Containment](https://img.shields.io/badge/runtime-SafeCell-2563eb)](#activation)
[![Status](https://img.shields.io/badge/status-research-6f42c1)](#limits)

Deception Mode deliberately presents synthetic resources inside SafeCell so unexpected behavior can reveal itself without exposing real secrets or infrastructure.

## Purpose

A normal inference runtime should not need to inspect fake SSH keys, wallet files, browser cookies, credentials, unrelated internal APIs, or decoy model files.

Interaction with these assets provides high-value behavioral evidence.

## Activation

Deception Mode is built on top of HARDENED security controls.

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

The mode never weakens isolation to make decoys more believable.

## Decoy assets

Possible synthetic resources:

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

All files are fake, non-privileged, and clearly marked in operator metadata.

## Honey credentials

Examples may look structurally realistic but are never valid production secrets.

Every honey credential has a canary ID, creation timestamp, sandbox/session scope, expected-access=false state, expiry, and event mapping.

## Decoy services

HoneyNet may expose synthetic metadata APIs, storage APIs, registry endpoints, internal status endpoints, and local service banners.

They return harmless synthetic responses and never proxy to real production systems.

## Response policy

A single canary interaction can trigger a Threat Hunter event and ask Creeping Frost to deny the sensitive capability or tighten the security profile.

Higher-confidence correlation may block egress, freeze/stop the runtime, preserve a SafeCell snapshot, and open an incident.

## Operator visibility

The UI must always let the user distinguish real resources from decoys. Deception targets the sandboxed workload, never the person operating Model Unbreak.

## No retaliation

Deception Mode does not attack, exploit, scan, or retaliate against external systems. It observes behavior inside an environment controlled by the user.

## Limits

No canary interaction does not prove safety. Deception Mode supplements isolation, supply-chain controls, threat hunting, and secure runtime design.