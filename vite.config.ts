import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const sharedDir = path.resolve(rootDir, "../backend/packages/shared");

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    // Use shared package source so Vite never serves a stale pre-bundle.
    alias: {
      "@mkopoflow/shared": path.join(sharedDir, "src/index.ts"),
    },
  },
  optimizeDeps: {
    exclude: ["@mkopoflow/shared"],
  },
  server: {
    port: 5173,
    fs: {
      allow: [rootDir, sharedDir],
    },
    watch: {
      ignored: ["!**/backend/packages/shared/**"],
    },
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
