import { spawn } from "node:child_process";
import { relative } from "node:path";
import { resolveInsideRoot } from "./path.js";
import type { SafeCell, SafeCellCapabilities, SafeCellExecutionRequest, SafeCellExecutionResult } from "./types.js";

const capabilities: SafeCellCapabilities = {
  filesystem: true,
  process: true,
  network: false
};

export interface DockerSafeCellOptions {
  workspaceRoot: string;
  image?: string;
  dockerCommand?: string;
  memoryMiB?: number;
  cpus?: number;
  pidsLimit?: number;
}

export function buildDockerArgs(
  options: DockerSafeCellOptions,
  request: SafeCellExecutionRequest
): string[] {
  if (request.argv.length === 0) throw new Error("argv must not be empty.");
  if (request.argv.length > 64) throw new Error("argv exceeds the SafeCell limit.");

  const workspaceRoot = resolveInsideRoot(options.workspaceRoot);
  const cwd = resolveInsideRoot(workspaceRoot, request.cwd ?? ".");
  const relativeCwd = relative(workspaceRoot, cwd).replaceAll("\\", "/");
  const workdir = relativeCwd ? `/workspace/${relativeCwd}` : "/workspace";

  return [
    "run",
    "--rm",
    "--network=none",
    "--read-only",
    "--tmpfs=/tmp:rw,noexec,nosuid,size=64m",
    "--cap-drop=ALL",
    "--security-opt=no-new-privileges",
    `--pids-limit=${options.pidsLimit ?? 64}`,
    `--memory=${options.memoryMiB ?? 512}m`,
    `--cpus=${options.cpus ?? 1}`,
    "--mount",
    `type=bind,src=${workspaceRoot},dst=/workspace,rw`,
    "--workdir",
    workdir,
    options.image ?? "python:3.12-alpine",
    ...request.argv
  ];
}

export class DockerSafeCell implements SafeCell {
  readonly capabilities = capabilities;
  private readonly dockerCommand: string;

  constructor(private readonly options: DockerSafeCellOptions) {
    this.dockerCommand = options.dockerCommand ?? "docker";
  }

  execute(request: SafeCellExecutionRequest): Promise<SafeCellExecutionResult> {
    if (request.signal.aborted) {
      return Promise.resolve({
        status: "CANCELLED",
        error: { code: "EXECUTION_CANCELLED", message: "SafeCell execution was cancelled before start." },
        durationMs: 0
      });
    }

    const startedAt = Date.now();
    const args = buildDockerArgs(this.options, request);

    return new Promise((resolveResult) => {
      const child = spawn(this.dockerCommand, args, { stdio: ["ignore", "pipe", "pipe"], shell: false });
      let stdout = "";
      let stderr = "";
      let settled = false;

      const finish = (result: SafeCellExecutionResult): void => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        request.signal.removeEventListener("abort", onAbort);
        resolveResult(result);
      };

      const onAbort = (): void => {
        child.kill("SIGKILL");
        finish({
          status: "CANCELLED",
          error: { code: "EXECUTION_CANCELLED", message: "SafeCell execution was cancelled." },
          durationMs: Date.now() - startedAt
        });
      };

      const timer = setTimeout(() => {
        child.kill("SIGKILL");
        finish({
          status: "TIMEOUT",
          error: { code: "SAFECELL_TIMEOUT", message: "SafeCell execution exceeded its timeout." },
          durationMs: Date.now() - startedAt
        });
      }, Math.max(1, request.timeoutMs));

      request.signal.addEventListener("abort", onAbort, { once: true });
      child.stdout?.setEncoding("utf8");
      child.stderr?.setEncoding("utf8");
      child.stdout?.on("data", (chunk: string) => { stdout += chunk; });
      child.stderr?.on("data", (chunk: string) => { stderr += chunk; });

      child.on("error", (error) => {
        finish({
          status: "FAILED",
          error: { code: "SAFECELL_START_FAILED", message: error.message },
          durationMs: Date.now() - startedAt
        });
      });

      child.on("close", (code) => {
        if (settled) return;
        finish({
          status: code === 0 ? "SUCCEEDED" : "FAILED",
          exitCode: code ?? -1,
          stdout: stdout.slice(0, 65_536),
          stderr: stderr.slice(0, 65_536),
          ...(code === 0 ? {} : {
            error: {
              code: "SAFECELL_PROCESS_FAILED",
              message: stderr.trim() || `Container exited with code ${String(code)}.`
            }
          }),
          durationMs: Date.now() - startedAt
        });
      });
    });
  }
}
