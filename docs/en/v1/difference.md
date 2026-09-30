---
description: "Archived vuEPG 1.x differences from vue-epg and compatibility adapters."
title: Differences from vue-epg
---

# Differences from vue-epg

vuEPG retains, changes or removes features from vue-epg. Review these differences when reusing components.

## Behavior differences

### Navigation

Navigation is rebuilt around EPGGroup and EPGItem hierarchy. vue-epg compares all items globally; see [Navigation rules](/en/v1/move-rule).

### Keys

vue-epg unconditionally prevents default behavior for every key, disabling number input and native keyboard functions. vuEPG does so for seven predefined actions and allows configuration; see [Key actions](/en/v1/key-action).

### Directives

Replace `v-items` / `v-group` with `v-epg-item` / `v-epg-group`, required since vuEPG 1.0.

## Removed features with adapters

### $service

The default `$service` binding was removed because its generic name can collide. Add a global alias manually if needed.

::: warning
Keep `$service` only for compatibility. Prefer a local instance with Options API, or a more specific global name such as `$epg`.
:::

```javascript
// main.js
import { useVuEPG } from "vuepg";
const epg = useVuEPG();

// Vue2
Vue.prototype.$service = epg;
// Vue3
app.config.globalProperties.$service = epg;
```

### serviceBack

vue-epg implements `serviceBack` with mixins. vuEPG removes it; a manual mixin can adapt existing code.

::: danger Avoid for new code
This adapter supports existing Options API components only. Use `onBack` for new code; see [Back callbacks](/en/v1/back-callback).
:::

```javascript
// main.js
import { useVuEPG } from "vuepg";

const epg = useVuEPG();

Vue.mixin({
  created() {
    if (this.serviceBack) {
      epg.onBack(this.serviceBack);
    }
  },
});
```

## Removed features without adapters

### XPath

`getPointerPosition()` and `getEleByPath(xpath)` were removed. Implement them in your application if needed.

### Group class

Groups no longer receive an automatic class. Add your own class directly.
