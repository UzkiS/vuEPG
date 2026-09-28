---
title: vue-epg 差异
---

# vue-epg 差异

vuEPG 保留、更改或移除了一些 vue-epg 的特性。为了旧组件的重用，你需要参考本页内容。

## 行为差异

### 移动逻辑

vuEPG 的移动逻辑是完全重新编码的，与 vue-epg 完全不同。vuEPG 是通过 `EPGGroup` 和 `EPGItem` 的层级关系来进行移动的，而 vue-epg 是通过对所有 Item 进行对比来移动的，详见[移动规则](/v1/move-rule)。

### 按键事件

vue-epg 默认对所有按键操作执行 `preventDefault()` 操作并且无法设置，这样会导致所有按键操作事件全部失效，无法输入数字，也无法使用键盘原生的各种功能。
vuEPG 中，默认只会对预定义的 7 种按键事件执行`preventDefault()` 操作，并且也可以通过设置来操控是否需要`preventDefault()` ，详见[按键事件](/v1/key-action)。

### 自定义指令变更

vue-epg 使用 `v-items`/`v-groups` 指令来注册可移动对象和组。vuEPG 1.0 起不再支持这两个指令，请改为 `v-epg-item`/`v-epg-group`。

## 已移除，可恢复的

### $service

vuEPG 移除了对 $service 的默认绑定。因为 $service 的名称不具有唯一性，容易出现一些问题。为了兼容性，你需要手动赋值全局变量。

::: warning
`$service` 命名不合理，仅用为兼容性保留。如果你需要使用 Options API ，我们也推荐您使用非全局变量来进行操作。如果你确实需要使用全局变量，我们建议您使用新的变量名，比如 `$epg`。
:::

```javascript
// main.js
import { useVuEPG } from "vuepg";
const epg = useVuEPG();

// Vue2
Vue.prototype.$service = epg;
// Vue3
app.config.globalProperties.$service = epg;
```

### serviceBack

vuEPG 移除了对 serviceBack 的支持。 在 vue-epg 中，serviceBack 是使用 mixins 实现的。mixins 是 Vue 2 创建可重用组件逻辑的主要方式，但现在已不再推荐。为了兼容性，你需要手动配置 mixin。

::: danger 十分不推荐
mixin 仅对已有代码进行兼容，有且仅支持 Options API。编写新代码时，请直接使用 onBack 函数，详见[返回回调](/v1/back-callback)。
:::

```javascript
// main.js
import { useVuEPG } from "vuepg";

const epg = useVuEPG();

Vue.mixin({
  created() {
    if (this.serviceBack) {
      epg.onBack(this.serviceBack);
    }
  },
});
```

## 已弃用，不可恢复的

### XPath

vuEPG 完全移除了对 XPath 的支持，`getPointerPosition()` 和 `getEleByPath(xpath)` 已不再可用，如果你需要用到，可以在你的项目中自行实现相关功能。

### Group class

Group class 无实际意义，已移除，不再对 group 自动添加 class。通常情况下，你都可以手动为 Group 添加 class。
