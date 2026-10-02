import type {
  CapabilityRequest,
  PolicyResult,
  PolicyRule,
  RiskLevel,
  SecurityProfile
} from "./types.js";

const rank: Record<RiskLevel, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3
};

export interface CapabilityPolicyOptions {
  id: string;
  capabilities: ReadonlySet<string>;
  maxRiskLevel: RiskLevel;
  askAtOrAbove?: RiskLevel;
  profiles?: ReadonlySet<SecurityProfile>;
}

export class CapabilityPolicyRule implements PolicyRule {
  constructor(private readonly options: CapabilityPolicyOptions) {}

  evaluate(request: CapabilityRequest, profile: SecurityProfile): PolicyResult | undefined {
    if (!this.options.capabilities.has(request.capability)) return undefined;
    if (this.options.profiles && !this.options.profiles.has(profile)) return undefined;

    if (rank[request.riskLevel] > rank[this.options.maxRiskLevel]) {
      return {
        decision: "DENY",
        riskLevel: request.riskLevel,
        reason: "Requested risk level exceeds the capability policy limit.",
        ruleId: this.options.id
      };
    }

    if (request.approved === true) {
      return {
        decision: "ALLOW",
        riskLevel: request.riskLevel,
        reason: "The exact capability request was explicitly approved.",
        ruleId: this.options.id
      };
    }

    const threshold = this.options.askAtOrAbove;
    if (threshold && rank[request.riskLevel] >= rank[threshold]) {
      return {
        decision: "ASK",
        riskLevel: request.riskLevel,
        reason: "This capability requires explicit approval at the current risk level.",
        ruleId: this.options.id
      };
    }

    return {
      decision: "ALLOW",
      riskLevel: request.riskLevel,
      reason: "Capability is allowed by explicit policy.",
      ruleId: this.options.id
    };
  }
}

export class AirgapNetworkDenyRule implements PolicyRule {
  evaluate(request: CapabilityRequest, profile: SecurityProfile): PolicyResult | undefined {
    if (profile !== "AIRGAP" || !request.capability.startsWith("network.")) return undefined;
    return {
      decision: "DENY",
      riskLevel: request.riskLevel,
      reason: "AIRGAP profile denies all network capabilities.",
      ruleId: "frost.airgap.network-deny",
      restrictions: { network: "deny" }
    };
  }
}

export class PrivateRemoteDenyRule implements PolicyRule {
  evaluate(request: CapabilityRequest, profile: SecurityProfile): PolicyResult | undefined {
    if (profile !== "PRIVATE" || request.capability !== "remoteInference.execute") return undefined;
    return {
      decision: "DENY",
      riskLevel: request.riskLevel,
      reason: "PRIVATE profile forbids remote inference.",
      ruleId: "frost.private.remote-deny"
    };
  }
}
