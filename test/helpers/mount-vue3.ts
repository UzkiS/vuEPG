import { createApp, type Component } from "vue";
import VuEPG, { type PluginOptions } from "../../src";
import type { Mounted, TestComponent } from "./types";

const mounted = new Set<Mounted>();

/** 以 Vue 3 挂载组件并安装 vuEPG */
export const mount = (component: TestComponent, options?: PluginOptions): Mounted => {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const app = createApp(component as Component);
  app.use(VuEPG, options);
  app.mount(host);
  const result: Mounted = {
    root: host,
    unmount: () => {
      app.unmount();
      host.remove();
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

export const vueVersion = 3;
