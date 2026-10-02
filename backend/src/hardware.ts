import { execFile } from "node:child_process";
import { statfs } from "node:fs/promises";
import os from "node:os";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface HardwareSnapshot {
  cpu: {
    model: string;
    logicalCores: number;
    architecture: string;
  };
  memory: {
    totalBytes: number;
    freeBytes: number;
    usedPercent: number;
  };
  gpu: {
    name: string;
    memoryTotalMb: number;
    memoryUsedMb: number;
    utilizationPercent: number;
  } | null;
  storage: {
    totalBytes: number;
    freeBytes: number;
    usedPercent: number;
  } | null;
  platform: string;
  release: string;
}

function percentUsed(total: number, free: number): number {
  if (total <= 0) return 0;
  return Math.round(((total - free) / total) * 100);
}

async function readNvidiaGpu(): Promise<HardwareSnapshot["gpu"]> {
  try {
    const { stdout } = await execFileAsync(
      "nvidia-smi",
      ["--query-gpu=name,memory.total,memory.used,utilization.gpu", "--format=csv,noheader,nounits"],
      { timeout: 2500, windowsHide: true, maxBuffer: 64 * 1024 }
    );
    const firstLine = stdout.trim().split(/\r?\n/)[0];
    if (!firstLine) return null;

    const [name, total, used, utilization] = firstLine.split(",").map((part) => part.trim());
    if (!name) return null;

    return {
      name,
      memoryTotalMb: Number.parseInt(total ?? "0", 10) || 0,
      memoryUsedMb: Number.parseInt(used ?? "0", 10) || 0,
      utilizationPercent: Number.parseInt(utilization ?? "0", 10) || 0
    };
  } catch {
    return null;
  }
}

async function readStorage(): Promise<HardwareSnapshot["storage"]> {
  try {
    const stats = await statfs(process.cwd());
    const totalBytes = Number(stats.blocks) * Number(stats.bsize);
    const freeBytes = Number(stats.bavail) * Number(stats.bsize);

    return {
      totalBytes,
      freeBytes,
      usedPercent: percentUsed(totalBytes, freeBytes)
    };
  } catch {
    return null;
  }
}

export async function inspectHardware(): Promise<HardwareSnapshot> {
  const cpus = os.cpus();
  const totalBytes = os.totalmem();
  const freeBytes = os.freemem();

  const [gpu, storage] = await Promise.all([readNvidiaGpu(), readStorage()]);

  return {
    cpu: {
      model: cpus[0]?.model?.trim() || "Unknown CPU",
      logicalCores: cpus.length,
      architecture: os.arch()
    },
    memory: {
      totalBytes,
      freeBytes,
      usedPercent: percentUsed(totalBytes, freeBytes)
    },
    gpu,
    storage,
    platform: os.platform(),
    release: os.release()
  };
}
