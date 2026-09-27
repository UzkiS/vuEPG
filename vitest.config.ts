import { fileURLToPath } from "node:url";
import { defineConfig, type TestProjectInlineConfiguration } from "vitest/config";

const resolve = (path: string): string => fileURLToPath(new URL(path, import.meta.url));

/**
 * 同一套测试分别运行在 Vue 3 与 Vue 2.7 上。
 * 通过别名把 `vue` 指向对应版本的完整构建（含模板编译器），`#mount` 指向对应版本的挂载工具。
 */
const project = (name: "vue3" | "vue2", vue: string): TestProjectInlineConfiguration => ({
  extends: true,
  test: { name },
  resolve: {
    alias: [
      { find: /^vue$/, replacement: resolve(vue) },
      { find: /^vue2$/, replacement: resolve("node_modules/vue2/dist/vue.esm.js") },
      { find: /^#mount$/, replacement: resolve(`test/helpers/mount-${name}.ts`) },
    ],
  },
});

export default defineConfig({
  define: {
    __VUE_OPTIONS_API__: "true",
    __VUE_PROD_DEVTOOLS__: "false",
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
  },
  test: {
    environment: "jsdom",
    setupFiles: ["test/setup.ts"],
    include: ["test/**/*.test.ts"],
    restoreMocks: true,
    projects: [
      project("vue3", "node_modules/vue/dist/vue.esm-bundler.js"),
      project("vue2", "node_modules/vue2/dist/vue.esm.js"),
    ],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      reporter: ["text", "html", "lcov"],
      thresholds: { lines: 100, functions: 100, statements: 100, branches: 99 },
    },
  },
});
