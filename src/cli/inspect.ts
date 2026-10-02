import { realpath, stat } from "node:fs/promises";
import { inspectGguf, type GgufModelProfile } from "../gguf/index.js";
import { probeHardware, type HardwareSnapshot } from "../hardware/index.js";
import {
  estimateMemory,
  planFit,
  type FitPlan,
  type MemoryEstimatorOptions
} from "../planner/index.js";
import {
  createDefaultCreepingFrostEngine,
  type SecurityProfile
} from "../security/policy/index.js";

export interface InspectOptions extends MemoryEstimatorOptions {
  securityProfile?: SecurityProfile;
}

export interface InspectionResult {
  path: string;
  model: GgufModelProfile;
  hardware: HardwareSnapshot;
  plan: FitPlan;
}

function assertAllowed(
  capability: string,
  resource: string | undefined,
  securityProfile: SecurityProfile
): void {
  const engine = createDefaultCreepingFrostEngine();
  const result = engine.evaluate({
    requesterId: "cli.inspect",
    capability,
    riskLevel: "LOW",
    reason: "Read-only local model inspection.",
    ...(resource ? { resource } : {})
  }, securityProfile);

  if (result.decision !== "ALLOW") {
    throw new Error(`Creeping Frost blocked ${capability}: ${result.reason}`);
  }
}

export async function inspectModel(
  modelPath: string,
  options: InspectOptions = {}
): Promise<InspectionResult> {
  const securityProfile = options.securityProfile ?? "HARDENED";
  const resolvedPath = await realpath(modelPath);
  const fileStat = await stat(resolvedPath);

  if (!fileStat.isFile()) throw new Error("Model path is not a regular file.");

  assertAllowed("filesystem.model.read", resolvedPath, securityProfile);
  assertAllowed("model.inspect", resolvedPath, securityProfile);
  assertAllowed("hardware.inspect", undefined, securityProfile);

  const [model, hardware] = await Promise.all([
    inspectGguf(resolvedPath),
    probeHardware()
  ]);
  const memory = estimateMemory(model, options);
  const plan = planFit(model, hardware, memory);

  return {
    path: resolvedPath,
    model,
    hardware,
    plan
  };
}

function jsonReplacer(_key: string, value: unknown): unknown {
  return typeof value === "bigint" ? value.toString() : value;
}

export function renderInspectionJson(result: InspectionResult): string {
  return JSON.stringify(result, jsonReplacer, 2);
}

export function formatBytes(bytes: number | null): string {
  if (bytes === null) return "unknown";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KiB", "MiB", "GiB", "TiB"];
  let value = bytes;
  let unit = -1;
  do {
    value /= 1024;
    unit += 1;
  } while (value >= 1024 && unit < units.length - 1);
  return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[unit]}`;
}

export function renderInspectionText(result: InspectionResult): string {
  const gpu = result.plan.selectedGpuIndex === undefined
    ? undefined
    : result.hardware.gpus.find((candidate) => candidate.index === result.plan.selectedGpuIndex);

  const lines = [
    "Model Unbreak",
    "",
    "MODEL",
    `Name: ${result.model.name ?? "unknown"}`,
    `Architecture: ${result.model.architecture ?? "unknown"}`,
    `Quantization: ${result.model.quantization}`,
    `File: ${formatBytes(result.model.fileSizeBytes)}`,
    "",
    "HARDWARE",
    `CPU: ${result.hardware.cpu.model} (${result.hardware.cpu.logicalCores} logical cores)`,
    `RAM available: ${formatBytes(result.hardware.memory.availableBytes)} / ${formatBytes(result.hardware.memory.totalBytes)}`,
    `GPU: ${gpu?.name ?? (result.hardware.gpuStatus === "UNAVAILABLE" ? "not measured" : "none selected")}`,
    `VRAM safe: ${formatBytes(result.plan.safeVramBytes)}`,
    "",
    "MEMORY",
    `Weights: ${formatBytes(result.plan.memory.weights.bytes)} [${result.plan.memory.weights.source}]`,
    `KV cache: ${formatBytes(result.plan.memory.kvCache.bytes)} [${result.plan.memory.kvCache.source}]`,
    `Runtime overhead: ${formatBytes(result.plan.memory.runtimeOverhead.bytes)} [${result.plan.memory.runtimeOverhead.source}]`,
    `Safety margin: ${formatBytes(result.plan.memory.safetyMargin.bytes)}`,
    "",
    "PLAN",
    `${result.plan.strategy} — ${result.plan.status}`,
    "",
    "WHY",
    ...result.plan.reasons.map((reason) => `✓ ${reason}`),
    ...result.plan.warnings.map((warning) => `! ${warning}`)
  ];

  return lines.join("\n");
}
