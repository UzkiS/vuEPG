# 返回处理

按下返回键（默认 `Backspace`、`Escape` 及常见遥控器返回键）时，vuEPG 按以下顺序查找处理函数：

1. 生效中的**页面级**处理函数（`onBack`）；
2. 全局处理函数（配置项 `backHandler`）；
3. 都没有时什么也不做。

也可以调用 `epg.back()` 手动触发同样的流程。

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

同时有多个处理函数生效时（例如页面中打开了一个弹窗，二者都注册了 `onBack`），**嵌套最深、创建最晚**的组件优先。弹窗卸载后，页面的处理函数自动恢复生效。
