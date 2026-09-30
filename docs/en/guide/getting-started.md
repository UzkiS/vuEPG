---
description: "Install vuEPG in Vue 2.7 or Vue 3, register directives, set initial focus and handle input. Android 4.x has a separate integration guide."
---

# Getting started

## Requirements

- Vue **2.7** or **3.x**. Upgrade Vue 2.6 or earlier to 2.7 first.
- Devices without `Proxy`, including legacy Android 4.x / WebView 30 environments, use **Vue 2.7**. Vue 3 requires Proxy; syntax transpilation cannot provide it.
- The library ships ES2015 syntax. If a target only supports ES5, transpile `node_modules/vuepg` in the application build.
- Supply the `CustomEvent` constructor, `Symbol`, `Map`, `Set`, `Object.assign` and `Array.from`. Missing runtime APIs need polyfills in addition to syntax transforms.

To start from a complete project, copy the included [example](./business-example) and replace its pages and data. It supplies Vue 2.7, both development entries, ES5 builds and required polyfills for getting started with legacy Android 4.x operator set-top boxes. See [Legacy integration](./legacy-webview) for compatibility steps.

## Installation

::: code-group

```sh [pnpm]
pnpm add vuepg
```

```sh [npm]
npm install vuepg
```

```sh [yarn]
yarn add vuepg
```

:::

## Register the plugin

::: code-group

```ts [Vue 3]
import { createApp } from "vue";
import VuEPG from "vuepg";
import App from "./App.vue";

createApp(App)
  .use(VuEPG, {
    // Optional; see Configuration
    backHandler: () => history.back(),
  })
  .mount("#app");
```

```ts [Vue 2.7]
import Vue from "vue";
import VuEPG from "vuepg";
import App from "./App.vue";

Vue.use(VuEPG, {
  // Optional; see Configuration
  backHandler: () => history.back(),
});

new Vue({ render: (h) => h(App) }).$mount("#app");
```

:::

The plugin registers `v-epg-item`, `v-epg-group` and `v-epg-scroll`, exposes `$epg` and starts listening for keyboard input.

## Focus styling

The selected element receives `vuepg-focus`, configurable in [Configuration](./configuration). Make it visible:

```css
.vuepg-focus {
  outline: 3px solid #d81b60;
  transform: scale(1.05);
}
```

## Your first page

```vue
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useVuEPG } from "vuepg";

const epg = useVuEPG();
const search = ref<HTMLElement>();

onMounted(() => {
  epg.move(search.value);
});

epg.onBack(() => {
  console.log("Page Back");
});

const play = (n: number): void => {
  console.log("Play movie", n);
};
</script>

<template>
  <nav v-epg-group>
    <button ref="search" v-epg-item>Search</button>
    <button v-epg-item>Account</button>
  </nav>

  <main v-epg-group="{ default: true }">
    <div v-for="n in 6" :key="n" v-epg-item="{ default: n === 1 }" @click="play(n)">
      Movie {{ n }}
    </div>
  </main>
</template>
```

- Direction keys move between elements by position. When no target exists inside a group, navigation searches adjacent groups.
- Confirm invokes the focused element's `click`.
- Back invokes the page's `onBack`, then the global `backHandler` fallback.

## Access the instance

vuEPG is a global singleton. All three access methods return the same instance:

```ts
import { useVuEPG } from "vuepg";
const epg = useVuEPG(); // Anywhere
```

```vue
<template>
  <!-- In a template -->
  <div v-epg-item @epg-up="$epg.move('left')">...</div>
</template>
```

```ts
export default {
  mounted() {
    this.$epg.move("down"); // Options API
  },
};
```

## Next steps

- [Focus items](./epg-item) and [Groups](./epg-group): directive options.
- [Events](./events): focus notifications and direction overrides.
- [Navigation rules](./navigation): how targets are selected.
- [Scrolling](./scrolling): keeping focus visible.
