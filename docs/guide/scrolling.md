---
description: 通过 v-epg-scroll 保持焦点可见，配置横纵滚动、对齐方式、嵌套容器和文档视口。
---

# 自动滚动

vuEPG 使用逻辑焦点，不调用元素的原生 `focus()`。焦点变化时，只有明确标记的滚动容器才会滚动；滚动配置不参与导航分组的选择。默认全部关闭。

## 横向与纵向

在**实际发生滚动的元素**上使用 `v-epg-scroll`。容器尺寸和 `overflow` 仍由 CSS 决定。

点击图下方的步骤按钮，观察焦点、可视区域和滚动位置。每个步骤都会从起点重放，也可以直接点击图中的卡片。

<ScrollDemo kind="horizontal" />

```vue
<div v-epg-scroll class="movie-row">
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

纵向列表使用同一个指令，给容器固定高度和 `overflow-y`：

<ScrollDemo kind="vertical" />

```vue
<div v-epg-scroll class="channel-list">
  <button v-for="channel in channels" :key="channel.id" v-epg-item>{{ channel.name }}</button>
</div>
```

```css
.channel-list {
  display: grid;
  grid-auto-rows: 48px;
  gap: 8px;
  height: 320px;
  overflow-y: auto;
}
```

指令可与 `v-epg-group` 放在同一元素，也可单独使用。仅为了滚动而加导航组，会改变进入和边界规则，因此建议让两种标记各司其职。

## 对齐方式

绑定值的类型和对齐方式来自源码：

<<< ../../src/core/scroll.ts#scroll-options{ts}

| 写法                                    | 行为                                                |
| --------------------------------------- | --------------------------------------------------- |
| `v-epg-scroll` 或 `v-epg-scroll="true"` | `nearest`：已可见时不滚动，超出边缘时移动到刚好可见 |
| `v-epg-scroll="'start'"`                | 对齐滚动区域起始边                                  |
| `v-epg-scroll="'center'"`               | 在滚动区域居中                                      |
| `v-epg-scroll="false"`                  | 暂时关闭，适合响应式控制                            |

卡片大于可视区域时，`nearest` 会对齐起始边。实际位置受容器滚动范围限制。指令不会设置 CSS `overflow`，也不会调用平滑滚动 API；旧设备上可直接使用 `scrollLeft` / `scrollTop`。

## 跨组与嵌套容器

从组 A 进入组 B 时，先选出 B 的入口项，再从内向外滚动**目标项的已标记祖先容器**。A 的滚动位置保持不变。外层容器是否是导航组，不影响它能否被标记为滚动容器。

<ScrollDemo kind="nested" />

图中将上下两排展开显示：两排的横向位置分别记录，右侧滑块显示外层目录的纵向位置。点「② 进入下排」时，可以看到上排位置保留、外层目录向下滚动。

```vue
<div v-epg-scroll class="catalog">
  <section v-epg-group v-epg-scroll class="movie-row">
    <button v-for="movie in firstRow" :key="movie.id" v-epg-item>{{ movie.title }}</button>
  </section>
  <section v-epg-group v-epg-scroll class="movie-row">
    <button v-for="movie in secondRow" :key="movie.id" v-epg-item>{{ movie.title }}</button>
  </section>
</div>
```

`.catalog` 负责纵向滚动，`.movie-row` 负责横向滚动。若目标行在页面外，还需要让目录容器或文档视口参与滚动。

## 文档视口

需要整页滚动时，在插件安装选项或 `setConfig()` 中显式开启：

```ts
app.use(VuEPG, { scrollViewport: true });
// 或：epg.setConfig({ scrollViewport: "center" });
```

`scrollViewport` 默认是 `false`。它使用 `true` / `"nearest"` / `"start"` / `"center"`，最后处理文档视口；固定定位的弹窗不会带动背后的页面。普通祖先元素不会被自动猜测为滚动容器，需要在实际容器上使用 `v-epg-scroll`。

`v-epg-scroll` 使用元素的 `getBoundingClientRect()` 和布局尺寸换算滚动距离，支持常见的 CSS `scale()` 缩放。滚动在 `epg-focus` 事件之前执行；对同一焦点项再次调用 `epg.move()` 会重新计算。复杂动画、虚拟列表换页或业务指定滚动位置时，可以在 `epg-focus` 中自行处理。
