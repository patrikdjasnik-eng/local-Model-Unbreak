export type ExtensionCapability =
  | "catalog.provider"
  | "model.runtime"
  | "planner.strategy"
  | "security.detector"
  | "security.policy"
  | "remote.transport"
  | "clone.trainer"
  | (string & {});

export interface ExtensionRegistrationContext {
  registerCapability(extensionId: string, capability: ExtensionCapability): void;
}

export interface ModelUnbreakExtension {
  readonly id: string;
  readonly version: string;
  capabilities(): readonly ExtensionCapability[];
  register(context: ExtensionRegistrationContext): void | Promise<void>;
}

export interface ExtensionDescriptor {
  id: string;
  version: string;
  capabilities: readonly ExtensionCapability[];
  source: "public" | "private";
}
