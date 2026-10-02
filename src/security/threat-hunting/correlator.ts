import type { SecurityEvent } from "../events/index.js";
import type { ThreatFinding, ThreatRule } from "./types.js";

export class ThreatHuntCorrelator {
  constructor(private readonly rules: readonly ThreatRule[] = []) {}

  evaluate(events: readonly SecurityEvent[]): readonly ThreatFinding[] {
    const findings: ThreatFinding[] = [];

    for (const rule of this.rules) {
      const finding = rule.evaluate(events);
      if (finding) findings.push(finding);
    }

    return findings;
  }
}

function sameSession(a: SecurityEvent, b: SecurityEvent): boolean {
  const left = a.source.sessionId;
  const right = b.source.sessionId;
  return Boolean(left && right && left === right);
}

export class CredentialAccessWithBlockedEgressRule implements ThreatRule {
  readonly id = "MU-HUNT-001";

  evaluate(events: readonly SecurityEvent[]): ThreatFinding | undefined {
    const credential = events.find((event) => event.type === "deception.credential_access");
    if (!credential) return undefined;

    const deniedNetwork = events.find((event) =>
      event.type === "network.denied" && sameSession(credential, event)
    );
    if (!deniedNetwork) return undefined;

    return {
      id: `${this.id}:${credential.id}:${deniedNetwork.id}`,
      ruleId: this.id,
      title: "Credential decoy access followed by blocked egress",
      severity: "high",
      eventIds: [credential.id, deniedNetwork.id],
      reason: "The same session accessed a synthetic credential and then attempted denied network egress."
    };
  }
}
