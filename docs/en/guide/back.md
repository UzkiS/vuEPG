---
description: "Configure global and component Back handlers for dialogs, page navigation and KeepAlive activation."
---

# Back handling

Back (by default Backspace, Escape and common remote Back codes) chooses:

1. Active component/page `onBack` handlers, starting with the last registered.
2. The global `backHandler`.
3. No action if neither exists.

A handler that returns `false` declines and passes Back to the next handler; see [Pass Back on](#pass-back-on). `epg.back()` runs the same flow programmatically and returns whether any handler handled it.

## Global handler

```ts
app.use(VuEPG, {
  backHandler: () => router.back(),
});
```

## Component handler

Call `onBack` inside component setup:

```vue
<script setup lang="ts">
import { useVuEPG } from "vuepg";

const epg = useVuEPG();

epg.onBack(() => {
  // Close the dialog before navigating back
  closeDialog();
});
</script>
```

With Options API, register during `created()`:

```ts
export default {
  created() {
    this.$epg.onBack(() => this.close());
  },
};
```

### Activation rules

| Component state               | Handler  |
| ----------------------------- | -------- |
| Mounted / KeepAlive activated | Active   |
| KeepAlive deactivated         | Inactive |
| Unmounted                     | Removed  |

When multiple handlers are active, the **last registered active handler** wins. Setup registration means nested components and newly created dialogs usually register later. Removing a dialog restores the page handler.

## Pass Back on

When temporary state inside a component should respond to Back first (edit mode, an expanded search box, a player overlay, a submenu), the handler returns `false` when it has nothing to do. Back then goes to the next active handler and finally to the global `backHandler`:

```ts
// FavoriteList.vue: Back leaves edit mode first, otherwise the page handles it
epg.onBack(() => {
  if (!editing.value) {
    return false;
  }
  editing.value = false;
});
```

Any return value other than `false`, including none, means the handler handled Back. When every handler returns `false`, or there is none, `epg.back()` returns `false`; a native host can use this to run its own default, such as exiting the application.
