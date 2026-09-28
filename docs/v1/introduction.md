---
title: 什么是 vuEPG
---

# 什么是 vuEPG

vuEPG 是基于 vue-epg，使用 vue-demi 完全重构的 Vue 2/3 通用焦点管理工具，感谢 vue-epg 珠玉在前。

## 为什么要重构

- 原项目删库
- 兼容性问题
- 源码不合理
- 等等

## 相比 vue-epg 多了什么

- Vue3 支持
- Composition API
- TypeScript 类型注解
- 尽可能多的源码注释
- 更多的 api

有问题请提交 issue 和 pull request

## 已知问题

以下问题存在于 1.x，均已在 2.0 中修复。如果你遇到了其中之一，建议[升级到 2.0](/migration/v1)。

- 个别布局下，方向键没有选中距离最近的元素（比较距离时基准没有随之更新）
- 焦点所在元素被隐藏（`v-show`、KeepAlive 切换页面）后，方向键不再响应
- 分组在挂载时记录子元素，之后新增的元素（例如子组件中 `v-for` 新增的项）可能无法通过方向键到达
- 卸载分组时，可能误删其他分组的注册信息
- 焦点元素重渲染（例如 `:class` 变化）后，焦点 class 会被清除
- `position: fixed` 的元素被当作隐藏元素跳过
- 多个组件同时注册 `onBack` 时互相覆盖，内层组件卸载后外层组件的回调也会失效
- Vue 3 中 `v-epg-group` 的 `@enter` 不生效，并且会覆盖同一分组上的 `@right`
- 移动到没有子元素的分组时抛出错误
- 导入 vuepg 时会覆盖 `document.onkeydown`
- 现代浏览器中按 `Escape` 不会触发返回
