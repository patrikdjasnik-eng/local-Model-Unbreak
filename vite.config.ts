import { defineConfig, loadEnv } from "vite";

function localBackendTarget(value: string | undefined): string {
  const candidate = value?.trim() || "http://127.0.0.1:8787";
  const url = new URL(candidate);
  const allowedHosts = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);

  if (!allowedHosts.has(url.hostname)) {
    throw new Error("VITE_BACKEND_URL must point to localhost/loopback.");
  }

  return url.origin;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendTarget = localBackendTarget(env.VITE_BACKEND_URL);

  return {
    server: {
      proxy: {
        "/api": {
          target: backendTarget,
          changeOrigin: true
        }
      }
    }
  };
});
