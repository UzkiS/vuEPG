---
description: "Vue 2.7 / Vue 3 focus management and spatial navigation for keyboards, remotes and API-connected input, for modern browsers and TV applications, including legacy Android 4.x operator boxes."
---

# Introduction

vuEPG aims to make focus management and spatial navigation easier to add to Vue pages, reducing adaptation and debugging work for modern browsers and existing operator set-top boxes.

vuEPG provides **focus management and spatial navigation** for Vue web applications in modern browsers, TV, IPTV and set-top boxes. Keyboard and remote mappings are built in. Logical APIs connect gamepads, virtual controls and native callbacks while preserving your components, styling and business logic.

It supports Vue 2.7 and Vue 3 and has been deployed in projects for major telecom operators. Maintaining applications for existing operator boxes often requires Android 4.x and older WebView compatibility. These projects use Vue 2.7, ES5 application builds and required polyfills. See [Android 4.x integration](./legacy-webview).

## How focus moves

- `v-epg-item` marks a focusable element.
- `v-epg-group` defines a navigation region with its own entry and boundaries.
- Direction keys search by **live screen position**, inside the group first and then outward through parent groups.
- Confirm invokes the current element's `click`; Back invokes the registered handler.

<FocusConceptDemo />

vuEPG uses logical focus: a focus class marks the selected item. Your page controls its appearance without adopting a fixed TV component library.

## Where input comes from

A normal browser receives keyboard events directly. A remote may send the same events. When a page runs inside a native application's WebView, the native application can forward keys through a JavaScript callback; see [Native input](./native-bridge). Gamepads and virtual controls can use the same logical APIs.

## Common capabilities

- **Dynamic content:** navigation skips hidden, unmounted and disabled targets and recovers unavailable focus inside an accessible group.
- **Default entries:** entering a group selects its designated item, which may change with application state.
- **Direction overrides:** DOM events handle custom jumps and boundaries, including loops and dialogs.
- **Scrolling:** marked scroll containers keep the selected item visible.
- **Back handling:** components register their own handlers; closing a dialog restores the page handler.
- **Input integration:** keyboard mappings, native callbacks and virtual controls share navigation logic.

## Where to start

[Getting started](./getting-started) installs the plugin and creates a first page. [Navigation demo](./playground) illustrates movement and events. The [complete example](./business-example) combines pages, scrolling and dialogs and can be copied as an independent project.

For existing vuEPG 1.x, vue-epg or vue-tv-focusable projects, use the [migration guides](../migration/) for directive, event and API replacements.

## Acknowledgements

- [vue-epg](https://www.npmjs.com/package/vue-epg): the starting point for this project.
