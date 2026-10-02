export interface ModelCapabilities {
  streaming: boolean;
  tools: boolean;
  vision: boolean;
  embeddings: boolean;
}

export interface ModelRequest {
  model: string;
  messages: readonly { role: "system" | "user" | "assistant" | "tool"; content: string }[];
  signal?: AbortSignal;
}

export interface ModelResponse {
  model: string;
  content: string;
}

export interface ChatModel {
  generate(request: ModelRequest): Promise<ModelResponse>;
  capabilities(): ModelCapabilities;
}
