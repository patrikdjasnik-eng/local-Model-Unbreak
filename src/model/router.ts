import { ProviderRegistry } from "./provider-registry.js";
import type { ModelCapabilities, ModelRequest, ModelResponse } from "./types.js";

export type ModelCapabilityRequirements = Partial<ModelCapabilities>;

export class ModelRouter {
  constructor(private readonly registry: ProviderRegistry) {}

  resolve(modelId: string, required: ModelCapabilityRequirements = {}) {
    const registration = this.registry.resolve(modelId);
    for (const [capability, expected] of Object.entries(required)) {
      if (expected !== true) continue;
      if (!registration.capabilities[capability as keyof ModelCapabilities]) {
        throw new Error(`Model ${modelId} does not support capability: ${capability}`);
      }
    }
    return registration;
  }

  async generate(
    request: ModelRequest,
    required: ModelCapabilityRequirements = {}
  ): Promise<ModelResponse> {
    return this.resolve(request.model, required).model.generate(request);
  }
}
