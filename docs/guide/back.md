---
description: 配置全局和组件返回处理，管理弹窗关闭、页面后退与 KeepAlive 激活后的返回优先级。
---

# 返回处理

按下返回键（默认 `Backspace`、`Escape` 及常见遥控器返回键）时，vuEPG 按以下顺序查找处理函数：

1. 生效中的**页面级**处理函数（`onBack`），从最后登记的开始；
2. 全局处理函数（配置项 `backHandler`）；
3. 都没有时什么也不做。

处理函数返回 `false` 表示不处理，交给下一个处理函数，见[交给下一个处理函数](#交给下一个处理函数)。也可以调用 `epg.back()` 手动触发同样的流程，它返回是否有处理函数处理了返回。

## 全局处理函数

```ts
app.use(VuEPG, {
  backHandler: () => router.back(),
});
```

## 页面级处理函数

在组件的 `setup()` 中调用 `onBack`：

```vue
<script setup lang="ts">
import { useVuEPG } from "vuepg";

const epg = useVuEPG();

epg.onBack(() => {
  // 先关闭弹窗，而不是直接返回上一页
  closeDialog();
});
</script>
```

Options API 中在 `created()` 里调用：

```ts
export default {
  created() {
    this.$epg.onBack(() => this.close());
  },
};
```

### 生效规则

| 组件状态              | 处理函数 |
| --------------------- | -------- |
| 挂载 / KeepAlive 激活 | 生效     |
| KeepAlive 失活        | 暂停     |
| 卸载                  | 移除     |

同时有多个处理函数生效时（例如页面中打开了一个弹窗，二者都注册了 `onBack`），**最后登记且仍生效**的处理函数优先；组件在 setup 阶段登记，因此嵌套组件或新打开的弹窗通常优先。弹窗卸载后，页面的处理函数自动恢复生效。

## 交给下一个处理函数

组件内部的临时状态需要先响应返回键时（编辑模式、展开的搜索框、播放器浮层、二级菜单等），处理函数在不需要处理时返回 `false`，返回键会交给下一个生效中的处理函数，最后是全局 `backHandler`：

```ts
// FavoriteList.vue：编辑模式下按返回先退出编辑，否则交给页面
epg.onBack(() => {
  if (!editing.value) {
    return false;
  }
  editing.value = false;
});
```

返回 `false` 以外的值（包括不返回）都表示已经处理。所有处理函数都返回 `false`、或没有处理函数时，`epg.back()` 返回 `false`；接入原生按键时，宿主可以据此执行自己的默认行为，例如退出应用。
