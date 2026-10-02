import "./styles.css";

type IconName =
  | "dashboard"
  | "search"
  | "planner"
  | "cpu"
  | "shield"
  | "nodes"
  | "catalog"
  | "settings"
  | "bolt"
  | "play"
  | "database"
  | "refresh"
  | "server"
  | "ram"
  | "gpu"
  | "storage"
  | "check"
  | "lock"
  | "network"
  | "plus"
  | "chart"
  | "cube"
  | "moon"
  | "close"
  | "minimize"
  | "maximize"
  | "chevron"
  | "more";

interface NavItem {
  label: string;
  icon: IconName;
}

interface Metric {
  label: string;
  value: string;
  detail: string;
  percent: number;
  icon: IconName;
  accent?: "blue" | "cyan" | "green";
}

interface PolicyRow {
  id: string;
  label: string;
  permission: "ALLOW" | "DENY";
  enabled: boolean;
  icon: IconName;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: "dashboard" },
  { label: "Model Inspector", icon: "search" },
  { label: "Planner", icon: "planner" },
  { label: "Hardware", icon: "cpu" },
  { label: "Security Lab", icon: "shield" },
  { label: "Nodes", icon: "nodes" },
  { label: "Catalog", icon: "catalog" },
  { label: "Settings", icon: "settings" }
];

const metrics: Metric[] = [
  { label: "CPU", value: "AMD Ryzen 7 7800X3D", detail: "8 cores / 16 threads", percent: 12, icon: "cpu" },
  { label: "RAM", value: "32 GB DDR5", detail: "28.1 GB available", percent: 14, icon: "ram" },
  { label: "GPU", value: "NVIDIA GeForce RTX 4070 Ti", detail: "12 GB VRAM (CUDA)", percent: 22, icon: "gpu" },
  { label: "VRAM", value: "12 GB GDDR6X", detail: "9.3 GB available", percent: 22, icon: "gpu", accent: "cyan" },
  { label: "Storage", value: "NVMe SSD (System)", detail: "512 GB available", percent: 38, icon: "storage", accent: "green" }
];

const policies: PolicyRow[] = [
  { id: "filesystem.model.read", label: "filesystem.model.read", permission: "ALLOW", enabled: true, icon: "storage" },
  { id: "model.inspect", label: "model.inspect", permission: "ALLOW", enabled: true, icon: "cube" },
  { id: "hardware.inspect", label: "hardware.inspect", permission: "ALLOW", enabled: true, icon: "cpu" },
  { id: "network.access", label: "network.access", permission: "DENY", enabled: true, icon: "network" }
];

const icons: Record<IconName, string> = {
  dashboard: '<path d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6V11h-6v9Zm0-16v5h6V4h-6Z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
  planner: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
  cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4"/><rect x="9" y="9" width="6" height="6" rx="1"/>',
  shield: '<path d="M12 3 19 6v5c0 5-3 8.4-7 10-4-1.6-7-5-7-10V6l7-3Z"/><path d="m9.3 12 1.8 1.8 3.8-4"/>',
  nodes: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="m8 7 3 8M16 7l-3 8M8.5 6h7"/>',
  catalog: '<path d="M4 5.5 12 2l8 3.5L12 9 4 5.5Z"/><path d="m4 10 8 3.5 8-3.5M4 14.5 12 18l8-3.5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
  bolt: '<path d="m13 2-8 12h6l-1 8 8-12h-6l1-8Z"/>',
  play: '<path d="m8 5 11 7-11 7V5Z"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
  refresh: '<path d="M20 6v5h-5"/><path d="M4 18v-5h5"/><path d="M7 8a7 7 0 0 1 11-1.5L20 8M4 16l2 1.5A7 7 0 0 0 17 16"/>',
  server: '<rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 7h.01M7 17h.01M11 7h7M11 17h7"/>',
  ram: '<rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 10h2v4H7zM11 10h2v4h-2zM15 10h2v4h-2zM6 17v3M10 17v3M14 17v3M18 17v3"/>',
  gpu: '<rect x="4" y="6" width="16" height="12" rx="2"/><circle cx="10" cy="12" r="3"/><path d="M15 10h2M15 14h2M20 9h2M20 15h2"/>',
  storage: '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="12" r="3"/><path d="M15 9h2M15 13h2"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  network: '<circle cx="5" cy="12" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="m7 11 10-4M7 13l10 4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chart: '<path d="M4 19V9M10 19V5M16 19v-7M22 19V3"/>',
  cube: '<path d="m12 2 8 4.5v9L12 20l-8-4.5v-9L12 2Z"/><path d="m4 6.5 8 4.5 8-4.5M12 11v9"/>',
  moon: '<path d="M20 15.5A8 8 0 0 1 8.5 4a8 8 0 1 0 11.5 11.5Z"/>',
  close: '<path d="m7 7 10 10M17 7 7 17"/>',
  minimize: '<path d="M7 17h10"/>',
  maximize: '<rect x="7" y="7" width="10" height="10" rx="1"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'
};

