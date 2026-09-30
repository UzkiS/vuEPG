---
description: "Archived vuEPG 1.x directional candidate selection and hierarchical navigation."
title: Navigation rules
---

# Navigation rules

Direction keys select the next focus by screen position from `getBoundingClientRect()`.

## 1. Candidate scope

Candidates are the current EPGGroup's **first-level** EPGItem and EPGGroup children, read from the current DOM for each navigation. Exclude the current item and hidden elements. Visible `position: fixed` elements participate. Each nested group is compared as one rectangle.

Without a parent group, a virtual page group contains the page's top-level nodes.

## 2. Direction filtering

For downward movement (other directions are symmetric):

1. Keep candidates whose top edge is below the current item's top edge.
2. Divide candidates into:
   - **Overlapping**: horizontal overlap with the current item, inset by 5% on both sides.
   - **Fully beyond**: no horizontal overlap, with a top edge below the current item's bottom edge.
3. Exclude the rest.

## 3. Closest candidate

- If overlapping candidates exist, select the one with the nearest top edge.
- Otherwise choose the nearest top edge among fully beyond candidates.
- Break distance ties by the closest left edge to the current item's left edge.

## 4. Search outward

If neither set contains candidates, use the current group as the starting rectangle and repeat steps 1–3 in the parent group, up to the page level.

## 5. Entry target

- An EPGItem receives focus directly.
- An EPGGroup selects its `default` child or its first child; continue inward for nested groups.
- A group without children does not move focus.

::: tip
2.x corrects several issues and provides interactive diagrams. See [2.x navigation rules](/en/guide/navigation).
:::
