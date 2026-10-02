export type GpuVendor = "NVIDIA" | "AMD" | "INTEL" | "APPLE" | "UNKNOWN";
export type GpuProbeStatus = "AVAILABLE" | "UNAVAILABLE" | "ERROR";

export interface GpuSnapshot {
  index: number;
  vendor: GpuVendor;
  name: string;
  totalVramBytes: number;
  availableVramBytes?: number;
  driverVersion?: string;
}

export interface HardwareSnapshot {
  platform: NodeJS.Platform;
  architecture: string;
  cpu: {
    model: string;
    logicalCores: number;
  };
  memory: {
    totalBytes: number;
    availableBytes: number;
  };
  gpuStatus: GpuProbeStatus;
  gpus: readonly GpuSnapshot[];
  warnings: readonly string[];
  capturedAt: string;
}
