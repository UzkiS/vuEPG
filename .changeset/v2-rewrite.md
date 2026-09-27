---
"vuepg": major
---

2.0 完整重构。升级前请阅读[迁移指南](https://uzkis.github.io/vuEPG/migration/v1)。

- 移除 vue-demi，零运行时依赖；最低支持 Vue 2.7，产物为 ES2015（兼容 webpack 4 与老旧机顶盒浏览器）
- 事件改为原生 `CustomEvent` 并统一加上 `epg-` 前缀（`epg-focus`、`epg-blur`、`epg-enter`、`epg-leave`、`epg-up` 等），用 `.prevent` 取消默认移动；新增分组的 `epg-leave`
- 新增 `disabled` 选项、插件安装选项、全局属性 `$epg`、`move()` 等方法的布尔返回值
- 修复：元素隐藏或被 KeepAlive 缓存后焦点卡死、分组成员快照过期、卸载分组时可能误删其他分组、重渲染冲掉焦点 class、`position: fixed` 被误判为隐藏、嵌套 `onBack` 互相覆盖、`Escape` 不触发返回等问题
- API 统一命名（如 `getFocusClass`、`findTarget`、`getNodeByElement`、`setKeyAction`），完整对照见迁移指南
- 文档迁移至 GitHub Pages：https://uzkis.github.io/vuEPG/
