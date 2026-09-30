import { h } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import VuEPG, { useVuEPG } from "vuepg";
import BusinessExample from "./components/BusinessExample.vue";
import EpgPlayground from "./components/EpgPlayground.vue";
import EventTimelineDemo from "./components/EventTimelineDemo.vue";
import FocusConceptDemo from "./components/FocusConceptDemo.vue";
import GroupEntryDemo from "./components/GroupEntryDemo.vue";
import HierarchyDemo from "./components/HierarchyDemo.vue";
import LegacyNotice from "./components/LegacyNotice.vue";
import NavigationDiagram from "./components/NavigationDiagram.vue";
import ScrollDemo from "./components/ScrollDemo.vue";
import SupportProject from "./components/SupportProject.vue";
import "./style.css";
import "./demo.css";

export default {
  extends: DefaultTheme,
  // 旧版文档（/v1/）顶部统一显示提示
  Layout: () => h(DefaultTheme.Layout, null, { "doc-before": () => h(LegacyNotice) }),
  enhanceApp: ({ app }) => {
    app.use(VuEPG);
    // 文档站默认不接管键盘，仅在演示激活时恢复
    useVuEPG().pause();
    app.component("BusinessExample", BusinessExample);
    app.component("EpgPlayground", EpgPlayground);
    app.component("EventTimelineDemo", EventTimelineDemo);
    app.component("FocusConceptDemo", FocusConceptDemo);
    app.component("GroupEntryDemo", GroupEntryDemo);
    app.component("HierarchyDemo", HierarchyDemo);
    app.component("NavigationDiagram", NavigationDiagram);
    app.component("ScrollDemo", ScrollDemo);
    app.component("SupportProject", SupportProject);
  },
} satisfies Theme;
