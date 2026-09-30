---
description: "Register focus items with v-epg-item, configure defaults, disabled state and styling, and understand hiding, unmounting and focus recovery."
---

# Focus items

`EPGItem` is the smallest focus unit. Register it with `v-epg-item`:

```vue
<div v-epg-item>Movie</div>
```

## Binding options

<<< ../../../src/core/nodes.ts#item-options{ts}

```vue
<div v-epg-item="{ default: true }">Default focus</div>
<div v-epg-item="{ disabled: isLocked }">Members only</div>
<div v-epg-item="{ focusClass: 'card-focus' }">Custom focus style</div>
```

| Option       | Behavior                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------- |
| `default`    | Preferred entry when this level, either a group or the page root, is entered              |
| `disabled`   | Remains registered and visible, but cannot become a target; direction navigation skips it |
| `focusClass` | Focus class for this element, overriding the global [focusClass](./configuration)         |

Bindings are reactive. Updating defaults or disabled state does not proactively move existing focus. Updating focus styling synchronizes the selected item's class.

## Lifecycle

| Stage                       | Behavior                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| Mount                       | Register and add a debugging `data-epg-item-id` attribute                |
| Binding or component update | Update options; restore the focus class if Vue overwrote it              |
| Unmount                     | Unregister; clear current focus if necessary without emitting `epg-blur` |

Hidden items (`v-show`, ancestor `display: none`, KeepAlive storage) remain registered but cannot be selected. If current focus is hidden or unmounted, the next direction operation recovers inside the original group first, falling back to the page entry if no group is accessible. An already selected item that becomes disabled can still be a navigation origin, but cannot be selected again.

## Events

| Event                                            | When                                         | Cancels default navigation |
| ------------------------------------------------ | -------------------------------------------- | -------------------------- |
| `epg-focus`                                      | Focus received                               | No                         |
| `epg-blur`                                       | Focus lost                                   | No                         |
| `epg-up` / `epg-down` / `epg-left` / `epg-right` | Direction input on this item                 | Yes                        |
| `click`                                          | Confirm on this item, using the native event | —                          |

```vue
<div v-epg-item @epg-focus="preview(movie)" @epg-blur="stopPreview" @click="play(movie)">
  {{ movie.title }}
</div>

<!-- In the first row, Up returns to Search with custom movement -->
<div v-epg-item @epg-up="$epg.move(searchRef)">...</div>

<!-- Block leftward movement -->
<div v-epg-item @epg-left.prevent>...</div>
```

See [Events](./events) for cancellation and ordering details.
