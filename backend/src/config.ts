const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);

export interface BackendConfig {
  host: string;
  port: number;
  llamaHost: string;
  llamaPort: number;
  llamaUrl: string;
  requestTimeoutMs: number;
}

function parsePort(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? String(fallback), 10);
  return Number.isFinite(parsed) && parsed > 0 && parsed < 65536 ? parsed : fallback;
}

export function resolveLocalUrl(value: string | undefined, fallback: string): string {
  const candidate = value?.trim() || fallback;
  const url = new URL(candidate);

  if (!LOOPBACK_HOSTS.has(url.hostname)) {
    throw new Error("Local runtime URL must use localhost or a loopback address.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Local runtime URL must use HTTP or HTTPS.");
  }

  return url.origin;
}

export function loadBackendConfig(env: NodeJS.ProcessEnv = process.env): BackendConfig {
  const port = parsePort(env.MODEL_UNBREAK_PORT, 8787);
  const llamaPort = parsePort(env.MODEL_UNBREAK_LLAMA_PORT, 8081);
  const parsedTimeout = Number.parseInt(env.MODEL_UNBREAK_TIMEOUT_MS ?? "30000", 10);
  const llamaHost = "127.0.0.1";
  const llamaUrl = resolveLocalUrl(env.LLAMA_URL, `http://${llamaHost}:${llamaPort}`);

  return {
    host: "127.0.0.1",
    port,
    llamaHost,
    llamaPort: Number(new URL(llamaUrl).port || llamaPort),
    llamaUrl,
    requestTimeoutMs: Number.isFinite(parsedTimeout) && parsedTimeout >= 1000 ? parsedTimeout : 30000
  };
}
