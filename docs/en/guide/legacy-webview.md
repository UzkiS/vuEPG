---
description: "Integrate vuEPG with legacy Android 4.x operator boxes and older WebViews using Vue 2.7, dependency transpilation, ES5 builds and polyfills, including device development and troubleshooting."
---

# Legacy operator box integration, including Android 4.x

Maintaining applications for existing operator boxes often requires Android 4.x and older WebView compatibility. These projects need compatible syntax, runtime APIs and key handling. vuEPG supplies a Vue 2.7 path and a copyable dual-toolchain project and has been deployed in projects for major telecom operators.

## Choose Vue and build targets

| Environment                     | Integration                                                |
| ------------------------------- | ---------------------------------------------------------- |
| Modern browsers                 | Vue 2.7 or Vue 3; see [Getting started](./getting-started) |
| Legacy Android 4.x / WebView 30 | Vue 2.7, ES5 application output and polyfills              |

Vue 3 requires Proxy. The library ships ES2015, so the application must transpile the library and other dependencies to device-supported syntax. Syntax transforms do not supply runtime APIs.

## Use the example project

Copy the [complete example](./business-example) and run in its directory:

```sh
pnpm install
pnpm dev:tv    # http://COMPUTER-LAN-IP:5174/
pnpm build     # webpack + Babel, ES5 output
pnpm preview   # http://COMPUTER-LAN-IP:4174/
```

The computer and device must be able to reach each other and these ports. Use pnpm dev for fast Vite development in modern browsers and dev:tv for device development.

## Why retain webpack development

Vite serves native ESM. In real Chromium 30, HTML loads but module entry scripts do not run and Vue does not mount, leaving a blank page.

webpack transpiles application, library and development-client code. The example's interactions and CSS updates pass in the same Chromium 30 environment.

The Vite legacy plugin only transforms production builds, not its development server. A legacy production build requires checking scripts, polyfills, HTML loading and styles. This project defaults to webpack compatibility builds.

## Transpile dependencies in webpack

Transpilation converts unsupported syntax such as arrows and optional chaining into compatible syntax. Babel must process both application code and bundled dependencies; processing only src misses vuepg.

These installation commands and settings apply to webpack projects using the tool combination in the [complete example](./business-example). Existing projects should retain compatible webpack, Babel and loader versions. For Vue CLI, use the [project configuration below](#when-using-vue-cli).

```sh
pnpm add core-js
pnpm add -D babel-loader @babel/core @babel/preset-env
```

Add this JavaScript rule alongside existing Vue and style loaders:

```js
// webpack.config.cjs
module.exports = {
  target: ["web", "es5"],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        // Do not exclude all node_modules: vuepg and other dependencies need Babel.
        exclude: /node_modules[\\/]core-js[\\/]/,
        use: {
          loader: "babel-loader",
          options: {
            sourceType: "unambiguous",
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: "chrome >= 30",
                  modules: false,
                },
              ],
            ],
          },
        },
      },
    ],
  },
};
```

The webpack target controls generated runtime syntax. The Babel 8 rule handles application and dependency syntax; the compatibility entry in the next section supplies runtime APIs. TypeScript/SFC projects also need .ts and Vue processing; see the [complete webpack configuration](https://github.com/UzkiS/vuEPG/blob/main/examples/tv-training/webpack.config.cjs).

## Load runtime polyfills

After syntax transforms, APIs such as Map may still be missing. Load their polyfill implementations before Vue and vuepg:

```ts
// main.ts: load polyfills before the application.
import "./polyfills";
import Vue from "vue";
import VuEPG from "vuepg";
```

```ts
// polyfills.ts: supply JavaScript built-in APIs.
import "core-js/stable";
```

core-js does not provide the DOM CustomEvent constructor. When it is missing, document.createEvent("CustomEvent") can create compatible events. See the [CustomEvent implementation in the example polyfills.ts](https://github.com/UzkiS/vuEPG/blob/main/examples/tv-training/src/polyfills.ts).

Babel downlevels the whole bundle's syntax. Supply any additional runtime APIs required by your application dependencies and development client according to their actual usage.

## Required capabilities

| Layer        | Integration requirements                                                        |
| ------------ | ------------------------------------------------------------------------------- |
| JavaScript   | core-js supplies missing Map, Set, Symbol, Array.from, Object.assign and others |
| DOM events   | Detect and provide CustomEvent                                                  |
| Script entry | Plain script HTML loads application and dependencies as ES5                     |
| CSS          | Avoid essential layout depending on CSS variables or flex gap                   |

Load polyfills before their users. Recheck final output after changing dependencies.

## When using Vue CLI

First inspect the CLI service and Babel plugin versions actually installed in the project:

```sh
pnpm list @vue/cli-service @vue/cli-plugin-babel --depth 0
```

Retain the project's tool versions and add the required engine to its existing browser targets. For example, when Chromium 30 is the minimum target:

```text
# .browserslistrc
chrome >= 30
```

Add vuepg to dependency transpilation in the Vue configuration file already used by the project:

```js
// Merge into the existing vue.config.js or another config file supported by the project.
module.exports = {
  transpileDependencies: ["vuepg"],
};
```

Append "vuepg" to an existing transpileDependencies list and retain other entries. Add other libraries that need transpilation according to actual usage. Enable the Babel plugin and preset that match the CLI so browser targets control syntax transforms.

Supply runtime APIs as described in [the previous section](#load-runtime-polyfills). Check the final application scripts, dependencies and development client, then verify startup, input and updates in the target browser. Checking only src is insufficient.

## Remote and native Back

For keydown use [Mappings](./key-actions). For intercepted Android keys forwarded by the container, use [Native input](./native-bridge).

## Blank pages and input issues

| Symptom                             | Check                                                    |
| ----------------------------------- | -------------------------------------------------------- |
| SyntaxError during startup          | Loaded application, dependency and dev-client syntax     |
| Missing API                         | Polyfill loading order and separate language/DOM support |
| Blank Vite page but working webpack | Native ESM development entry on a legacy device          |
| Visible page but no input           | Native interception, mapping and pause state             |
| Dialog visible but not focused      | Target mount and completed DOM update                    |
| Broken layout                       | CSS support, fonts and scale                             |
| Production works, development fails | Dev client, WebSocket, resource path and network         |

## Reproduce and check

pnpm check in the example verifies types and output. pnpm test:chrome30 checks real Chromium production, development and updates. See [Regression tests](./chromium30-testing).

Record device model, Android version, browser engine, vuepg version and reproduction steps. Browser tests verify application compatibility; native protocol and performance are checked on the target box.
