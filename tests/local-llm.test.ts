import { afterEach, describe, expect, it, vi } from "vitest";
import { LocalLlmClient, sanitizeHistory } from "../ui/llm.js";

describe("LocalLlmClient", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("loads model identifiers from llama.cpp", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      data: [
        { id: "qwen-id", name: "qwen2.5-coder-7b.gguf", sizeGb: 4.68 },
        { id: "llama-id", name: "llama-3.1-8b.gguf", sizeGb: 4.37 }
      ],
      runtime: null
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const client = new LocalLlmClient("/api");
    await expect(client.listModels()).resolves.toEqual({
      models: [
        { id: "qwen-id", name: "qwen2.5-coder-7b.gguf", sizeGb: 4.68 },
        { id: "llama-id", name: "llama-3.1-8b.gguf", sizeGb: 4.37 }
      ],
      runtime: null
    });
  });

  it("activates a selected model through the managed runtime", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: "running",
      modelId: "qwen-id",
      modelName: "qwen.gguf",
      profile: "gpu",
      error: null
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const client = new LocalLlmClient("/api");
    await expect(client.activateModel("qwen-id")).resolves.toMatchObject({
      status: "running",
      modelId: "qwen-id",
      profile: "gpu"
    });

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(JSON.parse(String(init.body))).toEqual({ modelId: "qwen-id" });
  });

  it("sends OpenAI-compatible chat payload and returns model content", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: "Lokální odpověď." } }]
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const client = new LocalLlmClient("/api");
    const answer = await client.chat("qwen", [{ role: "user", content: "Ahoj" }], {
      temperature: 0.4,
      maxTokens: 512
    });

    expect(answer).toBe("Lokální odpověď.");
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(init.body));
    expect(body).toMatchObject({ model: "qwen", temperature: 0.4, maxTokens: 512, stream: false });
  });

  it("does not fake success on HTTP errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("model unavailable", { status: 503 })));
    const client = new LocalLlmClient();
    await expect(client.chat("qwen", [{ role: "user", content: "test" }])).rejects.toThrow("model unavailable");
  });

  it("rejects empty responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: "" } }]
    }), { status: 200, headers: { "Content-Type": "application/json" } })));

    const client = new LocalLlmClient();
    await expect(client.chat("qwen", [{ role: "user", content: "test" }])).rejects.toThrow("empty response");
  });
});

describe("sanitizeHistory", () => {
  it("keeps only valid user and assistant messages", () => {
    expect(sanitizeHistory([
      { role: "system", content: "ignore" },
      { role: "user", content: " one " },
      { role: "assistant", content: " two " },
      { role: "tool", content: "ignore" }
    ], 2)).toEqual([
      { role: "user", content: "one" },
      { role: "assistant", content: "two" }
    ]);
  });
});


describe("local-only proxy configuration", () => {
  it("keeps the demo proxy local-only", async () => {
    const { readFile } = await import("node:fs/promises");
    const config = await readFile("vite.config.ts", "utf8");

    expect(config).toContain("127.0.0.1");
    expect(config).toContain("localhost");
    expect(config).toContain("VITE_BACKEND_URL must point to localhost/loopback");
  });
});
