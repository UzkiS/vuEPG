# EPGGroup

`EPGGroup` 是焦点的分组容器，用 `v-epg-group` 注册。菜单、列表、弹窗、选项卡等拥有独立进入规则或边界行为的区域适合放进一个分组。

```vue
<ul v-epg-group>
  <li v-epg-item>首页</li>
  <li v-epg-item>电影</li>
</ul>
```

## 分组做了什么

1. **组内优先**：按方向键时，先在当前组内寻找目标；找不到时，把整个组当作一个整体，在上一层寻找。
2. **默认焦点**：焦点从组外进入时，落在组内的 `default` 元素上，而不是几何上最近的元素。
3. **进出事件**：焦点进入、离开分组时派发 `epg-enter` / `epg-leave`；组内找不到方向目标时派发方向事件，可以拦截或处理边界。

滚动容器可以与导航组是同一个元素，也可以独立存在；详见[自动滚动](./scrolling)。

分组可以任意嵌套，中间隔着普通元素或其他组件也没关系：一个元素属于哪个组，由它在 DOM 中**最近的**带 `v-epg-group` 的祖先决定，并且每次按键时实时计算，不存在缓存过期的问题。

## 绑定值

<<< ../../src/core/nodes.ts#group-options{ts}

| 字段       | 说明                                                         |
| ---------- | ------------------------------------------------------------ |
| `default`  | 焦点进入所在层级时，优先进入这个组                           |
| `disabled` | 禁用：导航时整组被跳过（组内元素仍可通过 `move()` 直接聚焦） |

只有需要单独的入口或边界事件时才分组。普通网格可以只用一个组；无需给每一行或每个卡片再加组。跨组移动会进入目标组的默认元素，和在同一组内按几何位置选目标不同。

<HierarchyDemo />

```vue
<aside v-epg-group>
  <button v-for="entry in menu" :key="entry.id" v-epg-item>{{ entry.title }}</button>
</aside>

<main v-epg-group>
  <div v-epg-scroll class="card-list">
    <button v-for="movie in movies" :key="movie.id" v-epg-item>{{ movie.title }}</button>
  </div>
</main>
```

## 进入分组时焦点落在哪里

按以下顺序查找第一个可以获得焦点的元素：

1. 带 `default` 的子节点；
2. 其余子节点，按文档顺序；
3. 子节点是分组时，递归进入该分组，规则相同。

没有可获得焦点元素的分组（全部隐藏、禁用或为空）不会成为方向键的目标。

如果再次进入分组时希望回到上次聚焦项，可用响应式 `default` 指向该项；它被移除后，入口会自然回退到组内其他可用元素：

```vue
<script setup lang="ts">
import { ref } from "vue";

const lastId = ref<string | null>(null);
</script>

<template>
  <div v-epg-group>
    <button
      v-for="movie in movies"
      :key="movie.id"
      v-epg-item="{ default: lastId === movie.id }"
      @epg-focus="lastId = movie.id"
    >
      {{ movie.title }}
    </button>
  </div>
</template>
```

## 事件

| 事件                                             | 触发时机                   | 可取消 |
| ------------------------------------------------ | -------------------------- | ------ |
| `epg-enter`                                      | 焦点从组外进入本组         | 否     |
| `epg-leave`                                      | 焦点离开本组               | 否     |
| `epg-up` / `epg-down` / `epg-left` / `epg-right` | 本组内按该方向找不到目标时 | 是     |

```vue
<!-- 焦点离开侧边栏时收起 -->
<aside v-epg-group @epg-enter="expand = true" @epg-leave="expand = false">...</aside>

<!-- 弹窗：焦点不能向任何方向离开 -->
<div v-epg-group @epg-up.prevent @epg-down.prevent @epg-left.prevent @epg-right.prevent>...</div>
```

事件的完整说明见 [事件](./events)。
