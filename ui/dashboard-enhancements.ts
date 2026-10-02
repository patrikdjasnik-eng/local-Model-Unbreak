import "./github-dark.css";

const dashboard = document.querySelector<HTMLElement>(".dashboard-grid");
const nav = document.querySelector<HTMLElement>(".nav");

function readText(selector: string, fallback: string): string {
  return document.querySelector<HTMLElement>(selector)?.textContent?.trim() || fallback;
}

function addNavGroups(): void {
  if (!nav || nav.querySelector(".nav-group-label")) return;

  const items = [...nav.querySelectorAll<HTMLElement>(".nav-item")];
  const byLabel = new Map(items.map((item) => [item.dataset.nav, item]));

  const insert = (title: string, before: string): void => {
    const target = byLabel.get(before);
    if (!target) return;

    const label = document.createElement("div");
    label.className = "nav-group-label";
    label.textContent = title;
    nav.insertBefore(label, target);
  };

  insert("WORKSPACE", "Dashboard");
  insert("INFRASTRUCTURE", "Hardware");
  insert("SECURITY", "Security Lab");
  insert("SYSTEM", "Settings");
}

function createStatusOverview(): void {
  if (!dashboard || dashboard.querySelector(".system-status-panel")) return;

  const panel = document.createElement("section");
  panel.className = "panel system-status-panel";
  panel.innerHTML = `
    <div class="overview-head">
      <div>
        <span class="overview-kicker">SYSTEM STATUS</span>
        <h2>Local runtime overview</h2>
        <p>Model, hardware, runtime and security in one place.</p>
      </div>
      <button type="button" class="overview-refresh" data-overview-refresh>Refresh</button>
    </div>

    <div class="overview-cards">
      <button class="overview-card" type="button" data-overview-target="Local AI" data-overview-engine>
        <span class="overview-label">Local engine</span>
        <strong>Checking…</strong>
        <small>llama.cpp runtime</small>
      </button>

      <button class="overview-card" type="button" data-overview-target="Local AI" data-overview-model>
        <span class="overview-label">Active model</span>
        <strong>No model selected</strong>
        <small>Choose a local GGUF model</small>
      </button>

      <button class="overview-card" type="button" data-overview-target="Hardware" data-overview-gpu>
        <span class="overview-label">GPU / VRAM</span>
        <strong>Detecting…</strong>
        <small>Hardware telemetry</small>
      </button>

      <button class="overview-card" type="button" data-overview-target="Security Lab" data-overview-security>
        <span class="overview-label">Security</span>
        <strong>Hardened</strong>
        <small>Local-only sandbox</small>
      </button>

      <button class="overview-card" type="button" data-overview-target="Local AI" data-overview-context>
        <span class="overview-label">Context</span>
        <strong>4,096</strong>
        <small>Active context window</small>
      </button>
    </div>
  `;

  dashboard.prepend(panel);

  panel.querySelector<HTMLButtonElement>("[data-overview-refresh]")?.addEventListener("click", () => {
    document.dispatchEvent(new CustomEvent("model-unbreak:refresh-runtime"));
    window.setTimeout(syncOverview, 180);
  });

  panel.querySelectorAll<HTMLButtonElement>("[data-overview-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.overviewTarget;
      document.querySelector<HTMLButtonElement>(`[data-nav="${target}"]`)?.click();
    });
  });
}

function tunePrimaryActions(): void {
  const title = document.querySelector<HTMLElement>(".quick-actions-panel .panel-heading h2");
  const copy = document.querySelector<HTMLElement>(".quick-actions-panel .panel-heading p");

  if (title) title.textContent = "PRIMARY ACTIONS";
  if (copy) copy.textContent = "Start the workflows you are most likely to use.";

  document.querySelector<HTMLButtonElement>('.quick-card[data-action="catalog"]')?.remove();

  const inspect = document.querySelector<HTMLButtonElement>('.quick-card[data-action="inspect"]');
  const scan = document.querySelector<HTMLButtonElement>('.quick-card[data-action="hardware"]');
  const planner = document.querySelector<HTMLButtonElement>('.quick-card[data-action="planner"]');

  inspect?.querySelector("strong")?.replaceChildren("Inspect / run model");
  inspect?.querySelector("small")?.replaceChildren("Choose a GGUF model and open Local AI");
  scan?.querySelector("small")?.replaceChildren("Read real CPU, RAM, GPU and VRAM");
  planner?.querySelector("small")?.replaceChildren("Build a plan from detected hardware");
}

function syncOverview(): void {
  const engine = document.querySelector<HTMLElement>("[data-overview-engine]");
  const model = document.querySelector<HTMLElement>("[data-overview-model]");
  const gpu = document.querySelector<HTMLElement>("[data-overview-gpu]");
  const security = document.querySelector<HTMLElement>("[data-overview-security]");
  const context = document.querySelector<HTMLElement>("[data-overview-context]");

  if (engine) {
    const state = readText(".engine-title small", "Checking");
    const detail = readText(".engine-card dl div:first-child dd", "llama.cpp");
    engine.querySelector("strong")!.textContent = state;
    engine.querySelector("small")!.textContent = detail;
    engine.classList.toggle("is-good", /running|online|connected/i.test(state));
  }

  if (model) {
    const selected = document.querySelector<HTMLSelectElement>("[data-llm-model]")?.selectedOptions[0]?.textContent?.trim();
    model.querySelector("strong")!.textContent = selected || "No model selected";
    model.querySelector("small")!.textContent = selected ? "Ready in Local AI" : "Choose a local GGUF model";
  }

  if (gpu) {
    gpu.querySelector("strong")!.textContent = readText('[data-metric="gpu"] .metric-copy strong', "Detecting GPU");
    gpu.querySelector("small")!.textContent = readText('[data-metric="vram"] .metric-copy strong', "VRAM");
  }

  if (security) {
    security.querySelector("strong")!.textContent = readText(".hardened-pill strong", "HARDENED");
    security.querySelector("small")!.textContent = "Local-only sandbox";
    security.classList.add("is-good");
  }

  if (context) {
    context.querySelector("strong")!.textContent = readText(".engine-card dl div:nth-child(3) dd", "4,096");
    context.querySelector("small")!.textContent = "Active context window";
  }
}

