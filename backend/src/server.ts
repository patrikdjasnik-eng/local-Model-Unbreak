import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { loadBackendConfig } from "./config.js";
import { inspectHardware } from "./hardware.js";
import { LlamaService } from "./llama.js";
import { createApiHandler } from "./app.js";
import { discoverModels } from "./catalog.js";
import { RuntimeManager } from "./runtime-manager.js";

const MAX_BODY_BYTES = 64 * 1024;

async function readBody(request: IncomingMessage): Promise<string> {
  let total = 0;
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buffer.length;
    if (total > MAX_BODY_BYTES) throw new Error("Request body is too large.");
    chunks.push(buffer);
  }

  return Buffer.concat(chunks).toString("utf8");
}

function copyResponse(response: Response, outgoing: ServerResponse): Promise<void> {
  outgoing.statusCode = response.status;
  response.headers.forEach((value, key) => outgoing.setHeader(key, value));

  return response.arrayBuffer().then((buffer) => {
    outgoing.end(Buffer.from(buffer));
  });
}

export function createBackendServer() {
  const config = loadBackendConfig();
  const llama = new LlamaService(config.llamaUrl, config.requestTimeoutMs);
  const runtime = new RuntimeManager({
    host: config.llamaHost,
    port: config.llamaPort,
    models: () => discoverModels(),
    startupTimeoutMs: 45000
  });
  const handleApi = createApiHandler({ llama, runtime, inspectHardware });

  return createServer(async (incoming, outgoing) => {
    try {
      const method = incoming.method ?? "GET";
      const url = new URL(incoming.url ?? "/", `http://${config.host}:${config.port}`);
      const headers = new Headers();

      for (const [key, value] of Object.entries(incoming.headers)) {
        if (typeof value === "string") headers.set(key, value);
        else if (Array.isArray(value)) headers.set(key, value.join(", "));
      }

      const body = method === "GET" || method === "HEAD" ? undefined : await readBody(incoming);
      const request = new Request(url, {
        method,
        headers,
        ...(body ? { body } : {})
      });

      const response = await handleApi(request);
      await copyResponse(response, outgoing);
    } catch (error) {
      const status = error instanceof Error && error.message === "Request body is too large." ? 413 : 500;
      outgoing.statusCode = status;
      outgoing.setHeader("Content-Type", "application/json; charset=utf-8");
      outgoing.end(JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error."
      }));
    }
  });
}

if (process.env.NODE_ENV !== "test") {
  const config = loadBackendConfig();
  const server = createBackendServer();

  server.listen(config.port, config.host, () => {
    process.stdout.write(
      `Model Unbreak backend listening on http://${config.host}:${config.port} · llama.cpp ${config.llamaUrl}\n`
    );
  });
}
