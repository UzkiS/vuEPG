---
title: EPGItem
---

# EPGItem

`EPGItem` 是可移动焦点的最小单位。

## 指令绑定

`v-epg-item` 可将元素设置为 `EPGItem` 。

- 期望的绑定字面量类型

```typescript
interface EPGItemDirective {
  default: boolean;
  class: string;
}
```

- 详细信息

  - `default`: 移动到该层时默认选中的焦点。
  - `class`: 选中时的 class 名，若不设置，则使用全局 class。

- 示例

```html
<div v-epg-item>item1</div>
<div v-epg-item="{default:true}">item2</div>
<div v-epg-item>item3</div>
```

## 监听事件

### 方向事件

`@left`

`@right`

`@up`

`@down`

当方向事件存在时，触发方向事件将不会按原有逻辑移动，同时你也可以通过赋空值的方式阻止某个方向移动事件的发生。

处理函数的参数为 `(item, next)`：`item` 为当前 EPGItem，调用 `next()` 可以继续执行默认移动。

- 示例

```html
<div v-epg-group>
  <div v-epg-item>item1</div>
  // 焦点在 item2 上时，向上移动将被阻止。
  <div v-epg-item @up="">item2</div>
  // 焦点在 item3 上时，向上移动将调用 `move` 函数手动处理移动。
  <div v-epg-item @up="epg.move(top)">item3</div>
</div>
```

### 点击事件

`@click`

当触发 `ENTER` 事件时，会直接调用 `HTMLElement.click()` 来模拟鼠标左键单击一个元素，并触发该事件。

### 获取/失去焦点事件

`@focus`

`@blur`

当聚焦/失焦时触发。
