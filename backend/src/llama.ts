export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface ModelsResponse {
  data?: Array<{ id?: unknown }>;
}

interface ChatResponse {
  choices?: Array<{ message?: { content?: unknown } }>;
}

export class LlamaService {
  constructor(
    private readonly baseUrl: string,
    private readonly timeoutMs = 30000,
    private readonly fetchImpl: typeof fetch = fetch
  ) {}

  private async request(path: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      return await this.fetchImpl(`${this.baseUrl}${path}`, {
        ...init,
        signal: controller.signal
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error("llama.cpp request timed out.");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  async listModels(): Promise<string[]> {
    const response = await this.request("/v1/models", {
      method: "GET",
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      throw new Error(`llama.cpp models request failed: ${response.status}`);
    }

    const payload = await response.json() as ModelsResponse;
    return (payload.data ?? [])
      .map((item) => typeof item.id === "string" ? item.id.trim() : "")
      .filter(Boolean);
  }

  async chat(
    model: string,
    messages: readonly ChatMessage[],
    options: { temperature: number; maxTokens: number }
  ): Promise<string> {
    const response = await this.request("/v1/chat/completions", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        stream: false
      })
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(detail || `llama.cpp chat request failed: ${response.status}`);
    }

    const payload = await response.json() as ChatResponse;
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw new Error("llama.cpp returned an empty response.");
    }

    return content.trim();
  }

  async health(): Promise<{ reachable: boolean; models: string[] }> {
    try {
      return { reachable: true, models: await this.listModels() };
    } catch {
      return { reachable: false, models: [] };
    }
  }
}
