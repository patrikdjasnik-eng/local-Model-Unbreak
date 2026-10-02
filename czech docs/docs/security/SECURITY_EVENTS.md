# Security Event Contract

[![Events](https://img.shields.io/badge/security-normalized%20events-b91c1c)](#event-schema)
[![Correlation](https://img.shields.io/badge/correlation-event%20IDs-0f766e)](#event-identity)
[![Privacy](https://img.shields.io/badge/privacy-minimized-2563eb)](#privacy)
[![Status](https://img.shields.io/badge/stav-draft-6f42c1)](#event-types)

Security moduly komunikují přes normalized events místo module-specific stringů.

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

IDs jsou immutable a unique. Correlation vytvoří nový finding/incident s references na original event IDs místo jejich mutation.

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

Severity vychází z evidence a policy, ne z dramatického wording. Low-level info events se mohou později korelovat do higher-severity finding.

## Privacy

Events ukládají minimum nutných informací. Preferují resource classes a generated IDs před unrelated personal paths.

Prompt/output content není součástí base schema.

## Persistence

Events podporují local append-oriented storage, time-range query, incident correlation, user-approved export a retention/size controls.

Security exports defaultně scrubují secrets a personal content.