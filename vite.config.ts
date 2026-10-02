import { defineConfig, loadEnv } from "vite";

function localLlamaTarget(value: string | undefined): string {
  const candidate = value?.trim() || "http://127.0.0.1:8080";
  const url = new URL(candidate);
  const allowedHosts = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);

  if (!allowedHosts.has(url.hostname)) {
    throw new Error("VITE_LLAMA_URL must point to localhost/loopback for the local-only demo.");
  }

  return url.origin;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const llamaTarget = localLlamaTarget(env.VITE_LLAMA_URL);

  return {
    server: {
      proxy: {
        "/llama": {
          target: llamaTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/llama/, "")
        }
      }
    }
  };
});
