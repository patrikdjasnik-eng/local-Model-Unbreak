import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const llamaTarget = env.VITE_LLAMA_URL || "http://127.0.0.1:8080";

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
