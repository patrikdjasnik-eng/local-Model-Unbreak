import path from "node:path";

export function resolveInsideRoot(root: string, input = "."): string {
  if (input.includes("\0")) throw new Error("Path contains a null byte.");

  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(resolvedRoot, input);

  if (resolved !== resolvedRoot && !resolved.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error("Path escapes the SafeCell workspace.");
  }

  return resolved;
}
