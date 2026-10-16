---
title: 运营商存量盒子接入：Android 4.x、WebView 30 与 ES5 构建
description: 在 Android 4.x 等运营商存量盒子和旧 WebView 中接入 vuEPG，使用 Vue 2.7、webpack/Babel、ES5 构建和必要 polyfill，提供真机开发入口与白屏排查步骤。
---

# 运营商存量盒子接入（含 Android 4.x）

运营商存量盒子常运行 Android 4.x 与旧版 WebView，接入时要同时处理旧浏览器的语法、缺失的运行时 API 和遥控器输入。本页说明如何用 Vue 2.7、ES5 构建和 polyfill 接入 vuEPG；仓库附带的完整示例已按本页配置，可直接复制。

## 选择 Vue 与构建目标

| 环境                            | 接入方式                                              |
| ------------------------------- | ----------------------------------------------------- |
| 现代浏览器                      | Vue 2.7 或 Vue 3，按[快速开始](./getting-started)安装 |
| Android 4.x / WebView 30 旧设备 | Vue 2.7，ES5 应用产物，必要 polyfill                  |

Vue 3 依赖 `Proxy`；缺少该能力的设备应使用 Vue 2.7。vuepg 发布产物为 ES2015，应用构建需要将库和其他依赖一起转译到设备支持的语法。转译不会自动补齐运行时 API。

## 直接使用示例工程

复制[完整示例](./business-example)，在示例目录运行：

```sh
pnpm install
pnpm dev:tv    # http://电脑局域网IP:5174/
pnpm build     # webpack + Babel，ES5 兼容产物
pnpm preview   # http://电脑局域网IP:4174/
```

电脑与机顶盒需能互相访问相应地址和端口。日常使用现代浏览器快速开发时，运行 `pnpm dev` 打开 Vite 入口；真机开发使用 `dev:tv`。

## 为什么需要 webpack 开发入口

Vite 开发服务器依赖原生 ESM。Chromium 30 加载 Vite 页面后，HTML 存在，但模块入口不执行，Vue 应用没有挂载，表现为空白页面。

webpack 开发入口会转译业务代码、库依赖和开发客户端，在 Chromium 30 中可以正常运行和热更新。

`@vitejs/plugin-legacy` 只作用于 Vite 的生产构建，开发服务器仍然无法在旧浏览器中运行。示例的生产构建也使用 webpack。

## 在 webpack 中转译依赖

「转译」指构建工具将旧浏览器无法解析的语法转换为兼容语法，例如将箭头函数和可选链转为旧浏览器可执行的代码。webpack 的 Babel loader 必须处理应用代码和打包进来的依赖；只处理 `src` 会遗漏 vuepg。

