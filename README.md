# vuEPG

Vue2/3 通用式焦点管理工具，基于 vue-epg 完全重写， with Typescript 😊

[document](http://docs.ito.fun/vuepg)

# 快速开始

## 安装

```sh
pnpm install vuepg
```

## 注册和配置插件实例

```javascript
// main.js
import vuEPG, { useVuEPG } from "vuepg";

const epg = useVuEPG();
epg.setConfig({
  debug: true,
});

app.use(vuEPG);
// Vue.use(vuEPG) vue@2
```

## 调用实例方式

### 使用 useVuEPG()

```vue
<script setup>
import { useVuEPG } from "vuepg";

const epg = useVuEPG();

// epg.xxxx
</script>
```

### 使用 inject

在 Vue 3 中，插件会直接通过 provide 提供实例，我们可以直接调用

::: warning
inject 方式在使用 Vue 2 时不可用
:::

```vue
<script setup>
const epg = inject("epg");

// epg.xxxx
</script>
```

## 默认 class

为了肉眼可见的效果，我们需要新建一个全局 class，你可以稍后对其进行更改。

```css
.vuepg-focus {
  background: red;
}
```

## 基本使用

```vue
<template>
  <div v-epg-group>
    <div v-epg-item ref="top">Top</div>
    <div v-epg-group>
      <div v-epg-item>item1</div>
      <div v-epg-item>item2</div>
      <div v-epg-item @up="epg.move(top)">item3</div>
    </div>
  </div>
</template>

<script setup>
import { useVuEPG } from "vuepg";
import { ref, onMounted } from "vue";
const epg = useVuEPG();

const top = ref();

onMounted(() => {
  epg.move(top.value);
});
</script>
```
