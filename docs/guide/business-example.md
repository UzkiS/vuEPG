---
title: 可复制的 Vue TV 完整示例
description: 独立 Vue 2.7 TV 示例工程，展示循环导航、滚动、页面焦点恢复、弹窗和 Android 原生按键接入；可直接复制，提供 Vite 和 webpack 开发入口。
---

# 完整示例

vuEPG 附带「遥控学习中心」完整示例工程，可独立安装、运行和复制。它配好 Vue 2.7、Vite / webpack 双开发入口、ES5 构建、必要 polyfill 和真实 Chromium 30 回归测试，帮助快速上手 Android 4.x 等运营商存量盒子开发。它用学习页面演示遥控交互，使用本地数据和模拟原生按键，不需要后端服务。

<BusinessExample />

[查看源码](https://github.com/UzkiS/vuEPG/tree/main/examples/tv-training)

示例顶部提供文档和 GitHub 入口，点击后在新窗口打开，方便查看用法与源码。卡片轨道在首尾保留焦点框的绘制空间，循环导航到末项时也能完整显示。

## 可以复用哪些交互

示例的学习主题只是界面内容。以下交互也适用于菜单、内容卡片、频道列表等页面；使用者可以按自己的业务选择需要的部分。

| 交互         | 在示例中体验                     | 实现入口                        |
| ------------ | -------------------------------- | ------------------------------- |
| 循环导航     | 列表左右首尾循环                 | 项上的方向事件和 `move()`       |
| 自动滚动     | 切换卡片，焦点保持在视口中       | 实际容器上的 `v-epg-scroll`     |
| 页面位置恢复 | 进入练习后返回，回到刚才的卡片   | 保存业务 ID，挂载后设置焦点     |
| 动态列表     | 筛选已完成内容，失效焦点恢复     | Vue 更新内容与分组入口          |
| 弹窗         | 打开退出弹窗，方向键保持在弹窗内 | 分组边界与组件返回处理          |
| 关闭复焦     | 返回关闭弹窗，回到可用位置       | 保存原目标并检查其可用性        |
| 原生按键     | 使用 Android 方向、返回按钮      | [原生按键接入](./native-bridge) |

## 复制为自己的工程

下载源码，将 `examples/tv-training` 目录复制到自己的项目位置，在该目录执行：

```sh
pnpm install
pnpm dev       # 现代浏览器快速开发：http://localhost:5175/
pnpm dev:tv    # 旧机顶盒开发：http://电脑局域网IP:5174/
pnpm build     # ES5 兼容构建
pnpm preview   # 生产产物：http://localhost:4174/
```

工程包含自己的依赖、类型配置、开发与构建脚本、自动检查和 AGENTS.md；从 npm 安装 vuepg，不需要父目录文件。替换页面与数据即可开始自己的业务开发。

Vite 入口用于现代浏览器；webpack 入口用于旧机顶盒开发与生产构建。Android 4.x 的配置、polyfill 和排错步骤见[旧设备接入指南](./legacy-webview)。

## 阅读源码

| 文件                                                                                                     | 内容                                       |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| [`app.vue`](https://github.com/UzkiS/vuEPG/blob/main/examples/tv-training/src/app.vue)                   | 页面切换、业务位置记忆、循环导航和内容筛选 |
| [`focus-dialog.vue`](https://github.com/UzkiS/vuEPG/blob/main/examples/tv-training/src/focus-dialog.vue) | 弹窗入口、返回关闭、原目标失效时的回退     |
| [`bridge.ts`](https://github.com/UzkiS/vuEPG/blob/main/examples/tv-training/src/bridge.ts)               | Android 按键映射与监听释放                 |
| [`polyfills.ts`](https://github.com/UzkiS/vuEPG/blob/main/examples/tv-training/src/polyfills.ts)         | 旧设备需要的语言和 DOM / Web API 补齐      |

示例兼容入口还包含 `whatwg-fetch`，供本工程的 webpack 5 热更新下载更新清单使用；这是本示例开发链路的需求，vuEPG 本身不使用 fetch。

在 vuEPG 仓库中开发库或文档时，可以从根目录运行 `pnpm example:dev`、`pnpm example:dev:tv` 和 `pnpm example:build`，使用本地构建的包。浏览器检查与 Docker 环境说明见 [Chromium 30 自动回归](./chromium30-testing)。
