import { describe, expect, it } from "vitest";
import { parseCliArgs } from "../src/cli/index.js";
import { formatBytes } from "../src/cli/inspect.js";

describe("inspect CLI", () => {
  it("parses JSON and context options", () => {
    expect(parseCliArgs([
      "inspect",
      "./model.gguf",
      "--json",
      "--context",
      "8192"
    ])).toEqual({
      command: "inspect",
      modelPath: "./model.gguf",
      json: true,
      contextTokens: 8192
    });
  });

  it("rejects unknown options", () => {
    expect(() => parseCliArgs(["inspect", "./model.gguf", "--wat"])).toThrow("Unknown");
  });

  it("formats unknown and GiB values", () => {
    expect(formatBytes(null)).toBe("unknown");
    expect(formatBytes(1024 ** 3)).toBe("1.00 GiB");
  });
});
