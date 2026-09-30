---
description: "Connect native Android directions, Confirm and Back callbacks to vuEPG logical APIs without relying on synthetic keyboard constructors."
---

# Native input integration

Normal browsers deliver `keydown` to the page, which vuEPG listens to directly. A set-top box page may run inside a native Android application providing WebView, media and exit functionality. This application is the **native container or host application**.

The container may intercept keys and pass them to a JavaScript callback. This channel is commonly called a **JS Bridge**. If the device already sends ordinary keyboard events correctly, no extra bridge is needed.

This guide covers the callback route:

```text
Remote → native Android container → JavaScript callback → vuEPG logical operation
```

Android key codes differ from browser codes: Android Back is 4, browser Backspace is 8. The [complete example](./business-example) simulates native callbacks to demonstrate mapping.

## Directions and Back

```ts
import { useVuEPG } from "vuepg";

const epg = useVuEPG();
const onNativeKey = (keyCode: number): void => {
  if (epg.isPaused()) {
    return;
  }
  switch (keyCode) {
    case 19:
      epg.navigate("up");
      break;
    case 20:
      epg.navigate("down");
      break;
    case 21:
      epg.navigate("left");
      break;
    case 22:
      epg.navigate("right");
      break;
    case 4:
      epg.back();
      break;
  }
};
```

`navigate()` dispatches cancellable direction events, matching user direction input. `move("right")` is a programmatic move without that event flow.

Confirm can call the available current item's `el.click()`. Check existence, disabled state and rendering first; see the full guard in [bridge.ts](https://github.com/UzkiS/vuEPG/blob/main/examples/tv-training/src/bridge.ts).

## Connect the device container

Connect its callback to the mapping function and preserve its unsubscribe mechanism. Release listeners when the page is removed to prevent duplicates on re-entry.

The example's `vuepg-native-key` is a Mock contract, not a built-in vuEPG event or an operator protocol. Follow the actual container's contract and decide which keys remain native.

If a device delivers both native callbacks and keydown for one key, choose one input route. Do not both synthesize a keydown and call navigate for the same operation.

When native media, voice or text input takes over, retain the release function returned by pause(). The native callback must also check isPaused() and skip direction, Confirm and Back while paused. Resume after every pause holder releases its hold; see [Pause](./key-actions#pause-input).
