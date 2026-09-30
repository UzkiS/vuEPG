---
description: "vuEPG release history, features, fixes, compatibility changes and migration links."
---

# Changelog

Review features, fixes and compatibility changes. For existing projects, see the [migration guide](./migration/v1).

## 2.2.1

### Patch Changes

- Directional navigation now selects targets in a single pass, reducing candidate sorting and intermediate arrays. Debugging and documentation diagrams retain the full analysis, sharing the same scoring rules to preserve cross-group anchors and tie order.
  
  Includes an independently copyable Vue 2.7 example with Vite for modern development, webpack for legacy-device development, and ES5 builds. Adds real Chromium 30 regression tests for production, development and hot updates. Improves Chinese and English integration and migration guides, practical TypeScript examples, the project homepage and SEO, and unifies demos and the complete example around a white and pink visual style.

## 2.2.0

### Minor Changes

- [#10](https://github.com/UzkiS/vuEPG/pull/10) [`9142fa3`](https://github.com/UzkiS/vuEPG/commit/9142fa35d5ec7d54bd1b777a145bc7c1fa4f580e) Thanks [@UzkiS](https://github.com/UzkiS)! TV navigation, focus recovery, scrolling and legacy compatibility updates.
  - Added `navigate(direction)`: virtual input uses the same directional events and `.prevent` handling as keyboard input. `move()` remains for direct focus movement.
  - Saves the focus path to correct group entry/exit events after unmounting or replacement. Invalid focus recovers within the original available group, preventing escape from dialogs. A disabled current item can still serve as the movement origin.
  - Dispatches group direction events outward when no internal target exists; ties across levels use the current item's position.
  - Separates scrolling from navigation groups. `v-epg-scroll` marks actual scroll containers with horizontal, vertical and nested support, plus `nearest`, `start` and `center` alignment. `scrollViewport` explicitly controls document scrolling. Scrolling defaults to off; fixes coordinate conversion under CSS scaling.
  - Fixes numeric key fallback when `KeyboardEvent.code` is absent; adds Tizen and webOS Back codes. Editable elements retain text, Backspace and horizontal arrow behavior.
  - Independent pause releases; debug output traces candidates at each level without constructing logs when disabled.
  - Updates Vue 2.7 event examples, runtime requirements, scrolling and performance guides. Reorganizes navigation and adds interactive SVG demos using actual library behavior; fixes mobile demo layouts.
  - Adds Vue 2.7 / Vue 3 scenarios, type checks and scrolling tests; documents WebView 30 compatibility requirements and device performance measurement.

## 2.0.0

### Major Changes

- [#4](https://github.com/UzkiS/vuEPG/pull/4) [`8da5da2`](https://github.com/UzkiS/vuEPG/commit/8da5da2f7e9abe0253daa2bc55355cd68ac19d3d) Thanks [@UzkiS](https://github.com/UzkiS)! Full rewrite. Read the [migration guide](./migration/v1) before upgrading.
  - Removes vue-demi; zero runtime dependencies. Minimum Vue 2.7, ES2015 output for webpack 4 and legacy application builds.
  - Native CustomEvents with the `epg-` prefix, cancelled through `.prevent`; adds group `epg-leave`.
  - Adds `disabled`, plugin installation options, global `$epg`, and boolean movement results.
  - Fixes frozen focus after hiding or KeepAlive, stale group membership, accidental group deletion on unmount, missing focus class after re-render, visibility of fixed-position elements, conflicting nested `onBack` handlers and Escape handling.
  - Unified API names such as `getFocusClass`, `findTarget`, `getNodeByElement` and `setKeyAction`; see the migration table.
  - Documentation moves to GitHub Pages: <https://uzkis.github.io/vuEPG/en/>.

## 1.2.2

- Maintenance patch retaining the 1.x APIs and Vue 2 / Vue 3 usage.
- Fixes Vue 3 group `@enter` replacing `@right` and item `@enter` replacing `@click`.
- Fixes accidental group deletion on unmount, unreachable dynamically added items and errors entering empty groups.
- Fixes fixed-position visibility, import overwriting `document.onkeydown` and Escape handling.
- Adds Vue 2.7 / Vue 3 regression tests and updates the [1.x documentation](./v1/introduction).

Install with `pnpm add vuepg@^1.2.2`. The npm `legacy` tag points to this version; `latest` remains on 2.x.

## 1.2.1

- Updates author information and build scripts.

## 1.2.0

- Adds `back()` for programmatic Back handling.

## 1.1.0

- Adds `pause()` / `resume()` for key input control.

## 1.0.0

- First stable release.
- Removes adapters for older vue-epg patterns.
