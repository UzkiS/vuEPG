import { mount } from "#mount";
import { describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import { useVuEPG } from "../../src";
import { byId, focusedId } from "../helpers/dom";
import { press } from "../helpers/keyboard";
import { box } from "../helpers/layout";

const epg = useVuEPG();

/** 可视宽度 300 的横向列表，10 个宽 100 的元素（间距 10） */
const row = (binding: string): string => `<div>
  <div id="row" ${binding} style="${box(0, 0, 300, 100)}">
    ${Array.from({ length: 10 }, (_, i) => `<div id="c${String(i)}" v-epg-item style="${box(i * 110, 0, 100, 100)}"></div>`).join("")}
  </div>
</div>`;

describe("scroll", () => {
  it("does not scroll groups without the option", () => {
    mount({ template: row("v-epg-group") });
    const readRect = vi.spyOn(byId("c5"), "getBoundingClientRect");
    epg.move(byId("c5"));
    expect(byId("row").scrollLeft).toBe(0);
    expect(readRect).not.toHaveBeenCalled();
  });

  it("scrolls an ordinary container without changing the navigation hierarchy", () => {
    mount({ template: row("v-epg-scroll") });
    expect(epg.getGroups()).toEqual([]);
    epg.move(byId("c9"));
    expect(byId("row").scrollLeft).toBe(790);
  });

  it("scrolls the minimal distance with nearest (v-epg-scroll)", () => {
    mount({ template: row(`v-epg-group v-epg-scroll`) });
    epg.move(byId("c1"));
    expect(byId("row").scrollLeft).toBe(0); // 已完全可见
    press("ArrowRight"); // c2：220–320 超出右边缘 20
    expect(byId("row").scrollLeft).toBe(20);
    epg.move(byId("c9"));
    expect(byId("row").scrollLeft).toBe(790);
    epg.move(byId("c1")); // 超出左边缘：对齐起始边
    expect(byId("row").scrollLeft).toBe(110);
  });

  it("aligns to the start edge with start", () => {
    mount({ template: row(`v-epg-group v-epg-scroll="'start'"`) });
    epg.move(byId("c3"));
    expect(byId("row").scrollLeft).toBe(330);
    epg.move(byId("c9")); // 受滚动范围限制
    expect(byId("row").scrollLeft).toBe(790);
  });

  it("keeps the focused item centered with center", () => {
    mount({ template: row(`v-epg-group v-epg-scroll="'center'"`) });
    epg.move(byId("c3")); // 中心 380，可视区中心 150
    expect(byId("row").scrollLeft).toBe(230);
    epg.move(byId("c0"));
    expect(byId("row").scrollLeft).toBe(0);
  });

  it("aligns items larger than the viewport to the start edge", () => {
    mount({
      template: `<div v-epg-group v-epg-scroll id="list" style="${box(0, 0, 100, 100)}">
        <div id="a" v-epg-item style="${box(0, 0, 100, 50)}"></div>
        <div id="big" v-epg-item style="${box(0, 60, 100, 200)}"></div>
      </div>`,
    });
    epg.move(byId("big"));
    expect(byId("list").scrollTop).toBe(60);
  });

  it("scrolls nested scroll groups from the inside out", () => {
    mount({
      template: `<div id="page" v-epg-group v-epg-scroll style="${box(0, 0, 300, 200)}">
        <div id="row" v-epg-group v-epg-scroll style="${box(0, 300, 300, 100)}">
          <div id="a" v-epg-item style="${box(0, 300, 100, 100)}"></div>
          <div id="b" v-epg-item style="${box(400, 300, 100, 100)}"></div>
        </div>
      </div>`,
    });
    epg.move(byId("b"));
    expect(byId("row").scrollLeft).toBe(200);
    expect(byId("page").scrollTop).toBe(200);
  });

  it("scrolls the destination and outer group when switching groups, preserving the source", () => {
    mount({
      template: `<div id="page" v-epg-group v-epg-scroll style="${box(0, 0, 300, 200)}">
        <div id="first" v-epg-group v-epg-scroll style="${box(0, 0, 300, 100)}">
          <div id="f0" v-epg-item style="${box(0, 0, 100, 100)}"></div>
          <div id="f1" v-epg-item style="${box(400, 0, 100, 100)}"></div>
        </div>
        <div id="second" v-epg-group v-epg-scroll style="${box(0, 300, 300, 100)}">
          <div id="s0" v-epg-item style="${box(0, 300, 100, 100)}"></div>
          <div id="s1" v-epg-item style="${box(400, 300, 100, 100)}"></div>
        </div>
      </div>`,
    });
    epg.move(byId("f1"));
    expect(byId("first").scrollLeft).toBe(200);

    press("ArrowDown");
    expect(focusedId()).toBe("s0");
    expect(byId("page").scrollTop).toBe(200);
    expect(byId("first").scrollLeft).toBe(200);

    epg.move(byId("s1"));
    expect(byId("second").scrollLeft).toBe(200);
    press("ArrowUp");
    expect(focusedId()).toBe("f0");
    expect(byId("second").scrollLeft).toBe(200);
  });

  it("scrolls again when moving to the focused item", () => {
    mount({ template: row(`v-epg-group v-epg-scroll`) });
    epg.move(byId("c9"));
    byId("row").scrollLeft = 0;
    expect(epg.move(byId("c9"))).toBe(true);
    expect(byId("row").scrollLeft).toBe(790);
  });

  it("scrolls before epg-focus so handlers see the final position", () => {
    const seen = vi.fn();
    mount({
      template: row(`v-epg-group v-epg-scroll @epg-enter="onEnter"`),
      setup: () => ({ onEnter: () => undefined }),
    });
    byId("c9").addEventListener("epg-focus", () => {
      seen(byId("row").scrollLeft);
    });
    epg.move(byId("c9"));
    expect(seen).toHaveBeenCalledWith(790);
  });

  it("warns about invalid scroll values", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    mount({ template: row(`v-epg-group v-epg-scroll="'smooth'"`) });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("scroll"), "smooth");
    epg.move(byId("c9"));
    expect(byId("row").scrollLeft).toBe(0);
  });

  it("treats v-epg-scroll: false as disabled", () => {
    mount({ template: row(`v-epg-group v-epg-scroll="false"`) });
    epg.move(byId("c9"));
    expect(byId("row").scrollLeft).toBe(0);
  });

  it("updates and removes the scroll directive with the Vue lifecycle", async () => {
    const enabled = ref(false);
    const visible = ref(true);
    mount({
      template: `<div><div v-if="visible" id="row" v-epg-scroll="enabled" style="${box(0, 0, 300, 100)}">
        <div id="first" v-epg-item style="${box(0, 0, 100, 100)}"></div>
        <div id="last" v-epg-item style="${box(400, 0, 100, 100)}"></div>
      </div></div>`,
      setup: () => ({ enabled, visible }),
    });
    epg.move(byId("last"));
    expect(byId("row").scrollLeft).toBe(0);
    enabled.value = true;
    await nextTick();
    epg.move(byId("last"));
    expect(byId("row").scrollLeft).toBe(200);
    visible.value = false;
    await nextTick();
    expect(epg.getCurrentItem()).toBeNull();
  });

  it("scrolls the document viewport only when configured", () => {
    const height = window.innerHeight;
    const root = document.documentElement;
    root.style.cssText = box(0, 0, window.innerWidth, height);
    try {
      mount({
        template: `<div id="below" v-epg-item style="${box(0, height + 100, 100, 50)}"></div>`,
      });
      epg.move(byId("below"));
      expect(root.scrollTop).toBe(0);
      epg.setConfig({ scrollViewport: true });
      epg.move(byId("below"));
      expect(root.scrollTop).toBe(150);
    } finally {
      root.scrollTop = 0;
      root.removeAttribute("style");
    }
  });

  it("uses the browser scrolling element and scrolls horizontally when requested", () => {
    const root = document.documentElement;
    root.style.cssText = box(0, 0, window.innerWidth, window.innerHeight);
    Object.defineProperty(document, "scrollingElement", {
      configurable: true,
      value: root,
    });
    try {
      epg.setConfig({ scrollViewport: "start" });
      mount({
        template: `<div id="right" v-epg-item style="${box(window.innerWidth + 100, 0, 100, 50)}"></div>`,
      });
      epg.move(byId("right"));
      expect(root.scrollLeft).toBe(200);
      expect(root.scrollTop).toBe(0);
    } finally {
      root.scrollLeft = 0;
      root.removeAttribute("style");
      Reflect.deleteProperty(document, "scrollingElement");
    }
  });

  it("keeps a fixed overlay from scrolling the document behind it", () => {
    const height = window.innerHeight;
    const root = document.documentElement;
    root.style.cssText = box(0, 0, window.innerWidth, height);
    try {
      epg.setConfig({ scrollViewport: true });
      mount({
        template: `<div style="position:fixed;${box(0, height + 100, 100, 50)}">
          <div id="fixed" v-epg-item style="${box(0, height + 100, 100, 50)}"></div>
        </div>`,
      });
      epg.move(byId("fixed"));
      expect(root.scrollTop).toBe(0);
    } finally {
      root.scrollTop = 0;
      root.removeAttribute("style");
    }
  });

  it("converts scaled visual distance to layout distance", () => {
    mount({ template: row("v-epg-scroll") });
    const group = byId("row");
    const item = byId("c9");
    vi.spyOn(group, "getBoundingClientRect").mockImplementation(() => new DOMRect(0, 0, 150, 50));
    vi.spyOn(item, "getBoundingClientRect").mockImplementation(
      () => new DOMRect((990 - group.scrollLeft) * 0.5, 0, 50, 50),
    );
    epg.move(item);
    expect(group.scrollLeft).toBe(790);
    expect(item.getBoundingClientRect().right).toBe(150);
  });
});
