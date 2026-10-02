#!/usr/bin/env node
import { pathToFileURL } from "node:url";
import { inspectModel, renderInspectionJson, renderInspectionText } from "./inspect.js";

interface CliOptions {
  command: "inspect";
  modelPath: string;
  json: boolean;
  contextTokens?: number;
}

function parsePositiveInteger(value: string, flag: string): number {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${flag} requires a positive integer.`);
  }
  return parsed;
}

export function parseCliArgs(argv: readonly string[]): CliOptions {
  const [command, modelPath, ...rest] = argv;
  if (command !== "inspect" || !modelPath) {
    throw new Error(
      "Usage: model-unbreak inspect <model.gguf> [--json] [--context <tokens>]"
    );
  }

  let json = false;
  let contextTokens: number | undefined;

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (arg === "--json") {
      json = true;
      continue;
    }
    if (arg === "--context") {
      const value = rest[index + 1];
      if (!value) throw new Error("--context requires a value.");
      contextTokens = parsePositiveInteger(value, "--context");
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${String(arg)}`);
  }

  return {
    command: "inspect",
    modelPath,
    json,
    ...(contextTokens !== undefined ? { contextTokens } : {})
  };
}

export async function runCli(argv: readonly string[]): Promise<number> {
  try {
    const options = parseCliArgs(argv);
    const result = await inspectModel(options.modelPath, {
      ...(options.contextTokens !== undefined ? { contextTokens: options.contextTokens } : {})
    });
    process.stdout.write(
      options.json
        ? `${renderInspectionJson(result)}\n`
        : `${renderInspectionText(result)}\n`
    );
    return 0;
  } catch (error) {
    process.stderr.write(
      `Model Unbreak error: ${error instanceof Error ? error.message : "unknown error"}\n`
    );
    return 1;
  }
}

const entryPath = process.argv[1];
if (entryPath && import.meta.url === pathToFileURL(entryPath).href) {
  process.exitCode = await runCli(process.argv.slice(2));
}
