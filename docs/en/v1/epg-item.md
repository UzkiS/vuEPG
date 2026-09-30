---
description: "Archived vuEPG 1.x item directives, options and events."
title: EPGItem
---

# EPGItem

EPGItem is the smallest unit that can receive logical focus.

## Directive binding

`v-epg-item` registers an element as an EPGItem.

### Type

```typescript
interface EPGItemDirective {
  default: boolean;
  class: string;
}
```

- `default`: preferred focus when entering this level.
- `class`: focus class; falls back to the global class.

### Example

```html
<div v-epg-item>item1</div>
<div v-epg-item="{default:true}">item2</div>
<div v-epg-item>item3</div>
```

## Events

### Direction events

`@left`, `@right`, `@up`, `@down`

When a listener exists, default movement is blocked. An empty listener also blocks that direction. Handlers receive `(item, next)`; `item` is the current EPGItem, and `next()` continues default movement.

```html
<div v-epg-group>
  <div v-epg-item>item1</div>
  // When item2 is focused, upward movement is blocked.
  <div v-epg-item @up="">item2</div>
  // When item3 is focused, upward input calls move for custom movement.
  <div v-epg-item @up="epg.move(top)">item3</div>
</div>
```

### Click

`@click`

The ENTER action calls `HTMLElement.click()` to simulate clicking the element.

### Focus and blur

`@focus`, `@blur`

Fire when gaining or losing focus. `@enter` fires on gaining focus independently of `@click`.