const icon = (name: IconName, size = 18): string =>
  `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;

const metricMarkup = (metric: Metric): string => `
  <div class="metric-row" data-metric="${metric.label.toLowerCase()}">
    <div class="metric-icon">${icon(metric.icon, 15)}</div>
    <div class="metric-copy">
      <span class="metric-label">${metric.label}</span>
      <strong>${metric.value}</strong>
      <small>${metric.detail}</small>
    </div>
    <div class="metric-usage">
      <span data-usage-label>${metric.percent}%</span>
      <div class="microbar"><i class="${metric.accent ?? "blue"}" data-usage-bar style="width:${metric.percent}%"></i></div>
    </div>
  </div>
`;

const policyMarkup = (policy: PolicyRow): string => `
  <div class="policy-row" data-policy="${policy.id}">
    <span class="policy-icon">${icon(policy.icon, 14)}</span>
    <span class="policy-name">${policy.label}</span>
    <button class="policy-info" type="button" aria-label="Policy details">i</button>
    <button class="permission ${policy.permission === "DENY" ? "deny" : ""}" type="button" data-permission>
      ${policy.permission}
      ${icon("chevron", 12)}
    </button>
    <button class="switch ${policy.enabled ? "is-on" : ""}" type="button" role="switch" aria-checked="${policy.enabled}" data-switch>
      <span></span>
    </button>
  </div>
