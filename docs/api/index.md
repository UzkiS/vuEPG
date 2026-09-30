---
description: vuEPG API 参考：移动焦点、方向导航、查询节点、配置按键、暂停响应与生命周期返回处理。
---

# API

## 入口

```ts
import VuEPG, { useVuEPG } from "vuepg";
```

| 导出         | 说明                                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| 默认导出     | 插件，`app.use(VuEPG, options?)` / `Vue.use(VuEPG, options?)`，`options` 同 [配置](../guide/configuration) |
| `useVuEPG()` | 返回 vuEPG 实例（全局单例），即下文的 `epg`；模板与组件实例中也可以通过 `$epg` 访问                        |
| 类型         | 见 [TypeScript 接入](../guide/typescript)                                                                  |

## 移动

### epg.move

```ts
move(target: Direction | FocusTarget | null | undefined): boolean
type FocusTarget = EPGNode | Element | { $el: unknown }
```

- 传入方向时，按 [移动规则](../guide/navigation) 移动；
- 传入 EPGItem、EPGGroup、DOM 元素或组件实例（取其 `$el`）时，移动到对应的 EPGItem，或进入对应的 EPGGroup。

返回焦点是否移动到了目标。目标未注册、不可获得焦点，或方向上没有目标时返回 `false`。编程式调用不会派发方向事件。

```ts
epg.move("down");
epg.move(templateRef.value);
```

### epg.navigate

```ts
navigate(direction: Direction): boolean
```

处理一次用户方向操作，与按方向键相同：先派发可取消的方向事件，再执行默认移动。当前焦点失效时先在原分组恢复焦点。供虚拟遥控器、手柄等输入方式调用。焦点发生变化时返回 `true`；方向无效时抛出 `TypeError`。

### epg.up

等同于 `epg.move("up")`。

### epg.down

等同于 `epg.move("down")`。

### epg.left

等同于 `epg.move("left")`。

### epg.right

等同于 `epg.move("right")`。

### epg.moveToItem

```ts
moveToItem(item: EPGItem): boolean
```

让指定 EPGItem 获得焦点。

### epg.moveToGroup

```ts
moveToGroup(group: EPGGroup): boolean
```

进入指定 EPGGroup，焦点落在组内 `default` 元素或第一个可获得焦点的元素上。

### epg.findTarget

```ts
findTarget(direction: Direction): EPGNode | null
```

计算从当前焦点出发、指定方向上的下一个目标，**不移动焦点**。

## 返回

### epg.back

```ts
back(): void
```

执行返回处理：调用生效中的页面级处理函数，没有时调用全局 `backHandler`。见 [返回处理](../guide/back)。

### epg.onBack

```ts
onBack(handler: () => void): void
```

在组件 `setup()` 或 `created()` 中注册页面级返回处理函数。

## 暂停

### epg.pause

```ts
pause(): () => void
```

暂停响应按键，返回释放本次暂停的函数。多处同时暂停时，各自调用自己的释放函数，全部释放后才恢复响应。

### epg.resume

```ts
resume(): void
```

立即恢复响应按键，清除所有尚未释放的暂停。需要只恢复自己发起的暂停时，调用 `pause()` 返回的函数。

### epg.isPaused

```ts
isPaused(): boolean
```

## 配置

### epg.setConfig

```ts
setConfig(patch: Partial<EPGConfig>): void
```

合并配置，见 [配置](../guide/configuration)。`focusClass` 非法时抛出 `TypeError`。

### epg.getConfig

```ts
getConfig(): Readonly<EPGConfig>
```

## 查询

### epg.getCurrentItem

```ts
getCurrentItem(): EPGItem | null
```

当前获得焦点的 EPGItem。

### epg.getCurrentGroup

```ts
getCurrentGroup(): EPGGroup | null
```

当前焦点所在的（最近的）EPGGroup。

### epg.getFocusClass

```ts
getFocusClass(): string
```

当前焦点使用的 class：元素自身的 `focusClass`，没有时为全局 `focusClass`。

### epg.getItems

```ts
getItems(): EPGItem[]
```

所有已注册的 EPGItem（含被隐藏、禁用的）。

### epg.getGroups

```ts
getGroups(): EPGGroup[]
```

所有已注册的 EPGGroup。

### epg.getNodeByElement

```ts
getNodeByElement(el: Element): EPGNode | null
```

获取元素对应的 EPGItem 或 EPGGroup。

### epg.getParentGroup

```ts
getParentGroup(target: EPGNode | Element): EPGGroup | null
```

获取节点（或元素）最近的父级 EPGGroup。

### epg.getChildren

```ts
getChildren(group?: EPGGroup | null): EPGNode[]
```

获取组内第一层的 EPGItem / EPGGroup（中间可隔任意普通元素）。不传参数时返回顶层节点。

### epg.getItemsInGroup

```ts
getItemsInGroup(group: EPGGroup): EPGItem[]
```

获取组内任意深度的全部 EPGItem，按文档顺序。

### epg.isEPGItem

```ts
isEPGItem(value: unknown): value is EPGItem
```

### epg.isEPGGroup

```ts
isEPGGroup(value: unknown): value is EPGGroup
```

## 按键

见 [按键映射](../guide/key-actions)。

### epg.getKeyActions

```ts
getKeyActions(): Readonly<Record<string, KeyAction>>
```

当前全部按键事件的只读快照。

### epg.setKeyAction

```ts
setKeyAction(name: string, options: KeyActionOptions): void

interface KeyActionOptions {
  codes: readonly KeyCode[];
  preventDefault?: boolean; // 默认 false
  callback?: ((code: KeyCode, event: KeyboardEvent) => void) | null; // 默认 null
}
```

新增或替换按键事件。

### epg.updateKeyAction

```ts
updateKeyAction(name: string, patch: Partial<KeyActionOptions>): void
```

修改已有按键事件的部分字段；事件不存在时抛出错误。

### epg.removeKeyAction

```ts
removeKeyAction(name: string): boolean
```

删除按键事件，返回是否删除；删除内置事件时抛出错误。

### epg.addKeyCodes

```ts
addKeyCodes(name: string, codes: readonly KeyCode[]): void
```

为按键事件追加按键。

### epg.removeKeyCodes

```ts
removeKeyCodes(name: string, codes: readonly KeyCode[]): void
```

从按键事件中移除按键。

## 节点

`EPGItem` 与 `EPGGroup` 共有的只读成员：

| 成员         | 类型          | 说明                                                       |
| ------------ | ------------- | ---------------------------------------------------------- |
| `id`         | `string`      | 唯一 ID，同时写入 `data-epg-item-id` / `data-epg-group-id` |
| `el`         | `HTMLElement` | 对应的 DOM 元素                                            |
| `options`    | `object`      | 当前绑定值                                                 |
| `isDefault`  | `boolean`     | 是否为默认焦点                                             |
| `isDisabled` | `boolean`     | 是否被禁用                                                 |
| `getRect()`  | `DOMRect`     | 元素的视口坐标                                             |

`EPGItem` 另有 `focusClass: string | undefined`。
