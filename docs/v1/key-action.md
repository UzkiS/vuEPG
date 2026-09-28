---
title: 按键事件
---

# 按键事件

## 说明：默认事件

vuEPG 默认预定了 8 种按键事件的按键代码，分别为`UP`、`DOWN`、`LEFT`、`RIGHT`、`ENTER`、`BACK`、`PAGEACTION`、`NUMBER`。

- `UP`、`DOWN`、`LEFT`、`RIGHT`、`ENTER`、`BACK` 由插件内置处理，不可删除；可以通过 `setActionCallback` 追加回调，回调在内置处理之后执行。
- `BACK` 有两层回调，一个为默认回调，一个为临时替换回调。
- 除了`NUMBER`外均默认阻止了浏览器的默认事件。
- `ENTER` 会直接调用 `HTMLElement.click()` 来模拟鼠标左键单击一个元素，并触发该事件。
- 在任何时候，你都可以使用 `epg.getCurrentKeyActions()` 查看当前所有事件的详细信息。

::: details 默认按键事件定义

```javascript
const keyActions = {
  UP: {
    code: ["ArrowUp", 87, 19, 38],
    preventDefault: true,
    callback: null,
  },
  DOWN: {
    code: ["ArrowDown", 83, 40, 20, 47],
    preventDefault: true,
    callback: null,
  },
  LEFT: {
    code: ["ArrowLeft", 65, 29, 21, 37],
    preventDefault: true,
    callback: null,
  },
  RIGHT: {
    code: ["ArrowRight", 68, 22, 32, 39],
    preventDefault: true,
    callback: null,
  },
  ENTER: {
    code: ["Enter", "NumpadEnter", 13, 73, 66, 23, 1],
    preventDefault: true,
    callback: null,
  },
  BACK: {
    code: ["Backspace", 4, 27, 8],
    preventDefault: true,
    callback: null,
  },
  PAGEACTION: {
    code: ["PageUp", "PageDown", 33, 34],
    preventDefault: true,
    callback: null,
  },
  NUMBER: {
    code: [
      "Digit1",
      "Digit2",
      "Digit3",
      "Digit4",
      "Digit5",
      "Digit6",
      "Digit7",
      "Digit8",
      "Digit9",
      "Digit0",
      "Numpad1",
      "Numpad2",
      "Numpad3",
      "Numpad4",
      "Numpad5",
      "Numpad6",
      "Numpad7",
      "Numpad8",
      "Numpad9",
      "Numpad0",
      49,
      50,
      51,
      52,
      53,
      54,
      55,
      56,
      57,
      48,
      96,
      97,
      98,
      99,
      100,
      101,
      102,
      103,
      104,
      105,
    ],
    preventDefault: false,
    callback: null,
  },
};
```

:::

## 说明：获取按键 code

程序会依次读取`event.code`、`event.which`、`event.keyCode`的值，他们的值可以在控制台用如下方法查询，所以你如果需要添加某一个按键，那么你需要将这三个 code 都填写进去，程序会自动帮你去重。

```javascript
document.onkeydown = (event) => {
  console.log(event.code, event.which, event.keyCode);
};
```

## 注册新的按键事件

setAction 方法可以设置一个新的按键事件。

- 类型

```typescript
const setAction: (
  actionName: string,
  code: (string | number)[],
  callback?: Function | null,
  preventDefault?: boolean,
) => void;
```

- 详细信息

  - `actionName`: 事件名称。
  - `code`: 按键 code，一个按键需要填入`event.code` `event.which` `event.keyCode`三种值。
  - `callback`: 事件触发后的回调函数。
  - `preventDefault`: 是否阻止浏览器默认事件。

- 示例

将按键 K 和 L 设置为一个事件，事件名称为 `ALERT`，不阻止浏览器默认事件，按下时弹出窗口提示。

按键 K 的 `event.code` 值为 `KeyK`，`event.which` 值为 `75`，`event.keyCode` 值为 `75`；

按键 L 的 `event.code` 值为 `KeyL`，`event.which` 值为 `76`，`event.keyCode` 值为 `76`。

```javascript
epg.setAction(
  "ALERT",
  ["KeyK", 75, "KeyL", 76],
  () => {
    alert("K and L press down");
  },
  false,
);
```

## 移除按键事件

- 类型

```typescript
const removeAction: (actionName: string) => boolean;
```

::: warning
"UP", "DOWN", "LEFT", "RIGHT", "ENTER", "BACK" 事件不可被移除。
:::

- 示例

```javascript
epg.removeAction("ALERT");
```

## 为事件添加/移除回调函数

- 类型

```typescript
const setActionCallback: (actionName: string, callback?: Function | null) => void;
```

- 示例

```javascript
// 为 ALERT 事件添加回调
epg.setActionCallback("ALERT", () => {
  alert("add a callback");
});

// 移除 ALERT 事件的回调
epg.setActionCallback("ALERT", null);
```

## 为事件设置 preventDefault

在默认事件中，除了`NUMBER`外均默认阻止了浏览器的默认事件。如果我们想要按下数字键时只触发我们定义的回调函数，而非输入数字，这时我们就需要阻止默认事件的发生，反之我们需要解除设置。

- 类型

```javascript
const setActionPreventDefault: (actionName: string, preventDefault: boolean) => void
```

- 示例

```javascript
// 阻止
epg.setActionPreventDefault("ALERT", true);
// 解除阻止
epg.setActionPreventDefault("ALERT", false);
```

## 添加一个按键到已有的事件

- 类型

```javascript
const addCodeToAction: (actionName: string, code: (string | number)[]) => void
```

- 详细信息

  - `actionName`: 事件名称。
  - `code`: 按键 code，一个按键需要填入`event.code` `event.which` `event.keyCode`三种值。

- 示例

```javascript
epg.addCodeToAction("ALERT", ["KeyJ", 74]);
```

## 移除事件中已有的按键

- 类型

```javascript
const removeCodeFromAction: (actionName: string, code: (string | number)[]) => boolean
```

- 详细信息

  - `actionName`: 事件名称
  - `code`: 按键 code

- 示例

```javascript
epg.removeCodeFromAction("ALERT", ["KeyJ", 74]);
```
