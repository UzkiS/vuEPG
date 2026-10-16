<p align="center">
  <a href="https://uzkis.github.io/vuEPG/en/">
    <img src="https://raw.githubusercontent.com/UzkiS/vuEPG/main/docs/public/logo.svg" width="120" height="120" alt="vuEPG">
  </a>
</p>

<h1 align="center">vuEPG</h1>

<p align="center">Focus management and spatial navigation for Vue 2.7 / Vue 3, for modern browsers, TV, IPTV and set-top boxes, including legacy Android 4.x operator set-top boxes</p>
<p align="center">Deployed in set-top box projects for major telecom operators</p>
<p align="center"><a href="./README.md">简体中文</a> · <b>English</b></p>

<p align="center">
  <a href="https://www.npmjs.com/package/vuepg"><img src="https://img.shields.io/npm/v/vuepg?color=d81b60" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/vuepg"><img src="https://img.shields.io/npm/dm/vuepg?color=d81b60" alt="npm downloads"></a>
  <a href="https://github.com/UzkiS/vuEPG/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/UzkiS/vuEPG/ci.yml?branch=main&label=CI" alt="CI"></a>
  <a href="https://bundlejs.com/?q=vuepg"><img src="https://img.shields.io/bundlejs/size/vuepg" alt="bundle size"></a>
  <img src="https://img.shields.io/badge/vue-2.7%20%7C%203-42b883" alt="Vue 2.7 | 3">
  <a href="https://uzkis.github.io/vuEPG/en/guide/legacy-webview"><img src="https://img.shields.io/badge/target-Chromium%2030%2B-1976d2" alt="Target: Chromium 30+ with ES5 build and polyfills"></a>
  <a href="https://uzkis.github.io/vuEPG/en/guide/legacy-webview"><img src="https://img.shields.io/badge/Android-4.x%20compatible-3ddc84" alt="Android 4.x integration"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/npm/l/vuepg" alt="license"></a>
</p>

<p align="center">
  <a href="https://uzkis.github.io/vuEPG/en/">Documentation</a> ·
  <a href="https://uzkis.github.io/vuEPG/en/guide/business-example">Complete example</a> ·
  <a href="https://uzkis.github.io/vuEPG/en/guide/legacy-webview">Android 4.x integration</a> ·
  <a href="https://uzkis.github.io/vuEPG/en/migration/">Migration guides</a> ·
  <a href="https://uzkis.github.io/vuEPG/en/changelog">Changelog</a>
</p>

---

vuEPG adds focus management and spatial navigation to Vue pages: add directives to existing elements, and the arrow keys of a keyboard or remote move focus between them. Gamepads, virtual remotes and native key callbacks connect through the API. Your pages keep their own components and styles.

