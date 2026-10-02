import { afterEach, describe, expect, it, vi } from "vitest";
import { LocalLlmClient, sanitizeHistory } from "../ui/llm.js";

describe("LocalLlmClient", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("loads model identifiers from llama.cpp", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      data: [{ id: "qwen2.5-coder-7b" }, { id: "llama-3.1-8b" }]
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const client = new LocalLlmClient("/llama");
    await expect(client.listModels()).resolves.toEqual(["qwen2.5-coder-7b", "llama-3.1-8b"]);
  });

  it("sends OpenAI-compatible chat payload and returns model content", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: "Lokální odpověď." } }]
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const client = new LocalLlmClient("/llama");
    const answer = await client.chat("qwen", [{ role: "user", content: "Ahoj" }], {
      temperature: 0.4,
      maxTokens: 512
    });

    expect(answer).toBe("Lokální odpověď.");
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(init.body));
    expect(body).toMatchObject({ model: "qwen", temperature: 0.4, max_tokens: 512, stream: false });
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
    expect(config).toContain("VITE_LLAMA_URL must point to localhost/loopback");
  });
});
