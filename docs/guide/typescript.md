# TypeScript

vuEPG 使用 TypeScript 编写，自带完整类型，无需额外安装。

## 全局属性与指令

安装 vuepg 后，以下类型会自动生效：

- 组件实例上的 `$epg`（`this.$epg`、模板中的 `$epg`）；
- Vue 3 模板中 `v-epg-item`、`v-epg-group` 的绑定值类型（需要 Vue - Official 插件）。

::: warning Vue 2.7
Vue 2.7 中 `this.$epg` 的类型需要通过 `defineComponent` 定义组件才能获得。
:::

## 常用类型

```ts
import type {
  VuEPG, // useVuEPG() 的返回值
  EPGConfig, // 配置
  EPGItem, // 焦点元素节点
  EPGGroup, // 分组节点
  EPGNode, // EPGItem | EPGGroup
  EPGItemOptions, // v-epg-item 的绑定值
  EPGGroupOptions, // v-epg-group 的绑定值
  EPGEvent, // 事件，如 EPGEvent<"epg-focus">
  Direction, // "up" | "down" | "left" | "right"
  KeyAction, // 按键事件
  KeyCode, // string | number
} from "vuepg";
```

## 类型守卫

`getNodeByElement` 等方法返回 `EPGNode`，可以用 `isEPGItem` / `isEPGGroup` 收窄类型：

```ts
const node = epg.getNodeByElement(el);
if (epg.isEPGItem(node)) {
  node.focusClass; // string | undefined
}
```
