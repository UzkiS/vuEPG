---
title: TypeScript 接入：类型检查、模板 ref 与焦点事件
description: 在 Vue 2.7 和 Vue 3 中使用 vuEPG 的 TypeScript 类型，配置 vue-tsc，处理模板 ref、焦点事件、节点守卫与 Options API 的 $epg。
---

# TypeScript 接入

本页用于解决接入时的具体类型问题：如何检查 `.vue` 文件、怎样声明模板 ref、如何读取事件里的焦点元素，以及 Options API 中怎样获得 `this.$epg` 提示。vuepg 自带类型声明，无需额外安装 `@types/vuepg`。

插件安装与页面用法见[快速开始](./getting-started)；方法签名见 [API](../api/)。

## 检查 Vue 文件的类型

已有工程使用自己的 TypeScript 配置即可。需要命令行检查 `.vue` 时，安装工具并执行：

```sh
pnpm add -D typescript@6 vue-tsc@3
pnpm exec vue-tsc --noEmit -p tsconfig.json
```

编辑器使用 Vue - Official 扩展。Vue 2.7 工程还需在 `tsconfig.json` 中声明模板目标：

```json
{
  "vueCompilerOptions": {
    "target": 2.7
  }
}
```

这是接在已有 tsconfig 中的配置片段；完整可运行配置见[独立示例的 tsconfig.json](https://github.com/UzkiS/vuEPG/blob/main/examples/tv-training/tsconfig.json)。Vue 3 工程使用与所装 Vue 版本一致的模板目标，不填写 `2.7`。

类型检查与浏览器兼容构建是两个步骤。TypeScript 通过检查，不代表产物已经是 ES5；旧设备还需应用转译与 polyfill，见[旧设备接入](./legacy-webview)。

## 模板 ref、指令选项与事件

下面的组件可用于 Vue 2.7 和 Vue 3：

```vue
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useVuEPG, type EPGEvent, type EPGItemOptions } from "vuepg";

const epg = useVuEPG();
const first = ref<HTMLElement | null>(null);
const firstOptions: EPGItemOptions = { default: true };
const currentLabel = ref("");

onMounted(() => {
  epg.move(first.value);
});

const onFocus = (event: EPGEvent<"epg-focus">): void => {
  currentLabel.value = event.detail.item.el.textContent ?? "";
};
</script>

<template>
  <main v-epg-group>
    <button ref="first" v-epg-item="firstOptions" @epg-focus="onFocus">内容 1</button>
    <button v-epg-item @epg-focus="onFocus">内容 2</button>
    <p>当前焦点：{{ currentLabel }}</p>
  </main>
</template>
```

`ref` 在挂载前、卸载后可能为空。`move()` 接受 `null` / `undefined`，因此不需要写非空断言。事件元素从 `event.detail.item.el` 获取，具有 `HTMLElement` 类型；无需把可能为空的 `event.target` 强转成元素。

`EPGItemOptions` 会检查对象里的配置字段，`EPGEvent<"epg-focus">` 会检查事件载荷。方向事件使用 `EPGEvent<"epg-right">`，其载荷是 `detail.node` 与 `detail.direction`，不是 `detail.item`。

Vue 3 的模板指令绑定也有类型增强。Vue 2.7 工程可以先把绑定对象声明为 `EPGItemOptions` / `EPGGroupOptions`，让 TypeScript 在对象定义处检查字段，不依赖模板工具对指令的检查程度。

## Options API 中的 this.$epg

使用 `defineComponent` 获取组件实例类型。以下写法同时适用于 Vue 2.7 与 Vue 3：

```vue
<script lang="ts">
import { defineComponent } from "vue";
import { useVuEPG } from "vuepg";

export default defineComponent({
  methods: {
    moveRight(): void {
      this.$epg.navigate("right");
    },
    closeDialog(): void {
      // 处理应用自己的关闭逻辑。
    },
  },
  created() {
    useVuEPG().onBack(() => {
      this.closeDialog();
    });
  },
});
</script>

<template>
  <button type="button" @click="moveRight">向右移动</button>
</template>
```

`import "vuepg"` 或正常导入插件 / `useVuEPG` 会加载包里的 Vue 类型增强；运行时仍需在入口安装插件。若组件没有 `this.$epg` 提示，检查组件是否使用 `defineComponent`、入口是否包含 vuepg 导入，以及编辑器是否读取了当前项目的 tsconfig。

## 查询结果先收窄，再使用

查询 DOM 对应的节点时，结果可能是项、组或 `null`：

```ts
import { useVuEPG } from "vuepg";

const epg = useVuEPG();
const element = document.getElementById("content");
if (element !== null) {
  const node = epg.getNodeByElement(element);
  if (epg.isEPGItem(node)) {
    epg.moveToItem(node);
  } else if (epg.isEPGGroup(node)) {
    epg.moveToGroup(node);
  }
}
```

`isEPGItem()` 与 `isEPGGroup()` 是类型守卫，分别收窄为 `EPGItem` 和 `EPGGroup`；普通、未注册的 DOM 元素返回 `null`。方法及返回值见 [API](../api/)。
