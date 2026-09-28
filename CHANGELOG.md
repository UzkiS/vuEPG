# vuepg

## 2.1.0

### Minor Changes

- [#7](https://github.com/UzkiS/vuEPG/pull/7) [`33f8d76`](https://github.com/UzkiS/vuEPG/commit/33f8d76cb9db970feac0eac341ea68d961274803) Thanks [@UzkiS](https://github.com/UzkiS)! - 新增分组自动滚动与 `navigate(direction)`，并完善焦点恢复、方向事件和旧设备按键支持。

  - 分组支持 `scroll: true` / `"nearest"` / `"start"` / `"center"`，焦点进入时将元素滚入可视区域；支持嵌套滚动容器，默认关闭。
  - `navigate(direction)` 模拟一次用户方向输入，触发方向事件并尊重 `.prevent`；原有 `move()` 保持直接移动焦点的语义。
  - 保存焦点路径，修复焦点元素卸载或替换后 `epg-enter` / `epg-leave` 失配；失效时优先在原来仍有效的最内层分组恢复焦点，避免穿透弹窗。
  - 当前焦点项后来被禁用时，仍可作为方向移动的起点，但不会再次成为导航目标。
  - 组内找不到目标时，逐层派发组级方向事件；即使整页没有目标，列表边界处理函数也能接管翻页或循环。
  - 跨层候选距离并列时，使用当前焦点元素的位置裁决，改善侧边菜单和顶栏进入内容区的导航结果。
  - 修复旧内核 `KeyboardEvent.code` 缺失时无法回退到数字键值的问题；默认返回键增加 Tizen `10009` 与 webOS `461`。
  - 输入框等可编辑元素中的文字、Backspace 与左右方向键交给浏览器处理；保留上下方向键及 Esc / 遥控器返回键。
  - `pause()` 返回释放本次暂停的函数，多个组件可独立暂停；`resume()` 仍可立即清除全部暂停。
  - debug 模式增加每层候选、比较结果与选中目标的日志。
  - 文档补充 Vue 2.7 组件标签事件的 `.native` 写法、旧设备运行时 API、分组时机及场景配方；修复介绍页和在线演示的手机布局，虚拟遥控器改用 `navigate()`。
  - 新增菜单、网格、弹窗等场景测试，修正旧键盘与滚动布局测试替身；Vue 2.7 与 Vue 3 共 298 个测试通过。

## 2.0.0

### Major Changes

- [#4](https://github.com/UzkiS/vuEPG/pull/4) [`8da5da2`](https://github.com/UzkiS/vuEPG/commit/8da5da2f7e9abe0253daa2bc55355cd68ac19d3d) Thanks [@UzkiS](https://github.com/UzkiS)! - 2.0 完整重构。升级前请阅读[迁移指南](https://uzkis.github.io/vuEPG/migration/v1)。
  
  - 移除 vue-demi，零运行时依赖；最低支持 Vue 2.7，产物为 ES2015（兼容 webpack 4 与老旧机顶盒浏览器）
  - 事件改为原生 `CustomEvent` 并统一加上 `epg-` 前缀（`epg-focus`、`epg-blur`、`epg-enter`、`epg-leave`、`epg-up` 等），用 `.prevent` 取消默认移动；新增分组的 `epg-leave`
  - 新增 `disabled` 选项、插件安装选项、全局属性 `$epg`、`move()` 等方法的布尔返回值
  - 修复：元素隐藏或被 KeepAlive 缓存后焦点卡死、分组成员快照过期、卸载分组时可能误删其他分组、重渲染冲掉焦点 class、`position: fixed` 被误判为隐藏、嵌套 `onBack` 互相覆盖、`Escape` 不触发返回等问题
  - API 统一命名（如 `getFocusClass`、`findTarget`、`getNodeByElement`、`setKeyAction`），完整对照见迁移指南
  - 文档迁移至 GitHub Pages：https://uzkis.github.io/vuEPG/

## 1.2.1

- 更新作者信息与构建脚本

## 1.2.0

- 新增 `back()`，可手动触发返回处理

## 1.1.0

- 新增 `pause()` / `resume()`，暂停与恢复按键响应

## 1.0.0

- 首个正式版本
- 移除对 vue-epg 旧写法的兼容支持
