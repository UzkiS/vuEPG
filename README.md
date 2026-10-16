<p align="center">
  <a href="https://uzkis.github.io/vuEPG/">
    <img src="https://raw.githubusercontent.com/UzkiS/vuEPG/main/docs/public/logo.svg" width="120" height="120" alt="vuEPG">
  </a>
</p>

<h1 align="center">vuEPG</h1>

<p align="center">Vue 2.7 / Vue 3 焦点管理与空间导航，适用于现代浏览器及 TV、IPTV、机顶盒，兼顾 Android 4.x 等运营商存量盒子</p>
<p align="center">已在各大运营商机顶盒项目中实际落地</p>
<p align="center"><b>简体中文</b> · <a href="./README.en.md">English</a></p>

<p align="center">
  <a href="https://www.npmjs.com/package/vuepg"><img src="https://img.shields.io/npm/v/vuepg?color=d81b60" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/vuepg"><img src="https://img.shields.io/npm/dm/vuepg?color=d81b60" alt="npm downloads"></a>
  <a href="https://github.com/UzkiS/vuEPG/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/UzkiS/vuEPG/ci.yml?branch=main&label=CI" alt="CI"></a>
  <a href="https://bundlejs.com/?q=vuepg"><img src="https://img.shields.io/bundlejs/size/vuepg" alt="bundle size"></a>
  <img src="https://img.shields.io/badge/vue-2.7%20%7C%203-42b883" alt="Vue 2.7 | 3">
  <a href="https://uzkis.github.io/vuEPG/guide/legacy-webview"><img src="https://img.shields.io/badge/target-Chromium%2030%2B-1976d2" alt="Target: Chromium 30+ with ES5 build and polyfills"></a>
  <a href="https://uzkis.github.io/vuEPG/guide/legacy-webview"><img src="https://img.shields.io/badge/Android-4.x%20compatible-3ddc84" alt="Android 4.x integration"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/npm/l/vuepg" alt="license"></a>
</p>

<p align="center">
  <a href="https://uzkis.github.io/vuEPG/">文档</a> ·
  <a href="https://uzkis.github.io/vuEPG/guide/business-example">完整示例</a> ·
  <a href="https://uzkis.github.io/vuEPG/guide/legacy-webview">Android 4.x 接入</a> ·
  <a href="https://uzkis.github.io/vuEPG/migration/">迁移指南</a> ·
  <a href="./CHANGELOG.md">更新日志</a>
</p>

---

vuEPG 为 Vue 页面提供焦点管理与空间导航：在现有元素上添加指令，就能用键盘或遥控器的方向键在元素之间移动焦点；手柄、虚拟遥控器和原生按键回调可以通过 API 接入。页面继续使用自己的组件和样式。

