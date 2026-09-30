import { defineConfig } from "vite";
import vue2 from "@vitejs/plugin-vue2";
import { createRequire } from "node:module";

const settings = createRequire(import.meta.url)("./build-settings.cjs");

// 现代浏览器快速开发入口；旧盒子使用 webpack 的 dev:tv。
export default defineConfig({
  base: "./",
  server: {
    allowedHosts: ["host.docker.internal"],
    headers: { "X-vuepg-project": settings.projectId },
  },
  plugins: [vue2()],
  build: { outDir: "dist-modern" },
});
