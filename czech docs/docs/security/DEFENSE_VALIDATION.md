# Defense Validation

[![Defense Validation](https://img.shields.io/badge/security-Defense%20Validation-b91c1c)](#účel)
[![Authorization](https://img.shields.io/badge/scope-owned%20or%20authorized-0f766e)](#authorization-boundary)
[![Mode](https://img.shields.io/badge/mode-non--destructive-2563eb)](#validation-categories)
[![Status](https://img.shields.io/badge/stav-návrh-6f42c1)](#reporting)

Defense Validation ověřuje, že security controls Model Unbreak fungují tak, jak dokumentace tvrdí.

Je omezený na vlastní instalaci uživatele, test environment a systémy s explicitním oprávněním.

## Účel

Validation ověřuje:

- SafeCell filesystem boundaries,
- egress policy,
- reject unknown remote identities,
- block path traversal mimo approved roots,
- structured runtime args proti command injection,
- delivery canary events do Threat Hunter,
- handling resource limits,
- incident evidence snapshots,
- revoked node identities.

## Authorization boundary

Modul neposkytuje internet-wide target discovery, credential attacks, third-party exploitation, persistence deployment ani destructive payloads.

Cílem je control verification.

## Validation categories

### Isolation

Ověření inaccessible protected host paths.

### Egress

Ověření denied destinations a narrow allowlists.

### Identity

Ověření unknown, expired, revoked a version-incompatible nodes.

### Input validation

Harmless malformed fixtures pro parser/path rejection.

### Process policy

Ověření handling unauthorized child processes.

### Deception

Dedicated test harness se synthetic canaries.

### Recovery

Ověření cleanup stopped/quarantined workloadu bez silent resume.

## Safe fixtures

Používají se fake paths, dummy credentials, local test endpoints, non-executable malformed metadata a disposable sandbox files.

Nikdy real secrets nebo third-party accounts.

## Result states

- `PASS`
- `FAIL`
- `WARNING`
- `NOT_SUPPORTED`
- `NOT_TESTED`

Unavailable visibility se nikdy nepřeklopí na PASS.

## Reporting

Každý test ukládá control ID, expected behavior, observed behavior, environment, evidence reference, status a remediation guidance.
