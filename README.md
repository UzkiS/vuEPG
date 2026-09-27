<p align="center">
  <a href="https://uzkis.github.io/vuEPG/">
    <img src="https://raw.githubusercontent.com/UzkiS/vuEPG/main/docs/public/logo.svg" width="120" height="120" alt="vuEPG">
  </a>
</p>

<h1 align="center">vuEPG</h1>

<p align="center">为 TV、IPTV、机顶盒网页打造的遥控器焦点管理与空间导航插件，Vue 2.7 / Vue 3 通用</p>

<p align="center">
  <a href="https://www.npmjs.com/package/vuepg"><img src="https://img.shields.io/npm/v/vuepg?color=d81b60" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/vuepg"><img src="https://img.shields.io/npm/dm/vuepg?color=d81b60" alt="npm downloads"></a>
  <a href="https://github.com/UzkiS/vuEPG/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/UzkiS/vuEPG/ci.yml?branch=main&label=CI" alt="CI"></a>
  <a href="https://bundlejs.com/?q=vuepg"><img src="https://img.shields.io/bundlejs/size/vuepg" alt="bundle size"></a>
  <img src="https://img.shields.io/badge/vue-2.7%20%7C%203-42b883" alt="Vue 2.7 | 3">
  <a href="./LICENSE"><img src="https://img.shields.io/npm/l/vuepg" alt="license"></a>
</p>

<p align="center">
  <a href="https://uzkis.github.io/vuEPG/">文档</a> ·
  <a href="https://uzkis.github.io/vuEPG/guide/playground">在线演示</a> ·
  <a href="https://uzkis.github.io/vuEPG/migration/v1">从 1.x 升级</a> ·
  <a href="./CHANGELOG.md">更新日志</a>
</p>

---

## 特性

- 🧭 **空间导航**：按元素的真实位置计算方向键的下一个焦点，不需要手写跳转关系
- 🗂️ **分组与默认焦点**：组内优先、逐层向外查找，进入分组时落在指定的默认元素上
- 🛡️ **可靠的失效处理**：卸载、隐藏（`v-show`、KeepAlive）、禁用的元素自动跳过，焦点失效后自动回到入口
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
const search = ref<HTMLElement>();

onMounted(() => epg.move(search.value));
epg.onBack(() => closeDialog());
</script>

<template>
  <nav v-epg-group>
    <button ref="search" v-epg-item>搜索</button>
    <button v-epg-item>我的</button>
  </nav>

  <main v-epg-group="{ default: true }">
    <div
      v-for="movie in movies"
      :key="movie.id"
      v-epg-item="{ default: movie.id === 1 }"
      @epg-focus="preview(movie)"
      @click="play(movie)"
    >
      {{ movie.title }}
    </div>
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

## 参与贡献

欢迎提交 Issue 与 Pull Request，开发流程见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 致谢

- [vue-epg](https://www.npmjs.com/package/vue-epg)：本项目的起点

## License

[MIT](./LICENSE) © 2022-present UzkiS
