import { describe, expect, it } from "vitest";
import { parseNvidiaSmiOutput, probeHardware } from "../src/hardware/index.js";

describe("hardware probe", () => {
  it("parses NVIDIA CSV output", () => {
    const gpus = parseNvidiaSmiOutput("NVIDIA GTX 1070 Ti, 8192, 6144, 560.94\n");

    expect(gpus).toHaveLength(1);
    expect(gpus[0]?.name).toBe("NVIDIA GTX 1070 Ti");
    expect(gpus[0]?.totalVramBytes).toBe(8192 * 1024 * 1024);
    expect(gpus[0]?.availableVramBytes).toBe(6144 * 1024 * 1024);
  });

  it("continues in CPU-only mode when nvidia-smi is missing", async () => {
    const error = Object.assign(new Error("missing"), { code: "ENOENT" });
    const snapshot = await probeHardware({
      commandRunner: async () => { throw error; },
      platform: "win32",
      architecture: "x64",
      totalMemoryBytes: 16 * 1024 ** 3,
      availableMemoryBytes: 8 * 1024 ** 3,
      cpuModels: ["Test CPU", "Test CPU"],
      capturedAt: new Date(0).toISOString()
    });

    expect(snapshot.gpuStatus).toBe("UNAVAILABLE");
    expect(snapshot.gpus).toEqual([]);
    expect(snapshot.cpu.logicalCores).toBe(2);
  });
});
