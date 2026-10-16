---
description: "Vue 2.7 / Vue 3 focus management and spatial navigation for keyboards, remotes and API-connected input, for modern browsers and TV applications, including legacy Android 4.x operator boxes."
---

# Introduction

vuEPG provides **focus management and spatial navigation** for Vue web applications in modern browsers, TV, IPTV and set-top boxes. Keyboard and remote mappings are built in, and logical APIs connect gamepads, virtual remotes and native key callbacks. Your pages keep their components, styling and business logic.

vuEPG supports Vue 2.7 and Vue 3 and has been deployed in set-top box projects for major telecom operators. Legacy devices such as Android 4.x use Vue 2.7 with an ES5 application build and the required polyfills; see [Android 4.x integration](./legacy-webview).

## How focus moves

- `v-epg-item` marks a focusable element.
- `v-epg-group` defines a navigation region with its own entry and boundaries.
- Direction keys search by **live screen position**, inside the group first and then outward through parent groups.
- Confirm invokes the current element's `click`; Back invokes the registered handler.

<FocusConceptDemo />

vuEPG uses logical focus: instead of calling the browser's `focus()`, it adds a focus class to the selected item. Your page controls its appearance without adopting a fixed TV component library.

## Where input comes from

A normal browser receives keyboard events directly. A remote may send the same events. When a page runs inside a native application's WebView, the native application can forward keys through a JavaScript callback; see [Native input](./native-bridge). Gamepads and virtual controls can use the same logical APIs.

## Common capabilities

- **Dynamic content:** navigation skips hidden, unmounted and disabled targets; unavailable focus recovers inside its original group, and can be restored automatically after unmounting.
- **Default entries:** entering a group selects its designated item, which may change with application state.
- **Direction overrides:** DOM events handle custom jumps and boundaries, including loops and dialogs.
- **Scrolling:** marked scroll containers keep the selected item visible.
- **Back handling:** components register their own handlers; closing a dialog restores the page handler.

## Where to start

[Getting started](./getting-started) installs the plugin and creates a first page. [Navigation demo](./playground) illustrates movement and events. The [complete example](./business-example) combines pages, scrolling and dialogs and can be copied as an independent project.

For existing vuEPG 1.x, vue-epg or vue-tv-focusable projects, use the [migration guides](../migration/) for directive, event and API replacements.

## Acknowledgements

- [vue-epg](https://www.npmjs.com/package/vue-epg): the starting point for this project.
