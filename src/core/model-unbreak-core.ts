import { ExtensionRegistry, type ExtensionDescriptor, type ModelUnbreakExtension } from "../extensions/index.js";
import { ModelRouter, ProviderRegistry, type ModelRegistration } from "../model/index.js";
import { DockerSafeCell, type DockerSafeCellOptions } from "../sandbox/index.js";
import {
  InMemorySecurityEventStore,
  SecurityEventPipeline,
  type SecurityEvent
} from "../security/events/index.js";
import {
  createDefaultCreepingFrostEngine,
  type CapabilityRequest,
  type PolicyResult,
  type SecurityProfile
} from "../security/policy/index.js";

export interface ModelUnbreakCoreOptions {
  workspaceRoot: string;
  securityProfile?: SecurityProfile;
  safeCell?: Omit<DockerSafeCellOptions, "workspaceRoot">;
}

export class ModelUnbreakCore {
  readonly extensions = new ExtensionRegistry();
  readonly models = new ProviderRegistry();
  readonly router = new ModelRouter(this.models);
  readonly securityEvents = new InMemorySecurityEventStore();
  readonly security = new SecurityEventPipeline(this.securityEvents);
  readonly frost = createDefaultCreepingFrostEngine();
  readonly safeCell: DockerSafeCell;

  private securityProfile: SecurityProfile;

  constructor(options: ModelUnbreakCoreOptions) {
    this.securityProfile = options.securityProfile ?? "HARDENED";
    this.safeCell = new DockerSafeCell({
      workspaceRoot: options.workspaceRoot,
      ...options.safeCell
    });
  }

  getSecurityProfile(): SecurityProfile {
    return this.securityProfile;
  }

  setSecurityProfile(profile: SecurityProfile): void {
    this.securityProfile = profile;
  }

  evaluateCapability(request: CapabilityRequest): PolicyResult {
    const result = this.frost.evaluate(request, this.securityProfile);

    this.recordSecurityEvent({
      id: `frost-${crypto.randomUUID()}`,
      occurredAt: new Date().toISOString(),
      type: `frost.policy.${result.decision.toLowerCase()}`,
      severity: result.decision === "DENY" ? "medium" : "info",
      source: { module: "creeping-frost" },
      action: request.capability,
      policy: {
        decision: result.decision,
        ruleId: result.ruleId
      },
      evidenceRefs: [],
      message: result.reason
    });

    return result;
  }

  registerModel(registration: ModelRegistration): void {
    this.models.register(registration);
  }

  async registerExtension(
    extension: ModelUnbreakExtension,
    source: ExtensionDescriptor["source"] = "public"
  ): Promise<ExtensionDescriptor> {
    return this.extensions.registerExtension(extension, source);
  }

  recordSecurityEvent(event: SecurityEvent): SecurityEvent {
    return this.security.emit(event);
  }
}
