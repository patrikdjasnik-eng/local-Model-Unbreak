# Incident Response

[![Incidents](https://img.shields.io/badge/security-Incident%20Response-b91c1c)](#incident-lifecycle)
[![Evidence](https://img.shields.io/badge/evidence-local%20first-0f766e)](#evidence)
[![Recovery](https://img.shields.io/badge/recovery-explicit-2563eb)](#recovery)
[![Status](https://img.shields.io/badge/status-design-6f42c1)](#retention)

Incident Response defines how Model Unbreak reacts when a runtime, model workflow, node, or security control produces evidence that requires investigation.

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

## Automatic containment

Pre-authorized actions may include blocking network egress, denying a requested capability, stopping new remote jobs, freezing/terminating runtime, revoking temporary node permission, and preserving a SafeCell snapshot.

Destructive host actions are not automatic.

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

An incident may reference normalized security events, runtime/model hashes, policy snapshot, node attestation, SafeCell filesystem snapshot, process-tree metadata, network destination metadata, and user decisions.

Prompt/output content is excluded unless the user explicitly enables content capture for the investigation.

## Evidence integrity

Evidence records should include hashes and immutable identifiers where practical. Analyst notes/classifications never overwrite original events.

## Recovery

```text
[ Keep blocked ]
[ Remove artifact ]
[ Re-download clean artifact ]
[ Reset runtime ]
[ Re-trust node after review ]
[ Mark false positive with reason ]
```

A false-positive decision must not delete underlying evidence.

## Trust impact

Incident resolution can change model trust, runtime trust, node trust, Creeping Frost policy, or hunt-rule suppression.

Every trust change records what initiated it and why.

## Retention

Default evidence stays local. Retention is configurable by age/size.

Deleting evidence requires confirmation for open or high-severity incidents.