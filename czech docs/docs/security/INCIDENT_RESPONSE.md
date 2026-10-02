# Incident Response

[![Incidents](https://img.shields.io/badge/security-Incident%20Response-b91c1c)](#incident-lifecycle)
[![Evidence](https://img.shields.io/badge/evidence-local%20first-0f766e)](#evidence)
[![Recovery](https://img.shields.io/badge/recovery-explicit-2563eb)](#recovery)
[![Status](https://img.shields.io/badge/stav-návrh-6f42c1)](#retention)

Incident Response definuje reakci Model Unbreak, když runtime, model workflow, node nebo security control vytvoří evidence vyžadující investigation.

## Incident lifecycle

```text
security event
     ↓
triage
     ↓
policy response
     ↓
containment
     ↓
evidence preservation
     ↓
user review
     ↓
recovery / revoke / remove
     ↓
close with reason
```

## Automatický containment

Pre-authorized actions mohou zahrnovat block network egress, deny requested capability, stop new remote jobs, freeze/terminate runtime, revoke temporary node permission a preserve SafeCell snapshot.

Destructive host actions nejsou automatic.

## Incident timeline

```text
14:03:11  model staged in SafeCell
14:03:18  runtime started
14:03:22  model read
14:03:24  honey credential accessed          HIGH
14:03:24  Creeping Frost denied access
14:03:25  network permission revoked
14:03:25  runtime isolated
14:03:26  evidence snapshot preserved
14:03:27  incident MU-2026-0042 opened
```

## Evidence

Incident může referencovat normalized security events, runtime/model hashes, policy snapshot, node attestation, SafeCell filesystem snapshot, process-tree metadata, network destination metadata a user decisions.

Prompt/output content se nezahrnuje, pokud user explicitně nezapne content capture pro investigation.

## Evidence integrity

Evidence records mají obsahovat hashes a immutable identifiers, kde je to praktické. Analyst notes/classifications nikdy nepřepisují original events.

## Recovery

```text
[ Keep blocked ]
[ Remove artifact ]
[ Re-download clean artifact ]
[ Reset runtime ]
[ Re-trust node after review ]
[ Mark false positive with reason ]
```

False-positive decision nesmaže underlying evidence.

## Trust impact

Incident resolution může změnit model trust, runtime trust, node trust, Creeping Frost policy nebo hunt-rule suppression.

Každá trust change zaznamená, co ji initiated a proč.

## Retention

Default evidence zůstává local. Retention je configurable by age/size.

Delete evidence vyžaduje confirmation u open nebo high-severity incidentu.