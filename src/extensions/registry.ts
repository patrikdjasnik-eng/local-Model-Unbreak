import type {
  ExtensionCapability,
  ExtensionDescriptor,
  ExtensionRegistrationContext,
  ModelUnbreakExtension
} from "./types.js";

export class ExtensionRegistry implements ExtensionRegistrationContext {
  private readonly extensions = new Map<string, ExtensionDescriptor>();
  private readonly capabilities = new Map<ExtensionCapability, Set<string>>();

  async registerExtension(
    extension: ModelUnbreakExtension,
    source: ExtensionDescriptor["source"] = "public"
  ): Promise<ExtensionDescriptor> {
    const id = extension.id.trim();
    const version = extension.version.trim();

    if (!id) throw new Error("Extension id is required.");
    if (!version) throw new Error("Extension version is required.");
    if (this.extensions.has(id)) throw new Error(`Extension is already registered: ${id}`);

    const descriptor: ExtensionDescriptor = {
      id,
      version,
      capabilities: [...new Set(extension.capabilities())],
      source
    };

    this.extensions.set(id, descriptor);
    try {
      await extension.register(this);
      for (const capability of descriptor.capabilities) {
        this.registerCapability(id, capability);
      }
    } catch (error) {
      this.unregister(id);
      throw error;
    }

    return descriptor;
  }

  registerCapability(extensionId: string, capability: ExtensionCapability): void {
    if (!this.extensions.has(extensionId)) throw new Error(`Unknown extension: ${extensionId}`);
    const providers = this.capabilities.get(capability) ?? new Set<string>();
    providers.add(extensionId);
    this.capabilities.set(capability, providers);
  }

  providersFor(capability: ExtensionCapability): readonly string[] {
    return [...(this.capabilities.get(capability) ?? new Set<string>())];
  }

  list(): readonly ExtensionDescriptor[] {
    return [...this.extensions.values()];
  }

  has(extensionId: string): boolean {
    return this.extensions.has(extensionId);
  }

  unregister(extensionId: string): void {
    this.extensions.delete(extensionId);
    for (const providers of this.capabilities.values()) providers.delete(extensionId);
  }
}
