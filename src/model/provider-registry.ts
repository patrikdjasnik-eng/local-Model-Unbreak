import type { ChatModel, ModelCapabilities } from "./types.js";

export interface ModelRegistration {
  providerId: string;
  modelId: string;
  model: ChatModel;
}

export interface RegisteredModel extends ModelRegistration {
  capabilities: ModelCapabilities;
}

export class ProviderRegistry {
  private readonly registrations = new Map<string, ModelRegistration>();

  register(registration: ModelRegistration): void {
    if (this.registrations.has(registration.modelId)) {
      throw new Error(`Model is already registered: ${registration.modelId}`);
    }
    this.registrations.set(registration.modelId, registration);
  }

  resolve(modelId: string): RegisteredModel {
    const registration = this.registrations.get(modelId);
    if (!registration) throw new Error(`Model is not registered: ${modelId}`);
    return { ...registration, capabilities: registration.model.capabilities() };
  }

  list(): readonly RegisteredModel[] {
    return [...this.registrations.values()].map((registration) => ({
      ...registration,
      capabilities: registration.model.capabilities()
    }));
  }

  has(modelId: string): boolean {
    return this.registrations.has(modelId);
  }
}
