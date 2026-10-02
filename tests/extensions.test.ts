import { describe, expect, it } from "vitest";
import { ExtensionRegistry, type ModelUnbreakExtension } from "../src/extensions/index.js";

describe("ExtensionRegistry", () => {
  it("registers private extensions without exposing implementation details", async () => {
    const registry = new ExtensionRegistry();
    const extension: ModelUnbreakExtension = {
      id: "private.detector",
      version: "1.0.0",
      capabilities: () => ["security.detector"],
      register: () => undefined
    };

    const descriptor = await registry.registerExtension(extension, "private");

    expect(descriptor.source).toBe("private");
    expect(registry.providersFor("security.detector")).toEqual(["private.detector"]);
  });

  it("rejects duplicate extension ids", async () => {
    const registry = new ExtensionRegistry();
    const extension: ModelUnbreakExtension = {
      id: "demo",
      version: "1.0.0",
      capabilities: () => [],
      register: () => undefined
    };

    await registry.registerExtension(extension);
    await expect(registry.registerExtension(extension)).rejects.toThrow("already registered");
  });
});
