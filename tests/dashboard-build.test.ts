import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("dashboard build inputs", () => {
  it("mounts the Vite UI entry from index.html", async () => {
    const html = await readFile("index.html", "utf8");

    expect(html).toContain('<div id="app"></div>');
    expect(html).toContain('src="/ui/app.ts"');
    expect(html).toContain("Model Unbreak");
  });

  it("contains responsive desktop, tablet and mobile breakpoints", async () => {
    const css = await readFile("ui/styles.css", "utf8");

    expect(css).toContain("@media (max-width: 1180px)");
    expect(css).toContain("@media (max-width: 820px)");
    expect(css).toContain("@media (max-width: 560px)");
  });

  it("keeps all reference dashboard sections in the stylesheet", async () => {
    const css = await readFile("ui/styles.css", "utf8");

    for (const selector of [
      ".quick-actions-panel",
      ".snapshot-panel",
      ".model-panel",
      ".execution-panel",
      ".security-panel",
      ".nodes-panel",
      ".benchmark-panel",
      ".stats-panel"
    ]) {
      expect(css).toContain(selector);
    }
  });
});
