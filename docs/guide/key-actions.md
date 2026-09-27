# 按键映射

vuEPG 把按键映射为**按键事件**（key action）。每个按键事件包含一组按键、是否阻止浏览器默认行为，以及一个可选的回调。

## 默认按键事件

<<< ../../src/core/keyboard.ts#default-key-actions{ts}

| 事件                             | 内置行为                              |
| -------------------------------- | ------------------------------------- |
| `UP` / `DOWN` / `LEFT` / `RIGHT` | 移动焦点，见 [移动规则](./navigation) |
| `ENTER`                          | 调用当前焦点元素的 `click()`          |
| `BACK`                           | 调用返回处理，见 [返回处理](./back)   |
| `PAGE` / `NUMBER`                | 无，可通过回调自行处理                |

带内置行为的 6 个事件不可删除，但可以修改它们的按键、`preventDefault` 与回调；回调在内置行为**之后**执行。

## 按键是如何识别的

读取顺序为 `event.code` → `event.which` → `event.keyCode`，取第一个有效值（`event.code` 为空或 `"Unidentified"` 时视为无效）。现代浏览器通常只会匹配到 `event.code`，只提供数字键值的老旧机顶盒浏览器会匹配到数字。因此添加一个按键时，建议**同时写上 `event.code` 和数字键值**。

在目标设备上查看键值：

```ts
document.addEventListener("keydown", (event) => {
  console.log(event.code, event.which, event.keyCode);
});
```

## 自定义

```ts
const epg = useVuEPG();

// 新增：按 M 或遥控器菜单键（键值 82）打开菜单
epg.setKeyAction("MENU", {
  codes: ["KeyM", 82],
  preventDefault: true,
  callback: (code, event) => openMenu(),
});

// 修改部分字段
epg.updateKeyAction("NUMBER", {
  preventDefault: true,
  callback: (code) => jumpToChannel(code),
});

// 为已有事件追加 / 移除按键
epg.addKeyCodes("ENTER", ["Space", 32]);
epg.removeKeyCodes("UP", [87]);

// 删除自定义事件
epg.removeKeyAction("MENU");

// 查看当前全部按键事件（只读快照）
console.log(epg.getKeyActions());
```

修改不存在的事件、删除内置事件时会抛出错误。

## 暂停

弹出原生输入框、播放全屏视频等场景下，可以暂停 vuEPG 对按键的响应：

```ts
epg.pause();
epg.resume();
epg.isPaused(); // boolean
```

暂停期间不会调用 `preventDefault()`，按键完全交还给浏览器。
