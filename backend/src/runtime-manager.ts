import { execFile, spawn } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import type { CatalogModel } from "./catalog.js";

const execFileAsync = promisify(execFile);

export interface RuntimeState {
  status: "stopped" | "starting" | "running" | "error";
  managed: boolean;
  modelId: string | null;
  modelName: string | null;
  pid: number | null;
  endpoint: string;
  profile: "gpu" | "cpu" | null;
  error: string | null;
}

interface RuntimeManagerOptions {
  host: string;
  port: number;
  models: () => Promise<CatalogModel[]>;
  binary?: string;
  startupTimeoutMs?: number;
  fetchImpl?: typeof fetch;
}

async function commandExists(command: string): Promise<string | null> {
  const isWindows = process.platform === "win32";
  const program = isWindows ? "where.exe" : "which";

  try {
    const { stdout } = await execFileAsync(program, [command], {
      timeout: 2000,
      windowsHide: true,
      maxBuffer: 32 * 1024
    });
    const first = stdout.trim().split(/\r?\n/)[0]?.trim();
    return first || null;
  } catch {
    return null;
  }
}

export class RuntimeManager {
  private process: ReturnType<typeof spawn> | null = null;
  private state: RuntimeState;
  private readonly fetchImpl: typeof fetch;
  private readonly startupTimeoutMs: number;

  constructor(private readonly options: RuntimeManagerOptions) {
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.startupTimeoutMs = options.startupTimeoutMs ?? 45000;
    this.state = {
      status: "stopped",
      managed: false,
      modelId: null,
      modelName: null,
      pid: null,
      endpoint: `http://${options.host}:${options.port}`,
      profile: null,
      error: null
    };
  }

  getState(): RuntimeState {
    return { ...this.state };
  }

  async getCatalog(): Promise<CatalogModel[]> {
    return this.options.models();
  }

  private async resolveBinary(): Promise<string> {
    const configured = this.options.binary?.trim() || process.env.LLAMA_SERVER_BIN?.trim();
    if (configured) return path.resolve(configured);

    for (const candidate of ["llama-server.exe", "llama-server"]) {
      const found = await commandExists(candidate);
      if (found) return found;
    }

    throw new Error(
      "llama-server was not found. Install llama.cpp or set LLAMA_SERVER_BIN once; Model Unbreak handles model switching afterwards."
    );
  }

  private async isReady(): Promise<boolean> {
    try {
      const response = await this.fetchImpl(`${this.state.endpoint}/v1/models`, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(1200)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async waitUntilReady(child: ReturnType<typeof spawn>): Promise<void> {
    const started = Date.now();

    while (Date.now() - started < this.startupTimeoutMs) {
      if (child.exitCode !== null) {
        throw new Error(`llama-server exited during startup with code ${child.exitCode}.`);
      }
      if (await this.isReady()) return;
      await new Promise((resolve) => setTimeout(resolve, 350));
    }

    throw new Error("llama-server did not become ready before the startup timeout.");
  }

  private async stopChild(): Promise<void> {
    const child = this.process;
    this.process = null;
    if (!child || child.exitCode !== null) return;

    child.kill("SIGTERM");
    await Promise.race([
      new Promise<void>((resolve) => child.once("exit", () => resolve())),
      new Promise<void>((resolve) => setTimeout(resolve, 2500))
    ]);

    if (child.exitCode === null) child.kill("SIGKILL");
  }

  async stop(): Promise<RuntimeState> {
    await this.stopChild();
    this.state = {
      ...this.state,
      status: "stopped",
      managed: false,
      modelId: null,
      modelName: null,
      pid: null,
      profile: null,
      error: null
    };
    return this.getState();
  }

  private async launch(model: CatalogModel, profile: "gpu" | "cpu"): Promise<void> {
    const binary = await this.resolveBinary();
    const gpuLayers = profile === "gpu" ? "999" : "0";
    const args = [
      "-m", model.path,
      "--host", this.options.host,
      "--port", String(this.options.port),
      "-ngl", gpuLayers,
      "-c", "4096"
    ];

    const child = spawn(binary, args, {
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let recentError = "";
    child.stderr?.on("data", (chunk: Buffer) => {
      recentError = (recentError + chunk.toString("utf8")).slice(-8000);
    });

    this.process = child;
    this.state = {
      status: "starting",
      managed: true,
      modelId: model.id,
      modelName: model.name,
      pid: child.pid ?? null,
      endpoint: this.state.endpoint,
      profile,
      error: null
    };

    try {
      await this.waitUntilReady(child);
      this.state = { ...this.state, status: "running", error: null };
    } catch (error) {
      await this.stopChild();
      const message = recentError.trim();
      throw new Error(message || (error instanceof Error ? error.message : "llama-server startup failed."));
    }
  }

  async activate(modelId: string): Promise<RuntimeState> {
    const models = await this.options.models();
    const model = models.find((item) => item.id === modelId);
    if (!model) throw new Error("Selected model is not in the local Model Unbreak catalog.");

    if (this.state.status === "running" && this.state.modelId === model.id && await this.isReady()) {
      return this.getState();
    }

    await this.stopChild();
    this.state = {
      ...this.state,
      status: "starting",
      managed: true,
      modelId: model.id,
      modelName: model.name,
      pid: null,
      profile: "gpu",
      error: null
    };

    try {
      await this.launch(model, "gpu");
    } catch (gpuError) {
      try {
        await this.launch(model, "cpu");
      } catch (cpuError) {
        const error = cpuError instanceof Error ? cpuError.message : String(cpuError);
        this.state = {
          ...this.state,
          status: "error",
          managed: false,
          pid: null,
          profile: null,
          error: `GPU start failed; CPU fallback also failed: ${error}`
        };
        throw new Error(this.state.error);
      }
    }

    return this.getState();
  }

  async ensureActive(modelId: string): Promise<RuntimeState> {
    return this.activate(modelId);
  }
}
