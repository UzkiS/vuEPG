# 从 vue-epg 迁移

vuEPG 的移动逻辑与 vue-epg 完全不同：vue-epg 在全部元素中比较距离，vuEPG 按 `EPGGroup` 的层级逐层查找（见 [移动规则](../guide/navigation)）。迁移旧页面时，请对照以下差异。

## 指令

vue-epg 的 `v-items` / `v-groups` 不再支持，请改为 `v-epg-item` / `v-epg-group`。

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
