import { describe, expect, it, vi } from "vitest";
import { createApiHandler } from "../backend/src/app.js";
import { loadBackendConfig, resolveLocalUrl } from "../backend/src/config.js";
import { createExecutionPlan } from "../backend/src/planner.js";
import type { HardwareSnapshot } from "../backend/src/hardware.js";

const hardware: HardwareSnapshot = {
  cpu: { model: "Test CPU", logicalCores: 8, architecture: "x64" },
  memory: { totalBytes: 32_000_000_000, freeBytes: 20_000_000_000, usedPercent: 38 },
  gpu: { name: "Test GPU", memoryTotalMb: 8192, memoryUsedMb: 1024, utilizationPercent: 12 },
  storage: { totalBytes: 1_000_000_000_000, freeBytes: 500_000_000_000, usedPercent: 50 },
  platform: "win32",
  release: "test"
};

function createDeps() {
  return {
    llama: {
      health: vi.fn(async () => ({ reachable: true, models: ["qwen"] })),
      listModels: vi.fn(async () => ["qwen"]),
      chat: vi.fn(async () => "backend answer")
    },
    inspectHardware: vi.fn(async () => hardware),
    now: vi.fn(() => 1000)
  };
}

describe("backend config", () => {
  it("binds to loopback by default", () => {
    const config = loadBackendConfig({});
    expect(config.host).toBe("127.0.0.1");
    expect(config.port).toBe(8787);
    expect(config.llamaUrl).toBe("http://127.0.0.1:8080");
  });

  it("rejects non-local llama URLs", () => {
    expect(() => resolveLocalUrl("https://example.com", "http://127.0.0.1:8080"))
      .toThrow("localhost or a loopback");
  });
});

describe("execution planner", () => {
  it("prefers full GPU when VRAM is sufficient", () => {
    expect(createExecutionPlan({
      modelSizeGb: 4,
      contextSize: 4096,
      ramGb: 16,
      vramGb: 12
    }).mode).toBe("GPU");
  });

  it("uses GPU/RAM offload when combined memory is sufficient", () => {
    expect(createExecutionPlan({
      modelSizeGb: 8,
      contextSize: 8192,
      ramGb: 32,
      vramGb: 6
    }).mode).toBe("GPU_RAM_OFFLOAD");
  });

  it("reports an infeasible plan when memory is too small", () => {
    const result = createExecutionPlan({
      modelSizeGb: 20,
      contextSize: 32768,
      ramGb: 4,
      vramGb: 0
    });
    expect(result.feasible).toBe(false);
    expect(result.mode).toBe("INSUFFICIENT_MEMORY");
  });
});

describe("backend API", () => {
  it("reports backend and llama health", async () => {
    const handler = createApiHandler(createDeps());
    const response = await handler(new Request("http://127.0.0.1/api/health"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      ok: true,
      localOnly: true,
      llama: { reachable: true, modelCount: 1, models: ["qwen"] }
    });
  });

  it("returns real hardware service output", async () => {
    const handler = createApiHandler(createDeps());
    const response = await handler(new Request("http://127.0.0.1/api/hardware"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.cpu.model).toBe("Test CPU");
    expect(payload.gpu.name).toBe("Test GPU");
  });

  it("exposes local llama models in OpenAI-compatible list shape", async () => {
    const handler = createApiHandler(createDeps());
    const response = await handler(new Request("http://127.0.0.1/api/models"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data).toEqual([{ id: "qwen", object: "model", owned_by: "local" }]);
  });

  it("validates chat input before contacting llama.cpp", async () => {
    const deps = createDeps();
    const handler = createApiHandler(deps);
    const response = await handler(new Request("http://127.0.0.1/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] })
    }));

    expect(response.status).toBe(400);
    expect(deps.llama.chat).not.toHaveBeenCalled();
  });

  it("forwards sanitized chat to llama.cpp and returns a completion", async () => {
    const deps = createDeps();
    const handler = createApiHandler(deps);
    const response = await handler(new Request("http://127.0.0.1/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen",
        messages: [
          { role: "tool", content: "drop me" },
          { role: "user", content: " hello " }
        ],
        temperature: 99,
        maxTokens: 1
      })
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.choices[0].message.content).toBe("backend answer");
    expect(deps.llama.chat).toHaveBeenCalledWith(
      "qwen",
      [{ role: "user", content: "hello" }],
      { temperature: 2, maxTokens: 64 }
    );
  });

  it("turns llama.cpp failure into a 502 instead of false success", async () => {
    const deps = createDeps();
    deps.llama.chat.mockRejectedValueOnce(new Error("llama unavailable"));
    const handler = createApiHandler(deps);
    const response = await handler(new Request("http://127.0.0.1/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen",
        messages: [{ role: "user", content: "hello" }]
      })
    }));
    const payload = await response.json();

    expect(response.status).toBe(502);
    expect(payload.error).toContain("llama unavailable");
  });

  it("creates a planner response from posted hardware limits", async () => {
    const handler = createApiHandler(createDeps());
    const response = await handler(new Request("http://127.0.0.1/api/planner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modelSizeGb: 4.5, contextSize: 4096, ramGb: 32, vramGb: 12 })
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.feasible).toBe(true);
    expect(payload.mode).toBe("GPU");
  });

  it("returns 404 for unknown routes", async () => {
    const handler = createApiHandler(createDeps());
    const response = await handler(new Request("http://127.0.0.1/api/nope"));
    expect(response.status).toBe(404);
  });
});
