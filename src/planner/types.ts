import type { GgufModelProfile } from "../gguf/index.js";
import type { HardwareSnapshot } from "../hardware/index.js";

export type EstimateSource = "MEASURED" | "DERIVED" | "ESTIMATED" | "UNKNOWN";
export type EstimateConfidence = "LOW" | "MEDIUM" | "HIGH";

export interface MemoryComponent {
  bytes: number | null;
  source: EstimateSource;
  explanation: string;
}

export interface MemoryEstimate {
  contextTokens: number;
  weights: MemoryComponent;
  kvCache: MemoryComponent;
  runtimeOverhead: MemoryComponent;
  safetyMargin: MemoryComponent;
  minimumRequiredBytes: number;
  totalEstimatedBytes: number | null;
  confidence: EstimateConfidence;
  warnings: readonly string[];
}

export type FitStrategy =
  | "FULL_GPU"
  | "GPU_RAM_OFFLOAD"
  | "CPU_ONLY"
  | "UNSUPPORTED";

export type FitStatus = "SUPPORTED" | "CONDITIONAL" | "UNSUPPORTED";

export interface FitPlan {
  strategy: FitStrategy;
  status: FitStatus;
  reasons: readonly string[];
  warnings: readonly string[];
  requiredBytes: number;
  requiredSource: "TOTAL_ESTIMATE" | "MINIMUM_ONLY";
  safeVramBytes: number;
  safeRamBytes: number;
  selectedGpuIndex?: number;
  memory: MemoryEstimate;
  hardware: HardwareSnapshot;
  model: GgufModelProfile;
}
