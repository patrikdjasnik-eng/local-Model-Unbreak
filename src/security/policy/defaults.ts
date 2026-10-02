import { CreepingFrostEngine } from "./engine.js";
import {
  AirgapNetworkDenyRule,
  CapabilityPolicyRule,
  PrivateRemoteDenyRule
} from "./rules.js";

export function createDefaultCreepingFrostEngine(): CreepingFrostEngine {
  return new CreepingFrostEngine([
    new AirgapNetworkDenyRule(),
    new PrivateRemoteDenyRule(),
    new CapabilityPolicyRule({
      id: "frost.public.read",
      capabilities: new Set([
        "catalog.read",
        "model.read",
        "runtime.inspect",
        "security.observe"
      ]),
      maxRiskLevel: "MEDIUM"
    }),
    new CapabilityPolicyRule({
      id: "frost.registry.connect",
      capabilities: new Set(["network.registry"]),
      maxRiskLevel: "HIGH",
      askAtOrAbove: "MEDIUM"
    }),
    new CapabilityPolicyRule({
      id: "frost.remote.compute",
      capabilities: new Set(["remoteInference.execute"]),
      maxRiskLevel: "HIGH",
      askAtOrAbove: "LOW",
      profiles: new Set(["STANDARD", "HARDENED", "DECEPTION"])
    })
  ]);
}
