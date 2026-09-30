---
title: TypeScript integration for Vue checks, template refs and focus events
description: "Configure vue-tsc and use vuEPG types in Vue 2.7 and Vue 3, including template refs, focus events, node guards and Options API $epg."
---

# TypeScript integration

This page addresses concrete integration questions: checking Vue files, typing template refs, reading focus events and getting this.$epg completion in Options API. vuepg includes declarations; no @types/vuepg package is needed.

See [Getting started](./getting-started) for installation and page behavior, and [API](../api/) for method signatures.

## Check Vue file types

Retain your existing TypeScript configuration. To check Vue files from the command line, install the tools and run:

```sh
pnpm add -D typescript@6 vue-tsc@3
pnpm exec vue-tsc --noEmit -p tsconfig.json
```

Use Vue - Official in the editor. Vue 2.7 projects also specify the template target in tsconfig.json:

```json
{
  "vueCompilerOptions": {
    "target": 2.7
  }
}
```

Merge this fragment into the existing config. See the [independent example tsconfig.json](https://github.com/UzkiS/vuEPG/blob/main/examples/tv-training/tsconfig.json) for a runnable project configuration. Vue 3 projects use a template target matching their Vue version, rather than 2.7.

Type checking and browser-compatible builds are separate. Passing TypeScript checks does not make output ES5; legacy devices still need application transpilation and polyfills. See [Legacy integration](./legacy-webview).

## Template refs, directive options and events

This component works with Vue 2.7 and Vue 3:

```vue
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useVuEPG, type EPGEvent, type EPGItemOptions } from "vuepg";

const epg = useVuEPG();
const first = ref<HTMLElement | null>(null);
const firstOptions: EPGItemOptions = { default: true };
const currentLabel = ref("");

onMounted(() => {
  epg.move(first.value);
});

const onFocus = (event: EPGEvent<"epg-focus">): void => {
  currentLabel.value = event.detail.item.el.textContent ?? "";
};
</script>

<template>
  <main v-epg-group>
    <button ref="first" v-epg-item="firstOptions" @epg-focus="onFocus">Content 1</button>
    <button v-epg-item @epg-focus="onFocus">Content 2</button>
    <p>Current focus: {{ currentLabel }}</p>
  </main>
</template>
```

A ref can be null before mount or after unmount. move() accepts null / undefined, so no non-null assertion is needed. Read the HTMLElement from event.detail.item.el instead of casting the nullable event.target.

EPGItemOptions checks option fields; EPGEvent<"epg-focus"> checks the payload. Direction events use EPGEvent<"epg-right">, with detail.node and detail.direction rather than detail.item.

Vue 3 provides template directive augmentation. In Vue 2.7, declare bindings as EPGItemOptions / EPGGroupOptions so TypeScript checks the object itself independently of template-tooling directive support.

## this.$epg in Options API

Use defineComponent for the component instance type. This example works with Vue 2.7 and Vue 3:

```vue
<script lang="ts">
import { defineComponent } from "vue";
import { useVuEPG } from "vuepg";

export default defineComponent({
  methods: {
    moveRight(): void {
      this.$epg.navigate("right");
    },
    closeDialog(): void {
      // Handle the application's own close behavior.
    },
  },
  created() {
    useVuEPG().onBack(() => {
      this.closeDialog();
    });
  },
});
</script>

<template>
  <button type="button" @click="moveRight">Move right</button>
</template>
```

Importing vuepg or its plugin / useVuEPG loads Vue type augmentation. You must still install the plugin at runtime. If this.$epg completion is missing, check defineComponent, the vuepg import and whether the editor uses the project's tsconfig.

## Narrow query results before use

A registered DOM node may be an item, a group or null:

```ts
import { useVuEPG } from "vuepg";

const epg = useVuEPG();
const element = document.getElementById("content");
if (element !== null) {
  const node = epg.getNodeByElement(element);
  if (epg.isEPGItem(node)) {
    epg.moveToItem(node);
  } else if (epg.isEPGGroup(node)) {
    epg.moveToGroup(node);
  }
}
```

The isEPGItem() and isEPGGroup() type guards narrow to EPGItem and EPGGroup. Ordinary unregistered DOM elements return null. See [API](../api/) for methods and results.
