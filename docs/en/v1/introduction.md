---
description: "Archived vuEPG 1.x introduction, features and known limitations."
title: What is vuEPG?
---

# What is vuEPG?

vuEPG rebuilds vue-epg using vue-demi to provide shared Vue 2 / Vue 3 focus management. Thanks to vue-epg for the foundation.

## Reasons for the rewrite

- The original repository was deleted.
- Compatibility issues.
- Source organization issues.
- Other improvements.

## Additions over vue-epg

- Vue 3 support.
- Composition API.
- TypeScript annotations.
- More source comments.
- More APIs.

Please report issues and submit pull requests.

## Known issues

This version has the following limitations. See [Upgrade to 2.x](/en/migration/v1):

- Some layouts select a target farther away because the comparison baseline is not updated.
- Direction keys stop responding after the focused item is hidden by `v-show` or KeepAlive page changes.
- Re-rendering the focused element, e.g. changing `:class`, removes its focus class.
- Multiple `onBack` registrations overwrite each other; unmounting an inner component also invalidates the outer callback.