`;

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Application root not found.");

app.innerHTML = `
  <main class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">${icon("cube", 27)}</div>
        <div>
          <strong>Model Unbreak</strong>
          <span>v0.3.1</span>
        </div>
      </div>

      <nav class="nav" aria-label="Primary navigation">
        ${navItems.map((item, index) => `
          <button class="nav-item ${index === 0 ? "active" : ""}" type="button" data-nav="${item.label}">
            ${icon(item.icon, 17)}
            <span>${item.label}</span>
          </button>
        `).join("")}
      </nav>

      <section class="engine-card">
        <div class="engine-title">
          <span class="status-dot"></span>
          <div><strong>Local Engine</strong><small>Running</small></div>
        </div>
        <dl>
          <div><dt>llama.cpp (CUDA)</dt><dd>v0.3.1</dd></div>
          <div><dt>Models Loaded</dt><dd>2</dd></div>
          <div><dt>Active Context</dt><dd>4,096</dd></div>
          <div><dt>GPU Offload</dt><dd>Enabled</dd></div>
        </dl>
      </section>

      <div class="sidebar-footer">
        <span><i class="status-dot tiny"></i> Ready</span>
        <span class="divider"></span>
        <span>${icon("check", 14)} Local engine running (llama.cpp)</span>
      </div>
    </aside>

    <section class="workspace">
      <header class="topbar">
        <div class="headline">
          <div class="headline-mark">${icon("cube", 24)}</div>
          <div>
            <h1>Dashboard</h1>
            <p>Control center for local model inspection, planning, and secure runtime execution.</p>
          </div>
        </div>
        <div class="window-actions">
          <button class="hardened-pill" type="button" data-action="security">
            ${icon("shield", 18)}
            <span><strong>HARDENED</strong><small>Secure sandbox active</small></span>
            ${icon("chevron", 13)}
          </button>
          <button class="icon-button" type="button" aria-label="Theme">${icon("moon", 17)}</button>
          <button class="window-button" type="button" aria-label="Minimize">${icon("minimize", 14)}</button>
          <button class="window-button" type="button" aria-label="Maximize">${icon("maximize", 13)}</button>
          <button class="window-button" type="button" aria-label="Close">${icon("close", 13)}</button>
        </div>
      </header>

      <div class="dashboard-grid">
        <section class="panel quick-actions-panel">
          <div class="panel-heading">
            <span class="section-icon purple">${icon("bolt", 17)}</span>
            <div><h2>QUICK ACTIONS</h2><p>Common workflows to get started quickly.</p></div>
          </div>
          <div class="quick-actions">
            <button class="quick-card primary" type="button" data-action="inspect">
              ${icon("play", 22)}
              <span><strong>Inspect Model</strong><small>Analyze GGUF models</small></span>
              ${icon("chevron", 16)}
            </button>
            <button class="quick-card" type="button" data-action="hardware">
              <span class="mini-icon">${icon("cpu", 18)}</span>
              <span><strong>Scan Hardware</strong><small>Check system compatibility</small></span>
              ${icon("chevron", 16)}
            </button>
            <button class="quick-card" type="button" data-action="planner">
              <span class="mini-icon">${icon("planner", 18)}</span>
              <span><strong>Open Planner</strong><small>Generate execution plan</small></span>
              ${icon("chevron", 16)}
            </button>
            <button class="quick-card" type="button" data-action="catalog">
              <span class="mini-icon">${icon("database", 18)}</span>
              <span><strong>View Catalog</strong><small>Browse local models</small></span>
              ${icon("chevron", 16)}
            </button>
          </div>
        </section>

        <section class="panel snapshot-panel">
          <div class="panel-heading compact">
            <span class="section-icon blue">${icon("cpu", 16)}</span>
            <h2>SYSTEM SNAPSHOT</h2>
            <button class="mini-button" type="button" data-action="refresh">${icon("refresh", 12)} Refresh</button>
          </div>
          <div class="metric-list">
            ${metrics.map(metricMarkup).join("")}
          </div>
        </section>

        <section class="panel model-panel">
          <div class="panel-heading compact">
            <span class="section-icon purple">${icon("cube", 16)}</span>
            <h2>RECENT MODEL INSPECTION</h2>
            <button class="mini-button" type="button" data-action="catalog">View All</button>
          </div>
          <div class="model-card">
            <div class="model-art" aria-hidden="true">
              <div class="wolf">◢</div>
              <div class="model-glow"></div>
            </div>
            <div class="model-meta">
              <div class="model-title"><strong>Llama 3.1 8B Instruct</strong><span>GGUF</span></div>
              <small>Meta Llama 3.1</small>
              <dl>
                <div><dt>Architecture</dt><dd>Llama (3.1)</dd></div>
                <div><dt>Quantization</dt><dd>Q4_K_M</dd></div>
                <div><dt>File Size</dt><dd>4.37 GB</dd></div>
                <div><dt>Context Length</dt><dd>131,072</dd></div>
                <div><dt>Tokenizer</dt><dd>tiktoken (llama3)</dd></div>
              </dl>
            </div>
          </div>
          <button class="recommendation" type="button" data-action="feasibility">
            <span class="recommendation-check">${icon("check", 18)}</span>
            <span><small>Recommended Plan</small><strong>GPU + RAM Offload</strong><em>Run on GPU with partial offload to system RAM.</em></span>
            <span class="feasible">Feasible</span>
            ${icon("chevron", 15)}
          </button>
        </section>

        <section class="panel execution-panel">
          <div class="panel-heading compact">
            <span class="section-icon purple">${icon("bolt", 16)}</span>
            <h2>EXECUTION SUMMARY</h2>
            <span class="tag green">RECOMMENDED</span>
          </div>
          <div class="execution-layout">
            <div class="plan-choice">
              <div class="plan-badge">
                <strong>GPU + RAM OFFLOAD</strong>
                <span>Run on GPU with partial offload to system RAM.</span>
                <em>Feasible</em>
              </div>
              <ul class="check-list">
                <li>${icon("check", 12)} Fits in 12 GB VRAM with offloading</li>
                <li>${icon("check", 12)} Good balance of speed and memory usage</li>
                <li>${icon("check", 12)} Recommended for Q4_K_M quantization</li>
                <li>${icon("check", 12)} Supports long context (up to 131K)</li>
              </ul>
            </div>
            <div class="memory-estimate">
              <h3>Estimated Memory Usage</h3>
              <div class="legend">
                <span><i class="violet-dot"></i> Model Weights <strong>4.37 GB</strong></span>
                <span><i class="blue-dot"></i> KV Cache (4K) <strong>1.00 GB</strong></span>
                <span><i class="gray-dot"></i> Runtime Overhead <strong>0.50 GB</strong></span>
              </div>
              <div class="memory-bar"><i></i><b></b><span></span></div>
              <div class="memory-total"><span>Total Estimated</span><strong>7.04 <small>GB</small></strong></div>
              <div class="vram-row"><span>7.04 GB / 12.00 GB VRAM</span><strong>59%</strong></div>
            </div>
          </div>
        </section>

        <section class="panel security-panel">
          <div class="panel-heading compact">
            <span class="section-icon purple">${icon("shield", 16)}</span>
            <h2>SECURITY / CREEPING FROST</h2>
            <span class="tag green">HARDENED</span>
          </div>
          <p class="panel-copy">Sandboxed operations for model inspection and execution.</p>
          <div class="policy-list">
            ${policies.map(policyMarkup).join("")}
          </div>
          <div class="security-note">
            ${icon("lock", 14)}
            <span><strong>Model operations are restricted to your local machine.</strong><small>No data is sent to external servers.</small></span>
            <button type="button" data-action="security">Learn more ${icon("chevron", 11)}</button>
          </div>
        </section>

        <section class="panel nodes-panel">
          <div class="panel-heading compact">
            <span class="section-icon blue">${icon("nodes", 16)}</span>
            <h2>NODES</h2>
            <button class="mini-button" type="button" data-action="add-node">${icon("plus", 12)} Add Node</button>
          </div>
          <p class="panel-copy">Local and remote inference nodes.</p>
          <div class="node-list">
            <div class="node-row"><i class="node-dot online"></i><span><strong>local (this machine)</strong><small>RTX 4070 Ti · 12 GB VRAM</small></span><em class="active-chip">Active</em>${icon("more", 15)}</div>
            <div class="node-row muted"><i class="node-dot"></i><span><strong>workstation-01</strong><small>Not available</small></span><em>Offline</em>${icon("more", 15)}</div>
            <div class="node-row muted"><i class="node-dot"></i><span><strong>cloud-node</strong><small>Optional remote node</small></span><em>Not Configured</em>${icon("more", 15)}</div>
          </div>
        </section>

        <section class="panel benchmark-panel">
          <div class="panel-heading compact">
            <span class="section-icon blue">${icon("chart", 16)}</span>
            <h2>BENCHMARK SNAPSHOT</h2>
            <button class="mini-button" type="button">Tokens/s⌄</button>
          </div>
          <div class="benchmark-body">
            <div class="chart-wrap">
              <svg class="benchmark-chart" viewBox="0 0 300 95" preserveAspectRatio="none" role="img" aria-label="Token performance by context length">
                <defs>
                  <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="#6d4aff" stop-opacity=".34"/>
                    <stop offset="100%" stop-color="#6d4aff" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <path class="gridline" d="M0 18H300M0 43H300M0 68H300"/>
                <path class="chart-area" d="M12 17 L65 32 L118 46 L170 58 L225 61 L280 60 L280 88 L12 88 Z"/>
                <path class="chart-line" d="M12 17 L65 32 L118 46 L170 58 L225 61 L280 60"/>
                <g class="chart-points"><circle cx="12" cy="17" r="3"/><circle cx="65" cy="32" r="3"/><circle cx="118" cy="46" r="3"/><circle cx="170" cy="58" r="3"/><circle cx="225" cy="61" r="3"/><circle cx="280" cy="60" r="3"/></g>
              </svg>
              <div class="chart-labels"><span>512</span><span>1K</span><span>2K</span><span>4K</span><span>8K</span><span>16K</span></div>
            </div>
            <div class="bench-summary">
              <strong>28 tok/s</strong>
              <small>@ 16K context</small>
            </div>
          </div>
          <div class="benchmark-footer">
            <span><b>${icon("chart", 14)}</b><strong>28 tok/s</strong><small>Estimated (16K)</small></span>
            <span><b>${icon("bolt", 14)}</b><strong>4K</strong><small>Fast Token</small></span>
            <span><b>${icon("database", 14)}</b><strong>1.2s</strong><small>First Token</small></span>
            <span><b>${icon("database", 14)}</b><strong>4,096</strong><small>Test Context</small></span>
          </div>
        </section>

        <section class="panel stats-panel">
          <div class="panel-heading compact">
            <span class="section-icon purple">${icon("chart", 16)}</span>
            <h2>QUICK STATS</h2>
            <button class="mini-button" type="button">Last 24 hours⌄</button>
          </div>
          <div class="stats-grid">
            <div><span>${icon("cube", 18)}</span><p><small>Models Inspected</small><strong>2 <em>+2 today</em></strong></p>${icon("chart", 18)}</div>
            <div><span>${icon("play", 18)}</span><p><small>Execution Plans</small><strong>3 <em>+3 today</em></strong></p>${icon("chart", 18)}</div>
            <div><span>${icon("cpu", 18)}</span><p><small>Hardware Scans</small><strong>5 <em>+5 today</em></strong></p>${icon("chart", 18)}</div>
            <div><span>${icon("shield", 18)}</span><p><small>Security Events</small><strong>0 <em>No issues</em></strong></p></div>
          </div>
        </section>
      </div>

      <footer class="statusbar">
        <span><i class="status-dot tiny"></i> Ready</span>
        <span>${icon("check", 13)} Local engine running (llama.cpp)</span>
        <span>${icon("check", 13)} 1 node online</span>
        <span class="status-spacer"></span>
        <span>${icon("storage", 13)} 7.04 GB estimated</span>
        <span>${icon("chart", 13)} 28 tok/s (est.)</span>
        <span><i class="status-dot tiny"></i> Model Unbreak v0.3.1</span>
      </footer>
    </section>

    <div class="toast-stack" aria-live="polite" aria-atomic="true"></div>

    <div class="modal-backdrop" hidden data-modal>
      <section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-icon">${icon("bolt", 22)}</div>
        <div class="modal-copy">
          <h2 id="modal-title">Action ready</h2>
          <p id="modal-description">The workflow is ready to continue.</p>
        </div>
        <button class="modal-close" type="button" data-modal-close aria-label="Close">${icon("close", 17)}</button>
        <div class="modal-actions">
          <button class="secondary-button" type="button" data-modal-close>Cancel</button>
          <button class="primary-button" type="button" data-confirm>Continue</button>
        </div>
      </section>
    </div>
  </main>
