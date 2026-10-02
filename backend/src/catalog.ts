import { createHash } from "node:crypto";
import { readdir, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export interface CatalogModel {
  id: string;
  name: string;
  path: string;
  sizeBytes: number;
  sizeGb: number;
  source: "discovered";
}

const MAX_FILES = 12000;
const MAX_RESULTS = 100;

function modelId(filePath: string): string {
  return createHash("sha256").update(path.resolve(filePath)).digest("hex").slice(0, 16);
}

function defaultRoots(): string[] {
  const home = os.homedir();
  return [
    path.join(process.cwd(), "models"),
    path.join(home, "models"),
    path.join(home, "Models"),
    path.join(home, "Downloads"),
    path.join(home, ".cache", "llama.cpp"),
    path.join(home, ".cache", "huggingface", "hub")
  ];
}

function configuredRoots(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(path.delimiter)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function walk(
  root: string,
  depth: number,
  state: { visited: number; results: CatalogModel[] }
): Promise<void> {
  if (depth < 0 || state.visited >= MAX_FILES || state.results.length >= MAX_RESULTS) return;

  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (state.visited >= MAX_FILES || state.results.length >= MAX_RESULTS) return;
    state.visited += 1;

    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      await walk(fullPath, depth - 1, state);
      continue;
    }

    if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".gguf")) continue;

    try {
      const info = await stat(fullPath);
      state.results.push({
        id: modelId(fullPath),
        name: entry.name,
        path: path.resolve(fullPath),
        sizeBytes: info.size,
        sizeGb: Number((info.size / 1024 ** 3).toFixed(2)),
        source: "discovered"
      });
    } catch {
      continue;
    }
  }
}

export async function discoverModels(env: NodeJS.ProcessEnv = process.env): Promise<CatalogModel[]> {
  const roots = [...configuredRoots(env.MODEL_UNBREAK_MODEL_DIRS), ...defaultRoots()];
  const uniqueRoots = [...new Set(roots.map((root) => path.resolve(root)))];
  const state = { visited: 0, results: [] as CatalogModel[] };

  for (const root of uniqueRoots) {
    await walk(root, 5, state);
    if (state.results.length >= MAX_RESULTS || state.visited >= MAX_FILES) break;
  }

  const byPath = new Map<string, CatalogModel>();
  for (const model of state.results) byPath.set(model.path.toLowerCase(), model);

  return [...byPath.values()].sort((a, b) => a.name.localeCompare(b.name));
}
