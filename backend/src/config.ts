const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);

export interface BackendConfig {
  host: string;
  port: number;
  llamaUrl: string;
  requestTimeoutMs: number;
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
  const parsedPort = Number.parseInt(env.MODEL_UNBREAK_PORT ?? "8787", 10);
  const parsedTimeout = Number.parseInt(env.MODEL_UNBREAK_TIMEOUT_MS ?? "30000", 10);

  return {
    host: "127.0.0.1",
    port: Number.isFinite(parsedPort) && parsedPort > 0 && parsedPort < 65536 ? parsedPort : 8787,
    llamaUrl: resolveLocalUrl(env.LLAMA_URL, "http://127.0.0.1:8080"),
    requestTimeoutMs: Number.isFinite(parsedTimeout) && parsedTimeout >= 1000 ? parsedTimeout : 30000
  };
}
