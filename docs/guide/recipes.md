# 常见页面配方

分组决定导航的边界和进入位置。先按页面里真正独立的区域分组，再决定每个区域的入口与边界行为。

## 侧边菜单与内容网格

菜单和内容区各用一个组；内容网格中的卡片保持同层。跨组进入时，焦点会落在目标组的 `default` 卡片，而组内移动仍按几何位置计算。

```vue
<aside v-epg-group>
  <button v-for="entry in menu" :key="entry.id" v-epg-item>{{ entry.title }}</button>
</aside>

<main v-epg-group>
  <button
    v-for="(movie, index) in movies"
    :key="movie.id"
    v-epg-item="{ default: index === 0 }"
  >
    {{ movie.title }}
  </button>
</main>
```

## 横向滚动列表

让列表元素本身成为滚动容器，并开启分组滚动。`scroll: true` 只滚动到焦点卡片可见的位置。

```vue
<div v-epg-group="{ scroll: true }" class="movie-row">
  <button v-for="movie in movies" :key="movie.id" v-epg-item>{{ movie.title }}</button>
</div>
```

```css
.movie-row {
  display: flex;
  gap: 16px;
  overflow-x: auto;
}
.movie-row > button {
  flex: 0 0 180px;
}
```

在行尾需要翻页或循环时，监听组上的 `@epg-right`：只有组内没有右侧目标时才会触发。处理函数可调用 `event.preventDefault()` 阻止继续查找外层目标；换页后用 `epg.move()` 聚焦新元素。

## 弹窗与焦点陷阱

弹窗内容放在一个组中，四个方向的边界事件都取消。弹窗内部仍可正常移动；按钮被替换或卸载后，下一次方向操作会优先在仍可进入的弹窗组内恢复焦点。

```vue
<div v-if="open" v-epg-group @epg-up.prevent @epg-down.prevent @epg-left.prevent @epg-right.prevent>
  <button v-epg-item="{ default: true }">确定</button>
  <button v-epg-item>取消</button>
</div>
```

打开弹窗时调用 `epg.move(dialogRef.value)` 进入弹窗；关闭后调用 `epg.move(triggerRef.value)` 回到触发按钮。返回键可用 [`epg.onBack()`](./back) 关闭弹窗。

## 记住分组中上次聚焦的元素

用响应式 `default` 保存入口，无需额外的焦点记忆配置。组内焦点变化时记录元素 ID；再次进入时，仍存在的元素会成为入口。

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

虚拟列表一次只注册已渲染的元素：当前项卸载后，下次方向操作会在原组内恢复。换页或加载下一批数据时，可用组边界事件接管方向操作，并在新元素挂载后调用 `epg.move()` 指向新入口。
