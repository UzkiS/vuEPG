---
description: "Archived vuEPG 1.x configuration options and defaults."
title: Configure EPG
---

# Configure EPG

Call `setConfig` at any time.

## Type

```typescript
interface EPGConfig {
  focusClass?: string;
  defBackHandler?: Function | null;
  tempBackHandler?: Function | null;
  debug?: boolean;
}
```

## Options

- `focusClass`: global focus class, default `vuepg-focus`.
- `defBackHandler`: default Back callback.
- `tempBackHandler`: internal component callback state. Do not configure through `setConfig`; use `onBack`, as described in [Back callbacks](/en/v1/back-callback).
- `debug`: enables diagnostic `console.log` output.

## Example

```javascript
epg.setConfig({
  focusClass: "focus",
  defBackHandler: () => {
    console.log("back");
  },
  debug: true,
});
```
