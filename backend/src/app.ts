import type { HardwareSnapshot } from "./hardware.js";
import type { LlamaService, ChatMessage } from "./llama.js";
import type { RuntimeManager, RuntimeState } from "./runtime-manager.js";
import type { CatalogModel } from "./catalog.js";
import { createExecutionPlan } from "./planner.js";

export interface BackendDependencies {
  llama: Pick<LlamaService, "health" | "listModels" | "chat">;
  runtime: Pick<RuntimeManager, "getState" | "getCatalog" | "activate" | "ensureActive" | "stop">;
  inspectHardware: () => Promise<HardwareSnapshot>;
  now?: () => number;
}

interface ChatBody {
  model?: unknown;
  messages?: unknown;
  temperature?: unknown;
  maxTokens?: unknown;
}

interface ActivateBody {
  modelId?: unknown;
}

interface PlanBody {
  modelSizeGb?: unknown;
  contextSize?: unknown;
  ramGb?: unknown;
  vramGb?: unknown;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function clampNumber(value: unknown, fallback: number, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function sanitizeMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      role: item.role,
      content: item.content
    }))
    .filter((item): item is ChatMessage =>
      (item.role === "system" || item.role === "user" || item.role === "assistant") &&
      typeof item.content === "string" &&
      item.content.trim().length > 0
    )
    .slice(-24)
    .map((item) => ({
      role: item.role,
      content: item.content.trim().slice(0, 12000)
    }));
}

async function safeBody<T>(request: Request): Promise<T | null> {
  try {
    return await request.json() as T;
  } catch {
    return null;
  }
}

export function createApiHandler(deps: BackendDependencies): (request: Request) => Promise<Response> {
  const now = deps.now ?? Date.now;

  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/api/health") {
      const llama = await deps.llama.health();
      return json({
        ok: true,
        service: "model-unbreak-backend",
        localOnly: true,
        runtime: deps.runtime.getState(),
        llama: {
          reachable: llama.reachable,
          modelCount: llama.models.length,
          models: llama.models
        }
      });
    }

    if (request.method === "GET" && url.pathname === "/api/catalog") {
      try {
        const models = await deps.runtime.getCatalog();
        return json({
          data: models,
          runtime: deps.runtime.getState()
        });
      } catch (error) {
        return json({
          error: error instanceof Error ? error.message : "Local model catalog failed."
        }, 500);
      }
    }

    if (request.method === "POST" && url.pathname === "/api/runtime/activate") {
      const body = await safeBody<ActivateBody>(request);
      const modelId = typeof body?.modelId === "string" ? body.modelId.trim() : "";
      if (!modelId) return json({ error: "modelId is required" }, 400);

      try {
        const runtime = await deps.runtime.activate(modelId);
        return json(runtime);
      } catch (error) {
        return json({
          error: error instanceof Error ? error.message : "Model activation failed.",
          runtime: deps.runtime.getState()
        }, 500);
      }
    }

    if (request.method === "POST" && url.pathname === "/api/runtime/stop") {
      return json(await deps.runtime.stop());
    }

    if (request.method === "GET" && url.pathname === "/api/hardware") {
      try {
        return json(await deps.inspectHardware());
      } catch (error) {
        return json({
          error: error instanceof Error ? error.message : "Hardware inspection failed."
        }, 500);
      }
    }

    if (request.method === "GET" && url.pathname === "/api/models") {
      try {
        const models = await deps.runtime.getCatalog();
        return json({
          object: "list",
          data: models.map((model) => ({
            id: model.id,
            object: "model",
            owned_by: "local",
            name: model.name,
            sizeGb: model.sizeGb
          })),
          runtime: deps.runtime.getState()
        });
      } catch (error) {
        return json({
          error: error instanceof Error ? error.message : "Local model discovery failed."
        }, 500);
      }
    }

    if (request.method === "POST" && url.pathname === "/api/chat") {
      const body = await safeBody<ChatBody>(request);
      const model = typeof body?.model === "string" ? body.model.trim() : "";
      const messages = sanitizeMessages(body?.messages);

      if (!model) return json({ error: "model is required" }, 400);
      if (messages.length === 0) return json({ error: "at least one message is required" }, 400);

      const temperature = clampNumber(body?.temperature, 0.2, 0, 2);
      const maxTokens = Math.round(clampNumber(body?.maxTokens, 1024, 64, 8192));

      try {
        const runtime = await deps.runtime.ensureActive(model);
        const runtimeModel = runtime.modelName ?? model;
        const content = await deps.llama.chat(runtimeModel, messages, { temperature, maxTokens });
        return json({
          id: `local-${now()}`,
          object: "chat.completion",
          model: runtimeModel,
          runtime,
          choices: [{
            index: 0,
            finish_reason: "stop",
            message: { role: "assistant", content }
          }]
        });
      } catch (error) {
        return json({
          error: error instanceof Error ? error.message : "Local AI request failed."
        }, 502);
      }
    }

    if (request.method === "POST" && url.pathname === "/api/planner") {
      const body = await safeBody<PlanBody>(request);
      if (!body) return json({ error: "invalid JSON body" }, 400);

      const modelSizeGb = clampNumber(body.modelSizeGb, 4.5, 0.1, 512);
      const contextSize = Math.round(clampNumber(body.contextSize, 4096, 512, 1_048_576));
      const ramGb = clampNumber(body.ramGb, 0, 0, 4096);
      const vramGb = clampNumber(body.vramGb, 0, 0, 1024);

      return json(createExecutionPlan({ modelSizeGb, contextSize, ramGb, vramGb }));
    }

    if (request.method === "POST" && url.pathname === "/api/benchmark") {
      const body = await safeBody<ChatBody>(request);
      const model = typeof body?.model === "string" ? body.model.trim() : "";
      if (!model) return json({ error: "model is required" }, 400);

      const started = now();
      try {
        const runtime = await deps.runtime.ensureActive(model);
        const runtimeModel = runtime.modelName ?? model;
        const content = await deps.llama.chat(
          runtimeModel,
          [{ role: "user", content: "Reply with a concise one-sentence description of local LLM inference." }],
          { temperature: 0, maxTokens: 64 }
        );
        const elapsedMs = Math.max(1, now() - started);
        const estimatedTokens = Math.max(1, Math.round(content.length / 4));
        const estimatedTokensPerSecond = Number(((estimatedTokens * 1000) / elapsedMs).toFixed(2));

        return json({
          model: runtimeModel,
          runtime,
          elapsedMs,
          outputCharacters: content.length,
          estimatedTokens,
          estimatedTokensPerSecond,
          note: "Token rate is an estimate based on output characters, not tokenizer telemetry."
        });
      } catch (error) {
        return json({
          error: error instanceof Error ? error.message : "Benchmark failed."
        }, 502);
      }
    }

    return json({ error: "Not found" }, 404);
  };
}
