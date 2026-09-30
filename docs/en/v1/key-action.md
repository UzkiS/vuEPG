---
description: "Archived vuEPG 1.x key actions, key codes and callback configuration."
title: Key actions
---

# Key actions

## Default actions

The eight predefined actions are `UP`, `DOWN`, `LEFT`, `RIGHT`, `ENTER`, `BACK`, `PAGEACTION` and `NUMBER`.

- UP, DOWN, LEFT, RIGHT, ENTER and BACK are built in and cannot be removed. Call `setActionCallback` to append a callback after built-in handling.
- BACK has a default and a temporary callback.
- All actions except NUMBER prevent default browser behavior.
- ENTER calls `HTMLElement.click()`.
- `epg.getCurrentKeyActions()` returns the current action details.

::: details Default mappings

```javascript
const keyActions = {
  UP: {
    code: ["ArrowUp", 87, 19, 38],
    preventDefault: true,
    callback: null,
  },
  DOWN: {
    code: ["ArrowDown", 83, 40, 20, 47],
    preventDefault: true,
    callback: null,
  },
  LEFT: {
    code: ["ArrowLeft", 65, 29, 21, 37],
    preventDefault: true,
    callback: null,
  },
  RIGHT: {
    code: ["ArrowRight", 68, 22, 32, 39],
    preventDefault: true,
    callback: null,
  },
  ENTER: {
    code: ["Enter", "NumpadEnter", 13, 73, 66, 23, 1],
    preventDefault: true,
    callback: null,
  },
  BACK: {
    code: ["Backspace", "Escape", 4, 27, 8],
    preventDefault: true,
    callback: null,
  },
  PAGEACTION: {
    code: ["PageUp", "PageDown", 33, 34],
    preventDefault: true,
    callback: null,
  },
  NUMBER: {
    code: [
      "Digit1",
      "Digit2",
      "Digit3",
      "Digit4",
      "Digit5",
      "Digit6",
      "Digit7",
      "Digit8",
      "Digit9",
      "Digit0",
      "Numpad1",
      "Numpad2",
      "Numpad3",
      "Numpad4",
      "Numpad5",
      "Numpad6",
      "Numpad7",
      "Numpad8",
      "Numpad9",
      "Numpad0",
      49,
      50,
      51,
      52,
      53,
      54,
      55,
      56,
      57,
      48,
      96,
      97,
      98,
      99,
      100,
      101,
      102,
      103,
      104,
      105,
    ],
    preventDefault: false,
    callback: null,
  },
};
```

:::

## Inspect key codes

The plugin reads `event.code`, `event.which` and `event.keyCode` in order. Inspect all three and include their values when adding a key; duplicates are removed automatically.

```javascript
document.addEventListener("keydown", (event) => {
  console.log(event.code, event.which, event.keyCode);
});
```

## Register an action

`setAction` configures a new action.

```typescript
const setAction: (
  actionName: string,
  code: (string | number)[],
  callback?: Function | null,
  preventDefault?: boolean,
) => void;
```

- `actionName`: action name.
- `code`: all observed values from `event.code`, `event.which` and `event.keyCode`.
- `callback`: callback after the action.
- `preventDefault`: whether to prevent browser defaults.

This ALERT example maps K (`KeyK`, 75, 75) and L (`KeyL`, 76, 76), displays an alert, and leaves default behavior enabled:

```javascript
epg.setAction(
  "ALERT",
  ["KeyK", 75, "KeyL", 76],
  () => {
    alert("K and L press down");
  },
  false,
);
```

## Remove an action

```typescript
const removeAction: (actionName: string) => boolean;
```

::: warning
UP, DOWN, LEFT, RIGHT, ENTER and BACK cannot be removed.
:::

```javascript
epg.removeAction("ALERT");
```

## Add or remove callbacks

```typescript
const setActionCallback: (actionName: string, callback?: Function | null) => void;
```

```javascript
// Add a callback to ALERT
epg.setActionCallback("ALERT", () => {
  alert("add a callback");
});

// Remove the ALERT callback
epg.setActionCallback("ALERT", null);
```

## Configure preventDefault

All predefined actions except NUMBER prevent default behavior. To handle numbers without typing into a field, enable prevention; disable it to restore browser behavior.

```javascript
const setActionPreventDefault: (actionName: string, preventDefault: boolean) => void
```

```javascript
// Prevent default behavior
epg.setActionPreventDefault("ALERT", true);
// Restore default behavior
epg.setActionPreventDefault("ALERT", false);
```

## Add keys to an action

```javascript
const addCodeToAction: (actionName: string, code: (string | number)[]) => void
```

- `actionName`: action name.
- `code`: observed values from `event.code`, `event.which` and `event.keyCode`.

```javascript
epg.addCodeToAction("ALERT", ["KeyJ", 74]);
```

## Remove keys from an action

```javascript
const removeCodeFromAction: (actionName: string, code: (string | number)[]) => boolean
```

- `actionName`: action name.
- `code`: key codes.

```javascript
epg.removeCodeFromAction("ALERT", ["KeyJ", 74]);
```
