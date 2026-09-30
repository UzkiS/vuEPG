---
title: Vue TV focus migration guides for vuEPG 1.x, vue-epg and vue-tv-focusable
description: "Migrate from vuEPG 1.x, vue-epg or vue-tv-focusable / tv-focusable. Select a guide by your existing directives, focus APIs, events and build setup."
---

# Migration guides

Choose by the npm package and directives in your existing project. Retain your UI, data and ordinary click handlers while reviewing focus registration, direction events, scrolling and lifecycle handling.

| Current project    | Common syntax                                               | Guide                                           |
| ------------------ | ----------------------------------------------------------- | ----------------------------------------------- |
| `vuepg` 1.x        | `v-epg-item`, `@focus`, `getFoucsClass()`, `setAction()`    | [Upgrade from 1.x](./v1)                        |
| `vue-epg`          | `v-items`, `v-group`, `$service`, `serviceBack`             | [Migrate from vue-epg](./vue-epg)               |
| `vue-tv-focusable` | `v-focusable`, `$tv.next()`, `requestFocus()`, `limitingEl` | [Migrate from vue-tv-focusable](./tv-focusable) |

Check your Vue version first: vuEPG supports Vue 2.7 and Vue 3; Vue 2.6 must upgrade to 2.7. Android 4.x / WebView 30 projects retain Vue 2.7 and verify ES5 application/dependency transpilation plus polyfills. See [Legacy integration](../guide/legacy-webview).

Start with a page containing a list, dialog and Back action, avoiding duplicate key handling by old and new plugins. Validate navigation, clicks, Back, scrolling and page focus restoration before extending migration. Copy the [complete example project](../guide/business-example) for a runnable starting point.
