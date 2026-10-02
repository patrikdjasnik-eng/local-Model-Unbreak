import { describe, expect, it } from "vitest";
import {
  InMemorySecurityEventStore,
  SecurityEventPipeline
} from "../src/security/events/index.js";

describe("SecurityEventPipeline", () => {
  it("normalizes and stores immutable event records", () => {
    const store = new InMemorySecurityEventStore();
    const pipeline = new SecurityEventPipeline(store);

    const event = pipeline.emit({
      id: "evt-1",
      occurredAt: new Date(0).toISOString(),
      type: "frost.policy.deny",
      severity: "high",
      source: { module: "creeping-frost" },
      evidenceRefs: [],
      message: "  blocked unexpected network access  "
    });

    expect(event.message).toBe("blocked unexpected network access");
    expect(store.list()).toHaveLength(1);
    expect(Object.isFrozen(store.get("evt-1"))).toBe(true);
  });

  it("rejects duplicate event ids", () => {
    const store = new InMemorySecurityEventStore();
    const pipeline = new SecurityEventPipeline(store);
    const event = {
      id: "evt-1",
      occurredAt: new Date(0).toISOString(),
      type: "runtime.started",
      severity: "info" as const,
      source: { module: "runtime" },
      evidenceRefs: [] as string[],
      message: "started"
    };

    pipeline.emit(event);
    expect(() => pipeline.emit(event)).toThrow("already exists");
  });
});
