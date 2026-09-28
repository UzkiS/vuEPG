---
title: 配置EPG
---

# 配置 EPG

我们可以在任何时候使用调用 `setConfig` 来配置 EPG

- 类型

```typescript
interface EPGConfig {
  focusClass?: string;
  defBackHandler?: Function | null;
  tempBackHandler?: Function | null;
  debug?: boolean;
}
```

- 详细信息

  - `focusClass`: 全局焦点元素的 class 名，默认为`vuepg-focus`。
  - `defBackHandler`: 默认的触发返回事件的回调。
  - `tempBackHandler`: 请不要在 setConfig 中配置该项。此处用于单页面返回回调的设置，由 `onBack` 函数操作，详见[返回回调](/v1/back-callback)
  - `debug`: 开启 `console.log` 输出，查看 EPG 运行情况。

- 示例

```javascript
epg.setConfig({
  focusClass: "focus",
  defBackHandler: () => {
    console.log("back");
  },
  debug: true,
});
```
