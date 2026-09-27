import { defineConfig, type UserConfig } from "tsdown";

const shared = {
  entry: ["src/index.ts"],
  platform: "neutral",
  // 与 tsconfig.lib.json 保持一致：兼容老旧机顶盒浏览器及 webpack 4
  target: "es2015",
  tsconfig: "tsconfig.lib.json",
  // CJS 产物中默认导出位于 `exports.default`
  outputOptions: { exports: "named" },
  clean: true,
} satisfies UserConfig;

export default defineConfig([
  // JS 与类型声明分开构建，避免二者共享运行时代码而拆出额外 chunk
  { ...shared, format: ["esm", "cjs"], dts: false },
  {
    ...shared,
    format: ["esm", "cjs"],
    dts: { emitDtsOnly: true },
    // 浏览器库不适用 engines.node 等建议项，只报告警告及以上
    publint: { level: "warning" },
    attw: { profile: "strict" },
  },
]);
