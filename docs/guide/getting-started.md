---
description: 安装 vuEPG，在 Vue 2.7 或 Vue 3 注册插件、标记焦点项、设置初始位置并处理遥控器输入。Android 4.x 另提供旧设备接入方案。
---

# 快速开始

## 环境要求

- Vue **2.7** 或 **3.x**（Vue 2.6 及以下请先升级到 2.7）
- Android 4.x / WebView 30 等缺少 `Proxy` 的设备使用 **Vue 2.7**；Vue 3 依赖 `Proxy`，不能仅靠语法转译运行
- 产物语法为 ES2015；目标设备若只支持 ES5，请让构建工具转译 `node_modules/vuepg`
- 浏览器需提供 `CustomEvent` 构造函数、`Symbol`、`Map`、`Set`、`Object.assign` 与 `Array.from`；旧设备缺失时需要相应 polyfill。仅转译语法不会补齐这些运行时 API

希望直接从完整工程开始，可以复制仓库附带的[完整示例](./business-example)，替换页面与数据后开始开发。它配好 Vue 2.7、双开发入口、ES5 构建与必要 polyfill，适合快速上手 Android 4.x 等运营商存量盒子；兼容步骤见[旧设备接入](./legacy-webview)。

## 安装

::: code-group

```sh [pnpm]
pnpm add vuepg
```

```sh [npm]
npm install vuepg
```

```sh [yarn]
yarn add vuepg
```

:::

## 注册插件

::: code-group

```ts [Vue 3]
import { createApp } from "vue";
import VuEPG from "vuepg";
import App from "./App.vue";

createApp(App)
  .use(VuEPG, {
    // 可选，见「配置」
    backHandler: () => history.back(),
  })
  .mount("#app");
```

```ts [Vue 2.7]
import Vue from "vue";
import VuEPG from "vuepg";
import App from "./App.vue";

Vue.use(VuEPG, {
  // 可选，见「配置」
  backHandler: () => history.back(),
});

new Vue({ render: (h) => h(App) }).$mount("#app");
```

:::

插件会：

- 注册全局指令 `v-epg-item`、`v-epg-group` 与 `v-epg-scroll`；
- 注册全局属性 `$epg`，可在模板中直接使用；
- 开始监听键盘。

## 焦点样式

获得焦点的元素会被加上 `vuepg-focus` class（可在 [配置](./configuration) 中修改），先给它一个醒目的样式：

```css
.vuepg-focus {
  outline: 3px solid #d81b60;
  transform: scale(1.05);
}
```

## 第一个页面

```vue
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useVuEPG } from "vuepg";

const epg = useVuEPG();
const search = ref<HTMLElement>();

onMounted(() => {
  epg.move(search.value);
});

epg.onBack(() => {
  console.log("本页返回");
});

const play = (n: number): void => {
  console.log("播放影片", n);
};
</script>

<template>
  <nav v-epg-group>
    <button ref="search" v-epg-item>搜索</button>
    <button v-epg-item>我的</button>
  </nav>

  <main v-epg-group="{ default: true }">
    <div v-for="n in 6" :key="n" v-epg-item="{ default: n === 1 }" @click="play(n)">
      影片 {{ n }}
    </div>
  </main>
</template>
```

- 方向键在元素之间移动，组内找不到目标时自动跳到相邻的组；
- 确定键会触发当前元素的 `click`；
- 返回键调用本页的 `onBack`，没有时调用全局的 `backHandler`。

## 获取实例

vuEPG 是全局单例，以下三种方式拿到的是同一个对象：

```ts
import { useVuEPG } from "vuepg";
const epg = useVuEPG(); // 任意位置
```

```vue
<template>
  <!-- 模板中 -->
  <div v-epg-item @epg-up="$epg.move('left')">...</div>
</template>
```

```ts
export default {
  mounted() {
    this.$epg.move("down"); // Options API
  },
};
```

## 下一步

- [EPGItem](./epg-item) 与 [EPGGroup](./epg-group)：两个指令的全部用法
- [事件](./events)：监听焦点变化、拦截方向键
- [移动规则](./navigation)：方向键的目标是怎么选出来的
- [自动滚动](./scrolling)：让焦点项保持可见
