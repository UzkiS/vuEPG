---
description: "Listen to focus and group events, cancel default navigation, implement custom jumps and use the appropriate Vue 2.7 or Vue 3 listener syntax."
---

# Events

vuEPG dispatches native DOM `CustomEvent`s. They do not bubble; payloads are in `event.detail`. Listen with `@event-name`. Listeners on native elements use the same syntax in Vue 2.7 and Vue 3.

For listeners on **component tags**, Vue 2.7 needs `.native` to attach to the component root, including `@epg-right.native.prevent`. Vue 3 uses `@epg-*` directly.

The `epg-` prefix avoids collisions with native events. A mouse click on a button can emit native `focus`, but not `epg-focus`.

## Event reference

| Event                                            | Element       | Detail                | Cancels default navigation |
| ------------------------------------------------ | ------------- | --------------------- | -------------------------- |
| `epg-focus`                                      | Item          | `{ item }`            | No                         |
| `epg-blur`                                       | Item          | `{ item }`            | No                         |
| `epg-enter`                                      | Group         | `{ group }`           | No                         |
| `epg-leave`                                      | Group         | `{ group }`           | No                         |
| `epg-up` / `epg-down` / `epg-left` / `epg-right` | Item or group | `{ node, direction }` | Yes                        |

All `epg-*` events are dispatched with `cancelable: true`. Cancelling a direction event blocks default navigation. Focus/group notifications happen after state changes; cancellation does not undo those changes.

Confirm calls the current element's `click()`, so ordinary `@click` handlers work.

## Focus event order

<EventTimelineDemo />

Moving from A to B dispatches:

1. `epg-blur` on A.
2. `epg-leave` on exited groups, from inner to outer.
3. `epg-enter` on entered groups, from outer to inner.
4. `epg-focus` on B.

If a handler moves focus again, the remaining events stop and the newer move takes precedence.

## Direction events

Before default movement, a direction operation dispatches:

1. The direction event on the current item.
2. When a group has no target, the event on that group before searching outward. Even if the entire page has no target, each group along the path receives the event.

Default movement stops if a handler calls `preventDefault()` (or uses `.prevent`) or moves focus itself.

```vue
<!-- Block upward movement -->
<div v-epg-item @epg-up.prevent>...</div>

<!-- Up selects a specific target; default movement is skipped -->
<div v-epg-item @epg-up="$epg.move(searchRef)">...</div>

<!-- Observe only: default movement continues after the handler -->
<div v-epg-item @epg-down="track('down')">...</div>

<!-- Focus cannot leave this group to the right -->
<div v-epg-group @epg-right.prevent>...</div>
```

::: tip Other input
Virtual remotes and gamepads should call `epg.navigate("up")` to use the same direction events and cancellation. `epg.move("up")` and `epg.up()` move programmatically without direction events.
:::

## Types

```ts
import type { EPGEvent } from "vuepg";

const onFocus = (event: EPGEvent<"epg-focus">) => {
  console.log(event.detail.item.el);
};

const onUp = (event: EPGEvent<"epg-up">) => {
  console.log(event.detail.node, event.detail.direction);
};
```

## Without templates

Use ordinary DOM event listeners:

```ts
el.addEventListener("epg-focus", (event) => {
  // ...
});
```
