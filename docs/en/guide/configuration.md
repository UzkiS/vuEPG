---
description: "Configure focus styling, Back fallback, debug logs and viewport scrolling, with source-defined defaults and reactive updates."
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

`getConfig()` reads the current readonly configuration.

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
