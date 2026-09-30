---
description: "Migrate vue-epg applications to vuEPG: replace plugin installation, directives and Back handling while retaining page logic."
---

# Migrate from vue-epg

vue-epg compares distances across all items; vuEPG searches through the EPGGroup hierarchy. See [Navigation rules](../guide/navigation) and review these differences when migrating.

## Compare before migrating

This table uses the npm `vue-epg` 2.3.1 implementation to explain migration benefits and application logic to retain.

| Area                      | vue-epg                                                                   | vuEPG                                                                | Tradeoff                                                             |
| ------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Framework and integration | Vue 2 plugin with v-items / v-group and $service                          | Vue 2.7 / Vue 3 with shared directives and APIs                      | Upgrade Vue 2.6 first; migrate existing pages incrementally          |
| Navigation                | Geometric search among registered items; groups intercept exit directions | Searches through live DOM groups with default entries                | Regional boundaries are explicit; verify cross-group targets again   |
| Back handling             | A mixin reads serviceBack                                                 | onBack() follows component and KeepAlive lifecycles                  | Closing dialogs restores page handling; update registration          |
| XPath and saved positions | getEleByPath() and getPointerPosition()                                   | Node queries and focus APIs, without built-in XPath                  | Retain an application XPath utility or switch to stable business IDs |
| Dependencies and keys     | n-zepto and xpath-dom; prevents defaults for all keys                     | Zero runtime dependencies, configurable keys and editable text input | Fewer dependencies; review custom input against the new rules        |

## Directives

Replace unsupported `v-items` / `v-group` with `v-epg-item` / `v-epg-group`.

## $service

vue-epg exposes `$service`; vuEPG provides `$epg`:

```vue
<!-- vue-epg -->
<div v-items @up="$service.move(...)">...</div>

<!-- vuEPG -->
<div v-epg-item @epg-up="$epg.move(...)">...</div>
```

If you cannot update all code immediately, add a temporary alias:

```ts
import { useVuEPG } from "vuepg";

// Vue 3
app.config.globalProperties.$service = useVuEPG();
// Vue 2
Vue.prototype.$service = useVuEPG();
```

## serviceBack

vue-epg reads `serviceBack` through a mixin. vuEPG uses [`onBack`](../guide/back). A temporary global mixin can adapt existing Options API code; avoid it for long-term use:

```ts
import { useVuEPG } from "vuepg";

Vue.mixin({
  created() {
    if (typeof this.serviceBack === "function") {
      useVuEPG().onBack(() => this.serviceBack());
    }
  },
});
```

## Keys

vue-epg calls `preventDefault()` for all keys, disabling default browser behavior such as number input. vuEPG limits it to predefined actions and allows per-action configuration. See [Key mappings](../guide/key-actions).

## Removed features

| vue-epg                                              | Replacement                                  |
| ---------------------------------------------------- | -------------------------------------------- |
| XPath: `getPointerPosition()`, `getEleByPath(xpath)` | Implement in your application if needed.     |
| Automatic group class                                | Add the class directly to the group element. |
