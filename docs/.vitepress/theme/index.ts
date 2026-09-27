import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import VuEPG, { useVuEPG } from "vuepg";
import EpgPlayground from "./components/EpgPlayground.vue";
import HierarchyDemo from "./components/HierarchyDemo.vue";
import NavigationDiagram from "./components/NavigationDiagram.vue";
import "./style.css";

export default {
  extends: DefaultTheme,
  enhanceApp: ({ app }) => {
    app.use(VuEPG);
    // 文档站默认不接管键盘，仅在演示激活时恢复
    useVuEPG().pause();
    app.component("EpgPlayground", EpgPlayground);
    app.component("HierarchyDemo", HierarchyDemo);
    app.component("NavigationDiagram", NavigationDiagram);
  },
} satisfies Theme;