需要兼容 Android 4.x 等运营商存量盒子时，使用 **Vue 2.7 + ES5 应用构建 + 必要 polyfill**，步骤见[旧设备接入指南](https://uzkis.github.io/vuEPG/guide/legacy-webview)。仓库附带的[完整示例工程](#附带完整示例工程)已经配好这些设置，复制后替换页面与数据即可开始开发。

## 特性

- 🎮 **多种输入接入**：内置键盘与遥控器映射，通过逻辑 API 接入手柄、虚拟控制器或原生按键回调
- 🧭 **空间导航**：按元素的真实位置计算方向键的下一个焦点，不需要手写跳转关系
- 🗂️ **分组与默认焦点**：组内优先、逐层向外查找，进入分组时落在指定的默认元素上
- 🛡️ **可靠的失效处理**：导航跳过卸载、隐藏（`v-show`、KeepAlive）、禁用的目标；焦点失效后优先在原分组内恢复，可开启 `restoreFocus` 在卸载后自动复焦
- 📜 **可选自动滚动**：用 `v-epg-scroll` 标记实际滚动容器，保持焦点元素可见
- 🧩 **原生 DOM 事件**：`epg-focus`、`epg-blur`、`epg-enter`、`epg-leave` 与方向事件，用 `.prevent` 拦截默认移动
- 🎛️ **按键可定制**：内置方向、确定、返回映射，兼容只提供 `keyCode` 的老旧机顶盒
- 🔌 **Vue 2.7 / Vue 3**：同一套 API，两个版本在 CI 中分别运行完整测试
- 🪶 **零依赖**：无运行时依赖，产物为 ES2015，兼容 webpack 4，完整 TypeScript 类型

## 安装

```sh
pnpm add vuepg
```

## 使用

```ts
// main.ts
import { createApp } from "vue";
import VuEPG from "vuepg";
import App from "./App.vue";

createApp(App)
  .use(VuEPG, { backHandler: () => history.back() })
  .mount("#app");

// Vue 2.7：Vue.use(VuEPG, { backHandler: () => history.back() })
```

```vue
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useVuEPG } from "vuepg";

const epg = useVuEPG();
const first = ref<HTMLElement>();
onMounted(() => {
  epg.move(first.value);
});
const open = (id: number): void => {
  alert(`选择了内容 ${id}`);
};
</script>

<template>
  <main v-epg-group>
    <button ref="first" v-epg-item="{ default: true }" @click="open(1)">内容 1</button>
    <button v-epg-item @click="open(2)">内容 2</button>
  </main>
</template>

<style>
.vuepg-focus {
  outline: 3px solid #d81b60;
}
</style>
```

- 方向键按位置移动焦点，组内找不到目标时跳到相邻的组
- 确定键触发当前元素的 `click`
- 返回键调用本页的 `onBack`，没有时调用全局的 `backHandler`

完整用法请查看 **[文档](https://uzkis.github.io/vuEPG/)**，也可以先玩一下 **[在线演示](https://uzkis.github.io/vuEPG/guide/playground)**。

已有焦点库项目可按[迁移指南](https://uzkis.github.io/vuEPG/migration/)接入：[vuEPG 1.x](https://uzkis.github.io/vuEPG/migration/v1)、[vue-epg](https://uzkis.github.io/vuEPG/migration/vue-epg) 或 [vue-tv-focusable / tv-focusable](https://uzkis.github.io/vuEPG/migration/tv-focusable)。

## 附带完整示例工程

[遥控学习中心](https://uzkis.github.io/vuEPG/guide/business-example)可直接作为新工程的起点，开发、构建与兼容验证配置都已包含。它展示循环导航、滚动、页面位置恢复、动态列表、弹窗复焦和原生按键接入。示例以学习中心为题材，其中的交互可以直接用于菜单、列表和卡片。

<a href="https://uzkis.github.io/vuEPG/example/tv-training/"><img src="https://raw.githubusercontent.com/UzkiS/vuEPG/main/docs/public/example-preview.png" alt="打开 vuEPG 完整遥控交互示例" width="960"></a>

复制 [examples/tv-training](./examples/tv-training) 目录后，在该目录运行：

```sh
pnpm install
pnpm dev       # Vite，现代浏览器快速开发
pnpm dev:tv    # webpack + Babel，旧机顶盒开发
pnpm build     # ES5 兼容应用
pnpm preview   # 查看生产产物
```

开发 vuEPG 仓库时，也可从根目录运行：

```sh
pnpm install
pnpm example:dev       # 现代浏览器，Vite
pnpm example:dev:tv    # 旧盒子真机开发，webpack + Babel
pnpm example:build     # ES5 应用产物
pnpm example:preview   # 静态产物预览
```

完整说明见 [examples/tv-training](./examples/tv-training)。

## 开发与兼容验证

```sh
pnpm legacy:install   # 在 Docker 中安装并校验真实浏览器与驱动
pnpm test:chrome30    # 构建当前包，测试生产与 webpack 开发入口
pnpm legacy:clean     # 清理旧浏览器缓存、镜像与测试结果
```

真实 Chromium 30 自动回归覆盖生产、webpack 开发及热更新；同时检查导航、滚动、弹窗和焦点恢复。安装、日志与截图说明见[自动回归指南](https://uzkis.github.io/vuEPG/guide/chromium30-testing)。

## 参与贡献

欢迎提交 Issue 与 Pull Request，开发流程见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 支持项目

我的蓝色大肥鱼为爱发电没饭吃了！！！如果本项目有帮到你，可以给她喂一点白饭！🐳🍚

<p><img src="https://raw.githubusercontent.com/UzkiS/vuEPG/main/docs/public/support/blue-fish.webp" width="280" alt="吃白饭的蓝色大肥鱼"></p>

点个 Star、提个建议、分享给朋友，也都是支持。

<details>
<summary>投喂入口 · 微信 / 支付宝</summary>

<p>点击图片可查看原图。</p>
<table>
  <tr><th>微信支付</th><th>支付宝</th></tr>
  <tr>
    <td><a href="https://raw.githubusercontent.com/UzkiS/vuEPG/main/docs/public/support/wechat-pay.png"><img src="https://raw.githubusercontent.com/UzkiS/vuEPG/main/docs/public/support/wechat-pay.png" width="220" alt="微信支付支持项目收款码"></a></td>
    <td><a href="https://raw.githubusercontent.com/UzkiS/vuEPG/main/docs/public/support/alipay.jpg"><img src="https://raw.githubusercontent.com/UzkiS/vuEPG/main/docs/public/support/alipay.jpg" width="220" alt="支付宝支持项目收款码"></a></td>
  </tr>
</table>
</details>

## 致谢

- [vue-epg](https://www.npmjs.com/package/vue-epg)：本项目的起点

## License

[MIT](./LICENSE) © 2022 – Present UzkiS
