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
