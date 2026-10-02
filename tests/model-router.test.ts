import { describe, expect, it } from "vitest";
import {
  ModelRouter,
  ProviderRegistry,
  type ChatModel,
  type ModelRequest
} from "../src/model/index.js";

const model: ChatModel = {
  capabilities: () => ({
    streaming: true,
    tools: false,
    vision: false,
    embeddings: false
  }),
  generate: async (request: ModelRequest) => ({
    model: request.model,
    content: "ok"
  })
};

describe("ModelRouter", () => {
  it("routes a registered model", async () => {
    const registry = new ProviderRegistry();
    registry.register({ providerId: "local", modelId: "demo", model });
    const router = new ModelRouter(registry);

    await expect(router.generate({
      model: "demo",
      messages: [{ role: "user", content: "hello" }]
    })).resolves.toEqual({ model: "demo", content: "ok" });
  });

  it("rejects an unsupported required capability", () => {
    const registry = new ProviderRegistry();
    registry.register({ providerId: "local", modelId: "demo", model });
    const router = new ModelRouter(registry);

    expect(() => router.resolve("demo", { vision: true })).toThrow("vision");
  });
});
