export interface PlanInput {
  modelSizeGb: number;
  contextSize: number;
  ramGb: number;
  vramGb: number;
}

export interface ExecutionPlan {
  mode: "GPU" | "GPU_RAM_OFFLOAD" | "CPU_RAM" | "INSUFFICIENT_MEMORY";
  feasible: boolean;
  estimatedWorkingSetGb: number;
  estimatedKvCacheGb: number;
  reason: string;
}

function finitePositive(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function createExecutionPlan(input: PlanInput): ExecutionPlan {
  const modelSizeGb = finitePositive(input.modelSizeGb, 1);
  const contextSize = Math.max(512, Math.floor(finitePositive(input.contextSize, 4096)));
  const ramGb = Math.max(0, input.ramGb);
  const vramGb = Math.max(0, input.vramGb);

  const estimatedKvCacheGb = Math.max(0.25, (contextSize / 4096) * 0.75);
  const runtimeOverheadGb = 0.65;
  const estimatedWorkingSetGb = Number((modelSizeGb + estimatedKvCacheGb + runtimeOverheadGb).toFixed(2));

  if (vramGb >= estimatedWorkingSetGb) {
    return {
      mode: "GPU",
      feasible: true,
      estimatedWorkingSetGb,
      estimatedKvCacheGb: Number(estimatedKvCacheGb.toFixed(2)),
      reason: "The estimated working set fits in available VRAM."
    };
  }

  if (vramGb > 0 && ramGb + vramGb >= estimatedWorkingSetGb * 1.15) {
    return {
      mode: "GPU_RAM_OFFLOAD",
      feasible: true,
      estimatedWorkingSetGb,
      estimatedKvCacheGb: Number(estimatedKvCacheGb.toFixed(2)),
      reason: "Use partial GPU offload and keep the remaining layers in system RAM."
    };
  }

  if (ramGb >= estimatedWorkingSetGb * 1.1) {
    return {
      mode: "CPU_RAM",
      feasible: true,
      estimatedWorkingSetGb,
      estimatedKvCacheGb: Number(estimatedKvCacheGb.toFixed(2)),
      reason: "The model fits in system memory, but GPU acceleration is not available for the full working set."
    };
  }

  return {
    mode: "INSUFFICIENT_MEMORY",
    feasible: false,
    estimatedWorkingSetGb,
    estimatedKvCacheGb: Number(estimatedKvCacheGb.toFixed(2)),
    reason: "The estimated model working set exceeds available RAM and VRAM."
  };
}
