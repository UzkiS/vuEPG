---
description: "Improve navigation response on set-top boxes by organizing focus regions, limiting lists, avoiding layout overhead and measuring on target devices."
---

# Performance

TV, IPTV and set-top box input needs prompt responses. Browser capability and device speed vary, so desktop measurements do not replace target-device testing.

## What each direction operation does

Search from the current item's level, moving outward if necessary. Hierarchy comes from the **live DOM**; candidates need visibility and rectangle reads. A successful move updates the focus class, emits events and scrolls only explicitly marked containers. Disabled scrolling returns immediately.

Live reads avoid stale layout data after menus, dialogs and lists change. Cost still grows with the DOM and registered items. Root-level `getChildren()` traverses the document, so unrelated DOM can also increase work.

## Organize your page

- Register only actionable items. Paginate long lists or render a visible window; move to the intended item after it mounts.
- Group real navigation regions. Do not wrap every row or card just to reduce candidates: groups change entry rules.
- Mark actual scroll containers. Enable `scrollViewport` only for document scrolling; disabled scrolling avoids its geometry reads.
- Use debug logs to troubleshoot, and turn them off when measuring.
- Unrelated directive/config updates do not rewrite the focus class. Large page updates should still be checked on the device.
- Hold direction keys on the device and measure input-to-class latency, drops and peaks during cross-group moves and scrolling. Include long lists, dialogs and page changes.

## Candidate selection

Without debug, selection uses a single pass while preserving direction, overlap priority, anchor alignment and document-order ties. It avoids a full ranked result for every move. Debug and diagrams use the same scoring rules for complete analysis. Hierarchy stays live rather than being cached long-term.

Run `pnpm benchmark:navigation` in the repository to compare geometric selection with full analysis. This excludes DOM, events and scrolling and cannot substitute for device input measurements.

See [Android 4.x integration](./legacy-webview) for build and runtime configuration.
