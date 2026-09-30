---
description: "How vuEPG selects the next focus by direction, overlap and distance, enters groups and recovers unavailable focus."
---

# Navigation rules

Direction input selects the next focus using **actual screen positions**:

1. **Choose at the same level:** direction → overlap → nearest.
2. **If nothing fits, move outward:** treat the whole group as the origin at its parent level.

The diagrams call the real navigation algorithm. Step buttons show which candidates are retained or excluded.

<div class="legend vuepg-demo">
  <span><i class="origin"></i>Current O</span>
  <span><i class="idle"></i>Candidate</span>
  <span><i class="pool"></i>Compared</span>
  <span><i class="chosen"></i>Target</span>
  <span><i class="excluded"></i>Excluded</span>
</div>

## Same level: three steps

### ① Keep elements in the direction

Down considers elements below O, right considers elements to the right. Exclude the others.

<NavigationDiagram scenario="basic" />

::: tip Try it
Switch direction using the buttons below. Diagonal **E** passes the direction check for down or right, but does not win; the next step explains why.
:::

### ② Prefer the same row or column

Prefer candidates that **overlap O on the cross axis**: horizontal overlap for up/down, vertical overlap for left/right. The shaded band marks O's projection.

<NavigationDiagram scenario="overlap" />

**X** is closer but diagonal and does not overlap O. **Y** is farther but in the same column, so Y wins. Down navigation should favor the item directly below.

### Without overlap, require a target fully beyond O

When no candidate overlaps on the cross axis, keep only elements **fully on that side**: for down, the candidate's top must be below O's bottom.

<NavigationDiagram scenario="beyond" />

**U** is at the same height and fails step ①. **S** overlaps vertically and is not fully below, so step ② excludes it. Only **T** remains.

### ③ Choose the nearest

Choose the smallest distance among retained candidates. Down compares top edges, up compares bottom edges, and left/right compare the corresponding edges.

Break ties by **alignment**: compare left-edge offsets for up/down and top-edge offsets for left/right. During outward search, first compare cross-axis gaps from the actual focused item, then alignment to the group. If still tied, use document order.

<NavigationDiagram scenario="tie" />

**L** and **R** have equally high top edges. **R** aligns more closely with O, so R wins.

### Edge contact is not overlap

Shrink O's projection by 5% on each side to avoid treating slight edge contact as the same column or row.

<NavigationDiagram scenario="tolerance" />

**P** overlaps only three pixels and is outside the reduced band. **Q** is inside the band and wins.

## Across levels: search outward

When no target exists inside a group, dispatch its cancellable direction event. Then treat the **entire group as one origin** at the parent level and apply the same three steps. A selected group is entered.

<HierarchyDemo />

| Operation | Search                                                                | Result |
| --------- | --------------------------------------------------------------------- | ------ |
| A1 →      | No target inside A → use group A as origin → select group B → enter B | B2     |
| B1 ←      | No target inside B → use group B as origin → select group A → enter A | A1     |
| A1 ↑      | No target inside or outside A                                         | A1     |
| B2 ↓      | B4 is the nearest below inside B                                      | B4     |

A1 → selects **B2**, not the closer B1, because B2 is group B's **default entry** (★).

## Group entries

Try the first available item in this order:

1. Children marked `default`.
2. Remaining children in document order.
3. Enter child groups recursively using the same rules.

## Skipped elements

| Node     | Eligible target                                                                         |
| -------- | --------------------------------------------------------------------------------------- |
| EPGItem  | Not disabled and rendered in the document; neither it nor an ancestor has display: none |
| EPGGroup | Not disabled, rendered, and contains an available item                                  |

`visibility: hidden` and `position: fixed` elements count as rendered.

## Missing or unavailable focus

The first direction input without current focus selects the **page entry**, using the same group-entry rules for the root.

After focus is hidden or unmounted (including KeepAlive page changes), the next direction input tries the innermost accessible group on the original focus path, then the page entry. An already selected item becoming disabled affects future eligibility but can remain a navigation origin.

## Source

Rules correspond to the tested implementation:

- [Same-level selection](https://github.com/UzkiS/vuEPG/blob/main/src/core/navigation.ts)
- [Outward navigation](https://github.com/UzkiS/vuEPG/blob/main/src/core/navigate.ts) and [group entries](https://github.com/UzkiS/vuEPG/blob/main/src/core/tree.ts)
