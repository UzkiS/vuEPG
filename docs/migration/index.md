---
title: Vue TV 焦点库迁移指南：vuEPG 1.x、vue-epg 与 vue-tv-focusable
description: 从 vuEPG 1.x、vue-epg 或 vue-tv-focusable / tv-focusable 迁移到 vuEPG，按旧项目的指令、焦点 API、事件与构建方式选择指南。
---

# 迁移指南

先按现有项目使用的 npm 包和指令选择对应指南。已有界面、业务数据和普通点击处理可以保留，重点核对焦点注册、方向事件、滚动与生命周期。

| 当前项目           | 常见写法                                                    | 迁移指南                                   |
| ------------------ | ----------------------------------------------------------- | ------------------------------------------ |
| `vuepg` 1.x        | `v-epg-item`、`@focus`、`getFoucsClass()`、`setAction()`    | [从 1.x 升级](./v1)                        |
| `vue-epg`          | `v-items`、`v-group`、`$service`、`serviceBack`             | [从 vue-epg 迁移](./vue-epg)               |
| `vue-tv-focusable` | `v-focusable`、`$tv.next()`、`requestFocus()`、`limitingEl` | [从 vue-tv-focusable 迁移](./tv-focusable) |

迁移前确认 Vue 版本：vuEPG 支持 Vue 2.7 和 Vue 3，Vue 2.6 需先升级到 2.7。Android 4.x / WebView 30 工程继续使用 Vue 2.7，并核对应用和依赖的 ES5 转译及 polyfill，见[旧设备接入](../guide/legacy-webview)。

先迁移一个包含列表、弹窗与返回操作的页面，避免新旧插件同时响应按键。验收导航、点击、返回、滚动及页面复焦后，再扩展到其余页面。需要可运行起点时，可以复制[完整示例工程](../guide/business-example)。
