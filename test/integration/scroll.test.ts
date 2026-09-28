import { mount } from "#mount";
import { describe, expect, it, vi } from "vitest";
import { useVuEPG } from "../../src";
import { byId } from "../helpers/dom";
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
    epg.move(byId("c5"));
    expect(byId("row").scrollLeft).toBe(0);
  });

  it("scrolls the minimal distance with nearest (scroll: true)", () => {
    mount({ template: row(`v-epg-group="{ scroll: true }"`) });
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
    mount({ template: row(`v-epg-group="{ scroll: 'start' }"`) });
    epg.move(byId("c3"));
    expect(byId("row").scrollLeft).toBe(330);
    epg.move(byId("c9")); // 受滚动范围限制
    expect(byId("row").scrollLeft).toBe(790);
  });

  it("keeps the focused item centered with center", () => {
    mount({ template: row(`v-epg-group="{ scroll: 'center' }"`) });
    epg.move(byId("c3")); // 中心 380，可视区中心 150
    expect(byId("row").scrollLeft).toBe(230);
    epg.move(byId("c0"));
    expect(byId("row").scrollLeft).toBe(0);
  });

  it("aligns items larger than the viewport to the start edge", () => {
    mount({
      template: `<div v-epg-group="{ scroll: true }" id="list" style="${box(0, 0, 100, 100)}">
        <div id="a" v-epg-item style="${box(0, 0, 100, 50)}"></div>
        <div id="big" v-epg-item style="${box(0, 60, 100, 200)}"></div>
      </div>`,
    });
    epg.move(byId("big"));
    expect(byId("list").scrollTop).toBe(60);
  });

  it("scrolls nested scroll groups from the inside out", () => {
    mount({
      template: `<div id="page" v-epg-group="{ scroll: true }" style="${box(0, 0, 300, 200)}">
        <div id="row" v-epg-group="{ scroll: true }" style="${box(0, 300, 300, 100)}">
          <div id="a" v-epg-item style="${box(0, 300, 100, 100)}"></div>
          <div id="b" v-epg-item style="${box(400, 300, 100, 100)}"></div>
        </div>
      </div>`,
    });
    epg.move(byId("b"));
    expect(byId("row").scrollLeft).toBe(200);
    expect(byId("page").scrollTop).toBe(200);
  });

  it("scrolls again when moving to the focused item", () => {
    mount({ template: row(`v-epg-group="{ scroll: true }"`) });
    epg.move(byId("c9"));
    byId("row").scrollLeft = 0;
    expect(epg.move(byId("c9"))).toBe(true);
    expect(byId("row").scrollLeft).toBe(790);
  });

  it("scrolls before epg-focus so handlers see the final position", () => {
    const seen = vi.fn();
    mount({
      template: row(`v-epg-group="{ scroll: true }" @epg-enter="onEnter"`),
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
    mount({ template: row(`v-epg-group="{ scroll: 'smooth' }"`) });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("scroll"), "smooth");
    epg.move(byId("c9"));
    expect(byId("row").scrollLeft).toBe(0);
  });

  it("treats scroll: false as disabled", () => {
    mount({ template: row(`v-epg-group="{ scroll: false }"`) });
    epg.move(byId("c9"));
    expect(byId("row").scrollLeft).toBe(0);
  });
});
