---
title: Migrate from vue-tv-focusable / tv-focusable to vuEPG
description: "Replace vue-tv-focusable v-focusable, $tv.next, requestFocus, direction events, focus styling, scrolling and limitingEl dialogs with vuEPG while retaining Vue pages and click handlers."
---

# Migrate from vue-tv-focusable

This guide covers Vue applications using `vue-tv-focusable`, based on its [2.x documentation](https://slailcp.github.io/focusable-document/#/) and [official example](https://github.com/slailcp/tv-focusable-example/tree/master/vue-tv-focusable-example). It maps common `v-focusable`, `this.$tv`, `requestFocus()` and `next()` usage to vuEPG.

Keep your UI, business components and `@click` handlers. Review directive bindings, direction events, scrolling and dialogs. Navigation rules differ, so complete behavioral checks after replacing names.

## Compare before migrating

This table follows the public vue-tv-focusable 2.x documentation and examples. Both integrate with existing pages; the choice depends on which built-in behaviors you need.

| Area                        | vue-tv-focusable                                            | vuEPG                                                                                   | Tradeoff                                                                     |
| --------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Directives and framework    | Vue 2 / 3 wrapper with v-focusable and $tv                  | Vue 2.7 / 3, separate item, group and scroll directives                                 | Upgrade Vue 2.6 and replace boolean bindings with options                    |
| Direction events            | In 2.x, a listener must call next() to continue movement    | Observing listeners continue; .prevent explicitly cancels                               | Simpler observation; remove old continuation calls                           |
| Scrolling                   | Smooth animation, edge distance and scroll-speed settings   | Explicit containers, nested scrolling and alignment, direct position updates            | Predictable containers; migrate animations and throttling in the application |
| Dialogs and restoration     | limitingEl restricts the region and must be reset           | Group boundaries, component Back handlers, restoration and Tab isolation in the example | Clearer lifecycle handling; not a direct limitingEl rename                   |
| Long press, forms and XPath | Built-in long press, automatic form editing and XPath tools | Native click, focus and event APIs without those tools                                  | The old library has broader built-ins; dependent pages need extra work       |
| Legacy device setup         | Integration docs and examples                               | Independent dual-toolchain example and real Chromium 30 regression                      | Copyable verification path; still check actual device input and performance  |

## Replace installation and initialization

1. Upgrade Vue 2.6 applications to Vue 2.7 and match `vue-template-compiler`; Vue 3 applications retain their framework.
2. Remove the old plugin registration and imports, then install vuepg. Both plugins listen to keys: validate migrated pages through a separate entry to avoid processing one input twice.
3. Replace directives, events and `$tv` calls, then review scrolling and dialogs below.
4. Android 4.x / WebView 30 projects use Vue 2.7, ES5 application builds and required polyfills. See [Legacy integration](../guide/legacy-webview).

```sh
pnpm remove vue-tv-focusable
pnpm add vuepg
```

::: code-group

```js [Vue 2.7]
import Vue from "vue";
import VuEPG from "vuepg";
import App from "./App.vue";

Vue.use(VuEPG, { focusClass: "focus" });
new Vue({ render: (h) => h(App) }).$mount("#app");
```

```js [Vue 3]
import { createApp } from "vue";
import VuEPG from "vuepg";
import App from "./App.vue";

createApp(App).use(VuEPG, { focusClass: "focus" }).mount("#app");
```

:::

This retains the old `.focus` style. To rename it, use the default `.vuepg-focus` or your own class. See [Getting started](../guide/getting-started) for installation details.

## Common replacements

| vue-tv-focusable                     | vuEPG                                                   | Migration notes                                                               |
| ------------------------------------ | ------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `v-focusable` / `v-focusable="true"` | `v-epg-item`                                            | Register the actual DOM element                                               |
| `v-focusable="enabled"`              | `v-epg-item="{ disabled: !enabled }"`                   | Replace the boolean with an options object; do not pass true / false directly |
| `this.$tv` / exported `focusable`    | `this.$epg` / `useVuEPG()`                              | No empty Vue instance is needed to access the service                         |
| `focusClassName`                     | `focusClass`                                            | Configure during installation or through `epg.setConfig()`                    |
| `requestFocus(el)` / `next(el)`      | `epg.move(el)`                                          | Wait until the target renders; returns false on failure                       |
| `next("right")`                      | `epg.move("right")` or `epg.navigate("right")`          | Programmatic movement versus user directional input                           |
| `@onFocus` / `@on-focus`             | `@epg-focus`                                            | Read the element from `event.detail.item.el`                                  |
| `@onBlur` / `@on-blur`               | `@epg-blur`                                             | Use the new event name and detail structure                                   |
| `@left` / `@right` / `@up` / `@down` | `@epg-left` / `@epg-right` / `@epg-up` / `@epg-down`    | Default movement continues; add `.prevent` to block it                        |
| `@click`                             | `@click`                                                | Confirm still calls the current element's click()                             |
| `KEYS`                               | `epg.setKeyAction()` / `epg.addKeyCodes()`              | Configure named key actions; see below                                        |
| `scrollEl` / `setScrollEl(el)`       | `v-epg-scroll` on the actual scroll container           | No global scroll-element reset on page removal                                |
| `distanceToCenter: true`             | `v-epg-scroll="'center'"` or `scrollViewport: "center"` | Local container versus document viewport                                      |
| `limitingEl` / `resetLimitingEl()`   | Dialog group direction boundaries + `onBack()`          | Save and restore focus; see the complete example                              |
| `[focused]`                          | `epg.getCurrentItem()?.el`                              | Stop querying or manually clearing the old attribute                          |
| `getElementByPath()` / `readXPath()` | Template refs, stable business IDs, DOM queries         | No matching XPath API                                                         |

For **component tags** in Vue 2.7, listen to root DOM events with `.native`, such as `@epg-focus.native`. Ordinary div and button elements do not need it. Vue 3 uses `@epg-focus`. Wrap icons or SVGs in clickable HTML buttons, place `v-epg-item` on the button, and handle Confirm through its `@click`. See [Events](../guide/events).

## Migrate a basic page

The following works with Vue 2.7 and Vue 3 while keeping Options API and `.focus` styling:

```vue
<script>
import { useVuEPG } from "vuepg";

export default {
  data() {
    return { enabled: true, message: "" };
  },
  mounted() {
    this.$nextTick(() => {
      useVuEPG().move(this.$refs.first);
    });
  },
  methods: {
    open() {
      this.message = "Content selected";
    },
  },
};
</script>

<template>
  <main v-epg-group>
    <button ref="first" v-epg-item="{ default: true }" @click="open">Content 1</button>
    <button v-epg-item="{ disabled: !enabled }" @click="open">Content 2</button>
    <p>{{ message }}</p>
  </main>
</template>

<style>
.focus {
  outline: 3px solid #d81b60;
  outline-offset: 3px;
}
</style>
```

`default` defines the entry when entering this level; it does not take focus on mount. Set initial focus with move() after DOM updates. Menus, content and dialogs can each have a group; do not split an ordinary grid into row groups unnecessarily. Cross-group navigation enters the target group's default item. See [Groups](../guide/epg-group) and [Navigation rules](../guide/navigation).

## Direction events: avoid duplicate movement

vue-tv-focusable 2.x requires `$tv.next("right")` to continue movement after registering `@right`. vuEPG continues default movement after an observing listener:

```vue
<!-- Old: the handler must also call $tv.next("right") -->
<div v-focusable @right="trackAndMove">...</div>

<!-- New: observe; vuEPG continues movement -->
<div v-epg-item @epg-right="track('right')">...</div>

<!-- New: explicitly block rightward movement -->
<div v-epg-item @epg-right.prevent>...</div>

<!-- New: select a business target; default movement is skipped -->
<div v-epg-item @epg-right="$epg.move(targetRef)">...</div>
```

Keep observation and custom jumps, and remove next() calls that only continued default movement. For asynchronous decisions, **cancel synchronously** before waiting:

```vue
<script setup>
import { useVuEPG } from "vuepg";

const epg = useVuEPG();
const onRight = async () => {
  const origin = epg.getCurrentItem();
  const allowed = await canLeave();
  if (allowed && origin !== null && epg.getCurrentItem() === origin) {
    epg.move("right");
  }
};
</script>

<template>
  <div v-epg-item @epg-right.prevent="onRight">...</div>
</template>
```

Your application supplies canLeave(). Do not call navigate("right") inside an epg-right handler: it dispatches the same event again. Virtual remotes, gamepads and native input entries use navigate(); see [Native input](../guide/native-bridge).

## Keys and Back handling

Replace `KEYS.KEY_ENTER: [83, 13]`, for example, with:

```js
import { useVuEPG } from "vuepg";

const epg = useVuEPG();
epg.setKeyAction("ENTER", {
  codes: ["KeyS", 83, "Enter", 13],
  preventDefault: true,
});
```

setKeyAction() **replaces** the mapping. Use addKeyCodes() to append device codes. Modern browsers prioritize event.code; old engines fall back to numeric values. Include both instead of copying only numeric arrays. See [Key mappings](../guide/key-actions).

Register page or dialog Back handling in setup() or Options API created():

```js
export default {
  created() {
    this.$epg.onBack(() => {
      this.closeDialog();
    });
  },
};
```

Active component handlers take priority over global backHandler. Registrations are released on unmount; KeepAlive deactivation pauses them and activation restores them. See [Back handling](../guide/back).

## Local and document scrolling

```vue
<!-- Mark the actual container with overflow and size constraints -->
<div v-epg-scroll class="content-scroll">
  <main v-epg-group>
    <button v-for="item in items" :key="item.id" v-epg-item>{{ item.title }}</button>
  </main>
</div>

<!-- Center alignment -->
<div v-epg-scroll="'center'" class="content-scroll">...</div>
```

For document scrolling, configure scrollViewport: true on installation, or call epg.setConfig({ scrollViewport: "center" }). Automatic scrolling defaults to off; vuEPG does not infer containers from overflow. Scroll containers and navigation groups are independent.

The animation flag in requestFocus(el, false) has no corresponding positional argument. vuEPG sets scroll positions directly. Implement smoothTime, spacingTime, offsetDistance and scrollTo() effects in your application; do not pass them to move(). See [Automatic scrolling](../guide/scrolling).

## Dialogs and page focus restoration

Replace limitingEl with a dialog group that cancels movement at all four boundaries:

```vue
<section v-epg-group @epg-up.prevent @epg-down.prevent @epg-left.prevent @epg-right.prevent>
  <button ref="cancel" v-epg-item @click="closeDialog">Cancel</button>
  <button v-epg-item @click="confirmDialog">Confirm</button>
</section>
```

Direction boundaries constrain user navigation; direct move() calls can still select other targets. Save epg.getCurrentItem()?.el before opening, then wait for nextTick() before focusing a newly shown dialog. On close, try epg.move(previous), and use an application entry if it fails. Copy the [example dialog](https://github.com/UzkiS/vuEPG/blob/main/examples/tv-training/src/focus-dialog.vue) for complete lifecycle, Back and Tab isolation handling.

For page returns and KeepAlive, prefer storing stable business IDs, then locating the element after rendering and calling move(). XPath indices may select different content after filtering or sorting. Remove workarounds that manually clear [focused]; vuEPG manages focus classes and invalidation recovery. See the [complete example](../guide/business-example) for page position memory.

## Capabilities to migrate separately

| Old capability                                  | Approach                                                                                              |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `findFocusType` / `initDis`                     | No matching modes; verify the new navigation and use direction events for custom jumps                |
| `@longPress` / `longPressTime`                  | No built-in long-press event; handle keydown / keyup, repeats and timers in the application           |
| `scrollSpeedX` / `scrollSpeedY` / `scrollSpeed` | No built-in key throttling option; implement at the input entry and test held-key behavior            |
| `formAutofocus`                                 | Confirm triggers click; call the input element's native focus() in the click handler to enter editing |
| `setOnFocusChangeListener()`                    | Listen to epg-focus / epg-blur on focus elements; these events do not bubble                          |
| `init()` / `reset*()` / `reset()`               | Use documented configuration and lifecycle APIs; no public reset-all-state method                     |

## Post-migration checks

Verify initial focus, four-direction movement, disabled changes, Confirm and Back. Then check dialog boundaries and restoration, hidden / unmounted content, KeepAlive returns, local / document scrolling, held keys and native key codes.

Start from the [complete example](../guide/business-example) for a ready project. See [Legacy compatibility](../guide/legacy-webview) for device builds and [Chromium 30 tests](../guide/chromium30-testing) for regression commands.
