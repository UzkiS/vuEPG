# 配置

## 设置方式

安装插件时传入：

```ts
app.use(VuEPG, { focusClass: "focused", debug: import.meta.env.DEV });
```

或在任意时候调用 `setConfig`，只需传入要修改的字段：

```ts
useVuEPG().setConfig({ debug: true });
```

用 `getConfig()` 读取当前配置（只读）。

## 配置项

<<< ../../src/core/config.ts#config{ts}

### focusClass

获得焦点的元素会被加上这个 class。修改后，当前焦点元素上的 class 会立即替换。单个元素可以用 [`v-epg-item` 的 `focusClass`](./epg-item#绑定值) 覆盖。

必须是不含空白字符的非空字符串，否则 `setConfig` 会抛出 `TypeError`。

### backHandler

没有生效中的页面级返回处理函数时，按下返回键调用它。详见 [返回处理](./back)。

### debug

开启后，焦点移动、按键、注册与注销等过程会输出到控制台，方便排查“焦点为什么去了那里”。
