# Security Event Contract

[![Events](https://img.shields.io/badge/security-normalized%20events-b91c1c)](#event-schema)
[![Correlation](https://img.shields.io/badge/correlation-event%20IDs-0f766e)](#event-identity)
[![Privacy](https://img.shields.io/badge/privacy-minimized-2563eb)](#privacy)
[![Status](https://img.shields.io/badge/status-draft-6f42c1)](#event-types)

Security modules communicate through normalized events rather than module-specific strings.

## Event schema

```ts
export type SecurityEvent = {
  id: string;
  occurredAt: string;
  type: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
  source: {
    module: string;
    sessionId?: string;
    processId?: string;
    nodeId?: string;
  };
  resource?: {
    class: string;
    id?: string;
  };
  action?: string;
  policy?: {
    decision?: "ALLOW" | "ASK" | "DENY";
    ruleId?: string;
  };
  evidenceRefs: string[];
  message: string;
};
```

## Event identity

IDs are immutable and unique. Correlation creates a new finding/incident referencing original event IDs instead of mutating them.

## Event types

### Supply chain

- `artifact.download.started`
- `artifact.download.completed`
- `artifact.integrity.failed`
- `artifact.quarantine.promoted`

### Runtime

- `runtime.started`
- `runtime.stopped`
- `runtime.child_process`
- `runtime.resource_limit`

### Filesystem / network

- `filesystem.read`
- `filesystem.write`
- `filesystem.denied`
- `network.connect`
- `network.denied`
- `network.dns`

### Deception

- `deception.file_access`
- `deception.credential_access`
- `deception.service_access`

### Creeping Frost

- `frost.policy.allow`
- `frost.policy.ask`
- `frost.policy.deny`
- `frost.profile.tightened`

### Node / incident

- `node.discovered`
- `node.attested`
- `node.trust_changed`
- `node.revoked`
- `incident.opened`
- `incident.contained`
- `incident.closed`

## Severity

Severity is assigned from evidence and policy, not dramatic wording. Low-level info events may later correlate into a higher-severity finding.

## Privacy

Events store the minimum required information. Prefer resource classes and generated IDs over unrelated personal paths.

Prompt/output content is excluded from the base schema.

## Persistence

Events should support local append-oriented storage, time-range queries, incident correlation, user-approved export, and retention/size controls.

Security exports scrub secrets and personal content by default.