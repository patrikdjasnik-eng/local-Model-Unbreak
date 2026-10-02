export type GgufQuantization =
  | "F32"
  | "F16"
  | "Q4_0"
  | "Q4_1"
  | "Q5_0"
  | "Q5_1"
  | "Q8_0"
  | "Q2_K"
  | "Q3_K_S"
  | "Q3_K_M"
  | "Q3_K_L"
  | "Q4_K_S"
  | "Q4_K_M"
  | "Q5_K_S"
  | "Q5_K_M"
  | "Q6_K"
  | "UNKNOWN";

export type GgufMetadataScalar = string | number | bigint | boolean;

export interface GgufModelProfile {
  format: "GGUF";
  version: number;
  architecture?: string;
  name?: string;
  quantization: GgufQuantization;
  fileType?: number;
  fileSizeBytes: number;
  tensorCount: number;
  metadataCount: number;
  contextLength?: number;
  embeddingLength?: number;
  blockCount?: number;
  attentionHeadCount?: number;
  attentionHeadCountKv?: number;
  alignment: number;
  metadata: Readonly<Record<string, GgufMetadataScalar>>;
  warnings: readonly string[];
}
