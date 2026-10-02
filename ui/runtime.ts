interface HardwareSnapshot {
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

interface HealthResponse {
  ok: boolean;
  localOnly: boolean;
  llama: {
    reachable: boolean;
    modelCount: number;
    models: string[];
  };
}

function formatGb(bytes: number): string {
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

function setMetric(
  key: string,
  value: string,
  detail: string,
  percent: number
): void {
  const row = document.querySelector<HTMLElement>(`[data-metric="${key}"]`);
  if (!row) return;

  const strong = row.querySelector<HTMLElement>(".metric-copy strong");
  const small = row.querySelector<HTMLElement>(".metric-copy small");
  const label = row.querySelector<HTMLElement>("[data-usage-label]");
  const bar = row.querySelector<HTMLElement>("[data-usage-bar]");

  if (strong) strong.textContent = value;
  if (small) small.textContent = detail;
  if (label) label.textContent = `${Math.max(0, Math.min(100, percent))}%`;
  if (bar) bar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
}

function updateEngine(health: HealthResponse): void {
  const title = document.querySelector<HTMLElement>(".engine-title small");
  const dot = document.querySelector<HTMLElement>(".engine-title .status-dot");
  if (title) title.textContent = health.llama.reachable ? "Running" : "Offline";
  dot?.classList.toggle("offline", !health.llama.reachable);

  document.querySelectorAll<HTMLElement>(".engine-card dl div").forEach((row) => {
    const key = row.querySelector("dt")?.textContent?.trim();
    const value = row.querySelector<HTMLElement>("dd");
    if (!value) return;

    if (key === "Models Loaded") value.textContent = String(health.llama.modelCount);
    if (key === "llama.cpp (CUDA)") value.textContent = health.llama.reachable ? "Connected" : "Offline";
  });
}

async function refreshRuntime(): Promise<void> {
  const [healthResult, hardwareResult] = await Promise.allSettled([
    fetch("/api/health", { headers: { Accept: "application/json" } }),
    fetch("/api/hardware", { headers: { Accept: "application/json" } })
  ]);

  if (healthResult.status === "fulfilled" && healthResult.value.ok) {
    const health = await healthResult.value.json() as HealthResponse;
    updateEngine(health);
  } else {
    const title = document.querySelector<HTMLElement>(".engine-title small");
    const dot = document.querySelector<HTMLElement>(".engine-title .status-dot");
    if (title) title.textContent = "Backend Offline";
    dot?.classList.add("offline");
  }

  if (hardwareResult.status !== "fulfilled" || !hardwareResult.value.ok) return;
  const hardware = await hardwareResult.value.json() as HardwareSnapshot;

  setMetric(
    "cpu",
    hardware.cpu.model,
    `${hardware.cpu.logicalCores} logical cores · ${hardware.cpu.architecture}`,
    0
  );

  setMetric(
    "ram",
    formatGb(hardware.memory.totalBytes),
    `${formatGb(hardware.memory.freeBytes)} available`,
    hardware.memory.usedPercent
  );

  if (hardware.gpu) {
    setMetric(
      "gpu",
      hardware.gpu.name,
      `${hardware.gpu.memoryTotalMb} MB VRAM · NVIDIA`,
      hardware.gpu.utilizationPercent
    );

    const vramUsedPercent = hardware.gpu.memoryTotalMb > 0
      ? Math.round((hardware.gpu.memoryUsedMb / hardware.gpu.memoryTotalMb) * 100)
      : 0;

    setMetric(
      "vram",
      `${(hardware.gpu.memoryTotalMb / 1024).toFixed(1)} GB VRAM`,
      `${((hardware.gpu.memoryTotalMb - hardware.gpu.memoryUsedMb) / 1024).toFixed(1)} GB available`,
      vramUsedPercent
    );
  } else {
    setMetric("gpu", "No NVIDIA GPU detected", "nvidia-smi unavailable", 0);
    setMetric("vram", "Unavailable", "No NVIDIA telemetry", 0);
  }

  if (hardware.storage) {
    setMetric(
      "storage",
      "System storage",
      `${formatGb(hardware.storage.freeBytes)} available`,
      hardware.storage.usedPercent
    );
  }
}

document.addEventListener("model-unbreak:refresh-runtime", () => {
  void refreshRuntime();
});

void refreshRuntime();
