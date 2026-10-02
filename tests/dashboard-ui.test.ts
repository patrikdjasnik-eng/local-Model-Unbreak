import { beforeEach, describe, expect, it, vi } from "vitest";

async function renderDashboard(): Promise<void> {
  document.body.innerHTML = '<div id="app"></div>';
  vi.resetModules();
  await import("../ui/app.js");
}

describe("dashboard UI", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("renders the main dashboard structure", async () => {
    await renderDashboard();

    expect(document.querySelector("h1")?.textContent).toBe("Dashboard");
    expect(document.querySelectorAll("[data-nav]")).toHaveLength(8);
    expect(document.querySelectorAll("[data-metric]")).toHaveLength(5);
    expect(document.querySelectorAll("[data-policy]")).toHaveLength(4);
    expect(document.querySelector(".engine-card")?.textContent).toContain("Local Engine");
    expect(document.querySelector(".security-panel")?.textContent).toContain("CREEPING FROST");
  });

  it("marks Dashboard as the initial active navigation item", async () => {
    await renderDashboard();

    const dashboard = document.querySelector<HTMLButtonElement>('[data-nav="Dashboard"]');
    expect(dashboard?.classList.contains("active")).toBe(true);
  });

  it("changes active navigation and opens its workspace modal", async () => {
    await renderDashboard();

    const planner = document.querySelector<HTMLButtonElement>('[data-nav="Planner"]');
    planner?.click();

    expect(planner?.classList.contains("active")).toBe(true);
    expect(document.querySelector('[data-nav="Dashboard"]')?.classList.contains("active")).toBe(false);
    expect(document.querySelector<HTMLDivElement>("[data-modal]")?.hidden).toBe(false);
    expect(document.querySelector("#modal-title")?.textContent).toBe("Planner");
  });

  it("opens the Inspect Model workflow from quick actions", async () => {
    await renderDashboard();

    document.querySelector<HTMLButtonElement>('[data-action="inspect"]')?.click();

    expect(document.querySelector("#modal-title")?.textContent).toBe("Inspect Model");
    expect(document.querySelector("#modal-description")?.textContent).toContain("GGUF");
  });

  it("opens Creeping Frost security details", async () => {
    await renderDashboard();

    document.querySelector<HTMLButtonElement>('[data-action="security"]')?.click();

    expect(document.querySelector("#modal-title")?.textContent).toBe("Creeping Frost");
    expect(document.querySelector("#modal-description")?.textContent).toContain("sandbox policy");
  });

  it("toggles security policy switches and aria state", async () => {
    await renderDashboard();

    const toggle = document.querySelector<HTMLButtonElement>('[data-policy="model.inspect"] [data-switch]');
    expect(toggle?.getAttribute("aria-checked")).toBe("true");

    toggle?.click();
    expect(toggle?.getAttribute("aria-checked")).toBe("false");
    expect(toggle?.classList.contains("is-on")).toBe(false);

    toggle?.click();
    expect(toggle?.getAttribute("aria-checked")).toBe("true");
    expect(toggle?.classList.contains("is-on")).toBe(true);
  });

  it("toggles policy permission between ALLOW and DENY", async () => {
    await renderDashboard();

    const permission = document.querySelector<HTMLButtonElement>('[data-policy="filesystem.model.read"] [data-permission]');
    expect(permission?.textContent).toContain("ALLOW");

    permission?.click();
    expect(permission?.textContent).toContain("DENY");
    expect(permission?.classList.contains("deny")).toBe(true);

    permission?.click();
    expect(permission?.textContent).toContain("ALLOW");
    expect(permission?.classList.contains("deny")).toBe(false);
  });

  it("refreshes all system snapshot usage values within safe bounds", async () => {
    await renderDashboard();

    document.querySelector<HTMLButtonElement>('[data-action="refresh"]')?.click();

    const values = [...document.querySelectorAll<HTMLElement>("[data-usage-label]")]
      .map((item) => Number.parseInt(item.textContent ?? "", 10));

    expect(values).toHaveLength(5);
    expect(values.every((value) => Number.isInteger(value) && value >= 3 && value <= 92)).toBe(true);
  });

  it("closes an open modal with Escape", async () => {
    vi.useFakeTimers();
    await renderDashboard();

    document.querySelector<HTMLButtonElement>('[data-action="planner"]')?.click();
    const modal = document.querySelector<HTMLDivElement>("[data-modal]");
    expect(modal?.hidden).toBe(false);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    vi.advanceTimersByTime(200);

    expect(modal?.hidden).toBe(true);
  });

  it("confirms a workflow and reports safe local execution", async () => {
    vi.useFakeTimers();
    await renderDashboard();

    document.querySelector<HTMLButtonElement>('[data-action="feasibility"]')?.click();
    document.querySelector<HTMLButtonElement>("[data-confirm]")?.click();
    vi.advanceTimersByTime(200);

    expect(document.querySelector(".toast.success")?.textContent).toContain("safe local mode");
  });

  it("keeps the local-only security promise visible in the dashboard", async () => {
    await renderDashboard();

    const securityNote = document.querySelector(".security-note")?.textContent ?? "";
    expect(securityNote).toContain("restricted to your local machine");
    expect(securityNote).toContain("No data is sent to external servers");
  });
});
