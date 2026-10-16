# vuepg

## 2.4.0

### Minor Changes

- [#37](https://github.com/UzkiS/vuEPG/pull/37) [`0902306`](https://github.com/UzkiS/vuEPG/commit/09023060193bb78c65448caaaabe5d93865b76a3) Thanks [@UzkiS](https://github.com/UzkiS)! - 新增 `activate()`、`keyRepeatInterval` 与返回处理的放行，并加强按键映射的参数校验。
  
  - 新增 `epg.activate()`：与按下确定键相同，当前焦点存在、未禁用且已渲染时触发 `click`，返回是否触发。原生按键回调与虚拟遥控器不再需要自己检查焦点状态和调用 `click()`。
  - 返回处理函数返回 `false` 时，交给下一个生效中的 `onBack`，最后是全局 `backHandler`。组件内部的临时状态（编辑模式、搜索框、播放器浮层等）不需要处理返回键时，不再拦住外层页面。`epg.back()` 改为返回是否有处理函数处理了返回，原生宿主可据此执行自己的默认行为，例如退出应用。现有处理函数不受影响。
  - 新增配置 `keyRepeatInterval`（默认 `0`，不限制）：按住按键时，自动重复的按键至少间隔指定毫秒数才处理一次，避免慢设备上按键堆积、松手后焦点继续移动。旧内核没有 `event.repeat` 时，按下后尚未松开又再次按下视为自动重复。
  - `setKeyAction`、`updateKeyAction`、`addKeyCodes`、`removeKeyCodes` 校验参数，名称、按键列表或字段类型无效时抛出带 `[vuEPG]` 前缀的 `TypeError`；以前传入字符串作为按键列表时可能被静默接受或误删其他按键。
  - 同一个按键属于多个按键事件时，在控制台警告实际会触发哪一个事件。

## 2.3.0

### Minor Changes

- [#34](https://github.com/UzkiS/vuEPG/pull/34) [`5f87064`](https://github.com/UzkiS/vuEPG/commit/5f87064352295fbc8e0f8bd1b56e52fc84d0f8c3) Thanks [@UzkiS](https://github.com/UzkiS)! - 新增 `restoreFocus` 配置，并修复输入框、滚动与旧内核上的若干问题。
  
  - 新增 `restoreFocus`（默认关闭）：当前焦点元素被卸载后，在本轮渲染完成后自动恢复焦点，优先回到原分组内最近获得过焦点的元素，例如关闭弹窗后回到打开前的元素；页面自行设置的焦点优先。开启后，方向操作恢复失效焦点时同样优先回到最近获得过焦点的元素。
  - 焦点移到输入框等可编辑元素以外时，该元素失去输入焦点。修复从输入框按上下键离开后，左右方向键与确定键仍被交给输入框的问题。
  - 输入法组字期间的按键不再触发导航或返回；为 `UP`、`DOWN`、`BACK` 添加的非文字按键在输入框中同样生效。
  - `setConfig` 与插件选项中值为 `undefined` 的字段不再覆盖当前配置，例如不再给焦点元素加上 `undefined` class 或意外开启视口滚动。
  - 修复未开启 `scrollViewport` 时，聚焦写在 `v-epg-scroll` 容器内的固定定位弹窗会滚动该容器的问题。
  - 确定键在元素缺少 `click()` 方法的旧内核上改为派发点击事件。
  - 完整示例改用 `restoreFocus` 处理弹窗关闭和列表筛选后的焦点恢复。

## 2.2.2

### Patch Changes

- [`9ce58ec`](https://github.com/UzkiS/vuEPG/commit/9ce58ec3d86dcad411cb5c273e1b9dce74dc15d2) Thanks [@UzkiS](https://github.com/UzkiS)! - 修复完整示例末张卡片的焦点框被滚动容器裁剪的问题，将首尾留白计入实际内容轨道，并补充不同缩放与真实 Chromium 30 的边缘可见性回归。示例顶部新增文档与 GitHub 入口，中英文 README 预览图改为打开完整示例。

## 2.2.1

### Patch Changes

- [#17](https://github.com/UzkiS/vuEPG/pull/17) [`81a6e26`](https://github.com/UzkiS/vuEPG/commit/81a6e26bb73bfa65c53ba92d34afdf520dfff4e1) Thanks [@UzkiS](https://github.com/UzkiS)! - 普通方向导航使用单次遍历选择目标，减少候选排序与中间数组；调试与文档继续使用同一打分规则展示完整分析，保持跨组锚点和并列顺序的行为一致。
  
  附带可独立复制的 Vue 2.7 完整示例，提供 Vite 现代开发、webpack 旧设备开发与 ES5 构建；加入真实 Chromium 30 的生产、开发和热更新回归。完善中英文接入与迁移指南、TypeScript 示例、项目首页与 SEO，并统一演示和完整示例的白粉视觉风格。

## 2.2.0

### Minor Changes

- [#10](https://github.com/UzkiS/vuEPG/pull/10) [`9142fa3`](https://github.com/UzkiS/vuEPG/commit/9142fa35d5ec7d54bd1b777a145bc7c1fa4f580e) Thanks [@UzkiS](https://github.com/UzkiS)! - 完成 TV 导航、焦点恢复、滚动与旧设备兼容的本轮更新。
  
  - 新增 `navigate(direction)`：虚拟遥控器等输入方式与方向键使用相同的方向事件和 `.prevent` 拦截；原有 `move()` 继续用于直接移动焦点。
  - 保存焦点路径，修复元素卸载或替换后组进出事件失配；焦点失效时优先在仍有效的原分组内恢复，避免穿透弹窗。被禁用的当前项仍可作为移动起点。
  - 组内没有方向目标时逐层派发组级方向事件；跨层候选并列时用当前焦点项的位置裁决。
  - 滚动与导航组解耦：`v-epg-scroll` 标记实际滚动容器，支持横向、纵向、嵌套容器及 `nearest`、`start`、`center` 对齐；`scrollViewport` 显式控制文档视口。滚动默认关闭，修复 CSS 缩放下的距离换算。
  - 修复旧内核缺失 `KeyboardEvent.code` 时无法回退到数字键值的问题，增加 Tizen 与 webOS 返回键；在可编辑元素中把文字、Backspace 和左右方向键交给浏览器。
  - `pause()` 可独立释放多处暂停；debug 模式输出逐层导航候选，关闭时避免构造日志数据。
  - 更新 Vue 2.7 事件写法、运行时依赖、滚动与性能指南；重整文档导航，加入使用真实库行为的交互 SVG 演示，并修复手机版演示布局。
  - 补充 Vue 2.7 与 Vue 3 的场景测试、类型测试及滚动测试；对 WebView 30 的兼容边界和性能实测方法作出说明。

## 2.0.0

### Major Changes

- [#4](https://github.com/UzkiS/vuEPG/pull/4) [`8da5da2`](https://github.com/UzkiS/vuEPG/commit/8da5da2f7e9abe0253daa2bc55355cd68ac19d3d) Thanks [@UzkiS](https://github.com/UzkiS)! - 2.0 完整重构。升级前请阅读[迁移指南](https://uzkis.github.io/vuEPG/migration/v1)。
  
  - 移除 vue-demi，零运行时依赖；最低支持 Vue 2.7，产物为 ES2015（兼容 webpack 4 与老旧机顶盒浏览器）
  - 事件改为原生 `CustomEvent` 并统一加上 `epg-` 前缀（`epg-focus`、`epg-blur`、`epg-enter`、`epg-leave`、`epg-up` 等），用 `.prevent` 取消默认移动；新增分组的 `epg-leave`
  - 新增 `disabled` 选项、插件安装选项、全局属性 `$epg`、`move()` 等方法的布尔返回值
  - 修复：元素隐藏或被 KeepAlive 缓存后焦点卡死、分组成员快照过期、卸载分组时可能误删其他分组、重渲染冲掉焦点 class、`position: fixed` 被误判为隐藏、嵌套 `onBack` 互相覆盖、`Escape` 不触发返回等问题
  - API 统一命名（如 `getFocusClass`、`findTarget`、`getNodeByElement`、`setKeyAction`），完整对照见迁移指南
  - 文档迁移至 GitHub Pages：https://uzkis.github.io/vuEPG/

## 1.2.2

- 1.x 维护补丁，保留原有 API 与 Vue 2/3 使用方式。
- 修复 Vue 3 中分组 `@enter` 覆盖 `@right`、条目 `@enter` 覆盖 `@click` 的问题。
- 修复卸载分组时误删其他分组、动态新增的子项无法通过方向键到达，以及移动到空分组时抛错的问题。
- 修复 `position: fixed` 元素被误判为隐藏、导入时覆盖 `document.onkeydown`，以及 `Escape` 不触发返回的问题。
- 补充 Vue 2.7 和 Vue 3 回归测试，更新 [1.x 文档](https://uzkis.github.io/vuEPG/v1/introduction)。

安装：`pnpm add vuepg@^1.2.2`。npm 的 `legacy` 标签指向此版本，`latest` 仍指向 2.x。

## 1.2.1

- 更新作者信息与构建脚本

## 1.2.0

- 新增 `back()`，可手动触发返回处理

## 1.1.0

- 新增 `pause()` / `resume()`，暂停与恢复按键响应

## 1.0.0

- 首个正式版本
- 移除对 vue-epg 旧写法的兼容支持
