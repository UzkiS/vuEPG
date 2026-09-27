import Vue, { type ComponentOptions } from "vue2";
import VuEPG, { useVuEPG, type PluginOptions } from "../../src";
import type { Mounted, TestComponent } from "./types";

const mounted = new Set<Mounted>();

// Vue 2 的插件全局只安装一次（Vue.use 自带去重）
Vue.use(VuEPG);

/** 以 Vue 2.7 挂载组件；插件选项通过 setConfig 应用 */
export const mount = (component: TestComponent, options?: PluginOptions): Mounted => {
  if (options !== undefined) {
    useVuEPG().setConfig(options);
  }
  const host = document.createElement("div");
  document.body.appendChild(host);
  const vm = new Vue(component as ComponentOptions<Vue>).$mount(host);
  const result: Mounted = {
    root: vm.$el,
    unmount: () => {
      vm.$destroy();
      vm.$el.remove();
      mounted.delete(result);
    },
  };
  mounted.add(result);
  return result;
};

export const unmountAll = (): void => {
  mounted.forEach((app) => {
    app.unmount();
  });
};

export const vueVersion = 2;
