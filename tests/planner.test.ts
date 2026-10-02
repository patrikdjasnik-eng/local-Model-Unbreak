import { describe, expect, it } from "vitest";
import type { GgufModelProfile } from "../src/gguf/index.js";
import type { HardwareSnapshot } from "../src/hardware/index.js";
import { estimateMemory, planFit } from "../src/planner/index.js";

const gib = 1024 ** 3;

function model(overrides: Partial<GgufModelProfile> = {}): GgufModelProfile {
  return {
    format: "GGUF",
    version: 3,
    architecture: "qwen2",
    quantization: "Q4_K_M",
    fileSizeBytes: 4 * gib,
    tensorCount: 0,
    metadataCount: 0,
    contextLength: 32768,
    embeddingLength: 4096,
    blockCount: 32,
    attentionHeadCount: 32,
    attentionHeadCountKv: 8,
    alignment: 32,
    metadata: {},
    warnings: [],
    ...overrides
  };
}

function hardware(
  availableRamBytes: number,
  availableVramBytes?: number
): HardwareSnapshot {
  return {
    platform: "linux",
    architecture: "x64",
    cpu: { model: "Test CPU", logicalCores: 8 },
    memory: { totalBytes: 32 * gib, availableBytes: availableRamBytes },
    gpuStatus: availableVramBytes === undefined ? "UNAVAILABLE" : "AVAILABLE",
    gpus: availableVramBytes === undefined
      ? []
      : [{
          index: 0,
          vendor: "NVIDIA",
          name: "Test GPU",
          totalVramBytes: 12 * gib,
          availableVramBytes,
          driverVersion: "test"
        }],
    warnings: [],
    capturedAt: new Date(0).toISOString()
  };
}

describe("memory estimator and fit planner", () => {
  it("selects FULL_GPU when the estimate fits safe VRAM", () => {
    const profile = model({ fileSizeBytes: 2 * gib });
    const memory = estimateMemory(profile, { contextTokens: 1024 });
    const plan = planFit(profile, hardware(16 * gib, 10 * gib), memory);

    expect(plan.strategy).toBe("FULL_GPU");
    expect(plan.status).toBe("SUPPORTED");
  });

  it("selects GPU_RAM_OFFLOAD when VRAM is insufficient but combined memory fits", () => {
    const profile = model();
    const memory = estimateMemory(profile, { contextTokens: 4096 });
    const plan = planFit(profile, hardware(12 * gib, 3 * gib), memory);

    expect(plan.strategy).toBe("GPU_RAM_OFFLOAD");
  });

  it("selects CPU_ONLY on CPU-only hardware when RAM fits", () => {
    const profile = model({ fileSizeBytes: 2 * gib });
    const memory = estimateMemory(profile, { contextTokens: 1024 });
    const plan = planFit(profile, hardware(12 * gib), memory);

    expect(plan.strategy).toBe("CPU_ONLY");
  });

  it("marks a plan conditional when KV metadata is insufficient", () => {
    const profile = model();
    delete profile.attentionHeadCountKv;
    const memory = estimateMemory(profile);
    const plan = planFit(profile, hardware(16 * gib, 10 * gib), memory);

    expect(memory.kvCache.bytes).toBeNull();
    expect(plan.status).toBe("CONDITIONAL");
  });

  it("keeps configured VRAM headroom", () => {
    const profile = model({ fileSizeBytes: 4 * gib });
    const memory = estimateMemory(profile, {
      contextTokens: 1024,
      runtimeOverheadFloorBytes: 0,
      runtimeOverheadRatio: 0,
      safetyMarginBytes: 0
    });
    const plan = planFit(profile, hardware(16 * gib, 4.5 * gib), memory, {
      vramHeadroomBytes: 1 * gib
    });

    expect(plan.strategy).not.toBe("FULL_GPU");
    expect(plan.safeVramBytes).toBe(3.5 * gib);
  });

  it("returns UNSUPPORTED when safe local memory is insufficient", () => {
    const profile = model({ fileSizeBytes: 20 * gib });
    const memory = estimateMemory(profile, { contextTokens: 4096 });
    const plan = planFit(profile, hardware(4 * gib, 2 * gib), memory);

    expect(plan.strategy).toBe("UNSUPPORTED");
    expect(plan.status).toBe("UNSUPPORTED");
  });
});
