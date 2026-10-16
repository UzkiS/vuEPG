---
description: "Copy a complete Vue 2.7 TV project with circular navigation, scrolling, page restoration, dialogs, native input and Vite/webpack development entries."
---

# Complete example

vuEPG includes the TV learning center as a complete example project that can be installed, run and copied independently. It supplies Vue 2.7, Vite / webpack development entries, ES5 builds, required polyfills and real Chromium 30 tests to help you get started with legacy Android 4.x operator set-top boxes. Its learning theme demonstrates input interactions using local data and simulated native keys. No backend is required.

<BusinessExample />

[Source](https://github.com/UzkiS/vuEPG/tree/main/examples/tv-training)

## Reusable interactions

The example uses a learning-center theme; the interactions below apply directly to menus, content cards, channel lists and similar pages.

| Interaction         | Try it                                               | Implementation                     |
| ------------------- | ---------------------------------------------------- | ---------------------------------- |
| Circular navigation | Left/right loop at list ends                         | Direction events and move()        |
| Scrolling           | Focus a card outside the viewport                    | v-epg-scroll on the real container |
| Page restoration    | Enter an exercise and return to the same card        | Saved ID and focus after mount     |
| Dynamic lists       | Filter out the focused card; focus stays in the list | `restoreFocus` and group entry     |
| Dialog              | Open exit; directions stay inside                    | Boundaries and component Back      |
| Focus restoration   | Close and return to the previous item                | `restoreFocus`                     |
| Native keys         | Android direction/Back controls                      | [Native input](./native-bridge)    |

## Copy into your project

Download the source, copy `examples/tv-training`, and run inside that directory:

```sh
pnpm install
pnpm dev       # Modern browser development: http://localhost:5175/
pnpm dev:tv    # Legacy device development: http://COMPUTER-LAN-IP:5174/
pnpm build     # ES5 compatibility build
pnpm preview   # Production preview: http://localhost:4174/
```

It comes with its own dependencies, type configuration, scripts and checks, and installs vuepg from npm, so it runs on its own once copied. Replace its pages and data for your application.

Vite serves modern-browser development. webpack handles legacy-device development and production. See [Android 4.x integration](./legacy-webview) for polyfills and troubleshooting.

## Read the source

| File                                                                                                   | Contents                                   |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| [app.vue](https://github.com/UzkiS/vuEPG/blob/main/examples/tv-training/src/app.vue)                   | Pages, saved position, loops and filtering |
| [focus-dialog.vue](https://github.com/UzkiS/vuEPG/blob/main/examples/tv-training/src/focus-dialog.vue) | Dialog entry, Back and Tab cycling         |
| [bridge.ts](https://github.com/UzkiS/vuEPG/blob/main/examples/tv-training/src/bridge.ts)               | Android mapping and listener cleanup       |
| [polyfills.ts](https://github.com/UzkiS/vuEPG/blob/main/examples/tv-training/src/polyfills.ts)         | Language, DOM and Web API compatibility    |

The example's extra `whatwg-fetch` is only used by webpack hot updates; vuEPG itself does not need it.

When developing vuEPG, root `example:dev`, `example:dev:tv` and `example:build` use the local built package. See [Chromium regression](./chromium30-testing) for browser checks and Docker.
