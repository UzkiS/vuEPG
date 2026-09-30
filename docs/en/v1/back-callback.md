---
description: "Archived vuEPG 1.x global and component-scoped Back callbacks."
title: Back callbacks
---

# Back callbacks

vuEPG invokes a global or component callback for the `BACK` action.

## Global callback

Configure at any time through `setConfig`:

```javascript
const router = useRouter;

epg.setConfig({
  defBackHandler: () => {
    router.go(-1);
  },
});
```

## Component callback

::: warning

- Active while the Vue component is Mounted/Activated, inactive when Deactivated/Unmounted.
- While a component callback is active, the global callback is not invoked.
  :::

### Type

```typescript
const onBack: (func: Function) => void;
```

### Composition API

```vue
<script setup>
import { useVuEPG } from "vuepg";
const epg = useVuEPG();
epg.onBack(() => {
  console.log("Component Back callback");
});
</script>
```

### Options API

```vue
<script>
import { defineComponent } from "vue";
import { useVuEPG } from "vuepg";

const epg = useVuEPG();
export default defineComponent({
  created() {
    epg.onBack(() => {
      console.log("Component Back callback");
    });
  },
});
</script>
```
