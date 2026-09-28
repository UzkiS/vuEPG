/**
 * 类型测试（Vue 2.7）：只做类型检查，不运行。由 `pnpm typecheck` 通过 tsconfig.vue2.json 检查，
 * 其中 `vue` 被映射到 Vue 2.7 的类型声明。
 */
import Vue, { defineComponent } from "vue";
import VuEPG, { useVuEPG, type EPGGroupOptions, type ScrollBinding } from "../../src";

Vue.use(VuEPG);
Vue.use(VuEPG, { focusClass: "focused" });
Vue.use(VuEPG, { scrollViewport: true });

// Vue 2.7 中 `$epg` 的类型通过 defineComponent 获得
defineComponent({
  mounted() {
    const moved: boolean = this.$epg.move("up");
    return moved;
  },
});

useVuEPG().onBack(() => undefined);
export const navigated: boolean = useVuEPG().navigate("down");
const releasePause: () => void = useVuEPG().pause();
releasePause();
export const scrollBinding: ScrollBinding = "center";
export const groupOptions: EPGGroupOptions = { default: true };
// @ts-expect-error 滚动方式不接受 smooth
export const invalidScrollBinding: ScrollBinding = "smooth";
// @ts-expect-error 导航分组不负责滚动容器配置
export const invalidGroupOptions: EPGGroupOptions = { scroll: true };
// @ts-expect-error 导航方向只能是 up / down / left / right
useVuEPG().navigate("forward");
