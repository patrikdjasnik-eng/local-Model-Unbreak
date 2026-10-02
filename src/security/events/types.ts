export type SecuritySeverity = "info" | "low" | "medium" | "high" | "critical";

export interface SecurityEvent {
  id: string;
  occurredAt: string;
  type: string;
  severity: SecuritySeverity;
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
  evidenceRefs: readonly string[];
  message: string;
}

export interface SecurityEventStore {
  append(event: SecurityEvent): void;
  list(): readonly SecurityEvent[];
  get(id: string): SecurityEvent | undefined;
}
