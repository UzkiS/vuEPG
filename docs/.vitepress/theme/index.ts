import { h } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import VuEPG, { useVuEPG } from "vuepg";
import EpgPlayground from "./components/EpgPlayground.vue";
import HierarchyDemo from "./components/HierarchyDemo.vue";
import LegacyNotice from "./components/LegacyNotice.vue";
import NavigationDiagram from "./components/NavigationDiagram.vue";
import ScrollDemo from "./components/ScrollDemo.vue";
import "./style.css";

export default {
  extends: DefaultTheme,
  // 旧版文档（/v1/）顶部统一显示提示
  Layout: () => h(DefaultTheme.Layout, null, { "doc-before": () => h(LegacyNotice) }),
  enhanceApp: ({ app }) => {
    app.use(VuEPG);
    // 文档站默认不接管键盘，仅在演示激活时恢复
    useVuEPG().pause();
    app.component("EpgPlayground", EpgPlayground);
    app.component("HierarchyDemo", HierarchyDemo);
    app.component("NavigationDiagram", NavigationDiagram);
    app.component("ScrollDemo", ScrollDemo);
  },
} satisfies Theme;
