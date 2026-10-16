---
description: "Configure focus styling, Back fallback, debug logs, viewport scrolling, automatic focus restoration and held-key rate limiting, with source-defined defaults and reactive updates."
---

# Configuration

## Set options

Pass options when installing:

```ts
app.use(VuEPG, { focusClass: "focused", debug: import.meta.env.DEV });
```

Or call `setConfig` at any time with the fields you want to change:

```ts
useVuEPG().setConfig({ debug: true });
```

Fields whose value is `undefined` count as omitted and keep the current setting. `getConfig()` reads the current readonly configuration.

## Configuration options

<<< ../../../src/core/config.ts#config{ts}

### focusClass

The selected element receives this class. Changing it immediately replaces the current class. Individual items can override it with [focusClass](./epg-item#binding-options).

A class must be a nonempty string without whitespace; otherwise `setConfig` throws `TypeError`.

### backHandler

Fallback invoked on Back when no active component handler exists. See [Back handling](./back).

### debug

Logs movement, keys, registration and unregistration. Direction lookup also logs candidates and results at each level to explain target selection.

### scrollViewport

Document viewport scrolling, disabled by default. `true` means `"nearest"`; `"start"` and `"center"` are also available. Independent from element `v-epg-scroll`; see [Scrolling](./scrolling).

### restoreFocus

Disabled by default. When enabled and the focused element unmounts (for example, a dialog closes, list data is replaced or tab content switches), vuEPG restores focus once the current render finishes, without waiting for the next direction input:

1. If the page has already set focus after the update (for example, by calling `move()` in `nextTick`), its choice is kept.
2. Otherwise, inside the innermost accessible group on the original focus path, focus returns to the most recently focused item; if the group has none, focus enters the group's entry.
3. If no group on the original path is accessible, focus returns to the most recently focused item anywhere on the page, falling back to the page entry.

As a result, closing a dialog returns focus to the item focused before it opened, and replacing list data keeps focus in the list. With this option, direction input that recovers unavailable focus (for example, a hidden focused item) also prefers the most recently focused item.

```ts
app.use(VuEPG, { restoreFocus: true });
```

If the page decides focus only after an asynchronous request, restoration runs first; call `move()` again when the request completes.

### keyRepeatInterval

Defaults to `0`, no limit. While a direction key is held, the browser repeats it twenty to thirty times per second. On slower devices navigation cannot keep up, keys pile up and focus keeps moving after the key is released. With a number of milliseconds, auto-repeated keys from a held key are handled at most once per interval; repeats inside the interval are ignored (the browser default is still prevented). Separate key presses are not affected.

```ts
app.use(VuEPG, { keyRepeatInterval: 120 });
```

Pick the value by holding a direction key on the target device; 100–200 is common. On legacy engines without `event.repeat`, vuEPG treats a key pressed again before it was released as a repeat. A few devices never send `keyup`; there, quickly pressing the same key repeatedly is also limited by this interval.