`;

const toastStack = document.querySelector<HTMLDivElement>(".toast-stack");
const modal = document.querySelector<HTMLDivElement>("[data-modal]");
const modalTitle = document.querySelector<HTMLHeadingElement>("#modal-title");
const modalDescription = document.querySelector<HTMLParagraphElement>("#modal-description");

function showToast(message: string, tone: "success" | "info" = "info"): void {
  if (!toastStack) return;
  const toast = document.createElement("div");
  toast.className = `toast ${tone}`;
  toast.innerHTML = `${icon(tone === "success" ? "check" : "bolt", 15)}<span>${message}</span>`;
  toastStack.append(toast);
  window.setTimeout(() => toast.remove(), 3200);
}

function openModal(title: string, description: string): void {
  if (!modal || !modalTitle || !modalDescription) return;
  modalTitle.textContent = title;
  modalDescription.textContent = description;
  modal.hidden = false;
  requestAnimationFrame(() => modal.classList.add("visible"));
}

function closeModal(): void {
  if (!modal) return;
  modal.classList.remove("visible");
  window.setTimeout(() => {
    modal.hidden = true;
  }, 160);
}

document.querySelectorAll<HTMLButtonElement>("[data-nav]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-nav]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    const destination = button.dataset.nav ?? "Dashboard";
    if (destination === "Dashboard") {
      showToast("Dashboard is already active.");
      return;
    }

    openModal(
      destination,
      `${destination} is wired into the navigation shell. The dedicated workspace can now be connected to the project runtime.`
    );
  });
});

document.querySelectorAll<HTMLButtonElement>("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    const actions: Record<string, [string, string]> = {
      inspect: ["Inspect Model", "Choose a local GGUF file and start a sandboxed metadata inspection."],
      hardware: ["Hardware Scan", "Refresh CPU, RAM, GPU, VRAM and storage compatibility for local inference."],
      planner: ["Execution Planner", "Generate an execution plan from model requirements and current hardware limits."],
      catalog: ["Model Catalog", "Open the local model catalog and compare quantization, size and context limits."],
      security: ["Creeping Frost", "Review sandbox policy, local-only guarantees and individual runtime permissions."],
      feasibility: ["GPU + RAM Offload", "This plan fits the current 12 GB VRAM profile with partial system-memory offload."],
      "add-node": ["Add inference node", "Pair another local or remote inference node with explicit permission boundaries."]
    };

    if (action === "refresh") {
      document.querySelectorAll<HTMLElement>("[data-metric]").forEach((row, index) => {
        const base = [12, 14, 22, 22, 38][index] ?? 20;
        const delta = Math.floor(Math.random() * 7) - 3;
        const next = Math.max(3, Math.min(92, base + delta));
        const label = row.querySelector<HTMLElement>("[data-usage-label]");
        const bar = row.querySelector<HTMLElement>("[data-usage-bar]");
        if (label) label.textContent = `${next}%`;
        if (bar) bar.style.width = `${next}%`;
      });
      showToast("System snapshot refreshed.", "success");
      return;
    }

    const actionConfig = action ? actions[action] : undefined;
    if (actionConfig) {
      openModal(actionConfig[0], actionConfig[1]);
    }
  });
});

document.querySelectorAll<HTMLButtonElement>("[data-switch]").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const isOn = toggle.classList.toggle("is-on");
    toggle.setAttribute("aria-checked", String(isOn));
    const row = toggle.closest<HTMLElement>("[data-policy]");
    showToast(`${row?.dataset.policy ?? "Policy"} ${isOn ? "enabled" : "disabled"}.`, "success");
  });
});

document.querySelectorAll<HTMLButtonElement>("[data-permission]").forEach((permission) => {
  permission.addEventListener("click", () => {
    const deny = permission.classList.toggle("deny");
    const labelNode = permission.firstChild;
    if (labelNode) {
      labelNode.textContent = deny ? "DENY " : "ALLOW ";
    }
    showToast(`Policy changed to ${deny ? "DENY" : "ALLOW"}.`, "success");
  });
});

document.querySelectorAll<HTMLButtonElement>("[data-modal-close]").forEach((button) => {
  button.addEventListener("click", closeModal);
});

document.querySelector<HTMLButtonElement>("[data-confirm]")?.addEventListener("click", () => {
  closeModal();
  showToast("Workflow started in safe local mode.", "success");
});

modal?.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal && !modal.hidden) closeModal();
});
