import { describe, expect, it } from "vitest";
import { ModelUnbreakCore } from "../src/core/index.js";

describe("ModelUnbreakCore", () => {
  it("wires policy, event pipeline and SafeCell into one core", () => {
    const core = new ModelUnbreakCore({
      workspaceRoot: process.cwd(),
      securityProfile: "PRIVATE"
    });

    const decision = core.evaluateCapability({
      requesterId: "planner",
      capability: "remoteInference.execute",
      riskLevel: "HIGH",
      reason: "remote GPU"
    });

    expect(decision.decision).toBe("DENY");
    expect(core.securityEvents.list()).toHaveLength(1);
    expect(core.safeCell.capabilities.network).toBe(false);
  });

  it("can change security profile explicitly", () => {
    const core = new ModelUnbreakCore({ workspaceRoot: process.cwd() });
    expect(core.getSecurityProfile()).toBe("HARDENED");

    core.setSecurityProfile("AIRGAP");
    expect(core.getSecurityProfile()).toBe("AIRGAP");
  });
});
