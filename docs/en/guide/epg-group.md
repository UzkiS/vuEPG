---
description: "Organize navigation regions with v-epg-group: group-first search, default entries, movement between groups and boundary events."
---

# Groups

`EPGGroup` is a navigation container registered with `v-epg-group`. Use groups for regions with independent entries or boundaries, such as menus, lists, dialogs and tabs.

```vue
<ul v-epg-group>
  <li v-epg-item>Home</li>
  <li v-epg-item>Movies</li>
</ul>
```

## What a group does

1. **Search inside first:** search the current group; if no target exists, treat the whole group as an origin at the next level.
2. **Default entry:** entering a group selects its `default` entry instead of the geometrically closest item.
3. **Entry and exit events:** emit `epg-enter` / `epg-leave`; when no target exists in a direction, emit a boundary event before searching outward.

A scroll container can share the group element or be independent. See [Scrolling](./scrolling).

Groups may nest at any depth, including ordinary elements or components between them. Membership is determined by the closest registered ancestor in the **live DOM** on each navigation operation.

## Binding options

<<< ../../../src/core/nodes.ts#group-options{ts}

| Option     | Behavior                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------- |
| `default`  | Preferred group when its containing level is entered                                      |
| `disabled` | Skip the whole group in navigation; its items may still be focused directly with `move()` |

Create groups when you need separate entries or boundary events. A regular grid usually needs one group, not a group per row or card. Crossing groups enters the selected group's default, unlike geometric selection inside a group.

<GroupEntryDemo />

```vue
<aside v-epg-group>
  <button v-for="entry in menu" :key="entry.id" v-epg-item>{{ entry.title }}</button>
</aside>

<main v-epg-group>
  <div v-epg-scroll class="card-list">
    <button v-for="movie in movies" :key="movie.id" v-epg-item>{{ movie.title }}</button>
  </div>
</main>
```

## Which item receives focus on entry

Try these in order:

1. Children marked `default`.
2. Other children in document order.
3. If a child is a group, enter recursively using the same rule.

An empty group, or one with no available items, cannot become a direction target.

To return to the last selected item when entering again, point a reactive `default` at its ID. If the item is removed, entry falls back to another available item:

```vue
<script setup lang="ts">
import { ref } from "vue";

const lastId = ref<string | null>(null);
</script>

<template>
  <div v-epg-group>
    <button
      v-for="movie in movies"
      :key="movie.id"
      v-epg-item="{ default: lastId === movie.id }"
      @epg-focus="lastId = movie.id"
    >
      {{ movie.title }}
    </button>
  </div>
</template>
```

## Events

| Event            | When                                                | Cancels default navigation |
| ---------------- | --------------------------------------------------- | -------------------------- |
| `epg-enter`      | Focus enters the group                              | No                         |
| `epg-leave`      | Focus leaves the group                              | No                         |
| Direction events | No target exists in that direction inside the group | Yes                        |

```vue
<!-- Collapse the sidebar when focus leaves it -->
<aside v-epg-group @epg-enter="expand = true" @epg-leave="expand = false">...</aside>

<!-- Dialog: block focus from leaving in any direction -->
<div v-epg-group @epg-up.prevent @epg-down.prevent @epg-left.prevent @epg-right.prevent>...</div>
```

See [Events](./events) for the full event contract.
