---
description: "Try spatial navigation, group entries and focus events with a keyboard or virtual remote, and read the complete demo code."
---

# Navigation demo

A TV-style home page running the repository source:

- Click the demo to activate. Use arrow keys, Enter to confirm and Escape / Backspace to exit.
- On mobile, use the virtual remote below.
- Logs display focus, enter, leave and click events.

<EpgPlayground />

## How it is built

The page defines three groups:

```vue
<header v-epg-group @epg-enter="onEnter" @epg-leave="onLeave">
  <button v-for="tab in tabs" v-epg-item @epg-focus="onFocus">{{ tab }}</button>
</header>

<aside v-epg-group @epg-enter="onEnter" @epg-leave="onLeave">
  <button v-for="item in menu" v-epg-item @epg-focus="onFocus">{{ item }}</button>
</aside>

<main v-epg-group="{ default: true }" @epg-enter="onEnter" @epg-leave="onLeave">
  <button
    v-for="(card, index) in cards"
    v-epg-item="{ default: index === 0 }"
    @epg-focus="onFocus"
  >
    {{ card.title }}
  </button>
</main>
```

- Menu → content enters the default card instead of the geometrically nearest one.
- Up from the first content row leaves content and enters the top bar, emitting leave/enter events.
- Virtual controls call `navigate()` and use the same direction cancellation as keyboard input.
- The documentation pauses key handling outside active demos. Source: [EpgPlayground.vue](https://github.com/UzkiS/vuEPG/blob/main/docs/.vitepress/theme/components/EpgPlayground.vue).

For page changes, scrolling and dialogs, use the [independent example](./business-example).
