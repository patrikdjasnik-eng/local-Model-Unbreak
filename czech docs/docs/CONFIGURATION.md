# Konfigurace

[![Configuration](https://img.shields.io/badge/dokument-konfigurace-2563eb)](#principy)
[![Defaults](https://img.shields.io/badge/defaulty-safe%20%26%20local--first-0f766e)](#výchozí-policy)
[![Schema](https://img.shields.io/badge/schema-zatím%20nezmrazené-6f42c1)](#stav)

Tento dokument definuje principy konfigurace ještě před zmrazením runtime schema. Příklady jsou ilustrační a zatím je nelze považovat za stabilní public API.

## Principy

- Safe defaults před maximálním utilization.
- Explicitní opt-in pro remote nodes.
- Žádné secrets v běžné project configuration.
- Human-readable konfigurace s machine validation.
- Environment-specific hodnoty zůstávají mimo committed files.
- Unknown keys mají po stabilizaci schema failnout jasně.

## Precedence

Plánované pořadí od nejnižší po nejvyšší prioritu:

```text
built-in defaults
  ↓
user configuration
  ↓
project configuration
  ↓
environment variables
  ↓
CLI overrides
```

Security policy nesmí být tiše oslabena zdrojem s nižší prioritou.

## Ilustrační konfigurace

```yaml
profile: balanced

memory:
  vramHeadroomMiB: 768
  ramHeadroomMiB: 2048

runtime:
  preferredAdapter: llama.cpp
  contextTokens: 8192

remote:
  enabled: false
  trustedNodes: []

telemetry:
  persistLocalMetrics: true
  logPrompts: false
```

## Výchozí policy

Plánovaná default policy:

- preferovat local execution,
- remote execution vypnutý, dokud není explicitně nakonfigurován,
- vyžadovat nenulovou memory headroom,
- prompt/content logging vypnutý,
- planner explanations zapnuté,
- unsupported backend capabilities považovat za hard validation errors.

## Secrets

Authentication material pro remote nodes nesmí žít v běžném committed YAML/JSON souboru. Budoucí implementace má použít OS credential storage nebo dedicated secret mechanism.

## Validace

Configuration validation má reportovat:

- přesný field path,
- invalid value,
- expected type/range,
- zda je problém fatal,
- safe remediation, pokud je možná.


## Catalog a acquisition konfigurace

Plánovaný config surface:

```yaml
catalog:
  channel: stable
  allowUserProvidedGguf: true

acquisition:
  provider: huggingface
  requireConsent: true
  partialDownloads: true
  quarantine: true
  verifySha256: true
  diskSafetyReserveMiB: 2048
```

Repository credentials pro gated/private artifacts patří do secret storage, ne do tohoto souboru.

## Security Lab konfigurace

```yaml
security:
  mode: hardened
  creepingFrost:
    defaultDecision: ask
    adaptiveTightening: true
  safeCell:
    requiredForUnknownArtifacts: true
  network:
    inferenceEgress: deny
  deception:
    enabled: false
  evidence:
    localOnly: true
```

Security settings lze vyšší-precedence policy zpřísnit. Lower-precedence project config nesmí tiše oslabit user/admin security policy.

## Clone konfigurace

```yaml
clone:
  defaultDataSource: synthetic-only
  requireDataPreview: true
  allowRemoteTraining: false
```

Personal data sources vyžadují per-job consent i když je cloning globálně enabled.

## Stav

Configuration format je záměrně nezmrazený před prvními planner a backend adapter prototypy. Budoucí stable schema vyžaduje decision record v [DECISIONS.md](DECISIONS.md).
