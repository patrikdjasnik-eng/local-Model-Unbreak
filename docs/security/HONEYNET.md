# HoneyNet

[![HoneyNet](https://img.shields.io/badge/security-HoneyNet-b91c1c)](#purpose)
[![Deception](https://img.shields.io/badge/deception-safe%20decoys-0f766e)](#decoy-components)
[![Network](https://img.shields.io/badge/network-isolated%20lab-2563eb)](#network-boundary)
[![Status](https://img.shields.io/badge/status-research-6f42c1)](#limits)

HoneyNet is an isolated deception environment for detecting behavior that an ordinary inference runtime has no legitimate reason to perform.

## Purpose

HoneyNet asks:

> Does this workload interact with resources outside its expected inference role?

Events are signals for investigation, not automatic proof of malicious intent.

## Network boundary

```text
runtime
   ↓
SafeCell virtual network
   ├─ approved local API
   ├─ decoy API
   ├─ decoy storage
   ├─ decoy metadata service
   └─ telemetry sink
          ✕
     real LAN / internet
```

Production and personal systems are never used as honeypot targets.

## Decoy components

Possible decoys:

- fake internal APIs,
- fake object-storage listings,
- fake metadata endpoints,
- synthetic hostnames,
- canary documents,
- fake model registry entries,
- honey credentials with zero real privilege.

## Canary credentials

Honey credentials must:

- be synthetic,
- grant no real access,
- be unique per session where practical,
- emit a security event when touched,
- expire with the sandbox.

Example:

```text
event: deception.credential_access
credentialId: honey-github-7f12
sourceProcess: runtime-worker
severity: high
```

## Signal quality

High-signal events include:

- reading a canary private-key path,
- using a honey token,
- contacting a decoy metadata service,
- enumerating several unrelated decoy services.

Low-signal behavior must be correlated before escalation.

## Telemetry

Record only security-relevant metadata such as timestamp, session, process identity, decoy ID, action, destination class, policy result, severity, and evidence reference.

Prompt/output content is not required for normal HoneyNet telemetry.

## Limits

A workload that never touches a decoy is not automatically safe. HoneyNet complements isolation, secure runtime dependencies, endpoint protection, and authenticated remote protocols.
