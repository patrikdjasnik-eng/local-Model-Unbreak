import { execFile } from "node:child_process";
import os from "node:os";
import { promisify } from "node:util";
import type { GpuSnapshot, HardwareSnapshot } from "./types.js";

const execFileAsync = promisify(execFile);

export interface CommandResult {
  stdout: string;
  stderr: string;
}

export type CommandRunner = (
  command: string,
  args: readonly string[],
  timeoutMs: number
) => Promise<CommandResult>;

export interface HardwareProbeDependencies {
  commandRunner?: CommandRunner;
  platform?: NodeJS.Platform;
  architecture?: string;
  totalMemoryBytes?: number;
  availableMemoryBytes?: number;
  cpuModels?: readonly string[];
  capturedAt?: string;
}

const defaultCommandRunner: CommandRunner = async (command, args, timeoutMs) => {
  const result = await execFileAsync(command, [...args], {
    timeout: timeoutMs,
    windowsHide: true,
    maxBuffer: 1024 * 1024
  });
  return {
    stdout: result.stdout,
    stderr: result.stderr
  };
};

const mib = 1024 * 1024;

function parsePositiveNumber(value: string, label: string): number {
  const parsed = Number(value.trim());
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
  return parsed;
}

export function parseNvidiaSmiOutput(stdout: string): readonly GpuSnapshot[] {
  const lines = stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line, index) => {
    const parts = line.split(",").map((part) => part.trim());
    if (parts.length !== 4) {
      throw new Error(`Unexpected nvidia-smi output on line ${index + 1}.`);
    }

    const [name, totalMiB, freeMiB, driverVersion] = parts;
    if (!name || !totalMiB || !freeMiB || !driverVersion) {
      throw new Error(`Incomplete nvidia-smi output on line ${index + 1}.`);
    }

    return {
      index,
      vendor: "NVIDIA",
      name,
      totalVramBytes: Math.round(parsePositiveNumber(totalMiB, "GPU memory.total") * mib),
      availableVramBytes: Math.round(parsePositiveNumber(freeMiB, "GPU memory.free") * mib),
      driverVersion
    };
  });
}

function isMissingCommand(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? (error as { code?: unknown }).code : undefined;
  return code === "ENOENT" || code === 127;
}

export async function probeHardware(
  dependencies: HardwareProbeDependencies = {}
): Promise<HardwareSnapshot> {
  const commandRunner = dependencies.commandRunner ?? defaultCommandRunner;
  const cpuModels = dependencies.cpuModels ?? os.cpus().map((cpu) => cpu.model);
  const warnings: string[] = [];
  let gpus: readonly GpuSnapshot[] = [];
  let gpuStatus: HardwareSnapshot["gpuStatus"] = "UNAVAILABLE";

  try {
    const result = await commandRunner(
      "nvidia-smi",
      [
        "--query-gpu=name,memory.total,memory.free,driver_version",
        "--format=csv,noheader,nounits"
      ],
      5000
    );
    gpus = parseNvidiaSmiOutput(result.stdout);
    gpuStatus = gpus.length > 0 ? "AVAILABLE" : "UNAVAILABLE";
    if (result.stderr.trim()) warnings.push(`nvidia-smi: ${result.stderr.trim()}`);
  } catch (error) {
    if (isMissingCommand(error)) {
      warnings.push("nvidia-smi is unavailable; NVIDIA GPU details were not measured.");
    } else {
      gpuStatus = "ERROR";
      warnings.push(
        `GPU probe failed: ${error instanceof Error ? error.message : "unknown error"}`
      );
    }
  }

  return {
    platform: dependencies.platform ?? os.platform(),
    architecture: dependencies.architecture ?? os.arch(),
    cpu: {
      model: cpuModels[0] ?? "Unknown CPU",
      logicalCores: cpuModels.length
    },
    memory: {
      totalBytes: dependencies.totalMemoryBytes ?? os.totalmem(),
      availableBytes: dependencies.availableMemoryBytes ?? os.freemem()
    },
    gpuStatus,
    gpus,
    warnings,
    capturedAt: dependencies.capturedAt ?? new Date().toISOString()
  };
}
