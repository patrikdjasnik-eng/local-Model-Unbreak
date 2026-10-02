import type { SecurityEvent, SecuritySeverity } from "../events/index.js";

export interface ThreatFinding {
  id: string;
  ruleId: string;
  title: string;
  severity: SecuritySeverity;
  eventIds: readonly string[];
  reason: string;
}

export interface ThreatRule {
  readonly id: string;
  evaluate(events: readonly SecurityEvent[]): ThreatFinding | undefined;
}