以下安装命令和配置与[完整示例](./business-example)使用的工具一致，已有工程沿用自己的 webpack 与 Babel 版本即可。使用 Vue CLI 时见[下文](#使用-vue-cli-时)。

```sh
pnpm add core-js
pnpm add -D babel-loader @babel/core @babel/preset-env
```

下面配置接在已有 Vue loader 和样式规则旁边，专门处理 JavaScript：

```js
// webpack.config.cjs
module.exports = {
  target: ["web", "es5"],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        // 不排除整个 node_modules：vuepg 等依赖也必须经过 Babel。
        exclude: /node_modules[\\/]core-js[\\/]/,
        use: {
          loader: "babel-loader",
          options: {
            sourceType: "unambiguous",
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: "chrome >= 30",
                  modules: false,
                },
              ],
            ],
          },
        },
      },
    ],
  },
};
```

`target` 约束 webpack 自己生成的代码；Babel 规则处理应用及依赖的语法，运行时 API 通过下一节的兼容入口补齐。TypeScript 工程还需处理 `.ts` 文件和 Vue 单文件组件，完整配置见[示例 webpack.config.cjs](https://github.com/UzkiS/vuEPG/blob/main/examples/tv-training/webpack.config.cjs)。

## 加载运行时 polyfill

转译语法后，旧浏览器仍可能没有 `Map` 等 API。polyfill 是补充这些 API 的实现，需要在 Vue 和 vuepg 导入前加载：

```ts
// main.ts：先加载兼容入口，再加载应用。
import "./polyfills";
import Vue from "vue";
import VuEPG from "vuepg";
```

```ts
// polyfills.ts：补齐 JavaScript 内置 API。
import "core-js/stable";
```

core-js 不提供 DOM 的 `CustomEvent` 构造器。缺少该能力时，可用 `document.createEvent("CustomEvent")` 创建兼容事件；具体实现见[示例 polyfills.ts 中的 CustomEvent 补齐](https://github.com/UzkiS/vuEPG/blob/main/examples/tv-training/src/polyfills.ts)。

Babel 只转换语法。业务依赖和开发客户端用到的其他运行时 API 也要按实际使用补齐，例如示例为 webpack 热更新额外加载了 `whatwg-fetch`。

## 需要补齐哪些能力

| 层面       | 接入要求                                                                        |
| ---------- | ------------------------------------------------------------------------------- |
| JavaScript | core-js 提供缺失的 `Map`、`Set`、`Symbol`、`Array.from`、`Object.assign` 等能力 |
| DOM 事件   | 检测并补齐 `CustomEvent` 构造函数                                               |
| 脚本入口   | 生产 HTML 使用普通脚本，包含业务及依赖的 ES5 产物                               |
| 页面样式   | 使用旧设备可运行的布局，避免必要布局依赖 CSS 变量或 flex `gap`                  |

polyfill 必须在 Vue、vuEPG 和其他依赖使用这些 API 前加载。示例的 `src/polyfills.ts` 可以作为接入起点；调整依赖后继续检查最终产物。

## 使用 Vue CLI 时

Vue CLI 工程不需要更换工具版本，只需调整浏览器目标和依赖转译。在浏览器目标中加入需要兼容的内核，例如最低目标为 Chromium 30 时：

```text
# .browserslistrc
chrome >= 30
```

在 Vue 配置文件中把 vuepg 加入依赖转译列表：

```js
// vue.config.js
module.exports = {
  transpileDependencies: ["vuepg"],
};
```

已有 `transpileDependencies` 列表时追加 `"vuepg"` 即可。语法转译由 `@vue/cli-plugin-babel` 完成，确认工程已启用它。

运行时 API 按[上一节](#加载运行时-polyfill)补齐。配置完成后检查最终业务脚本、依赖及开发客户端，并在目标浏览器验证启动、输入与更新；不能只检查自己的 `src` 目录。

## 遥控器和原生返回

浏览器派发 `keydown` 时，使用默认映射或[自定义按键映射](./key-actions)。页面嵌在 Android 应用的 WebView 中、原生应用截获按键并回调网页时，可以直接接入逻辑导航和返回处理，见[原生按键接入](./native-bridge)。

## 白屏与输入排查

| 现象                            | 检查项                                                 |
| ------------------------------- | ------------------------------------------------------ |
| 页面启动时报 SyntaxError        | 实际加载脚本、依赖和开发客户端中是否保留现代语法       |
| 某 API 不存在                   | polyfill 是否先加载，语言与 DOM / Web API 是否分别补齐 |
| Vite 页面空白，webpack 页面正常 | 是否在旧设备使用了原生 ESM 开发入口                    |
| 页面可见但遥控器无响应          | 原生应用是否截获按键、键值是否匹配、按键响应是否暂停   |
| 弹窗显示但焦点没进去            | 目标是否已挂载，显示后是否等待 DOM 更新                |
| 布局错位或卡片挤在一起          | CSS 能力、字体与视口缩放                               |
| 生产正常，开发失败              | 开发客户端、WebSocket、资源路径与设备网络              |

## 复现与检查

示例目录的 `pnpm check` 检查类型与构建产物；`pnpm test:chrome30` 使用 Docker 中真实 Chromium 30 检查生产、开发与热更新。安装与结果说明见[自动回归指南](./chromium30-testing)。

遇到设备问题时，请记录盒子型号、Android 版本、浏览器内核、vuepg 版本及复现步骤。自动浏览器回归用于确认应用兼容性；宿主按键协议和设备性能在目标盒子上检查。
