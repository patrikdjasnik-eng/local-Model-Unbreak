import { describe, expect, it } from "vitest";
import {
  CapabilityPolicyRule,
  CreepingFrostEngine,
  createDefaultCreepingFrostEngine
} from "../src/security/policy/index.js";

describe("CreepingFrostEngine", () => {
  it("fails closed without an explicit rule", () => {
    const engine = new CreepingFrostEngine();
    const result = engine.evaluate({
      requesterId: "runtime",
      capability: "unknown.capability",
      riskLevel: "LOW",
      reason: "test"
    }, "STANDARD");

    expect(result.decision).toBe("DENY");
    expect(result.ruleId).toBe("frost.default-deny");
  });

  it("requires approval for configured high-risk capability", () => {
    const engine = new CreepingFrostEngine([
      new CapabilityPolicyRule({
        id: "test.rule",
        capabilities: new Set(["remoteInference.execute"]),
        maxRiskLevel: "HIGH",
        askAtOrAbove: "HIGH"
      })
    ]);

    const result = engine.evaluate({
      requesterId: "planner",
      capability: "remoteInference.execute",
      riskLevel: "HIGH",
      reason: "remote GPU"
    }, "STANDARD");

    expect(result.decision).toBe("ASK");
  });

  it("allows the exact request after explicit approval", () => {
    const engine = new CreepingFrostEngine([
      new CapabilityPolicyRule({
        id: "test.rule",
        capabilities: new Set(["remoteInference.execute"]),
        maxRiskLevel: "HIGH",
        askAtOrAbove: "LOW"
      })
    ]);

    const result = engine.evaluate({
      requesterId: "planner",
      capability: "remoteInference.execute",
      riskLevel: "HIGH",
      reason: "remote GPU",
      approved: true
    }, "STANDARD");

    expect(result.decision).toBe("ALLOW");
  });

  it("denies network in AIRGAP and remote compute in PRIVATE", () => {
    const engine = createDefaultCreepingFrostEngine();

    expect(engine.evaluate({
      requesterId: "runtime",
      capability: "network.registry",
      riskLevel: "LOW",
      reason: "download"
    }, "AIRGAP").decision).toBe("DENY");

    expect(engine.evaluate({
      requesterId: "planner",
      capability: "remoteInference.execute",
      riskLevel: "HIGH",
      reason: "remote node"
    }, "PRIVATE").decision).toBe("DENY");
  });
});
