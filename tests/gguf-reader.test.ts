import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { inspectGguf, quantizationFromFileType } from "../src/gguf/index.js";

const tempDirs: string[] = [];

function u32(value: number): Buffer {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value);
  return buffer;
}

function u64(value: number): Buffer {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64LE(BigInt(value));
  return buffer;
}

function ggufString(value: string): Buffer {
  const data = Buffer.from(value, "utf8");
  return Buffer.concat([u64(data.length), data]);
}

function metadataString(key: string, value: string): Buffer {
  return Buffer.concat([ggufString(key), u32(8), ggufString(value)]);
}

function metadataU32(key: string, value: number): Buffer {
  return Buffer.concat([ggufString(key), u32(4), u32(value)]);
}

function buildMinimalGguf(): Buffer {
  const metadata = [
    metadataString("general.architecture", "qwen2"),
    metadataString("general.name", "Synthetic Qwen"),
    metadataU32("general.file_type", 15),
    metadataU32("qwen2.context_length", 32768),
    metadataU32("qwen2.embedding_length", 4096),
    metadataU32("qwen2.block_count", 32),
    metadataU32("qwen2.attention.head_count", 32),
    metadataU32("qwen2.attention.head_count_kv", 8)
  ];

  return Buffer.concat([
    Buffer.from("GGUF", "ascii"),
    u32(3),
    u64(0),
    u64(metadata.length),
    ...metadata
  ]);
}

async function tempFile(content: Buffer): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), "model-unbreak-"));
  tempDirs.push(dir);
  const filePath = path.join(dir, "model.gguf");
  await writeFile(filePath, content);
  return filePath;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("GGUF reader", () => {
  it("reads a minimal synthetic GGUF without loading model weights", async () => {
    const filePath = await tempFile(buildMinimalGguf());
    const profile = await inspectGguf(filePath);

    expect(profile.version).toBe(3);
    expect(profile.architecture).toBe("qwen2");
    expect(profile.quantization).toBe("Q4_K_M");
    expect(profile.contextLength).toBe(32768);
    expect(profile.blockCount).toBe(32);
  });

  it("rejects invalid magic", async () => {
    const filePath = await tempFile(Buffer.from("NOPE-not-a-gguf"));
    await expect(inspectGguf(filePath)).rejects.toThrow("magic");
  });

  it("rejects truncated metadata", async () => {
    const valid = buildMinimalGguf();
    const filePath = await tempFile(valid.subarray(0, valid.length - 2));
    await expect(inspectGguf(filePath)).rejects.toThrow("truncated");
  });

  it("rejects unreasonable key length before allocating it", async () => {
    const content = Buffer.concat([
      Buffer.from("GGUF", "ascii"),
      u32(3),
      u64(0),
      u64(1),
      u64(1024 * 1024)
    ]);
    const filePath = await tempFile(content);
    await expect(inspectGguf(filePath)).rejects.toThrow("string exceeds");
  });

  it("returns UNKNOWN for unmapped quantization", () => {
    expect(quantizationFromFileType(9999)).toBe("UNKNOWN");
  });
});
