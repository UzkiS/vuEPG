---
description: "Archived vuEPG 1.x group directives, defaults and events."
title: EPGGroup
---

# EPGGroup

An EPGGroup contains EPGItems or nested EPGGroups. Empty groups are not navigation targets.

## Directive binding

`v-epg-group` registers an element as an EPGGroup.

### Type

```typescript
interface EPGGroupDirective {
  default: boolean;
}
```

- `default`: preferred entry when entering this level.

### Example

```html
<div v-epg-group>
  <div v-epg-item>item1</div>
  <div v-epg-item="{default:true}">item2</div>
  <div v-epg-item @up="epg.move(top)">item3</div>
</div>
<div v-epg-group="{default:true}">
  <div v-epg-item>item3</div>
</div>
```

## Events

### Direction events

`@left`, `@right`, `@up`, `@down`

Fire when leaving the group in that direction.

### Group entry and exit

`@enter` fires when entering the group and its default or first child is another EPGGroup.

`@leave` is not implemented.
