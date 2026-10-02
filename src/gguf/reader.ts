import { open, type FileHandle } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import type {
  GgufMetadataScalar,
  GgufModelProfile,
  GgufQuantization
} from "./types.js";

const GGUF_MAGIC = "GGUF";
const SUPPORTED_VERSIONS = new Set([2, 3]);
const MAX_KEY_BYTES = 16 * 1024;
const MAX_STRING_BYTES = 16 * 1024 * 1024;
const MAX_ARRAY_ITEMS = 5_000_000;
const DEFAULT_ALIGNMENT = 32;

enum GgufValueType {
  Uint8 = 0,
  Int8 = 1,
  Uint16 = 2,
  Int16 = 3,
  Uint32 = 4,
  Int32 = 5,
  Float32 = 6,
  Bool = 7,
  String = 8,
  Array = 9,
  Uint64 = 10,
  Int64 = 11,
  Float64 = 12
}

const quantizationByFileType: Readonly<Record<number, GgufQuantization>> = {
  0: "F32",
  1: "F16",
  2: "Q4_0",
  3: "Q4_1",
  7: "Q8_0",
  8: "Q5_0",
  9: "Q5_1",
  10: "Q2_K",
  11: "Q3_K_S",
  12: "Q3_K_M",
  13: "Q3_K_L",
  14: "Q4_K_S",
  15: "Q4_K_M",
  16: "Q5_K_S",
  17: "Q5_K_M",
  18: "Q6_K"
};

function bigintToSafeNumber(value: bigint, label: string): number {
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error(`${label} exceeds JavaScript safe integer range.`);
  }
  return Number(value);
}

function shouldCaptureMetadata(key: string): boolean {
  return key === "general.architecture"
    || key === "general.name"
    || key === "general.file_type"
    || key === "general.alignment"
    || key.endsWith(".context_length")
    || key.endsWith(".embedding_length")
    || key.endsWith(".block_count")
    || key.endsWith(".attention.head_count")
    || key.endsWith(".attention.head_count_kv");
}

class BinaryReader {
  private position = 0;

  constructor(
    private readonly file: FileHandle,
    private readonly fileSize: number
  ) {}

  private async readExact(length: number): Promise<Buffer> {
    if (!Number.isSafeInteger(length) || length < 0) {
      throw new Error("Invalid GGUF read length.");
    }
    if (this.position + length > this.fileSize) {
      throw new Error("GGUF file is truncated.");
    }

    const buffer = Buffer.allocUnsafe(length);
    const result = await this.file.read(buffer, 0, length, this.position);
    if (result.bytesRead !== length) throw new Error("GGUF file is truncated.");
    this.position += length;
    return buffer;
  }

  async skip(length: number): Promise<void> {
    if (!Number.isSafeInteger(length) || length < 0 || this.position + length > this.fileSize) {
      throw new Error("GGUF skip exceeds file bounds.");
    }
    this.position += length;
  }

  async uint8(): Promise<number> {
    return (await this.readExact(1)).readUInt8(0);
  }

  async int8(): Promise<number> {
    return (await this.readExact(1)).readInt8(0);
  }

  async uint16(): Promise<number> {
    return (await this.readExact(2)).readUInt16LE(0);
  }

  async int16(): Promise<number> {
    return (await this.readExact(2)).readInt16LE(0);
  }

  async uint32(): Promise<number> {
    return (await this.readExact(4)).readUInt32LE(0);
  }

  async int32(): Promise<number> {
    return (await this.readExact(4)).readInt32LE(0);
  }

  async float32(): Promise<number> {
    return (await this.readExact(4)).readFloatLE(0);
  }

  async uint64(): Promise<bigint> {
    return (await this.readExact(8)).readBigUInt64LE(0);
  }

  async int64(): Promise<bigint> {
    return (await this.readExact(8)).readBigInt64LE(0);
  }

  async float64(): Promise<number> {
    return (await this.readExact(8)).readDoubleLE(0);
  }

  async string(maxBytes = MAX_STRING_BYTES): Promise<string> {
    const length = bigintToSafeNumber(await this.uint64(), "GGUF string length");
    if (length > maxBytes) throw new Error(`GGUF string exceeds ${maxBytes} bytes.`);
    return (await this.readExact(length)).toString("utf8");
  }

