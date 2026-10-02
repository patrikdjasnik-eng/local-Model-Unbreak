# Defense Validation

[![Defense Validation](https://img.shields.io/badge/security-Defense%20Validation-b91c1c)](#purpose)
[![Authorization](https://img.shields.io/badge/scope-owned%20or%20authorized-0f766e)](#authorization-boundary)
[![Mode](https://img.shields.io/badge/mode-non--destructive-2563eb)](#validation-categories)
[![Status](https://img.shields.io/badge/status-design-6f42c1)](#reporting)

Defense Validation verifies that Model Unbreak security controls behave as documented.

It is limited to the user's own installation, test environments, and systems where the user has explicit authorization.

## Purpose

Validation checks whether:

- SafeCell filesystem boundaries are applied,
- egress policy is enforced,
- unknown remote identities are rejected,
- path traversal leaves approved roots blocked,
- structured runtime arguments resist command injection,
- canary events reach Threat Hunter,
- resource limits trigger expected handling,
- incident snapshots preserve evidence,
- revoked node identities remain blocked.

## Authorization boundary

The module does **not** provide internet-wide target discovery, credential attacks, third-party exploitation, persistence deployment, or destructive payloads.

Its objective is control verification.

## Validation categories

### Isolation

Verify protected host paths remain inaccessible.

### Egress

Verify denied destinations stay denied and allowlists remain narrow.

### Identity

Verify unknown, expired, revoked, and version-incompatible nodes are rejected.

### Input validation

Use harmless malformed fixtures to test parser/path rejection.

### Process policy

Verify unauthorized child processes trigger configured handling.

### Deception

Touch synthetic canaries through a dedicated test harness and verify the expected event.

### Recovery

Verify stopped/quarantined workloads clean up temporary resources and do not silently resume.

## Safe fixtures

Use fake paths, dummy credentials, local test endpoints, non-executable malformed metadata, and disposable sandbox files.

Never use real secrets or third-party accounts.

## Result states

- `PASS`
- `FAIL`
- `WARNING`
- `NOT_SUPPORTED`
- `NOT_TESTED`

Unavailable visibility is never converted into PASS.

## Reporting

Each test records control ID, expected behavior, observed behavior, environment, evidence reference, status, and remediation guidance.
