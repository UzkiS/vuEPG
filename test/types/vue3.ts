/**
 * 类型测试（Vue 3）：只做类型检查，不运行。由 `pnpm typecheck` 通过 tsconfig.test.json 检查。
 */
import { createApp, defineComponent } from "vue";
import VuEPG, {
  useVuEPG,
  type EPGEvent,
  type EPGGroupOptions,
  type EPGItem,
  type EPGNode,
  type ScrollMode,
} from "../../src";

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
export const navigated: boolean = epg.navigate("right");
const releasePause: () => void = epg.pause();
releasePause();
const mode: ScrollMode = "nearest";
export const groupOptions: EPGGroupOptions = { scroll: mode };
// @ts-expect-error 滚动方式不接受 smooth
export const invalidGroupOptions: EPGGroupOptions = { scroll: "smooth" };
// @ts-expect-error 导航方向只能是 up / down / left / right
epg.navigate("forward");
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