function createMascot(): void {
  const actions = document.querySelector<HTMLElement>(".window-actions");
  if (!actions || actions.querySelector("[data-unbreak-mascot]")) return;

  const mascot = document.createElement("button");
  mascot.type = "button";
  mascot.className = "unbreak-mascot";
  mascot.dataset.unbreakMascot = "";
  mascot.setAttribute("aria-label", "Open Local AI");
  mascot.title = "Unbreak · local AI companion";
  mascot.innerHTML = `
    <span class="mascot-tooltip">Open Local AI</span>
    <svg viewBox="0 0 72 72" aria-hidden="true">
      <defs>
        <linearGradient id="mascotFace" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#21262d"/>
          <stop offset="1" stop-color="#161b22"/>
        </linearGradient>
      </defs>

      <g class="mascot-shadow">
        <ellipse cx="36" cy="61" rx="20" ry="4"/>
      </g>

      <g class="mascot-body">
        <g class="mascot-ear mascot-ear-left">
          <path d="M21 28 16 6c-.5-2.2 2.2-3.7 3.8-2.2l13.1 13.4Z"/>
          <path class="mascot-ear-inner" d="m22.5 21-3-12 8.2 8.5Z"/>
        </g>
        <g class="mascot-ear mascot-ear-right">
          <path d="m51 28 5-22c.5-2.2-2.2-3.7-3.8-2.2L39.1 17.2Z"/>
          <path class="mascot-ear-inner" d="m49.5 21 3-12-8.2 8.5Z"/>
        </g>

        <path class="mascot-head" d="M17 27 29 18h14l12 9v20L45 57H27L17 47Z"/>
        <path class="mascot-face-line" d="M23 31 31 27h10l8 4"/>
        <path class="mascot-cheek" d="M22 45h7M43 45h7"/>

        <g class="mascot-eyes">
          <rect class="mascot-eye mascot-eye-left" x="25" y="34" width="8" height="5" rx="2.5"/>
          <rect class="mascot-eye mascot-eye-right" x="39" y="34" width="8" height="5" rx="2.5"/>
        </g>

        <path class="mascot-nose" d="m36 41-2.5 2h5Z"/>
        <path class="mascot-mouth" d="M31 48c2 2 8 2 10 0"/>
        <path class="mascot-mark" d="M36 21v7M32.5 24.5h7"/>
      </g>

      <g class="mascot-scan">
        <path d="M13 39h46"/>
      </g>
    </svg>
    <span class="mascot-status-dot"></span>
  `;

  actions.insertBefore(mascot, actions.firstChild);

  mascot.addEventListener("click", () => {
    document.querySelector<HTMLButtonElement>('[data-nav="Local AI"]')?.click();
  });

  const moods = ["is-winking", "is-scanning", "is-bobbing"] as const;
  let timer = 0;

  const schedule = (): void => {
    window.clearTimeout(timer);
    const delay = 5500 + Math.floor(Math.random() * 5000);

    timer = window.setTimeout(() => {
      if (document.hidden) {
        schedule();
        return;
      }

      const mood = moods[Math.floor(Math.random() * moods.length)] ?? "is-winking";
      mascot.classList.add(mood);

      window.setTimeout(() => mascot.classList.remove(mood), mood === "is-scanning" ? 1600 : 850);
      schedule();
    }, delay);
  };

  schedule();

  const updateRuntimeMood = (): void => {
    const state = readText(".engine-title small", "Checking");
    const online = /running|online|connected/i.test(state);
    mascot.classList.toggle("is-offline", !online);
    mascot.title = online
      ? "Unbreak · Local AI is ready"
      : "Unbreak · Local runtime is offline";
  };

  const engine = document.querySelector(".engine-card");
  if (engine) {
    new MutationObserver(updateRuntimeMood).observe(engine, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true
    });
  }

  updateRuntimeMood();
}

function observeRuntime(): void {
  const observer = new MutationObserver(() => syncOverview());
  const targets = [
    document.querySelector(".engine-card"),
    document.querySelector(".snapshot-panel"),
    document.querySelector(".model-panel"),
    document.querySelector(".hardened-pill")
  ].filter((item): item is Element => Boolean(item));

  for (const target of targets) {
    observer.observe(target, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true
    });
  }

  document.addEventListener("model-unbreak:navigate", () => window.setTimeout(syncOverview, 120));
  document.addEventListener("model-unbreak:refresh-runtime", () => window.setTimeout(syncOverview, 220));
}

addNavGroups();
createStatusOverview();
tunePrimaryActions();
createMascot();
observeRuntime();
window.setTimeout(syncOverview, 100);
