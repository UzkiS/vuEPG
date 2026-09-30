---
title: 从 vue-tv-focusable / tv-focusable 迁移到 vuEPG
description: 将 vue-tv-focusable 的 v-focusable、$tv.next、requestFocus、方向事件、焦点样式、滚动与 limitingEl 弹窗迁移到 vuEPG，保留 Vue 页面与点击逻辑。
---

# 从 vue-tv-focusable 迁移

本页面向使用 `vue-tv-focusable` 的 Vue 项目，对照其 [2.x 文档](https://slailcp.github.io/focusable-document/#/)和[官方示例](https://github.com/slailcp/tv-focusable-example/tree/master/vue-tv-focusable-example)说明迁移方式。旧代码里的 `v-focusable`、`this.$tv`、`requestFocus()` 和 `next()` 都在下面列出对应写法。

可保留已有界面、业务组件和 `@click`。重点检查指令绑定、方向事件、滚动和弹窗；两个库的导航规则不同，不能只批量替换名字后就结束验收。

## 迁移前先看差异

下表对照 `vue-tv-focusable` 2.x 的公开文档与示例。两者都可以接入已有页面；选择主要取决于你需要哪些内置行为。

| 方面               | vue-tv-focusable                            | vuEPG                                           | 取舍                                         |
| ------------------ | ------------------------------------------- | ----------------------------------------------- | -------------------------------------------- |
| 指令与框架         | Vue 2 / 3 包装，使用 `v-focusable` 与 `$tv` | Vue 2.7 / 3，焦点项、分组与滚动容器各有指令     | Vue 2.6 需先升级，布尔绑定改为选项对象       |
| 方向事件           | 2.x 注册监听后需调用 `next()` 继续移动      | 监听默认继续移动，`.prevent` 明确取消           | 常规观察更直接，旧的继续移动代码要删除       |
| 滚动               | 提供平滑动画、边缘距离与滚动速度配置        | 显式容器、嵌套滚动和对齐方式，直接更新位置      | 可预测的容器控制；旧动画与节流效果需业务实现 |
| 弹窗与复焦         | 用 `limitingEl` 限制区域，关闭时重置        | 分组边界、组件返回处理，示例包含复焦与 Tab 隔离 | 生命周期更明确，不能只将 `limitingEl` 改名   |
| 长按、表单与 XPath | 内置长按、表单自动进入编辑及 XPath 工具     | 原生 click、focus 与事件 API；不内置这些工具    | 原库功能较全，依赖这些能力的页面需要额外迁移 |
| 旧设备工程         | 文档和示例提供接入用法                      | 独立双工具链示例和真实 Chromium 30 自动回归     | 可复制验证路径，仍需核对实际设备输入与性能   |

## 先替换安装与入口

1. Vue 2.6 项目先升级到 Vue 2.7，并同步 `vue-template-compiler` 版本；Vue 3 项目沿用现有框架。
2. 移除 `vue-tv-focusable` 的插件注册及导入，再安装 vuepg。两个插件都会监听按键，迁移页面时使用独立入口验证，避免同时处理一次输入。
3. 将焦点项、事件与 `$tv` 调用逐项替换，按下文核对滚动和弹窗。
4. Android 4.x / WebView 30 工程使用 Vue 2.7、ES5 应用构建与必要 polyfill，见[旧设备接入](../guide/legacy-webview)。

```sh
pnpm remove vue-tv-focusable
pnpm add vuepg
```

::: code-group

```js [Vue 2.7]
import Vue from "vue";
import VuEPG from "vuepg";
import App from "./App.vue";

Vue.use(VuEPG, { focusClass: "focus" });
new Vue({ render: (h) => h(App) }).$mount("#app");
```

```js [Vue 3]
import { createApp } from "vue";
import VuEPG from "vuepg";
import App from "./App.vue";

createApp(App).use(VuEPG, { focusClass: "focus" }).mount("#app");
```

:::

这里保留旧的 `.focus` 样式名；希望使用新名称时，改成默认的 `.vuepg-focus` 或自己的 class。完整安装步骤见[快速开始](../guide/getting-started)。

## 常用写法对照

| vue-tv-focusable                     | vuEPG                                                   | 迁移要点                                          |
| ------------------------------------ | ------------------------------------------------------- | ------------------------------------------------- |
| `v-focusable` / `v-focusable="true"` | `v-epg-item`                                            | 在实际 DOM 元素上注册焦点项                       |
| `v-focusable="enabled"`              | `v-epg-item="{ disabled: !enabled }"`                   | 布尔绑定改为选项对象；不能原样传 `true` / `false` |
| `this.$tv` / 导出的 `focusable`      | `this.$epg` / `useVuEPG()`                              | 不需要再创建空 Vue 实例获取服务                   |
| `focusClassName`                     | `focusClass`                                            | 在安装选项或 `epg.setConfig()` 中配置             |
| `requestFocus(el)` / `next(el)`      | `epg.move(el)`                                          | 等目标渲染后调用；失败时返回 `false`              |
| `next("right")`                      | `epg.move("right")` 或 `epg.navigate("right")`          | 前者编程式移动；后者模拟用户方向操作              |
| `@onFocus` / `@on-focus`             | `@epg-focus`                                            | 当前 DOM 元素由 `event.detail.item.el` 获取       |
| `@onBlur` / `@on-blur`               | `@epg-blur`                                             | 使用新的事件名与 detail 结构                      |
| `@left` / `@right` / `@up` / `@down` | `@epg-left` / `@epg-right` / `@epg-up` / `@epg-down`    | 默认继续移动；需要阻止时加 `.prevent`             |
| `@click`                             | `@click`                                                | 确定键仍调用当前元素的 `click()`                  |
| `KEYS`                               | `epg.setKeyAction()` / `epg.addKeyCodes()`              | 按事件名称配置，见下文                            |
| `scrollEl` / `setScrollEl(el)`       | 实际滚动容器上的 `v-epg-scroll`                         | 无需在页面销毁时重置全局滚动元素                  |
| `distanceToCenter: true`             | `v-epg-scroll="'center'"` 或 `scrollViewport: "center"` | 分别控制局部容器与文档视口                        |
| `limitingEl` / `resetLimitingEl()`   | 弹窗分组的方向边界 + `onBack()`                         | 保存旧焦点，关闭后主动复焦；见完整示例            |
| `[focused]`                          | `epg.getCurrentItem()?.el`                              | 不再用旧属性查找或手动清除焦点                    |
| `getElementByPath()` / `readXPath()` | 模板 ref、稳定业务 ID、DOM 查询                         | 没有同名 XPath API                                |

Vue 2.7 的**组件标签**需要 `.native` 监听根 DOM，例如 `@epg-focus.native`；普通 `<div>`、`<button>` 不需要。Vue 3 使用 `@epg-focus`。图标或 SVG 可放在可点击的 HTML 按钮内，将 `v-epg-item` 放在按钮上，确定操作沿用按钮的 `@click`。见[事件](../guide/events)。

## 迁移一个基本页面

下面是保留 Options API 和 `.focus` 样式的 Vue 2.7 / Vue 3 共用写法：

```vue
<script>
import { useVuEPG } from "vuepg";

export default {
  data() {
    return { enabled: true, message: "" };
  },
  mounted() {
    this.$nextTick(() => {
      useVuEPG().move(this.$refs.first);
    });
  },
  methods: {
    open() {
      this.message = "已选择内容";
    },
  },
};
</script>

<template>
  <main v-epg-group>
    <button ref="first" v-epg-item="{ default: true }" @click="open">内容 1</button>
    <button v-epg-item="{ disabled: !enabled }" @click="open">内容 2</button>
    <p>{{ message }}</p>
  </main>
</template>

<style>
.focus {
  outline: 3px solid #d81b60;
  outline-offset: 3px;
}
</style>
```

`default` 定义进入这一层级时的入口，不会在挂载时自动抢焦点；首屏仍在 DOM 更新后调用 `move()`。已有菜单、内容区和弹窗可分别使用 `v-epg-group`，普通网格无需按行拆组。跨组会进入目标组的默认项，见[分组](../guide/epg-group)与[移动规则](../guide/navigation)。

## 方向事件：避免重复移动

`vue-tv-focusable` 2.x 中，监听 `@right` 后需要调用 `$tv.next("right")` 才会继续默认移动。vuEPG 的观察型监听默认继续移动：

```vue
<!-- 旧：处理函数里还需调用 $tv.next("right") -->
<div v-focusable @right="trackAndMove">...</div>

<!-- 新：只记录，由 vuEPG 继续移动 -->
<div v-epg-item @epg-right="track('right')">...</div>

<!-- 新：明确阻止向右移动 -->
<div v-epg-item @epg-right.prevent>...</div>

<!-- 新：跳到业务指定元素，默认移动自动跳过 -->
<div v-epg-item @epg-right="$epg.move(targetRef)">...</div>
```

事件处理函数里只保留记录、业务跳转等需要的逻辑，去掉仅为继续默认移动而写的 `next()`。异步判断必须**同步取消**默认移动，再等待结果：

```vue
<script setup>
import { useVuEPG } from "vuepg";

const epg = useVuEPG();
const onRight = async () => {
  const origin = epg.getCurrentItem();
  const allowed = await canLeave();
  if (allowed && origin !== null && epg.getCurrentItem() === origin) {
    epg.move("right");
  }
};
</script>

<template>
  <div v-epg-item @epg-right.prevent="onRight">...</div>
</template>
```

`canLeave()` 由业务提供。不要在 `epg-right` 处理函数中调用 `navigate("right")`，否则会再次派发同一方向事件。虚拟遥控器、手柄或原生按键入口则使用 `navigate()`，见[原生按键接入](../guide/native-bridge)。

## 按键与返回

例如将旧 `KEYS.KEY_ENTER: [83, 13]` 迁移为：

```js
import { useVuEPG } from "vuepg";

const epg = useVuEPG();
epg.setKeyAction("ENTER", {
  codes: ["KeyS", 83, "Enter", 13],
  preventDefault: true,
});
```

`setKeyAction()` **替换**这组映射；只是追加设备键值时用 `addKeyCodes()`。现代浏览器优先识别 `event.code`，旧内核回退数字键值；不要只搬数字数组。默认映射见[按键映射](../guide/key-actions)。

页面或弹窗返回逻辑在 `setup()` 或 Options API 的 `created()` 中登记：

```js
export default {
  created() {
    this.$epg.onBack(() => {
      this.closeDialog();
    });
  },
};
```

生效中的组件处理函数优先于全局 `backHandler`；卸载时释放登记，KeepAlive 失活时暂停、再次激活后恢复。见[返回处理](../guide/back)。

## 局部滚动与整页滚动

```vue
<!-- 在真正有 overflow 和尺寸限制的容器上标记 -->
<div v-epg-scroll class="content-scroll">
  <main v-epg-group>
    <button v-for="item in items" :key="item.id" v-epg-item>{{ item.title }}</button>
  </main>
</div>

<!-- 需要居中时 -->
<div v-epg-scroll="'center'" class="content-scroll">...</div>
```

整页滚动需安装时配置 `scrollViewport: true`，或调用 `epg.setConfig({ scrollViewport: "center" })`。vuEPG 默认关闭自动滚动，不会从 `overflow` 猜测容器；滚动容器与导航分组互相独立。

旧 `requestFocus(el, false)` 的动画参数没有对应位置参数。vuEPG 直接设置滚动位置；`smoothTime`、`spacingTime`、`offsetDistance` 和 `scrollTo()` 等效果按业务实现，不能原样传给 `move()`。见[自动滚动](../guide/scrolling)。

## 弹窗与页面焦点恢复

把旧 `limitingEl` 改为弹窗自己的分组，在四个方向边界上加 `.prevent`：

```vue
<section v-epg-group @epg-up.prevent @epg-down.prevent @epg-left.prevent @epg-right.prevent>
  <button ref="cancel" v-epg-item @click="closeDialog">取消</button>
  <button v-epg-item @click="confirmDialog">确定</button>
</section>
```

方向边界约束用户导航；业务直接调用 `move()` 仍可指定其他目标。打开前保存 `epg.getCurrentItem()?.el`，显示后等 `nextTick()` 再聚焦；关闭时尝试 `epg.move(previous)`，失败后回到业务入口。完整的生命周期、返回与 Tab 隔离实现可复制[示例弹窗](https://github.com/UzkiS/vuEPG/blob/main/examples/tv-training/src/focus-dialog.vue)。

页面返回与 KeepAlive 恢复优先保存稳定业务 ID，再在内容渲染后找到对应元素并调用 `move()`。数据筛选或排序后，XPath 中的节点序号可能不再指向原内容。不要照搬移除 `[focused]` 属性的修复代码；vuEPG 维护焦点 class 与失效恢复，完整业务位置记忆见[完整示例](../guide/business-example)。

## 需要单独迁移的能力

| 旧能力                                          | 处理方式                                                                  |
| ----------------------------------------------- | ------------------------------------------------------------------------- |
| `findFocusType` / `initDis`                     | 没有同名模式；先验收新的空间导航，特殊跳转使用方向事件                    |
| `@longPress` / `longPressTime`                  | 没有内置长按事件；业务监听 keydown / keyup，管理重复键与定时器            |
| `scrollSpeedX` / `scrollSpeedY` / `scrollSpeed` | 没有内置按键节流配置；在业务输入入口处理，并验证长按体验                  |
| `formAutofocus`                                 | 确定键触发 click；需进入编辑时由 click 处理函数调用输入框的原生 `focus()` |
| `setOnFocusChangeListener()`                    | 在项目中监听 `epg-focus` / `epg-blur`；事件不冒泡，监听实际焦点元素       |
| `init()` / `reset*()` / `reset()`               | 使用文档中的配置与生命周期 API；没有统一重置所有状态的公开方法            |

## 迁移后检查

确认首屏焦点、四方向跳转、disabled 更新、确定点击和返回符合页面设计。再覆盖弹窗隔离与复焦、内容隐藏／卸载、KeepAlive 返回、局部与文档滚动，以及长按和原生键值。

需要现成工程验证时使用[完整示例](../guide/business-example)；旧设备配置见[兼容指南](../guide/legacy-webview)，浏览器回归见[Chromium 30 测试](../guide/chromium30-testing)。
