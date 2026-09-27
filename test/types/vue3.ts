/**
 * 类型测试（Vue 3）：只做类型检查，不运行。由 `pnpm typecheck` 通过 tsconfig.test.json 检查。
 */
import { createApp, defineComponent } from "vue";
import VuEPG, { useVuEPG, type EPGEvent, type EPGItem, type EPGNode } from "../../src";

const app = createApp({});
app.use(VuEPG);
app.use(VuEPG, { focusClass: "focused", debug: true, backHandler: () => undefined });
// @ts-expect-error 插件选项只接受 EPGConfig 中的字段
app.use(VuEPG, { unknown: true });

defineComponent({
  mounted() {
    const moved: boolean = this.$epg.move("up");
    return moved;
  },
});

const epg = useVuEPG();
epg.move("down");
epg.move(document.body);
// @ts-expect-error 方向只能是 up / down / left / right
epg.move("forward");

const node: EPGNode | null = epg.getNodeByElement(document.body);
if (epg.isEPGItem(node)) {
  const item: EPGItem = node;
  const focusClass: string | undefined = item.focusClass;
  epg.setConfig({ focusClass: focusClass ?? "fallback" });
}

epg.setKeyAction("MENU", { codes: ["KeyM", 77], callback: (code) => code });
// @ts-expect-error setKeyAction 的 codes 为必填字段
epg.setKeyAction("MENU", {});

export const onFocus = (event: EPGEvent<"epg-focus">): EPGItem => event.detail.item;
