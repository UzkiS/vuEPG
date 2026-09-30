---
description: 将 vue-epg 项目迁移到 vuEPG，替换插件安装、指令与返回处理，保留已有页面逻辑。
---

# 从 vue-epg 迁移

vuEPG 的移动逻辑与 vue-epg 完全不同：vue-epg 在全部元素中比较距离，vuEPG 按 `EPGGroup` 的层级逐层查找（见 [移动规则](../guide/navigation)）。迁移旧页面时，请对照以下差异。

## 迁移前先看差异

下表对照 npm 的 `vue-epg` 2.3.1 用法，便于判断迁移收益与需要保留的业务逻辑。

| 方面             | vue-epg                                                 | vuEPG                                            | 取舍                                                   |
| ---------------- | ------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------ |
| 框架与接入       | Vue 2 插件，`v-items` / `v-group`，通过 `$service` 调用 | Vue 2.7 / Vue 3，同一套指令与 API                | Vue 2.6 需先升级；现有页面可以逐项迁移                 |
| 导航规则         | 在已注册项中按位置查找，分组可拦截离开方向              | 按真实 DOM 分组逐层查找，支持默认入口            | 新规则更强调区域边界，跨组落点需重新验收               |
| 返回处理         | mixin 读取 `serviceBack`                                | `onBack()` 随组件和 KeepAlive 生命周期生效       | 弹窗关闭后可恢复页面处理，需改登记方式                 |
| XPath 与位置记录 | 提供 `getEleByPath()`、`getPointerPosition()`           | 提供节点查询和焦点 API；没有内置 XPath           | 原项目直接使用 XPath 的代码需保留自有工具或改用业务 ID |
| 依赖与按键       | 依赖 `n-zepto`、`xpath-dom`，默认拦截所有按键           | 零运行时依赖，可配置按键；可编辑元素保留文字输入 | 减少依赖，但自定义按键与输入逻辑要按新规则核对         |

## 指令

vue-epg 的 `v-items` / `v-group` 不再支持，请改为 `v-epg-item` / `v-epg-group`。

## $service

vue-epg 会把实例挂在 `$service` 上。vuEPG 内置的全局属性是 `$epg`：

```vue
<!-- vue-epg -->
<div v-items @up="$service.move(...)">...</div>

<!-- vuEPG -->
<div v-epg-item @epg-up="$epg.move(...)">...</div>
```

旧代码暂时无法全部修改时，可以手动加一个别名：

```ts
import { useVuEPG } from "vuepg";

// Vue 3
app.config.globalProperties.$service = useVuEPG();
// Vue 2
Vue.prototype.$service = useVuEPG();
```

## serviceBack

vue-epg 通过 mixin 读取组件的 `serviceBack` 方法。vuEPG 使用 [`onBack`](../guide/back)。旧代码暂时无法全部修改时，可以加一个全局 mixin 兼容（仅支持 Options API，不推荐长期使用）：

```ts
import { useVuEPG } from "vuepg";

Vue.mixin({
  created() {
    if (typeof this.serviceBack === "function") {
      useVuEPG().onBack(() => this.serviceBack());
    }
  },
});
```

## 按键

vue-epg 对所有按键调用 `preventDefault()`，导致数字输入等浏览器默认行为全部失效。vuEPG 只对预定义的按键事件调用，并且可以逐个配置，见 [按键映射](../guide/key-actions)。

## 已移除

| vue-epg                                              | 说明                                   |
| ---------------------------------------------------- | -------------------------------------- |
| XPath：`getPointerPosition()`、`getEleByPath(xpath)` | 移除，如有需要请在项目中自行实现       |
| 自动为 group 添加 class                              | 移除，请直接在模板中为分组元素写 class |
