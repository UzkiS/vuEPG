/**
 * 类型测试（Vue 2.7）：只做类型检查，不运行。由 `pnpm typecheck` 通过 tsconfig.vue2.json 检查，
 * 其中 `vue` 被映射到 Vue 2.7 的类型声明。
 */
import Vue, { defineComponent } from "vue";
import VuEPG, { useVuEPG } from "../../src";

Vue.use(VuEPG);
Vue.use(VuEPG, { focusClass: "focused" });

// Vue 2.7 中 `$epg` 的类型通过 defineComponent 获得
defineComponent({
  mounted() {
    const moved: boolean = this.$epg.move("up");
    return moved;
  },
});

useVuEPG().onBack(() => undefined);
