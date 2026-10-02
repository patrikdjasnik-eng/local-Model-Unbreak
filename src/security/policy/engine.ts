import type {
  CapabilityRequest,
  PolicyResult,
  PolicyRule,
  SecurityProfile
} from "./types.js";

export class CreepingFrostEngine {
  constructor(private readonly rules: readonly PolicyRule[] = []) {}

  evaluate(request: CapabilityRequest, profile: SecurityProfile): PolicyResult {
    for (const rule of this.rules) {
      const result = rule.evaluate(request, profile);
      if (result) return result;
    }

    return {
      decision: "DENY",
      riskLevel: request.riskLevel,
      reason: "No explicit policy rule allowed this capability.",
      ruleId: "frost.default-deny"
    };
  }
}
