import { describe, expect, it } from "vitest";
import {
  CredentialAccessWithBlockedEgressRule,
  ThreatHuntCorrelator
} from "../src/security/threat-hunting/index.js";
import type { SecurityEvent } from "../src/security/events/index.js";

function event(
  id: string,
  type: string,
  sessionId: string
): SecurityEvent {
  return {
    id,
    occurredAt: new Date(0).toISOString(),
    type,
    severity: "info",
    source: { module: "test", sessionId },
    evidenceRefs: [],
    message: type
  };
}

describe("ThreatHuntCorrelator", () => {
  it("correlates decoy credential access with blocked egress in one session", () => {
    const correlator = new ThreatHuntCorrelator([
      new CredentialAccessWithBlockedEgressRule()
    ]);

    const findings = correlator.evaluate([
      event("a", "deception.credential_access", "session-1"),
      event("b", "network.denied", "session-1")
    ]);

    expect(findings).toHaveLength(1);
    expect(findings[0]?.severity).toBe("high");
  });

  it("does not correlate unrelated sessions", () => {
    const correlator = new ThreatHuntCorrelator([
      new CredentialAccessWithBlockedEgressRule()
    ]);

    const findings = correlator.evaluate([
      event("a", "deception.credential_access", "session-1"),
      event("b", "network.denied", "session-2")
    ]);

    expect(findings).toHaveLength(0);
  });
});
