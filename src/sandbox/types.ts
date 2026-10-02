export type SafeCellStatus = "SUCCEEDED" | "FAILED" | "CANCELLED" | "TIMEOUT";

export interface SafeCellCapabilities {
  filesystem: boolean;
  process: boolean;
  network: boolean;
}

export interface SafeCellExecutionRequest {
  argv: readonly string[];
  cwd?: string;
  timeoutMs: number;
  signal: AbortSignal;
}

export interface SafeCellExecutionResult {
  status: SafeCellStatus;
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  error?: {
    code: string;
    message: string;
  };
  durationMs: number;
}

export interface SafeCell {
  readonly capabilities: SafeCellCapabilities;
  execute(request: SafeCellExecutionRequest): Promise<SafeCellExecutionResult>;
}
