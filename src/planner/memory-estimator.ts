import type { GgufModelProfile } from "../gguf/index.js";
import type { MemoryEstimate } from "./types.js";

const mib = 1024 ** 2;

export interface MemoryEstimatorOptions {
  contextTokens?: number;
  runtimeOverheadRatio?: number;
  runtimeOverheadFloorBytes?: number;
  safetyMarginBytes?: number;
  kvBytesPerElement?: number;
}

function positiveInteger(value: number | undefined): value is number {
  return value !== undefined && Number.isSafeInteger(value) && value > 0;
}

function estimateKvCacheBytes(
  model: GgufModelProfile,
  contextTokens: number,
  bytesPerElement: number
): number | null {
  const embeddingLength = model.embeddingLength;
  const blockCount = model.blockCount;
  const headCount = model.attentionHeadCount;
  const headCountKv = model.attentionHeadCountKv;

  if (
    !positiveInteger(embeddingLength)
    || !positiveInteger(blockCount)
    || !positiveInteger(headCount)
    || !positiveInteger(headCountKv)
  ) {
    return null;
  }

  if (embeddingLength % headCount !== 0) return null;

  const headDim = embeddingLength / headCount;
  const kvWidth = headDim * headCountKv;
  const bytes = contextTokens * blockCount * kvWidth * 2 * bytesPerElement;

  return Number.isSafeInteger(bytes) && bytes > 0 ? bytes : null;
}

export function estimateMemory(
  model: GgufModelProfile,
  options: MemoryEstimatorOptions = {}
): MemoryEstimate {
  const warnings: string[] = [];
  const requestedContext = options.contextTokens ?? Math.min(model.contextLength ?? 4096, 4096);

  if (!Number.isSafeInteger(requestedContext) || requestedContext <= 0) {
    throw new Error("contextTokens must be a positive safe integer.");
  }

  const contextTokens = model.contextLength
    ? Math.min(requestedContext, model.contextLength)
    : requestedContext;

  if (model.contextLength && requestedContext > model.contextLength) {
    warnings.push(
      `Requested context ${requestedContext} exceeds model metadata limit ${model.contextLength}; estimator used ${contextTokens}.`
    );
  }

  const runtimeOverheadRatio = options.runtimeOverheadRatio ?? 0.06;
  const runtimeOverheadFloorBytes = options.runtimeOverheadFloorBytes ?? 256 * mib;
  const safetyMarginBytes = options.safetyMarginBytes ?? 512 * mib;
  const kvBytesPerElement = options.kvBytesPerElement ?? 2;

  if (runtimeOverheadRatio < 0 || !Number.isFinite(runtimeOverheadRatio)) {
    throw new Error("runtimeOverheadRatio must be a finite non-negative number.");
  }
  if (!Number.isSafeInteger(runtimeOverheadFloorBytes) || runtimeOverheadFloorBytes < 0) {
    throw new Error("runtimeOverheadFloorBytes must be a non-negative safe integer.");
  }
  if (!Number.isSafeInteger(safetyMarginBytes) || safetyMarginBytes < 0) {
    throw new Error("safetyMarginBytes must be a non-negative safe integer.");
  }
  if (![1, 2, 4].includes(kvBytesPerElement)) {
    throw new Error("kvBytesPerElement must be 1, 2, or 4.");
  }

  const weightsBytes = model.fileSizeBytes;
  const runtimeOverheadBytes = Math.ceil(
    Math.max(runtimeOverheadFloorBytes, weightsBytes * runtimeOverheadRatio)
  );
  const kvCacheBytes = estimateKvCacheBytes(model, contextTokens, kvBytesPerElement);

  if (kvCacheBytes === null) {
    warnings.push(
      "KV-cache size is unknown because required attention metadata is missing or inconsistent."
    );
  }

  const minimumRequiredBytes = weightsBytes + runtimeOverheadBytes + safetyMarginBytes;
  const totalEstimatedBytes = kvCacheBytes === null
    ? null
    : minimumRequiredBytes + kvCacheBytes;

  return {
    contextTokens,
    weights: {
      bytes: weightsBytes,
      source: "DERIVED",
      explanation: "Derived from the GGUF file size; tensor/runtime representation may differ slightly."
    },
    kvCache: kvCacheBytes === null
      ? {
          bytes: null,
          source: "UNKNOWN",
          explanation: "Required attention metadata was unavailable or inconsistent."
        }
      : {
          bytes: kvCacheBytes,
          source: "ESTIMATED",
          explanation: `Estimated for ${contextTokens} tokens at ${kvBytesPerElement} bytes per KV element.`
        },
    runtimeOverhead: {
      bytes: runtimeOverheadBytes,
      source: "ESTIMATED",
      explanation: "Heuristic runtime/graph/workspace overhead; benchmark data can replace this later."
    },
    safetyMargin: {
      bytes: safetyMarginBytes,
      source: "ESTIMATED",
      explanation: "Reserved memory margin to avoid fragile edge-of-capacity plans."
    },
    minimumRequiredBytes,
    totalEstimatedBytes,
    confidence: kvCacheBytes === null ? "LOW" : "MEDIUM",
    warnings
  };
}
