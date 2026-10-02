import { beforeEach, describe, expect, it, vi } from "vitest";

async function renderWithBackend(): Promise<void> {
  vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);

    if (url === "/api/models") {
      return new Response(JSON.stringify({
        data: [{ id: "qwen-local", object: "model", owned_by: "local" }]
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (url === "/api/health") {
      return new Response(JSON.stringify({
        ok: true,
        localOnly: true,
        llama: { reachable: true, modelCount: 1, models: ["qwen-local"] }
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (url === "/api/hardware") {
      return new Response(JSON.stringify({
        cpu: { model: "Intel Test CPU", logicalCores: 8, architecture: "x64" },
        memory: { totalBytes: 17179869184, freeBytes: 8589934592, usedPercent: 50 },
        gpu: {
          name: "NVIDIA Test GPU",
          memoryTotalMb: 8192,
          memoryUsedMb: 2048,
          utilizationPercent: 25
        },
        storage: {
          totalBytes: 536870912000,
          freeBytes: 268435456000,
          usedPercent: 50
        },
        platform: "win32",
        release: "test"
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }));

  document.body.innerHTML = '<div id="app"></div>';
  localStorage.clear();
  vi.resetModules();
  await import("../ui/app.js");
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("runtime telemetry UI", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("replaces dashboard demo hardware with backend telemetry", async () => {
    await renderWithBackend();

    expect(document.querySelector('[data-metric="cpu"] .metric-copy strong')?.textContent)
      .toBe("Intel Test CPU");
    expect(document.querySelector('[data-metric="gpu"] .metric-copy strong')?.textContent)
      .toBe("NVIDIA Test GPU");
    expect(document.querySelector('[data-metric="ram"] [data-usage-label]')?.textContent)
      .toBe("50%");
    expect(document.querySelector('[data-metric="vram"] [data-usage-label]')?.textContent)
      .toBe("25%");
  });

  it("shows real llama backend state in the engine card", async () => {
    await renderWithBackend();

    expect(document.querySelector(".engine-title small")?.textContent).toBe("Running");
    expect(document.querySelector(".engine-card")?.textContent).toContain("1");
    expect(document.querySelector(".engine-card")?.textContent).toContain("Connected");
  });

  it("refresh button asks the backend for fresh telemetry", async () => {
    await renderWithBackend();
    const fetchMock = vi.mocked(fetch);
    const before = fetchMock.mock.calls.length;

    document.querySelector<HTMLButtonElement>('[data-action="refresh"]')?.click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(fetchMock.mock.calls.length).toBeGreaterThan(before);
    expect(fetchMock.mock.calls.some(([url]) => String(url) === "/api/hardware")).toBe(true);
  });
});
