---
description: 监听 vuEPG 焦点与分组事件，取消默认方向移动，处理业务跳转，并了解 Vue 2.7 和 Vue 3 的监听方式。
---

# 事件

vuEPG 通过**原生 DOM 事件**通知焦点变化。它们都是标准的 [`CustomEvent`](https://developer.mozilla.org/zh-CN/docs/Web/API/CustomEvent)：不冒泡，数据放在 `event.detail` 中。在 Vue 模板里用 `@事件名` 监听。事件写在原生元素上时，Vue 2.7 与 Vue 3 的写法相同。

如果监听写在**组件标签**上，Vue 2.7 需要 `.native` 修饰符，让监听器绑定到组件根元素；Vue 3 直接写 `@epg-*`。在 Vue 2.7 中，方向事件的 `.prevent` 也要与 `.native` 一起使用：`@epg-right.native.prevent`。

事件名统一带 `epg-` 前缀，不会与浏览器原生事件冲突：例如 `<button>` 被鼠标点击时浏览器会派发原生 `focus`，但不会派发 `epg-focus`。

## 事件一览

| 事件                                             | 派发在   | `detail`              | 取消默认导航 |
| ------------------------------------------------ | -------- | --------------------- | ------------ |
| `epg-focus`                                      | EPGItem  | `{ item }`            | 否           |
| `epg-blur`                                       | EPGItem  | `{ item }`            | 否           |
| `epg-enter`                                      | EPGGroup | `{ group }`           | 否           |
| `epg-leave`                                      | EPGGroup | `{ group }`           | 否           |
| `epg-up` / `epg-down` / `epg-left` / `epg-right` | 两者皆可 | `{ node, direction }` | 是           |

所有 `epg-*` 事件均以 `cancelable: true` 派发；方向事件的取消会阻止默认导航。焦点和分组通知发生在状态变化后，取消这些通知不会撤销已经完成的变化。

确定键会直接调用当前焦点元素的 `click()`，所以用普通的 `@click` 即可。

## 焦点变化的顺序

<EventTimelineDemo />

焦点从 A 移动到 B 时，依次派发：

1. A 上的 `epg-blur`；
2. A 所在、但 B 不在的每个组上的 `epg-leave`（由内向外）；
3. B 所在、但 A 不在的每个组上的 `epg-enter`（由外向内）；
4. B 上的 `epg-focus`。

若某个处理函数中又移动了焦点，剩余的事件不再派发，以新的移动为准。

## 方向事件

按下方向键时，在真正移动之前依次派发：

1. 当前焦点元素上的方向事件；
2. 当前组内找不到目标时，在该组上派发方向事件，再到外层继续查找；即使整页都没有目标，沿途的组也会收到事件。

任一处理函数满足以下条件之一，就不再执行默认移动：

- 调用了 `event.preventDefault()`（在模板中写 `.prevent` 修饰符即可）；
- 自己移动了焦点。

```vue
<!-- 禁止向上移动 -->
<div v-epg-item @epg-up.prevent>...</div>

<!-- 向上时跳到指定元素，默认移动自动跳过 -->
<div v-epg-item @epg-up="$epg.move(searchRef)">...</div>

<!-- 只记录、不干预：处理函数执行后照常移动 -->
<div v-epg-item @epg-down="track('down')">...</div>

<!-- 焦点不能向右离开这个组 -->
<div v-epg-group @epg-right.prevent>...</div>
```

::: tip 其他输入方式
虚拟遥控器、手柄等应调用 `epg.navigate("up")`，与方向键走相同的事件和 `.prevent` 流程。`epg.move("up")`、`epg.up()` 等只移动焦点，不派发方向事件。
:::

## 类型

```ts
import type { EPGEvent } from "vuepg";

const onFocus = (event: EPGEvent<"epg-focus">) => {
  console.log(event.detail.item.el);
};

const onUp = (event: EPGEvent<"epg-up">) => {
  console.log(event.detail.node, event.detail.direction);
};
```

## 不使用模板

事件就是普通的 DOM 事件，也可以直接用 `addEventListener` 监听：

```ts
el.addEventListener("epg-focus", (event) => {
  // ...
});
```
