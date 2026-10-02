import { describe, expect, it } from "vitest";
import {
  buildDockerArgs,
  DockerSafeCell,
  resolveInsideRoot
} from "../src/sandbox/index.js";

describe("SafeCell", () => {
  it("builds a hardened Docker invocation without network access", () => {
    const controller = new AbortController();
    const args = buildDockerArgs({
      workspaceRoot: process.cwd(),
      image: "python:3.12-alpine"
    }, {
      argv: ["python3", "-c", "print('ok')"],
      timeoutMs: 5000,
      signal: controller.signal
    });

    expect(args).toContain("--network=none");
    expect(args).toContain("--read-only");
    expect(args).toContain("--cap-drop=ALL");
    expect(args).toContain("--security-opt=no-new-privileges");
    expect(args).toContain("python:3.12-alpine");
  });

  it("blocks paths escaping the workspace", () => {
    expect(() => resolveInsideRoot(process.cwd(), "../outside")).toThrow("escapes");
  });

  it("fails before spawning Docker when already cancelled", async () => {
    const controller = new AbortController();
    controller.abort();
    const safeCell = new DockerSafeCell({ workspaceRoot: process.cwd() });

    const result = await safeCell.execute({
      argv: ["true"],
      timeoutMs: 5000,
      signal: controller.signal
    });

    expect(result.status).toBe("CANCELLED");
    expect(safeCell.capabilities.network).toBe(false);
  });
});
