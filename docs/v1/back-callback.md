---
title: 返回回调
---

# 返回回调

vuEPG 提供了全局返回回调和单页面返回回调，在触发`BACK`事件时会进行调用。

## 全局返回回调

任何时候，使用 `setConfig` 进行设置。

- 示例

```javascript
const router = useRouter;

epg.setConfig({
  defBackHandler: () => {
    router.go(-1);
  },
});
```

## 单页面返回回调

::: warning

- 单页面返回回调会在设置的 Vue 组件 `Mounted/Activated` 时生效，在组件 `Deactivated/Unmounted` 时失效。
- 单页面返回回调生效时，全局返回回调将不会被调用。

:::

- 类型

```typescript
const onBack: (func: Function) => void;
```

- Composition API 示例

```vue
<script setup>
import { useVuEPG } from "vuepg";
const epg = useVuEPG();
epg.onBack(() => {
  console.log("单页面返回回调");
});
</script>
```

- Options API 示例

```vue
<script>
import { defineComponent } from "vue";
import { useVuEPG } from "vuepg";

const epg = useVuEPG();
export default defineComponent({
  created() {
    epg.onBack(() => {
      console.log("单页面返回回调");
    });
  },
});
</script>
```
