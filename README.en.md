<p align="center"><a href="https://uzkis.github.io/vuEPG/en/"><img src="https://raw.githubusercontent.com/UzkiS/vuEPG/main/docs/public/logo.svg" width="100" height="100" alt="vuEPG"></a></p>

# vuEPG

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

Focus management and spatial navigation for **Vue 2.7 / Vue 3**, for modern browsers, TV, IPTV and set-top boxes, including legacy Android 4.x operator set-top boxes. Keyboard and remote input are built in; logical APIs let you connect gamepads, virtual controls and native callbacks.

[简体中文](./README.md) · [Documentation](https://uzkis.github.io/vuEPG/en/) · [Complete example](https://uzkis.github.io/vuEPG/en/guide/business-example) · [Android 4.x integration](https://uzkis.github.io/vuEPG/en/guide/legacy-webview)

vuEPG aims to make focus management and spatial navigation easier to add to Vue pages, reducing adaptation and debugging work for modern browsers and existing operator set-top boxes.

vuEPG has been deployed in set-top box projects for major telecom operators. Add directives to your existing UI and keep your components and visual design. Maintaining applications for existing operator boxes often requires Android 4.x and older WebView compatibility. These projects use Vue 2.7, ES5 application builds and required polyfills.

The repository includes a **complete, independently copyable example project** with Vue 2.7, Vite / webpack development entries, ES5 builds, required polyfills and real Chromium 30 regression tests. Copy it, replace the pages and data, and start your own TV / IPTV application, including development for legacy Android 4.x operator set-top boxes. See the [complete example](https://uzkis.github.io/vuEPG/en/guide/business-example).

## Features

- Add directives to your existing DOM and keep your UI components and visual design.
- Navigate by live screen geometry, searching within groups first, then outward; enter groups at their designated default item.
- Use the same API on Vue 2.7 and Vue 3, with a full test suite on both versions.
- Skip hidden, unmounted and disabled targets; recover unavailable focus within the original group.
- Native `epg-*` DOM events support focus, group entry/exit and cancellable directions through `.prevent`.
- Customize key mappings, including numeric `keyCode` fallback on legacy devices.
- Keep focused items visible with independent scroll-container directives.
- Zero runtime dependencies; Vue is a peer dependency. ES2015 ESM/CommonJS output compatible with webpack 4, with TypeScript declarations.

## Installation

```sh
pnpm add vuepg
```

## Usage

```ts
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

Direction keys move focus by position, Confirm invokes the current element's `click`, and Back calls the component's `onBack` or global `backHandler`. See the [documentation](https://uzkis.github.io/vuEPG/en/) and [navigation demo](https://uzkis.github.io/vuEPG/en/guide/playground).

For existing focus-library applications, follow the [migration guides](https://uzkis.github.io/vuEPG/en/migration/): [vuEPG 1.x](https://uzkis.github.io/vuEPG/en/migration/v1), [vue-epg](https://uzkis.github.io/vuEPG/en/migration/vue-epg) or [vue-tv-focusable / tv-focusable](https://uzkis.github.io/vuEPG/en/migration/tv-focusable).

## Included complete example project

The [TV learning center](./examples/tv-training) provides a starting point for a new project, including development, build and compatibility test configuration. It demonstrates circular navigation, scrolling, saved page position, dialogs, focus restoration and a mock Android key bridge. The learning theme is demonstration content; reuse these interactions in your own menus, lists and cards.

<img src="https://raw.githubusercontent.com/UzkiS/vuEPG/main/docs/public/example-preview.png" alt="vuEPG complete interaction example" width="960">

Copy the example directory and run its commands independently:

```sh
pnpm install
pnpm dev
pnpm dev:tv
pnpm build
pnpm preview
```

When developing vuEPG itself, use the root commands:

| Command at repository root | Purpose                                           |
| -------------------------- | ------------------------------------------------- |
| `pnpm example:dev`         | Fast Vite development in modern browsers          |
| `pnpm example:dev:tv`      | webpack + Babel development on legacy TV WebViews |
| `pnpm example:build`       | ES5 application build targeting Chrome 30         |
| `pnpm example:preview`     | Serve the production application                  |

Vite's development server requires native ESM. A production legacy build does not make that server usable on WebView 30. Both development paths are intentionally retained.

## Development and compatibility tests

```sh
pnpm legacy:install
pnpm test:chrome30
pnpm legacy:clean
```

The project manages a pinned amd64 Docker environment with real Chromium 30.0.1584.0, ChromeDriver 2.8 and Xvfb. It checks binary/session versions and saves assertions, logs, screenshots and bundle hashes. See the [regression guide](https://uzkis.github.io/vuEPG/en/guide/chromium30-testing) for host-platform verification limits.

## Compatibility

The library ships ES2015 syntax. Legacy devices, including Android 4.x set-top boxes, need application-level transpilation and missing JavaScript / DOM APIs. WebView 30 needs **Vue 2.7**, ES5 application output and polyfills including CustomEvent where necessary. Vue 3 requires Proxy.

See the [compatibility guide](https://uzkis.github.io/vuEPG/en/guide/legacy-webview) for the complete build and verification path. Browser automation and syntax checks do not replace tests on the actual device.

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

- [vue-epg](https://www.npmjs.com/package/vue-epg): the starting point for this project.

## License

[MIT](./LICENSE) © 2022 – Present UzkiS
