import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import { defineConfig, globalIgnores } from "eslint/config";
import vue from "eslint-plugin-vue";
import globals from "globals";
import tseslint from "typescript-eslint";

/** 统一使用箭头函数：禁止 function 声明与 function 表达式（类方法、对象方法、getter/setter 除外） */
const ARROW_FUNCTIONS_ONLY = "统一使用箭头函数，禁止使用 function 关键字";

export default defineConfig(
  globalIgnores([
    "dist",
    "coverage",
    "docs/.vitepress/cache",
    "docs/.vitepress/dist",
    "**/dist/**",
    "**/dist-modern",
    "**/.webpack-dev",
    "**/.cache/**",
    "**/test-results/**",
    "**/playwright-report/**",
  ]),

  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  vue.configs["flat/recommended"],
  {
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: [".vue"],
      },
    },
  },
  {
    files: ["**/*.vue"],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },

  // 全局规范
  {
    rules: {
      curly: ["error", "all"],
      eqeqeq: ["error", "always"],
      "no-console": "error",
      "func-style": ["error", "expression"],
      "prefer-arrow-callback": "error",
      "no-restricted-syntax": [
        "error",
        { selector: "FunctionDeclaration", message: ARROW_FUNCTIONS_ONLY },
        {
          selector:
            "FunctionExpression:not(MethodDefinition > FunctionExpression, Property[method=true] > FunctionExpression, Property[kind='get'] > FunctionExpression, Property[kind='set'] > FunctionExpression)",
          message: ARROW_FUNCTIONS_ONLY,
        },
      ],
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/consistent-type-exports": "error",
      // 禁止类型断言（`as const` 除外）：类型应由校验与类型守卫得出
      "@typescript-eslint/consistent-type-assertions": ["error", { assertionStyle: "never" }],
      "@typescript-eslint/switch-exhaustiveness-check": "error",
    },
  },

  // 库源码：导出必须显式标注返回类型
  {
    files: ["src/**/*.ts"],
    rules: {
      "@typescript-eslint/explicit-module-boundary-types": "error",
    },
  },

  // 分层约束：core 与框架无关
  {
    files: ["src/core/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [{ name: "vue", message: "core 层必须与框架无关，Vue 相关代码放在 src/vue/" }],
          patterns: [{ group: ["**/vue/**", "../vue"], message: "core 层不得依赖 vue 适配层" }],
        },
      ],
    },
  },
  // 分层约束：vue 层只能通过门面使用 core
  {
    files: ["src/vue/**/*.ts", "src/index.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["**/core/*"], message: "请通过 core 门面（src/core/index.ts）引用" },
          ],
        },
      ],
    },
  },

  // 独立示例的构建配置与检查脚本使用原生 Node 模块，不参加 TS 项目检查。
  {
    files: ["**/*.cjs", "**/*.mjs"],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      globals: globals.node,
      sourceType: "module",
      parserOptions: { projectService: false, project: false },
    },
  },
  {
    files: ["**/*.cjs"],
    languageOptions: { sourceType: "commonjs" },
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  {
    files: ["scripts/**/*.mjs", "examples/**/scripts/**/*.mjs"],
    rules: { "no-console": "off" },
  },
  {
    files: ["examples/**/*.ts", "examples/**/*.vue"],
    rules: { "@typescript-eslint/prefer-includes": "off" },
  },
  // Node 环境的配置文件与脚本
  {
    files: ["*.config.ts", "docs/.vitepress/config.ts", "scripts/**/*.ts"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["scripts/**/*.ts"],
    rules: { "no-console": "off" },
  },

  // 测试：允许使用断言构造测试替身、断言 console 调用，单文件内可定义多个测试组件
  {
    files: ["test/**/*.ts", "examples/**/test/**/*.ts"],
    rules: {
      "@typescript-eslint/consistent-type-assertions": "off",
      "no-console": "off",
      "vue/one-component-per-file": "off",
    },
  },

  prettier,
);
