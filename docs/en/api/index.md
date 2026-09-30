---
description: "vuEPG API reference for focus movement, navigation, node queries, key mappings, pause control and component-scoped Back handling."
---

# API

## Exports

```ts
import VuEPG, { useVuEPG } from "vuepg";
```

| Export         | Description                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| Default export | Plugin: `app.use(VuEPG, options?)` / `Vue.use(VuEPG, options?)`. See [Configuration](../guide/configuration).      |
| `useVuEPG()`   | Returns the global singleton referred to below as `epg`. Templates and component instances can also access `$epg`. |
| Types          | See [TypeScript integration](../guide/typescript).                                                                 |

## Movement

### epg.move

```ts
move(target: Direction | FocusTarget | null | undefined): boolean
type FocusTarget = EPGNode | Element | { $el: unknown }
```

- A direction follows the [navigation rules](../guide/navigation).
- An EPGItem, EPGGroup, DOM element or component instance (using its `$el`) selects the corresponding item or enters the group.

Returns whether focus reached the target. Returns `false` for unregistered or unavailable targets and when no directional target exists. Programmatic movement does not dispatch direction events.

```ts
epg.move("down");
epg.move(templateRef.value);
```

### epg.navigate

```ts
navigate(direction: Direction): boolean
```

Handles user directional input like a direction key: dispatches cancellable direction events before default movement. If focus is unavailable, first recovers it within the original group. Use for virtual controls and gamepads. Returns `true` when focus changes; an invalid direction throws `TypeError`.

### epg.up

Equivalent to `epg.move("up")`.

### epg.down

Equivalent to `epg.move("down")`.

### epg.left

Equivalent to `epg.move("left")`.

### epg.right

Equivalent to `epg.move("right")`.

### epg.moveToItem

```ts
moveToItem(item: EPGItem): boolean
```

Focuses the specified EPGItem.

### epg.moveToGroup

```ts
moveToGroup(group: EPGGroup): boolean
```

Enters the EPGGroup, selecting its `default` entry or first available item.

### epg.findTarget

```ts
findTarget(direction: Direction): EPGNode | null
```

Calculates the next target in a direction from current focus, **without moving focus**.

## Back

### epg.back

```ts
back(): void
```

Invokes the active component handler, or the global `backHandler` when none is active. See [Back handling](../guide/back).

### epg.onBack

```ts
onBack(handler: () => void): void
```

Registers a component-scoped handler inside `setup()` or `created()`.

## Pause

### epg.pause

```ts
pause(): () => void
```

Pauses key input and returns a function that releases this pause. Multiple holders release their own pauses; input resumes once all have released.

### epg.resume

```ts
resume(): void
```

Immediately resumes key input and clears all outstanding pauses. To release only your own pause, use the function returned by `pause()`.

### epg.isPaused

```ts
isPaused(): boolean
```

## Configuration

### epg.setConfig

```ts
setConfig(patch: Partial<EPGConfig>): void
```

Merges configuration; see [Configuration](../guide/configuration). An invalid `focusClass` throws `TypeError`.

### epg.getConfig

```ts
getConfig(): Readonly<EPGConfig>
```

## Queries

### epg.getCurrentItem

```ts
getCurrentItem(): EPGItem | null
```

The currently focused EPGItem.

### epg.getCurrentGroup

```ts
getCurrentGroup(): EPGGroup | null
```

The nearest EPGGroup containing current focus.

### epg.getFocusClass

```ts
getFocusClass(): string
```

The current item's `focusClass`, or the global `focusClass` when no override exists.

### epg.getItems

```ts
getItems(): EPGItem[]
```

All registered EPGItems, including hidden and disabled items.

### epg.getGroups

```ts
getGroups(): EPGGroup[]
```

All registered EPGGroups.

### epg.getNodeByElement

```ts
getNodeByElement(el: Element): EPGNode | null
```

Returns the EPGItem or EPGGroup registered on an element.

### epg.getParentGroup

```ts
getParentGroup(target: EPGNode | Element): EPGGroup | null
```

Returns the nearest parent EPGGroup of a node or element.

### epg.getChildren

```ts
getChildren(group?: EPGGroup | null): EPGNode[]
```

Returns the group's first-level EPGItem / EPGGroup children, allowing arbitrary ordinary elements between them. Without a group, returns top-level nodes.

### epg.getItemsInGroup

```ts
getItemsInGroup(group: EPGGroup): EPGItem[]
```

Returns all EPGItems at any depth within the group, in document order.

### epg.isEPGItem

```ts
isEPGItem(value: unknown): value is EPGItem
```

### epg.isEPGGroup

```ts
isEPGGroup(value: unknown): value is EPGGroup
```

## Keys

See [Key mappings](../guide/key-actions).

### epg.getKeyActions

```ts
getKeyActions(): Readonly<Record<string, KeyAction>>
```

A read-only snapshot of all current key actions.

### epg.setKeyAction

```ts
setKeyAction(name: string, options: KeyActionOptions): void

interface KeyActionOptions {
  codes: readonly KeyCode[];
  preventDefault?: boolean; // Default: false
  callback?: ((code: KeyCode, event: KeyboardEvent) => void) | null; // Default: null
}
```

Adds or replaces a key action.

### epg.updateKeyAction

```ts
updateKeyAction(name: string, patch: Partial<KeyActionOptions>): void
```

Updates selected fields of an existing action. Throws if the action does not exist.

### epg.removeKeyAction

```ts
removeKeyAction(name: string): boolean
```

Removes an action and returns whether it was removed. Throws when removing a built-in action.

### epg.addKeyCodes

```ts
addKeyCodes(name: string, codes: readonly KeyCode[]): void
```

Appends key codes to an action.

### epg.removeKeyCodes

```ts
removeKeyCodes(name: string, codes: readonly KeyCode[]): void
```

Removes key codes from an action.

## Nodes

EPGItem and EPGGroup share these read-only members:

| Member       | Type          | Description                                                          |
| ------------ | ------------- | -------------------------------------------------------------------- |
| `id`         | `string`      | Unique ID, also written to `data-epg-item-id` / `data-epg-group-id`. |
| `el`         | `HTMLElement` | Registered DOM element.                                              |
| `options`    | `object`      | Current directive binding.                                           |
| `isDefault`  | `boolean`     | Whether it is a default entry.                                       |
| `isDisabled` | `boolean`     | Whether it is disabled.                                              |
| `getRect()`  | `DOMRect`     | Viewport coordinates.                                                |

EPGItem also has `focusClass: string | undefined`.
