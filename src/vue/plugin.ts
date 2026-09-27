import { banner, listenKeyboard, setConfig, type EPGConfig } from "../core";
import { homepage, version } from "../../package.json";
import { groupDirective, itemDirective } from "./directives";
import { useVuEPG } from "./use-vuepg";

/** Vue 3 应用实例中插件用到的部分 */
interface Vue3App {
  directive(name: string, directive: object): unknown;
  readonly config: { readonly globalProperties: object };
}

/** Vue 2 构造函数中插件用到的部分 */
interface Vue2Constructor {
  directive(name: string, directive: object): unknown;
  readonly prototype: object;
}

/** `app.use()` / `Vue.use()` 传入的对象 */
export type PluginTarget = Vue3App | Vue2Constructor;

/** 插件选项，与 `setConfig` 相同 */
export type PluginOptions = Partial<EPGConfig>;

/** vuEPG 插件 */
export interface VuEPGPlugin {
  install(app: PluginTarget, options?: PluginOptions): void;
}

const isVue3App = (target: PluginTarget): target is Vue3App =>
  "config" in target && "globalProperties" in target.config;

let bannerShown = false;

export const plugin: VuEPGPlugin = {
  install: (app, options) => {
    if (options !== undefined) {
      setConfig(options);
    }
    app.directive("epg-item", itemDirective);
    app.directive("epg-group", groupDirective);
    Object.defineProperty(isVue3App(app) ? app.config.globalProperties : app.prototype, "$epg", {
      value: useVuEPG(),
      configurable: true,
      enumerable: true,
    });
    // 服务端渲染时没有 document，只注册指令
    if (typeof document === "undefined") {
      return;
    }
    listenKeyboard(document);
    if (!bannerShown) {
      bannerShown = true;
      banner(version, homepage);
    }
  },
};
