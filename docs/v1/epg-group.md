---
title: EPGGroup
---

# EPGGroup

`EPGGroup` 是可移动焦点的集合，可以包含 `EPGItem` 或其他 `EPGGroup`。空分组不会成为导航落点。

## 指令绑定

`v-epg-group` 可将元素设置为 `EPGGroup` 。

- 期望的绑定字面量类型

```typescript
interface EPGGroupDirective {
  default: boolean;
}
```

- 详细信息

  - `default`: 移动到该层时默认选中的焦点。

- 示例

```html
<div v-epg-group>
  <div v-epg-item>item1</div>
  <div v-epg-item="{default:true}">item2</div>
  <div v-epg-item @up="epg.move(top)">item3</div>
</div>
<div v-epg-group="{default:true}">
  <div v-epg-item>item3</div>
</div>
```

## 监听事件

### 方向事件

`@left`

`@right`

`@up`

`@down`

从某个方向离开本组时触发。

### 获取/失去焦点事件

`@enter`

焦点进入本组、且本组的默认（或第一个）子节点是 EPGGroup 时触发。

`@leave`（未实现）
