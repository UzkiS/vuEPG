---
description: "Archived vuEPG 1.x installation, plugin configuration and basic usage."
title: Getting started
---

# Getting started

## Installation

```sh
pnpm add vuepg@^1.2.2
```

## Register and configure the plugin

```javascript
// main.js
import vuEPG, { useVuEPG } from "vuepg";

const epg = useVuEPG();
epg.setConfig({
  debug: true,
});

app.use(vuEPG);
// Vue.use(vuEPG) vue@2
```

## Access the instance

### useVuEPG()

```vue
<script setup>
import { useVuEPG } from "vuepg";

const epg = useVuEPG();

// epg.xxxx
</script>
```

### inject

Vue 3 provides the instance through `provide`.

::: warning

- This injection is unavailable in Vue 2.
- The injected object lacks key-action methods such as `setAction`; use `useVuEPG()` for them.
  :::

```vue
<script setup>
const epg = inject("epg");

// epg.xxxx
</script>
```

## Default focus class

Define a global class to make focus visible. You can customize it later.

```css
.vuepg-focus {
  background: red;
}
```

## Basic usage

```vue
<template>
  <div v-epg-group>
    <div v-epg-item ref="top">Top</div>
    <div v-epg-group>
      <div v-epg-item>item1</div>
      <div v-epg-item>item2</div>
      <div v-epg-item @up="epg.move(top)">item3</div>
    </div>
  </div>
</template>

<script setup>
import { useVuEPG } from "vuepg";
import { ref, onMounted } from "vue";
const epg = useVuEPG();

const top = ref();

onMounted(() => {
  epg.move(top.value);
});
</script>
```
