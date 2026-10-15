Adds the `restoreFocus` option and fixes several input, scrolling and legacy-kernel issues.

- New `restoreFocus` option (disabled by default): when the focused element unmounts, focus is restored once the current render finishes, preferring the most recently focused item in the original group. For example, closing a dialog returns focus to the item focused before it opened. Focus set by the page takes precedence. When enabled, direction input that recovers unavailable focus also prefers the most recently focused item.
- When focus moves outside an input or other editable element, that element loses input focus. Fixes left/right and Enter still going to the input after leaving it with up/down.
- Keys pressed during an input method composition no longer navigate or trigger Back. Non-text keys added to `UP`, `DOWN` and `BACK` now also work inside inputs.
- Fields set to `undefined` in `setConfig` and plugin options no longer overwrite the current configuration, which previously could add an `undefined` class or enable viewport scrolling.
- Fixes a fixed-position dialog written inside a `v-epg-scroll` container scrolling that container when `scrollViewport` is disabled.
- Enter dispatches a click event on legacy kernels where the element has no `click()` method.
- The complete example uses `restoreFocus` to restore focus after closing dialogs and filtering lists.
