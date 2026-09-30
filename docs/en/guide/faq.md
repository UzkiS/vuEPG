---
description: "Answers for Vue focus integration: components, input types, Android 4.x, WebView 30, Vite, group entries, recovery and long lists."
---

# Frequently asked questions

## Must I replace existing components?

No. Directives mark DOM focus items and groups, and your page controls focus styling. Ordinary @click handles Confirm. For listeners on a component root, Vue 2.7 needs .native; see [Events](./events).

## Which input types are supported?

Keyboard and remote direction, Confirm and Back mappings are built in. Gamepads, virtual controls and native callbacks connect through navigate(), back() and other logical APIs without synthetic keyboard events. See [Native input](./native-bridge).

## How do legacy Android 4.x operator boxes integrate?

Use Vue 2.7, transpile application and dependencies to ES5 and supply language/DOM APIs. [Device integration](./legacy-webview) includes a project, commands and troubleshooting.

## Why is Vite development blank on the device?

Legacy WebViews cannot execute the native ESM entry. The example retains webpack device development and Vite for modern browsers. See [Development entries](./legacy-webview#why-retain-webpack-development).

## Why does entering a group not pick the nearest item?

Cross-group movement selects a group, then enters its default. Create groups for separate entries and boundaries; a regular grid need not group every row. See [Groups](./epg-group).

## What happens when focus hides or unmounts?

The next direction input recovers inside the original group, then at the page entry. To restore a specific page position, move focus after DOM updates. See [Focus items](./epg-item).

## How do native keys connect?

Connect the container's callbacks to logical actions and avoid processing the same input through both native and DOM routes. See [Native input](./native-bridge).

## Are virtual lists or full TV components included?

vuEPG supplies focus and navigation. Choose pagination or a virtual list for long content, move focus after targets render and handle layout boundaries. See [Performance](./performance).