For legacy Android 4.x operator set-top boxes, use **Vue 2.7 + an ES5 application build + the required polyfills**; see the [legacy device guide](https://uzkis.github.io/vuEPG/en/guide/legacy-webview). The included [complete example project](#included-complete-example-project) is already set up this way: copy it, replace the pages and data, and start building.

## Features

- 🎮 **Multiple inputs**: built-in keyboard and remote mappings; connect gamepads, virtual controls or native key callbacks through the logical API
- 🧭 **Spatial navigation**: the next focus is chosen from the elements' real positions, with no hand-written jump tables
- 🗂️ **Groups and default focus**: search inside the group first, then outward; entering a group lands on its designated default item
- 🛡️ **Reliable recovery**: navigation skips unmounted, hidden (`v-show`, KeepAlive) and disabled targets; unavailable focus recovers inside its original group, and `restoreFocus` can restore focus automatically after unmounting
- 📜 **Optional scrolling**: mark the real scroll containers with `v-epg-scroll` to keep the focused item visible
- 🧩 **Native DOM events**: `epg-focus`, `epg-blur`, `epg-enter`, `epg-leave` and direction events; cancel the default move with `.prevent`
- 🎛️ **Customizable keys**: built-in direction, Enter and Back mappings, including legacy boxes that only report `keyCode`
- 🔌 **Vue 2.7 / Vue 3**: one API, with the full test suite run on both versions in CI
- 🪶 **Zero dependencies**: no runtime dependencies, ES2015 output compatible with webpack 4, complete TypeScript types

## Installation

```sh
pnpm add vuepg
```

## Usage

```ts
// main.ts
import { createApp } from "vue";
import VuEPG from "vuepg";
import App from "./App.vue";

createApp(App)
  .use(VuEPG, { backHandler: () => history.back() })
  .mount("#app");

// Vue 2.7: Vue.use(VuEPG, { backHandler: () => history.back() })
```

```vue
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useVuEPG } from "vuepg";

const epg = useVuEPG();
const first = ref<HTMLElement>();
onMounted(() => {
  epg.move(first.value);
});
const open = (id: number): void => {
  alert(`Selected content ${id}`);
};
</script>

<template>
  <main v-epg-group>
    <button ref="first" v-epg-item="{ default: true }" @click="open(1)">Content 1</button>
    <button v-epg-item @click="open(2)">Content 2</button>
  </main>
</template>

<style>
.vuepg-focus {
  outline: 3px solid #d81b60;
}
</style>
```

- Direction keys move focus by position; when a group has no target, focus moves to the adjacent group
- Enter triggers the current element's `click`
- Back calls the page's `onBack`, or the global `backHandler` when there is none

See the **[documentation](https://uzkis.github.io/vuEPG/en/)** for complete usage, or try the **[navigation demo](https://uzkis.github.io/vuEPG/en/guide/playground)** first.

Projects using another focus library can follow the [migration guides](https://uzkis.github.io/vuEPG/en/migration/): [vuEPG 1.x](https://uzkis.github.io/vuEPG/en/migration/v1), [vue-epg](https://uzkis.github.io/vuEPG/en/migration/vue-epg) or [vue-tv-focusable / tv-focusable](https://uzkis.github.io/vuEPG/en/migration/tv-focusable).

## Included complete example project

The [remote learning center](https://uzkis.github.io/vuEPG/en/guide/business-example) can serve as the starting point of a new project, with development, build and compatibility testing already configured. It demonstrates circular navigation, scrolling, page position restoration, dynamic lists, dialog focus restoration and native key input. The learning theme is just the subject of the demo; the interactions apply directly to your own menus, lists and cards. Its interface is in Chinese.

<a href="https://uzkis.github.io/vuEPG/example/tv-training/"><img src="https://raw.githubusercontent.com/UzkiS/vuEPG/main/docs/public/example-preview.png" alt="Open the vuEPG complete remote-control example" width="960"></a>

Copy the [examples/tv-training](./examples/tv-training) directory and run in it:

```sh
pnpm install
pnpm dev       # Vite, fast development in modern browsers
pnpm dev:tv    # webpack + Babel, development on legacy set-top boxes
pnpm build     # ES5-compatible application
pnpm preview   # serve the production build
```

When developing the vuEPG repository, you can also run from the root:

```sh
pnpm install
pnpm example:dev       # modern browsers, Vite
pnpm example:dev:tv    # legacy device development, webpack + Babel
pnpm example:build     # ES5 application build
pnpm example:preview   # serve the static build
```

See [examples/tv-training](./examples/tv-training) for details.

## Development and compatibility testing

```sh
pnpm legacy:install   # install and verify the real browser and driver in Docker
pnpm test:chrome30    # build the package and test the production and webpack dev entries
pnpm legacy:clean     # remove legacy browser caches, images and results
```

The real Chromium 30 regression covers the production build, webpack development and hot updates, and checks navigation, scrolling, dialogs and focus restoration. Installation, logs and screenshots are described in the [regression guide](https://uzkis.github.io/vuEPG/en/guide/chromium30-testing).

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the development workflow.

## Support the project

My big blue fish has been working for love alone, and now she is out of rice!!! If this project has helped you, please feed her a little rice! 🐳🍚

<p><img src="https://raw.githubusercontent.com/UzkiS/vuEPG/main/docs/public/support/blue-fish.webp" width="280" alt="The big blue fish enjoying a bowl of rice"></p>

A star, a suggestion or sharing the project with a friend helps too.

<details>
<summary>Treat the author · WeChat Pay / Alipay</summary>

<p>Click an image to view it at full size.</p>
<table>
  <tr><th>WeChat Pay</th><th>Alipay</th></tr>
  <tr>
    <td><a href="https://raw.githubusercontent.com/UzkiS/vuEPG/main/docs/public/support/wechat-pay.png"><img src="https://raw.githubusercontent.com/UzkiS/vuEPG/main/docs/public/support/wechat-pay.png" width="220" alt="WeChat Pay QR code for supporting the project"></a></td>
    <td><a href="https://raw.githubusercontent.com/UzkiS/vuEPG/main/docs/public/support/alipay.jpg"><img src="https://raw.githubusercontent.com/UzkiS/vuEPG/main/docs/public/support/alipay.jpg" width="220" alt="Alipay QR code for supporting the project"></a></td>
  </tr>
</table>
</details>

## Acknowledgements

- [vue-epg](https://www.npmjs.com/package/vue-epg): the starting point of this project

## License

[MIT](./LICENSE) © 2022 – Present UzkiS
