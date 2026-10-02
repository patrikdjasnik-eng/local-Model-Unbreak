import type { GpuSnapshot, HardwareSnapshot } from "../hardware/index.js";
import type { GgufModelProfile } from "../gguf/index.js";
import type { FitPlan, MemoryEstimate } from "./types.js";

const gib = 1024 ** 3;
const mib = 1024 ** 2;

export interface FitPlannerOptions {
  vramHeadroomBytes?: number;
  ramHeadroomBytes?: number;
}

function availableVram(gpu: GpuSnapshot): number {
  return gpu.availableVramBytes ?? gpu.totalVramBytes;
}

function selectGpu(hardware: HardwareSnapshot): GpuSnapshot | undefined {
  return [...hardware.gpus].sort((left, right) => availableVram(right) - availableVram(left))[0];
}

export function planFit(
  model: GgufModelProfile,
  hardware: HardwareSnapshot,
  memory: MemoryEstimate,
  options: FitPlannerOptions = {}
): FitPlan {
  const vramHeadroomBytes = options.vramHeadroomBytes ?? 768 * mib;
  const ramHeadroomBytes = options.ramHeadroomBytes ?? 2 * gib;

  if (vramHeadroomBytes < 0 || ramHeadroomBytes < 0) {
    throw new Error("Planner headroom values must be non-negative.");
  }

  const gpu = selectGpu(hardware);
  const rawVram = gpu ? availableVram(gpu) : 0;
  const safeVramBytes = Math.max(0, rawVram - vramHeadroomBytes);
  const safeRamBytes = Math.max(0, hardware.memory.availableBytes - ramHeadroomBytes);
  const requiredBytes = memory.totalEstimatedBytes ?? memory.minimumRequiredBytes;
  const requiredSource = memory.totalEstimatedBytes === null
    ? "MINIMUM_ONLY"
    : "TOTAL_ESTIMATE";
  const warnings = [...memory.warnings];

  if (gpu && gpu.availableVramBytes === undefined) {
    warnings.push(
      "Current free VRAM was unavailable; planner used total VRAM as an upper bound."
    );
  }

  if (requiredSource === "MINIMUM_ONLY") {
    warnings.push(
      "Plan is conditional because KV-cache memory is unknown; actual runtime memory can be higher."
    );
  }

  const status = requiredSource === "MINIMUM_ONLY" ? "CONDITIONAL" : "SUPPORTED";

  if (gpu && requiredBytes <= safeVramBytes) {
    return {
      strategy: "FULL_GPU",
      status,
      reasons: [
        "Estimated memory fits inside safe GPU capacity.",
        `VRAM headroom reserves ${vramHeadroomBytes} bytes before planning.`
      ],
      warnings,
      requiredBytes,
      requiredSource,
      safeVramBytes,
      safeRamBytes,
      selectedGpuIndex: gpu.index,
      memory,
      hardware,
      model
    };
  }

  if (gpu && requiredBytes <= safeVramBytes + safeRamBytes) {
    return {
      strategy: "GPU_RAM_OFFLOAD",
      status,
      reasons: [
        "The model does not fit safely in available VRAM alone.",
        "Combined safe GPU and system RAM capacity can cover the current estimate."
      ],
      warnings,
      requiredBytes,
      requiredSource,
      safeVramBytes,
      safeRamBytes,
      selectedGpuIndex: gpu.index,
      memory,
      hardware,
      model
    };
  }

  if (requiredBytes <= safeRamBytes) {
    return {
      strategy: "CPU_ONLY",
      status,
      reasons: [
        gpu
          ? "GPU capacity is insufficient for the current estimate, but safe system RAM is sufficient."
          : "No usable GPU memory was measured, but safe system RAM is sufficient."
      ],
      warnings,
      requiredBytes,
      requiredSource,
      safeVramBytes,
      safeRamBytes,
      memory,
      hardware,
      model
    };
  }

  return {
    strategy: "UNSUPPORTED",
    status: "UNSUPPORTED",
    reasons: [
      "The current minimum memory requirement exceeds safe local capacity.",
      "No remote execution strategy is implemented in M1."
    ],
    warnings,
    requiredBytes,
    requiredSource,
    safeVramBytes,
    safeRamBytes,
    ...(gpu ? { selectedGpuIndex: gpu.index } : {}),
    memory,
    hardware,
    model
  };
}
