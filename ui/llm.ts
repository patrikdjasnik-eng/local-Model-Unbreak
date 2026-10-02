import "./llm.css";

type LlmRole = "user" | "assistant" | "system";

interface LlmMessage {
  role: LlmRole;
  content: string;
}

interface CatalogModel {
  id: string;
  name: string;
  sizeGb: number;
}

interface RuntimeState {
  status: "stopped" | "starting" | "running" | "error";
  modelId: string | null;
  modelName: string | null;
  profile: "gpu" | "cpu" | null;
  error: string | null;
}

interface ModelsResponse {
  data?: Array<{
    id?: unknown;
    name?: unknown;
    sizeGb?: unknown;
  }>;
  runtime?: RuntimeState;
}

interface ChatResponse {
  choices?: Array<{ message?: { content?: unknown } }>;
}

const STORAGE_KEY = "model-unbreak.local-ai.history.v1";
const MODEL_KEY = "model-unbreak.local-ai.model.v1";
const SYSTEM_PROMPT = [
  "You are Model Unbreak Local AI, a local-only assistant for model inspection and runtime planning.",
  "Be concise, technical and honest about uncertainty.",
  "Never claim a system action happened unless the UI provides a real result.",
  "Answer in the same language as the user."
].join(" ");

export function sanitizeHistory(value: unknown, limit = 20): LlmMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({ role: item.role, content: item.content }))
    .filter((item): item is LlmMessage =>
      (item.role === "user" || item.role === "assistant") &&
      typeof item.content === "string" &&
      item.content.trim().length > 0
    )
    .slice(-limit)
    .map((item) => ({ role: item.role, content: item.content.trim() }));
}

export class LocalLlmClient {
  constructor(private readonly baseUrl = "/api") {}

  async listModels(signal?: AbortSignal): Promise<{ models: CatalogModel[]; runtime: RuntimeState | null }> {
    const response = await fetch(`${this.baseUrl}/models`, {
      method: "GET",
      headers: { Accept: "application/json" },
      ...(signal ? { signal } : {})
    });

    if (!response.ok) throw new Error(`Model catalog request failed: ${response.status}`);

    const payload = await response.json() as ModelsResponse;
    const models = (payload.data ?? [])
      .map((item) => ({
        id: typeof item.id === "string" ? item.id.trim() : "",
        name: typeof item.name === "string" ? item.name.trim() : "",
        sizeGb: typeof item.sizeGb === "number" && Number.isFinite(item.sizeGb) ? item.sizeGb : 0
      }))
      .filter((item) => item.id.length > 0)
      .map((item) => ({
        ...item,
        name: item.name || item.id
      }));

    return { models, runtime: payload.runtime ?? null };
  }

  async activateModel(modelId: string, signal?: AbortSignal): Promise<RuntimeState> {
    const response = await fetch(`${this.baseUrl}/runtime/activate`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ modelId }),
      ...(signal ? { signal } : {})
    });

    const payload = await response.json().catch(() => ({})) as Partial<RuntimeState> & { error?: string };
    if (!response.ok) throw new Error(payload.error || `Model activation failed: ${response.status}`);
    return payload as RuntimeState;
  }

  async chat(
    model: string,
    messages: readonly LlmMessage[],
    options: { temperature?: number; maxTokens?: number; signal?: AbortSignal } = {}
  ): Promise<string> {
    const cleanModel = model.trim();
    if (!cleanModel) throw new Error("No local model is selected.");

    const response = await fetch(`${this.baseUrl}/chat`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: cleanModel,
        messages,
        temperature: options.temperature ?? 0.2,
        maxTokens: options.maxTokens ?? 1024,
        stream: false
      }),
      ...(options.signal ? { signal: options.signal } : {})
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(detail || `llama.cpp chat request failed: ${response.status}`);
    }

    const payload = await response.json() as ChatResponse;
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw new Error("The local model returned an empty response.");
    }

    return content.trim();
  }
}

