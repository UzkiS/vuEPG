---
layout: home
title: vuEPG · Vue focus management and spatial navigation, including legacy Android 4.x operator set-top boxes
description: "Vue 2.7 / Vue 3 focus management and spatial navigation with keyboard, remote and API-connected input. For modern browsers, TV, IPTV and set-top boxes, including legacy Android 4.x operator set-top boxes."
titleTemplate: false
hero:
  name: vuEPG
  text: Focus management and spatial navigation
  tagline: Vue 2.7 / Vue 3 for modern browsers, TV, IPTV and set-top box web applications, including legacy Android 4.x operator set-top boxes. Deployed in projects for major telecom operators.
  image:
    src: /logo.svg
    alt: vuEPG
  actions:
    - theme: brand
      text: Getting started
      link: /en/guide/getting-started
    - theme: alt
      text: Legacy compatibility
      link: /en/guide/legacy-webview
    - theme: alt
      text: Complete example
      link: /en/guide/business-example
features:
  - icon: 📺
    title: Modern and legacy devices
    details: Supports modern browsers and provides an integration path for Android 4.x, WebView 30 and existing operator boxes, with a complete project, ES5 builds and device development.
  - icon: 🧭
    title: Spatial navigation
    details: Chooses the next focus by live screen position, without manually maintaining direction tables when layouts change.
  - icon: 🪶
    title: Vue 2.7 and Vue 3
    details: The same API on Vue 2.7 and Vue 3. Add directives to existing elements; zero runtime dependencies and TypeScript declarations.
  - icon: 🔌
    title: Keyboard, remote and other input
    details: Built-in keyboard and remote mappings, with APIs for gamepads, virtual controls and native callbacks.
  - icon: 🗂️
    title: Groups and default focus
    details: Organize menus, content and dialogs into navigation regions, searching within groups first with default entries and cancellable boundaries.
  - icon: 📜
    title: Scrolling and focus recovery
    details: Scrolls when focus leaves the visible area of a scroll container. Hidden or unmounted focus recovers inside its original group, and can be restored automatically after unmounting.
---

## Included complete example project

The repository includes an independent Vue 2.7 project with Vite / webpack development entries, ES5 builds, required polyfills and real Chromium 30 regression tests. Copy it and replace the pages and data to start your own TV / IPTV application, with legacy set-top box configuration already in place.

<BusinessExample />

The example demonstrates circular navigation, scrolling, page position restoration, dialogs and Android native input. Its interface is in Chinese. Try the navigation rules in the [navigation demo](./guide/playground); legacy configuration is in [Android 4.x integration](./guide/legacy-webview).

## Support the project {#support}

<SupportProject />
