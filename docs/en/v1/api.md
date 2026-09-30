---
description: "Archived vuEPG 1.x public API signatures and behavior."
title: API
---

# API

## epg.move

Move in a direction or to an EPGItem. The target accepts a direction, EPGItem, EPGGroup, their HTMLElement, or a component instance using its `$el`.

```typescript
type MoveType = "right" | "left" | "down" | "up";
const move: (target: MoveType | HTMLElement | EPGItem | EPGGroup | VueComponent) => void;
```

## epg.left

Equivalent to `epg.move("left")`.

## epg.right

Equivalent to `epg.move("right")`.

## epg.up

Equivalent to `epg.move("up")`.

## epg.down

Equivalent to `epg.move("down")`.

## epg.back

Invoke Back handling as a Back key would. See [Back callbacks](/en/v1/back-callback).

## epg.pause

Pause key input.

## epg.resume

Resume key input.

## epg.getTargetByDirection

Find the next target in a direction without moving focus.

```typescript
const getTargetByDirection: (direction: MoveType) => EPGItem | EPGGroup | null;
```

## epg.moveToItem

Focus the specified EPGItem.

```typescript
const moveToItem: (target: EPGItem) => void;
```

## epg.moveToGroup

Enter the specified EPGGroup and focus its first EPGItem.

```typescript
const moveToGroup: (target: EPGGroup) => void;
```

## epg.getFoucsClass

Get the default focus class.

## epg.getCurrentItem

Get the currently focused EPGItem.

## epg.getCurrentGroup

Get the EPGGroup containing the focused EPGItem.

## epg.getItems

Get all registered EPGItems.

## epg.getItemByHTMLElement

Get the EPGItem for an HTMLElement.

```typescript
const getItemByHTMLElement: (element: HTMLElement) => EPGItem | null;
```

## epg.getItemsByGroup

Get all items in a group as an HTMLElement array.

```typescript
const getItemsByGroup: (group: EPGGroup) => HTMLElement[];
```

## epg.getGroups

Get all registered EPGGroups.

## epg.getGroupByHTMLElement

Get the EPGGroup for an HTMLElement.

```typescript
const getGroupByHTMLElement: (element: HTMLElement) => EPGGroup | null;
```

## epg.getGroupByItem

Get the group containing an item.

```typescript
const getGroupByItem: (item: EPGItem) => EPGGroup | null;
```

## epg.getGroupChildrenByHTMLElement

Get the first-level children of a group element.

```typescript
const getGroupChildrenByHTMLElement: (element: HTMLElement | Node) => (EPGGroup | EPGItem)[];
```

## epg.getGlobalGroupChildren

Get top-level nodes.

```typescript
const getGlobalGroupChildren: () => (EPGItem | EPGGroup)[];
```

## epg.getParentsByHTMLElement

Get parent group elements for an HTMLElement.

```typescript
const getParentsByHTMLElement: (element: HTMLElement) => HTMLElement[];
```

## epg.getParentGroupByHTMLElement

Get the nearest parent EPGGroup for an HTMLElement.

```typescript
const getParentGroupByHTMLElement: (element: HTMLElement) => EPGGroup | null;
```

## epg.getChild

Get the EPGGroup or EPGItem registered on an HTMLElement.

```typescript
const getChild: (element: HTMLElement) => (EPGItem | EPGGroup) | null;
```

## epg.isEPGItem

Test whether an HTMLElement is registered as an EPGItem.

```typescript
const isEPGItem: (element: HTMLElement) => boolean;
```

## epg.isEPGGroup

Test whether an HTMLElement is registered as an EPGGroup.

```typescript
const isEPGGroup: (element: HTMLElement) => boolean;
```
