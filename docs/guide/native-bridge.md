---
title: Android 原生遥控器按键接入
description: 将 Android TV、IPTV 与机顶盒宿主的方向键、确定和返回回调接入 vuEPG，使用逻辑导航 API，避免旧 WebView 的合成 KeyboardEvent 兼容问题。
---

# 原生按键接入

在普通浏览器里，按键通过 `keydown` 到达网页，vuEPG 可以直接监听。机顶盒上的网页有时运行在原生 Android 应用内：这个应用提供 WebView、播放器和退出能力，本文称它为**原生容器（宿主应用）**。

原生容器可能先截获按键，再通过约定的 JavaScript 回调传给网页。这个回调通道通常称为 **JS Bridge（原生桥）**。如果设备已经正常派发浏览器 `keydown`，无需额外建立桥接。

本文处理的是第二条输入路径：

```text
遥控器 → Android 原生容器 → JavaScript 回调 → vuEPG 逻辑操作
```

Android keyCode 与浏览器键盘码不同，例如 Android 返回是 `4`，浏览器 Backspace 是 `8`。[完整示例](./business-example)提供模拟原生回调，可以先在浏览器中体验映射结果。

## 方向与返回

```ts
import { useVuEPG } from "vuepg";

const epg = useVuEPG();
const onNativeKey = (keyCode: number): void => {
  if (epg.isPaused()) {
    return;
  }
  switch (keyCode) {
    case 19:
      epg.navigate("up");
      break;
    case 20:
      epg.navigate("down");
      break;
    case 21:
      epg.navigate("left");
      break;
    case 22:
      epg.navigate("right");
      break;
    case 4:
      epg.back();
      break;
  }
};
```

调用 `navigate()` 与用户按下方向键一致，会派发可取消的方向事件。`move("right")` 用于编程式移动，不会经过这条方向事件链路。

确定键可以调用当前可用项的 `el.click()`。应先检查当前项存在、未禁用、仍然渲染，完整守卫见示例 [`bridge.ts`](https://github.com/UzkiS/vuEPG/blob/main/examples/tv-training/src/bridge.ts)。

## 连接设备的原生容器

将原生容器的按键回调连接到上述函数，并保留宿主提供的解绑方式。页面卸载后释放监听，避免返回再进入时重复触发。

示例的 `vuepg-native-key` 是 Mock 契约，不是 vuEPG 内置事件或任何运营商的固定协议。真实设备应沿用宿主协议，并明确哪些按键交给网页、哪些保留给宿主。

在会同时收到原生回调与浏览器 keydown 的设备上，应只选择一条输入链路处理同一次操作。不要把同一次按键既合成为 keydown，又直接调用 `navigate()`。

原生播放器、语音或输入框需要临时接管按键时，使用 `pause()` 返回的释放函数。原生回调入口也需要先检查 `isPaused()`，暂停期间跳过导航、确定和返回处理；所有持有者释放后再恢复响应。见[暂停与恢复](./key-actions)。
