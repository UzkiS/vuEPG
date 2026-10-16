import { mount } from "#mount";
import { describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import { useVuEPG } from "../../src";
import { byId, focusedId } from "../helpers/dom";
import { press, pressLegacy } from "../helpers/keyboard";
import { box } from "../helpers/layout";

const epg = useVuEPG();

/**
 * 典型页面布局：
 *   [home][search]                      顶栏 group
 *   [m1]   [c1][c2][c3]                 菜单 group + 内容 group（c5 为 default）
 *   [m2]   [c4][c5][c6]
 *   [m3]
 */
const PAGE = `<div>
  <div id="top" v-epg-group>
    <div id="home" v-epg-item style="${box(0, 0, 100, 40)}"></div>
    <div id="search" v-epg-item style="${box(110, 0, 100, 40)}"></div>
  </div>
  <div id="body" v-epg-group>
    <div id="menu" v-epg-group>
      <div id="m1" v-epg-item style="${box(0, 60, 100, 40)}"></div>
      <div id="m2" v-epg-item style="${box(0, 110, 100, 40)}"></div>
      <div id="m3" v-epg-item style="${box(0, 160, 100, 40)}"></div>
    </div>
    <div id="grid" v-epg-group>
      <div id="c1" v-epg-item style="${box(120, 60, 80, 80)}"></div>
      <div id="c2" v-epg-item style="${box(210, 60, 80, 80)}"></div>
      <div id="c3" v-epg-item style="${box(300, 60, 80, 80)}"></div>
      <div id="c4" v-epg-item style="${box(120, 150, 80, 80)}"></div>
      <div id="c5" v-epg-item="{ default: true }" style="${box(210, 150, 80, 80)}"></div>
      <div id="c6" v-epg-item style="${box(300, 150, 80, 80)}"></div>
    </div>
  </div>
</div>`;

describe("keyboard navigation", () => {
  it("focuses the entry item on the first key press", () => {
    mount({ template: PAGE });
    press("ArrowRight");
    expect(focusedId()).toBe("home");
  });

  it("moves within a group", () => {
    mount({ template: PAGE });
    epg.move(byId("c1"));
    press("ArrowRight");
    expect(focusedId()).toBe("c2");
    press("ArrowDown");
    expect(focusedId()).toBe("c5");
    press("ArrowLeft");
    expect(focusedId()).toBe("c4");
  });

  it("climbs to the parent level and enters the target group at its default item", () => {
    mount({ template: PAGE });
    epg.move(byId("m1"));
    press("ArrowRight");
    expect(focusedId()).toBe("c5");
  });

  it("climbs through several levels", () => {
    mount({ template: PAGE });
    epg.move(byId("c2"));
    press("ArrowUp");
    expect(focusedId()).toBe("home");
  });

  it("stays put at the edge of the page", () => {
    mount({ template: PAGE });
    epg.move(byId("m3"));
    press("ArrowDown");
    press("ArrowLeft");
    expect(focusedId()).toBe("m3");
  });

  it("supports legacy numeric key codes", () => {
    mount({ template: PAGE });
    epg.move(byId("m1"));
    pressLegacy(40);
    expect(focusedId()).toBe("m2");
  });

  it("clicks the focused element on ENTER", () => {
    const onClick = vi.fn();
    mount({
      template: `<div id="a" v-epg-item style="${box(0, 0, 50, 50)}" @click="onClick"></div>`,
      setup: () => ({ onClick }),
    });
    press("Enter");
    expect(onClick).not.toHaveBeenCalled();
    epg.move(byId("a"));
    press("Enter");
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("dispatches a click event where the element has no click() method", () => {
    const onClick = vi.fn();
    mount({
      template: `<div id="a" v-epg-item style="${box(0, 0, 50, 50)}" @click="onClick"></div>`,
      setup: () => ({ onClick }),
    });
    const el = byId("a");
    // 模拟部分旧 WebKit 内核：非表单元素没有 click()
    Object.defineProperty(el, "click", { value: undefined });
    epg.move(el);
    press("Enter");
    expect(onClick).toHaveBeenCalledOnce();
    expect(onClick.mock.calls[0]?.[0]).toBeInstanceOf(MouseEvent);
  });
});

describe("invalidation", () => {
  it("ignores arrow keys when nothing can receive the focus", () => {
    mount({ template: `<div v-epg-item="{ disabled: true }" style="${box(0, 0, 50, 50)}"></div>` });
    press("ArrowDown");
    expect(epg.getCurrentItem()).toBeNull();
  });

  it("falls back to the next child when the default one is unavailable", () => {
    mount({
      template: `<div id="g" v-epg-group>
        <div id="a" v-epg-item style="${box(0, 0, 50, 50)}"></div>
        <div id="b" v-epg-item="{ default: true, disabled: true }" style="${box(0, 60, 50, 50)}"></div>
      </div>`,
    });
    expect(epg.move(byId("g"))).toBe(true);
    expect(focusedId()).toBe("a");
  });

  it("skips hidden items", () => {
    mount({
      template: `<div>
        <div id="a" v-epg-item style="${box(0, 0, 50, 50)}"></div>
        <div id="b" v-epg-item v-show="false" style="${box(0, 60, 50, 50)}"></div>
        <div id="c" v-epg-item style="${box(0, 120, 50, 50)}"></div>
      </div>`,
    });
    epg.move(byId("a"));
    press("ArrowDown");
    expect(focusedId()).toBe("c");
  });

  it("skips disabled items and refuses to focus them directly", () => {
    mount({
      template: `<div>
        <div id="a" v-epg-item style="${box(0, 0, 50, 50)}"></div>
        <div id="b" v-epg-item="{ disabled: true }" style="${box(0, 60, 50, 50)}"></div>
        <div id="c" v-epg-item style="${box(0, 120, 50, 50)}"></div>
      </div>`,
    });
    expect(epg.move(byId("b"))).toBe(false);
    epg.move(byId("a"));
    press("ArrowDown");
    expect(focusedId()).toBe("c");
  });

  it("skips disabled, hidden and empty groups", () => {
    mount({
      template: `<div>
        <div id="a" v-epg-item style="${box(0, 0, 50, 50)}"></div>
        <div v-epg-group="{ disabled: true }">
          <div id="b" v-epg-item style="${box(0, 60, 50, 50)}"></div>
        </div>
        <div v-epg-group v-show="false">
          <div id="c" v-epg-item style="${box(0, 120, 50, 50)}"></div>
        </div>
        <div v-epg-group style="${box(0, 180, 50, 50)}"></div>
        <div id="d" v-epg-item style="${box(0, 240, 50, 50)}"></div>
      </div>`,
    });
    epg.move(byId("a"));
    press("ArrowDown");
    expect(focusedId()).toBe("d");
  });

  it("re-enters at the entry item once the focused element becomes hidden", async () => {
    const visible = ref(true);
    mount({
      template: `<div>
        <div id="a" v-epg-item style="${box(0, 0, 50, 50)}"></div>
        <div id="b" v-epg-item v-show="visible" style="${box(0, 60, 50, 50)}"></div>
      </div>`,
      setup: () => ({ visible }),
    });
    epg.move(byId("b"));
    visible.value = false;
    await nextTick();
    expect(epg.move("up")).toBe(false);
    press("ArrowUp");
    expect(focusedId()).toBe("a");
  });

  it("does not click a focused element that became disabled", async () => {
    const onClick = vi.fn();
    const disabled = ref(false);
    mount({
      template: `<div id="a" v-epg-item="{ disabled }" style="${box(0, 0, 50, 50)}" @click="onClick"></div>`,
      setup: () => ({ onClick, disabled }),
    });
    epg.move(byId("a"));
    disabled.value = true;
    await nextTick();
    press("Enter");
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("keyRepeatInterval", () => {
  const ROW = `<div>${["a", "b", "c", "d"]
    .map((id, index) => `<div id="${id}" v-epg-item style="${box(index * 60, 0, 50, 50)}"></div>`)
    .join("")}</div>`;
  const keyup = (code: string): void => {
    document.dispatchEvent(new KeyboardEvent("keyup", { code, bubbles: true }));
  };

  it("handles every repeat by default", () => {
    mount({ template: ROW });
    epg.move(byId("a"));
    press("ArrowRight");
    press("ArrowRight", { repeat: true });
    press("ArrowRight", { repeat: true });
    expect(focusedId()).toBe("d");
  });

  it("ignores repeats of a held key within the interval", () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(1000);
    mount({ template: ROW }, { keyRepeatInterval: 100 });
    epg.move(byId("a"));
    press("ArrowRight");
    const ignored = press("ArrowRight", { repeat: true });
    expect(focusedId()).toBe("b");
    // 被忽略的重复按键仍阻止浏览器默认滚动
    expect(ignored.defaultPrevented).toBe(true);
    now.mockReturnValue(1100);
    press("ArrowRight", { repeat: true });
    expect(focusedId()).toBe("c");
    // 松开后重新按下不受限制
    keyup("ArrowRight");
    press("ArrowRight");
    expect(focusedId()).toBe("d");
  });

  it("detects repeats without event.repeat until the key is released", () => {
    vi.spyOn(Date, "now").mockReturnValue(1000);
    mount({ template: ROW }, { keyRepeatInterval: 100 });
    epg.move(byId("a"));
    pressLegacy(39);
    pressLegacy(39);
    expect(focusedId()).toBe("b");
    const release = new KeyboardEvent("keyup", { bubbles: true });
    Object.defineProperty(release, "code", { value: undefined });
    Object.defineProperty(release, "keyCode", { value: 39 });
    Object.defineProperty(release, "which", { value: 39 });
    document.dispatchEvent(release);
    pressLegacy(39);
    expect(focusedId()).toBe("c");
    // 松开其他按键不影响正在按住的键
    pressLegacy(39);
    keyup("ArrowLeft");
    pressLegacy(39);
    expect(focusedId()).toBe("c");
  });
});
