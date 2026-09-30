---
description: "Read default keyboard and remote mappings, handle legacy numeric key codes, customize callbacks and pause or resume input."
---

# Key mappings

vuEPG maps keys to **key actions**. Each action defines codes, whether to prevent browser behavior and an optional callback.

## Default actions

<<< ../../../src/core/keyboard.ts#default-key-actions{ts}

| Action                           | Built-in behavior                          |
| -------------------------------- | ------------------------------------------ |
| `UP` / `DOWN` / `LEFT` / `RIGHT` | Move focus; see [Navigation](./navigation) |
| `ENTER`                          | Invoke the current element's `click()`     |
| `BACK`                           | Invoke [Back handling](./back)             |
| `PAGE` / `NUMBER`                | None; supply your own callback             |

The six built-in actions cannot be removed. Their codes, `preventDefault` and callback can change. Callbacks run **after** the built-in behavior.

## How keys are identified

Read `event.code`, then `event.which`, then `event.keyCode`. A missing, empty or `"Unidentified"` code falls back to numeric values. Modern browsers normally match code strings; legacy set-top boxes may provide only numbers. Add both string and numeric codes for a portable mapping.

For text input, textarea, select and editable content, vuEPG leaves text, Backspace and left/right keys to the browser. Up/down, Escape and remote Back still use vuEPG. Listen on the input element for other custom keys.

Inspect codes on your device:

```ts
document.addEventListener("keydown", (event) => {
  console.log(event.code, event.which, event.keyCode);
});
```

## Customize actions

```ts
const epg = useVuEPG();

// Add: M or remote Menu (82) opens the menu
epg.setKeyAction("MENU", {
  codes: ["KeyM", 82],
  preventDefault: true,
  callback: (code, event) => openMenu(),
});

// Update selected fields
epg.updateKeyAction("NUMBER", {
  preventDefault: true,
  callback: (code) => jumpToChannel(code),
});

// Append / remove keys for an action
epg.addKeyCodes("ENTER", ["Space", 32]);
epg.removeKeyCodes("UP", [87]);

// Remove a custom action
epg.removeKeyAction("MENU");

// Read all current actions (read-only snapshot)
console.log(epg.getKeyActions());
```

Updating nonexistent actions or removing a built-in action throws an error.

## Pause input

Temporarily hand input to native text entry or fullscreen playback:

```ts
const releasePause = epg.pause();
releasePause(); // Release only this pause
epg.resume(); // Clear all outstanding pauses
epg.isPaused(); // boolean
```

Keep and call each pause holder's release function. Input resumes when all holds have been released. While paused, vuEPG does not call `preventDefault()`.
