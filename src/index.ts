/**
 * vuEPG：Vue 2.7 / Vue 3 通用的大屏焦点管理插件。
 *
 * 分层（自上而下，只允许上层依赖下层）：
 * - `index.ts`  公开入口：插件、`useVuEPG` 与类型
 * - `vue/`      Vue 适配层：插件安装、指令、`onBack`、公开 API 清单
 * - `core/`     框架无关的核心：注册表、焦点状态、导航算法、按键映射
 */
import type { ObjectDirective } from "vue";
import type { EPGGroupOptions, EPGItemOptions } from "./core";
import { plugin } from "./vue/plugin";
import type { VuEPG } from "./vue/use-vuepg";

export default plugin;
export { useVuEPG } from "./vue/use-vuepg";

export type { VuEPG } from "./vue/use-vuepg";
export type { PluginOptions, PluginTarget, VuEPGPlugin } from "./vue/plugin";
export type {
  BackHandler,
  BuiltinKeyActionName,
  Direction,
  DirectionEventDetail,
  EPGConfig,
  EPGEvent,
  EPGEventDetailMap,
  EPGEventName,
  EPGGroup,
  EPGGroupOptions,
  EPGItem,
  EPGItemOptions,
  EPGNode,
  FocusTarget,
  KeyAction,
  KeyActionCallback,
  KeyActionOptions,
  KeyCode,
} from "./core";

declare module "vue" {
  interface ComponentCustomProperties {
    /** vuEPG 实例，与 `useVuEPG()` 返回值相同 */
    $epg: VuEPG;
  }

  interface GlobalDirectives {
    /** 将元素注册为 EPGItem */
    vEpgItem: ObjectDirective<HTMLElement, EPGItemOptions | undefined>;
    /** 将元素注册为 EPGGroup */
    vEpgGroup: ObjectDirective<HTMLElement, EPGGroupOptions | undefined>;
  }
}