const client = new LocalLlmClient();
const dashboard = document.querySelector<HTMLElement>(".dashboard-grid");
const headlineTitle = document.querySelector<HTMLElement>(".headline h1");
const headlineCopy = document.querySelector<HTMLElement>(".headline p");

function loadHistory(): LlmMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeHistory(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: readonly LlmMessage[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-20)));
}

if (dashboard) {
  const workspace = document.createElement("section");
  workspace.className = "llm-workspace";
  workspace.dataset.llmWorkspace = "";
  workspace.hidden = true;
  workspace.innerHTML = `
    <div class="llm-header">
      <div>
        <span class="llm-kicker">LOCAL INTELLIGENCE / LLAMA.CPP</span>
        <h2>Model Unbreak AI Console</h2>
        <p>Vyber lokální GGUF model. Model Unbreak ho sám spustí a připojí k chatu.</p>
      </div>
      <div class="llm-runtime">
        <span class="llm-state" data-llm-state><i></i><strong>CHECKING</strong></span>
        <button class="llm-ghost" type="button" data-llm-refresh>Reconnect</button>
      </div>
    </div>

    <div class="llm-layout">
      <aside class="llm-side">
        <div class="llm-side-title">LOCAL RUNTIME</div>
        <label class="llm-field">
          <span>Model</span>
          <select data-llm-model><option value="">Detecting models…</option></select>
        </label>
        <label class="llm-field">
          <span>Temperature</span>
          <input data-llm-temperature type="number" min="0" max="2" step="0.1" value="0.2">
        </label>
        <label class="llm-field">
          <span>Max tokens</span>
          <input data-llm-max-tokens type="number" min="64" max="8192" step="64" value="1024">
        </label>
        <div class="llm-runtime-card">
          <span>Endpoint</span>
          <strong>127.0.0.1:8787</strong>
          <small>Automatický runtime · bez ručního spouštění modelu</small>
        </div>
        <div class="llm-runtime-card">
          <span>Privacy</span>
          <strong>LOCAL ONLY</strong>
          <small>Historie zůstává v localStorage prohlížeče.</small>
        </div>
        <button class="llm-danger" type="button" data-llm-clear>Clear conversation</button>
      </aside>

      <section class="llm-console">
        <div class="llm-messages" data-llm-messages>
          <div class="llm-welcome" data-llm-welcome>
            <div class="llm-orb">MU</div>
            <span>MODEL UNBREAK / LOCAL AI</span>
            <h3>Local model ready for work.</h3>
            <p>Vyber model vlevo a rovnou piš. Backend model automaticky načte, spustí llama-server a při problému zkusí CPU fallback.</p>
            <div class="llm-suggestions">
              <button type="button" data-llm-prompt="Vysvětli mi rozdíl mezi GPU offloadem a čistým CPU inference.">GPU offload vs CPU</button>
              <button type="button" data-llm-prompt="Navrhni bezpečné nastavení context size pro 8B Q4 model na 8 GB VRAM.">8 GB VRAM plan</button>
              <button type="button" data-llm-prompt="Jak poznám, že GGUF model používá příliš mnoho RAM nebo VRAM?">Memory diagnostics</button>
            </div>
          </div>
        </div>

        <form class="llm-composer" data-llm-form>
          <textarea data-llm-input rows="3" maxlength="12000" placeholder="Napiš zprávu lokálnímu modelu…"></textarea>
          <div class="llm-composer-foot">
            <span>Enter odešle · Shift+Enter nový řádek</span>
            <div>
              <button class="llm-stop" type="button" data-llm-stop hidden>Stop</button>
              <button class="llm-send" type="submit" data-llm-send disabled>Send ↑</button>
            </div>
          </div>
        </form>
      </section>
    </div>
  `;

  dashboard.append(workspace);

  const state = workspace.querySelector<HTMLElement>("[data-llm-state]");
  const modelSelect = workspace.querySelector<HTMLSelectElement>("[data-llm-model]");
  const messages = workspace.querySelector<HTMLElement>("[data-llm-messages]");
  const welcome = workspace.querySelector<HTMLElement>("[data-llm-welcome]");
  const form = workspace.querySelector<HTMLFormElement>("[data-llm-form]");
  const input = workspace.querySelector<HTMLTextAreaElement>("[data-llm-input]");
  const sendButton = workspace.querySelector<HTMLButtonElement>("[data-llm-send]");
  const stopButton = workspace.querySelector<HTMLButtonElement>("[data-llm-stop]");
  const temperature = workspace.querySelector<HTMLInputElement>("[data-llm-temperature]");
  const maxTokens = workspace.querySelector<HTMLInputElement>("[data-llm-max-tokens]");

  let history = loadHistory();
  let busy = false;
  let controller: AbortController | null = null;

  function setRuntimeState(kind: "online" | "offline" | "checking", label: string): void {
    if (state) {
      state.dataset.state = kind;
      const strong = state.querySelector("strong");
      if (strong) strong.textContent = label;
    }

    const engineStatus = document.querySelector<HTMLElement>(".engine-title small");
    const engineDot = document.querySelector<HTMLElement>(".engine-title .status-dot");
    if (engineStatus) engineStatus.textContent = kind === "online" ? "Running" : kind === "checking" ? "Checking" : "Offline";
    engineDot?.classList.toggle("offline", kind === "offline");
  }

  function renderMessages(): void {
    if (!messages) return;
    messages.querySelectorAll("[data-llm-message]").forEach((node) => node.remove());
    if (welcome) welcome.hidden = history.length > 0;

    for (const message of history) {
      const row = document.createElement("article");
      row.dataset.llmMessage = "";
      row.className = `llm-message ${message.role}`;

      const role = document.createElement("span");
      role.textContent = message.role === "user" ? "YOU" : "MU";

      const content = document.createElement("p");
      content.textContent = message.content;

      row.append(role, content);
      messages.append(row);
    }

    messages.scrollTop = messages.scrollHeight;
  }

  function syncComposer(): void {
    if (!sendButton || !input || !modelSelect) return;
    sendButton.disabled = busy || !input.value.trim() || !modelSelect.value;
    sendButton.textContent = busy ? "WORKING…" : "Send ↑";
    if (stopButton) stopButton.hidden = !busy;
  }

  async function refreshModels(): Promise<void> {
    if (!modelSelect) return;
    setRuntimeState("checking", "SCANNING");
    modelSelect.disabled = true;

    try {
      const { models, runtime } = await client.listModels();
      modelSelect.innerHTML = "";

      if (models.length === 0) {
        modelSelect.innerHTML = '<option value="">No GGUF models discovered</option>';
        setRuntimeState("offline", "NO MODELS");
        return;
      }

      const remembered = localStorage.getItem(MODEL_KEY);
      for (const model of models) {
        const option = document.createElement("option");
        option.value = model.id;
        option.textContent = model.sizeGb > 0
          ? `${model.name} · ${model.sizeGb.toFixed(2)} GB`
          : model.name;
        modelSelect.append(option);
      }

      const preferred = runtime?.modelId ?? remembered;
      if (preferred && models.some((model) => model.id === preferred)) {
        modelSelect.value = preferred;
      }

      localStorage.setItem(MODEL_KEY, modelSelect.value);

      if (runtime?.status === "running" && runtime.modelId === modelSelect.value) {
        setRuntimeState("online", runtime.profile === "cpu" ? "ONLINE · CPU" : "ONLINE · GPU");
      } else {
        setRuntimeState("offline", "SELECT MODEL");
      }
    } catch (error) {
      modelSelect.innerHTML = '<option value="">Backend unavailable</option>';
      setRuntimeState("offline", "OFFLINE");
      console.error(error);
    } finally {
      modelSelect.disabled = false;
      syncComposer();
    }
  }

  async function activateSelectedModel(): Promise<void> {
    if (!modelSelect?.value || busy) return;

    busy = true;
    modelSelect.disabled = true;
    setRuntimeState("checking", "STARTING");
    syncComposer();

    try {
      const runtime = await client.activateModel(modelSelect.value);
      localStorage.setItem(MODEL_KEY, modelSelect.value);
      setRuntimeState("online", runtime.profile === "cpu" ? "ONLINE · CPU" : "ONLINE · GPU");
    } catch (error) {
      setRuntimeState("offline", "START FAILED");
      history = [...history, {
        role: "assistant",
        content: `Model se nepodařilo automaticky spustit: ${error instanceof Error ? error.message : "Unknown error"}`
      }].slice(-20);
      saveHistory(history);
      renderMessages();
    } finally {
      busy = false;
      modelSelect.disabled = false;
      syncComposer();
      input?.focus();
    }
  }

  async function sendMessage(): Promise<void> {
    const prompt = input?.value.trim() ?? "";
    const model = modelSelect?.value.trim() ?? "";
    if (!prompt || !model || busy) return;

    const previousHistory = history;
    history = [...history, { role: "user", content: prompt }].slice(-20);
    saveHistory(history);
    if (input) input.value = "";
    renderMessages();

    busy = true;
    controller = new AbortController();
    syncComposer();

    try {
      const response = await client.chat(
        model,
        [{ role: "system", content: SYSTEM_PROMPT }, ...previousHistory, { role: "user", content: prompt }],
        {
          temperature: Number(temperature?.value ?? 0.2),
          maxTokens: Number(maxTokens?.value ?? 1024),
          signal: controller.signal
        }
      );

      history = [...history, { role: "assistant", content: response }].slice(-20);
      saveHistory(history);
      setRuntimeState("online", "ONLINE");
    } catch (error) {
      const aborted = error instanceof DOMException && error.name === "AbortError";
      const message = aborted
        ? "Generation stopped by user."
        : `Connection error: ${error instanceof Error ? error.message : "Local AI request failed."}`;

      history = [...history, { role: "assistant", content: message }].slice(-20);
      saveHistory(history);
      if (!aborted) setRuntimeState("offline", "ERROR");
    } finally {
      busy = false;
      controller = null;
      renderMessages();
      syncComposer();
      input?.focus();
    }
  }

  renderMessages();
  void refreshModels();

  document.addEventListener("model-unbreak:navigate", (event) => {
    const detail = (event as CustomEvent<{ view?: string }>).detail;
    const localAi = detail?.view === "local-ai";
    dashboard.classList.toggle("ai-active", localAi);
    workspace.hidden = !localAi;

    if (headlineTitle) headlineTitle.textContent = localAi ? "Local AI" : "Dashboard";
    if (headlineCopy) {
      headlineCopy.textContent = localAi
        ? "Local llama.cpp console with persistent local conversation history."
        : "Control center for local model inspection, planning, and secure runtime execution.";
    }

    if (localAi) {
      input?.focus();
      void refreshModels();
    }
  });

  workspace.querySelector<HTMLButtonElement>("[data-llm-refresh]")?.addEventListener("click", () => void refreshModels());

  modelSelect?.addEventListener("change", () => {
    localStorage.setItem(MODEL_KEY, modelSelect.value);
    syncComposer();
    void activateSelectedModel();
  });

  input?.addEventListener("input", syncComposer);
  input?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    void sendMessage();
  });

  stopButton?.addEventListener("click", () => controller?.abort());

  workspace.querySelector<HTMLButtonElement>("[data-llm-clear]")?.addEventListener("click", () => {
    if (busy) return;
    history = [];
    localStorage.removeItem(STORAGE_KEY);
    renderMessages();
    syncComposer();
  });

  workspace.querySelectorAll<HTMLButtonElement>("[data-llm-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!input) return;
      input.value = button.dataset.llmPrompt ?? "";
      syncComposer();
      input.focus();
    });
  });
}
