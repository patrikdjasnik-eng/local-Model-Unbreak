# Changelog

[![Changelog](https://img.shields.io/badge/dokument-changelog-334155)](#nevydáno)
[![Format](https://img.shields.io/badge/formát-inspirován%20Keep%20a%20Changelog-2563eb)](#konvence)
[![Versioning](https://img.shields.io/badge/verzování-semver%20plánováno-0f766e)](#konvence)

Významné změny projektu jsou dokumentovány zde. Projekt je pre-release, takže záznamy zatím popisují milníky repozitáře, ne stabilní produktové verze.

## Nevydáno

### Přidáno

- Kurátorovaný Free/Premium GGUF catalog s exact upstream artifacts a quantizations.
- Explicit-consent model acquisition s artifact-level downloadem, partial/resume, integrity verification a quarantine.
- Detailní frontend UX specification pro Catalog, Planner, Clone Lab, Security Lab a remote nodes.
- Model Clone / Self-Distill research specification se synthetic-only defaultem a explicit data consent.
- Security Lab dokumentace: Creeping Frost AI Firewall v2, SafeCell, HoneyNet, Threat Hunting, Defense Validation, Supply Chain Security, Node Attestation, Deception Mode, Incident Response a normalized Security Events.

- Počáteční definice projektu pro explainable GGUF runtime planning.
- Dokumentace architektury, roadmapy, security, governance, support a contributing.
- Technical design pro hardware probing, model inspection, benchmarking, fit planning, validation a backend adapters.
- Benchmarking a threat-model specifications.

### Změněno

- Zatím nic.

### Opraveno

- Zatím nic.

### Bezpečnost

- Definován trusted-node-only baseline pro budoucí remote execution.

## Konvence

- Stabilní releases mají používat semantic versioning, jakmile existuje public versioned behavior.
- User-visible changes patří pod `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed` nebo `Security`.
- Interní refaktory bez observable impact nepotřebují jednotlivé changelog entries.
- Security fixes nemají před coordinated disclosure zveřejňovat unnecessary exploit details.