  async value(type: number, capture: boolean, depth = 0): Promise<GgufMetadataScalar | undefined> {
    if (depth > 2) throw new Error("GGUF metadata nesting is too deep.");

    switch (type) {
      case GgufValueType.Uint8:
        return capture ? this.uint8() : (await this.skip(1), undefined);
      case GgufValueType.Int8:
        return capture ? this.int8() : (await this.skip(1), undefined);
      case GgufValueType.Uint16:
        return capture ? this.uint16() : (await this.skip(2), undefined);
      case GgufValueType.Int16:
        return capture ? this.int16() : (await this.skip(2), undefined);
      case GgufValueType.Uint32:
        return capture ? this.uint32() : (await this.skip(4), undefined);
      case GgufValueType.Int32:
        return capture ? this.int32() : (await this.skip(4), undefined);
      case GgufValueType.Float32:
        return capture ? this.float32() : (await this.skip(4), undefined);
      case GgufValueType.Bool: {
        const value = await this.uint8();
        return capture ? value !== 0 : undefined;
      }
      case GgufValueType.String: {
        const value = await this.string();
        return capture ? value : undefined;
      }
      case GgufValueType.Uint64: {
        const value = await this.uint64();
        return capture ? value : undefined;
      }
      case GgufValueType.Int64: {
        const value = await this.int64();
        return capture ? value : undefined;
      }
      case GgufValueType.Float64:
        return capture ? this.float64() : (await this.skip(8), undefined);
      case GgufValueType.Array: {
        const elementType = await this.uint32();
        const length = bigintToSafeNumber(await this.uint64(), "GGUF array length");
        if (length > MAX_ARRAY_ITEMS) {
          throw new Error(`GGUF metadata array exceeds ${MAX_ARRAY_ITEMS} items.`);
        }
        for (let index = 0; index < length; index += 1) {
          await this.value(elementType, false, depth + 1);
        }
        return undefined;
      }
      default:
        throw new Error(`Unsupported GGUF metadata value type: ${type}`);
    }
  }
}

function asNumber(value: GgufMetadataScalar | undefined): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "bigint" && value <= BigInt(Number.MAX_SAFE_INTEGER)) return Number(value);
  return undefined;
}

function asString(value: GgufMetadataScalar | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function metadataNumber(
  metadata: Readonly<Record<string, GgufMetadataScalar>>,
  architecture: string | undefined,
  suffix: string
): number | undefined {
  if (architecture) {
    const direct = asNumber(metadata[`${architecture}.${suffix}`]);
    if (direct !== undefined) return direct;
  }

  const entry = Object.entries(metadata).find(([key]) => key.endsWith(`.${suffix}`));
  return entry ? asNumber(entry[1]) : undefined;
}

export function quantizationFromFileType(fileType: number | undefined): GgufQuantization {
  if (fileType === undefined) return "UNKNOWN";
  return quantizationByFileType[fileType] ?? "UNKNOWN";
}

export async function inspectGguf(filePath: string): Promise<GgufModelProfile> {
  const file = await open(filePath, fsConstants.O_RDONLY);
  try {
    const stat = await file.stat();
    if (!stat.isFile()) throw new Error("GGUF path is not a regular file.");
    if (stat.size < 24) throw new Error("GGUF file is too small.");

    const reader = new BinaryReader(file, stat.size);
    const magic = (await file.read(Buffer.alloc(4), 0, 4, 0)).buffer;
    const magicBuffer = Buffer.from(magic);
    if (magicBuffer.subarray(0, 4).toString("ascii") !== GGUF_MAGIC) {
      throw new Error("Invalid GGUF magic.");
    }

    await reader.skip(4);
    const version = await reader.uint32();
    if (!SUPPORTED_VERSIONS.has(version)) {
      throw new Error(`Unsupported GGUF version: ${version}`);
    }

    const tensorCount = bigintToSafeNumber(await reader.uint64(), "GGUF tensor count");
    const metadataCount = bigintToSafeNumber(await reader.uint64(), "GGUF metadata count");
    if (metadataCount > 1_000_000) throw new Error("GGUF metadata count is unreasonable.");

    const metadata: Record<string, GgufMetadataScalar> = {};
    for (let index = 0; index < metadataCount; index += 1) {
      const key = await reader.string(MAX_KEY_BYTES);
      const valueType = await reader.uint32();
      const capture = shouldCaptureMetadata(key);
      const value = await reader.value(valueType, capture);
      if (capture && value !== undefined) metadata[key] = value;
    }

    const architecture = asString(metadata["general.architecture"]);
    const name = asString(metadata["general.name"]);
    const fileType = asNumber(metadata["general.file_type"]);
    const alignment = asNumber(metadata["general.alignment"]) ?? DEFAULT_ALIGNMENT;
    const warnings: string[] = [];
    const quantization = quantizationFromFileType(fileType);

    if (!architecture) warnings.push("GGUF architecture metadata is missing.");
    if (quantization === "UNKNOWN") warnings.push("GGUF quantization could not be identified from general.file_type.");

    return {
      format: "GGUF",
      version,
      ...(architecture ? { architecture } : {}),
      ...(name ? { name } : {}),
      quantization,
      ...(fileType !== undefined ? { fileType } : {}),
      fileSizeBytes: stat.size,
      tensorCount,
      metadataCount,
      contextLength: metadataNumber(metadata, architecture, "context_length"),
      embeddingLength: metadataNumber(metadata, architecture, "embedding_length"),
      blockCount: metadataNumber(metadata, architecture, "block_count"),
      attentionHeadCount: metadataNumber(metadata, architecture, "attention.head_count"),
      attentionHeadCountKv: metadataNumber(metadata, architecture, "attention.head_count_kv"),
      alignment,
      metadata,
      warnings
    };
  } finally {
    await file.close();
  }
}
