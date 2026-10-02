export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type PolicyDecision = "ALLOW" | "ASK" | "DENY";
export type SecurityProfile = "STANDARD" | "PRIVATE" | "HARDENED" | "DECEPTION" | "AIRGAP";

export interface CapabilityRequest {
  requesterId: string;
  capability: string;
  riskLevel: RiskLevel;
  reason: string;
  resource?: string;
  approved?: boolean;
}

export interface PolicyRestrictions {
  safeCellRequired?: boolean;
  network?: "deny" | "localhost" | "allowlist";
  maxRamMiB?: number;
  maxVramMiB?: number;
  childProcesses?: boolean;
}

export interface PolicyResult {
  decision: PolicyDecision;
  riskLevel: RiskLevel;
  reason: string;
  ruleId: string;
  restrictions?: PolicyRestrictions;
}

export interface PolicyRule {
  evaluate(request: CapabilityRequest, profile: SecurityProfile): PolicyResult | undefined;
}
