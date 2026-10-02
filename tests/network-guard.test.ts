import { describe, expect, it } from "vitest";
import { isGlobalIp, validateHttpTarget } from "../src/security/network/index.js";

describe("NetworkGuard", () => {
  it("classifies common private and public IPv4 ranges", () => {
    expect(isGlobalIp("10.1.2.3")).toBe(false);
    expect(isGlobalIp("127.0.0.1")).toBe(false);
    expect(isGlobalIp("192.168.1.1")).toBe(false);
    expect(isGlobalIp("8.8.8.8")).toBe(true);
  });

  it("rejects DNS targets resolving to private addresses", async () => {
    await expect(validateHttpTarget("https://models.example", {
      resolver: async () => [{ address: "10.0.0.7", family: 4 }]
    })).rejects.toThrow("blocked");
  });

  it("accepts a public HTTPS target", async () => {
    const result = await validateHttpTarget("https://models.example/file.gguf", {
      requireHttpsForRemote: true,
      resolver: async () => [{ address: "8.8.8.8", family: 4 }]
    });

    expect(result.isLoopback).toBe(false);
    expect(result.url.protocol).toBe("https:");
  });

  it("allows loopback only when explicitly configured", async () => {
    const resolver = async () => [{ address: "127.0.0.1", family: 4 as const }];

    await expect(validateHttpTarget("http://localhost:8080", { resolver })).rejects.toThrow("blocked");

    const result = await validateHttpTarget("http://localhost:8080", {
      allowLoopback: true,
      resolver
    });
    expect(result.isLoopback).toBe(true);
  });

  it("rejects credentials embedded in a URL", async () => {
    await expect(validateHttpTarget("https://user:secret@example.com", {
      resolver: async () => [{ address: "8.8.8.8", family: 4 }]
    })).rejects.toThrow("Credentials");
  });
});
