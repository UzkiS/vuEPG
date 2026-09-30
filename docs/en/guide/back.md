---
description: "Configure global and component Back handlers for dialogs, page navigation and KeepAlive activation."
---

# Back handling

Back (by default Backspace, Escape and common remote Back codes) chooses:

1. An active component/page `onBack` handler.
2. The global `backHandler`.
3. No action if neither exists.

`epg.back()` invokes the same flow programmatically.

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
