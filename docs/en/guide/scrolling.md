---
description: "Keep focus visible with v-epg-scroll, configure horizontal and vertical lists, alignment, nested containers and the document viewport."
---

# Scrolling

vuEPG uses logical focus without calling native `focus()`, so the browser does not scroll on its own. Only marked containers scroll when focus changes. Scroll configuration is independent from navigation groups and disabled by default.

## Horizontal and vertical lists

Apply `v-epg-scroll` to the **actual scrolling element**. CSS still controls its size and overflow.

Step buttons replay from the origin. Observe focus, visible area and offsets, or choose cards directly.

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

A vertical list uses the same directive with a fixed height and vertical overflow:

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

Scroll and group directives can share an element or be independent. Adding a navigation group only for scrolling changes entry and boundary rules, so keep their roles distinct.

::: tip Clipped focus outlines
Scrolling uses the element's border rectangle, which excludes outlines and shadows. Reserve space for these outward effects so `overflow` does not clip them. Include the start and end spacing of a horizontal list in the content track's width; padding on the clipping container alone may still leave the last item against the clipping edge. See the `lesson-track` layout in the [complete example](./business-example).
:::

## Alignment

The binding type is defined in the source:

<<< ../../../src/core/scroll.ts#scroll-options{ts}

| Binding            | Behavior                                                       |
| ------------------ | -------------------------------------------------------------- |
| No value or `true` | `nearest`: do nothing if visible; otherwise scroll just enough |
| `"start"`          | Align with the beginning of the visible area                   |
| `"center"`         | Center in the visible area                                     |
| `false`            | Disable reactively                                             |

For oversized items, nearest aligns the beginning. Positions are clamped by the scroll range. The directive does not set CSS `overflow`; it writes `scrollLeft` / `scrollTop` directly without smooth scrolling, which also works on legacy devices.

## Groups and nested containers

Entering group B from A first selects B's entry, then scrolls the selected item's **marked ancestors from inner to outer**. A's scroll offset stays unchanged. An ancestor need not be a navigation group to be a scroll container.

<ScrollDemo kind="nested" />

The two rows are drawn separately. Each row records its horizontal offset; the right slider records the outer vertical offset. Entering the bottom row keeps the top row's offset while scrolling the outer catalog.

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

The catalog scrolls vertically and rows scroll horizontally. A row outside the page also needs a marked outer container or viewport scrolling.

## Document viewport

Enable document scrolling explicitly during installation or with `setConfig`:

```ts
app.use(VuEPG, { scrollViewport: true });
// Or: epg.setConfig({ scrollViewport: "center" });
```

`scrollViewport` defaults to false. It accepts true / nearest / start / center and runs last. Fixed-position (`position: fixed`) elements do not move their outer scroll containers or the document viewport, even when a dialog is written inside a page scroll container; scroll containers inside the dialog still scroll. Ordinary ancestors are not automatically guessed as scroll containers.

Bounding rectangles are converted from visual pixels to layout pixels, supporting common CSS scale transforms. Scrolling happens before `epg-focus`. Repeating `move()` on the same item recalculates scrolling. For complex animation, virtual-page changes or custom positions, handle scrolling in `epg-focus`.
