import type { SecurityEvent, SecurityEventStore } from "./types.js";

const severities = new Set(["info", "low", "medium", "high", "critical"]);

export class InMemorySecurityEventStore implements SecurityEventStore {
  private readonly events: SecurityEvent[] = [];
  private readonly byId = new Map<string, SecurityEvent>();

  append(event: SecurityEvent): void {
    if (this.byId.has(event.id)) throw new Error(`Security event already exists: ${event.id}`);

    const frozen: SecurityEvent = Object.freeze({
      ...event,
      source: Object.freeze({ ...event.source }),
      ...(event.resource ? { resource: Object.freeze({ ...event.resource }) } : {}),
      ...(event.policy ? { policy: Object.freeze({ ...event.policy }) } : {}),
      evidenceRefs: Object.freeze([...event.evidenceRefs])
    });

    this.events.push(frozen);
    this.byId.set(frozen.id, frozen);
  }

  list(): readonly SecurityEvent[] {
    return [...this.events];
  }

  get(id: string): SecurityEvent | undefined {
    return this.byId.get(id);
  }
}

export class SecurityEventPipeline {
  constructor(private readonly store: SecurityEventStore) {}

  emit(event: SecurityEvent): SecurityEvent {
    const normalized = this.validate(event);
    this.store.append(normalized);
    return normalized;
  }

  private validate(event: SecurityEvent): SecurityEvent {
    const id = event.id.trim();
    const type = event.type.trim();
    const module = event.source.module.trim();
    const message = event.message.trim();

    if (!id) throw new Error("Security event id is required.");
    if (!type) throw new Error("Security event type is required.");
    if (!module) throw new Error("Security event source module is required.");
    if (!message) throw new Error("Security event message is required.");
    if (!severities.has(event.severity)) throw new Error(`Unsupported severity: ${event.severity}`);
    if (Number.isNaN(Date.parse(event.occurredAt))) throw new Error("Security event timestamp is invalid.");

    return {
      ...event,
      id,
      type,
      source: { ...event.source, module },
      message,
      evidenceRefs: [...event.evidenceRefs]
    };
  }
}
