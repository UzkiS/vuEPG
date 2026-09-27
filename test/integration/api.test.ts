import { mount } from "#mount";
import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useVuEPG } from "../../src";
import { byId, focusedId } from "../helpers/dom";
import { press } from "../helpers/keyboard";
import { box } from "../helpers/layout";

const epg = useVuEPG();

const LAYOUT = `<div>
  <div id="outer" v-epg-group>
    <div id="a" v-epg-item style="${box(0, 0, 50, 50)}"></div>
    <div>
      <div id="inner" v-epg-group>
        <div id="b" v-epg-item style="${box(60, 0, 50, 50)}"></div>
        <div id="c" v-epg-item="{ default: true }" style="${box(120, 0, 50, 50)}"></div>
      </div>
    </div>
  </div>
  <div id="empty" v-epg-group></div>
  <div id="d" v-epg-item style="${box(0, 60, 50, 50)}"></div>
</div>`;

describe("move", () => {
  it("accepts elements, nodes and directions", () => {
    mount({ template: LAYOUT });
    expect(epg.move(byId("a"))).toBe(true);
    const node = epg.getNodeByElement(byId("b"));
    expect(node && epg.move(node)).toBe(true);
    expect(epg.move("right")).toBe(true);
    expect(focusedId()).toBe("c");
  });

  it("accepts component instances through $el", () => {
    const child = ref<{ $el: unknown } | null>(null);
    mount({
      template: `<div><Child ref="child" /></div>`,
      components: {
        Child: { template: `<div id="x" v-epg-item style="${box(0, 0, 50, 50)}"></div>` },
      },
      setup: () => ({ child }),
    });
    expect(epg.move(child.value)).toBe(true);
    expect(focusedId()).toBe("x");
  });

  it("enters groups at their default item", () => {
    mount({ template: LAYOUT });
    expect(epg.move(byId("inner"))).toBe(true);
    expect(focusedId()).toBe("c");
  });

  it("returns false for unusable targets", () => {
    mount({ template: LAYOUT });
    expect(epg.move(null)).toBe(false);
    expect(epg.move(undefined)).toBe(false);
    expect(epg.move(document.body)).toBe(false);
    expect(epg.move({ $el: null })).toBe(false);
    expect(epg.move(byId("empty"))).toBe(false);
    expect(epg.move("down")).toBe(false);
  });

  it("offers direction shortcuts", () => {
    mount({ template: LAYOUT });
    epg.move(byId("b"));
    expect(epg.right()).toBe(true);
    expect(epg.left()).toBe(true);
    expect(epg.down()).toBe(true);
    expect(focusedId()).toBe("d");
    expect(epg.up()).toBe(true);
    expect(epg.down()).toBe(true);
    expect(epg.down()).toBe(false);
  });

  it("keeps the focus when moving to the focused item again", () => {
    mount({ template: LAYOUT });
    const onFocus = vi.fn();
    byId("a").addEventListener("epg-focus", onFocus);
    epg.move(byId("a"));
    expect(epg.move(byId("a"))).toBe(true);
    expect(onFocus).toHaveBeenCalledOnce();
  });

  it("exposes moveToItem / moveToGroup / findTarget", () => {
    mount({ template: LAYOUT });
    expect(epg.findTarget("down")).toBeNull();
    const [a, b] = epg.getItems();
    const inner = epg.getGroups().find((group) => group.el.id === "inner");
    expect(a && epg.moveToItem(a)).toBe(true);
    expect(epg.findTarget("right")?.el.id).toBe("inner");
    expect(inner && epg.moveToGroup(inner)).toBe(true);
    expect(b && epg.moveToItem(b)).toBe(true);
  });
});

describe("queries", () => {
  it("describes the current focus", () => {
    mount({ template: LAYOUT });
    expect(epg.getCurrentItem()).toBeNull();
    expect(epg.getCurrentGroup()).toBeNull();
    epg.move(byId("b"));
    expect(epg.getCurrentItem()?.el.id).toBe("b");
    expect(epg.getCurrentGroup()?.el.id).toBe("inner");
  });

  it("navigates the node tree", () => {
    mount({ template: LAYOUT });
    const outer = epg.getNodeByElement(byId("outer"));
    const inner = epg.getNodeByElement(byId("inner"));
    expect(epg.isEPGGroup(outer)).toBe(true);
    expect(epg.isEPGItem(outer)).toBe(false);
    if (!epg.isEPGGroup(outer) || !epg.isEPGGroup(inner)) {
      throw new Error("groups not registered");
    }
    expect(epg.getChildren().map((node) => node.el.id)).toEqual(["outer", "empty", "d"]);
    expect(epg.getChildren(outer).map((node) => node.el.id)).toEqual(["a", "inner"]);
    expect(epg.getItemsInGroup(outer).map((item) => item.el.id)).toEqual(["a", "b", "c"]);
    expect(epg.getParentGroup(byId("c"))).toBe(inner);
    expect(epg.getParentGroup(inner)).toBe(outer);
    expect(epg.getParentGroup(outer)).toBeNull();
    expect(epg.getNodeByElement(document.body)).toBeNull();
    expect(epg.isEPGItem(epg.getNodeByElement(byId("a")))).toBe(true);
  });
});

describe("plugin", () => {
  it("applies install options", () => {
    mount({ template: `<div></div>` }, { focusClass: "installed" });
    expect(epg.getConfig().focusClass).toBe("installed");
  });

  it("exposes $epg to templates", () => {
    mount({
      template: `<div id="a" v-epg-item style="${box(0, 0, 50, 50)}" @click="$epg.pause()"></div>`,
    });
    epg.move(byId("a"));
    press("Enter");
    expect(epg.isPaused()).toBe(true);
    press("ArrowDown");
    epg.resume();
    expect(epg.isPaused()).toBe(false);
  });

  it("prints debug logs only when enabled", () => {
    mount({ template: LAYOUT });
    const log = vi.mocked(console.log);
    log.mockClear();
    epg.move(byId("a"));
    expect(log).not.toHaveBeenCalled();
    epg.setConfig({ debug: true });
    epg.move(byId("b"));
    expect(log).toHaveBeenCalled();
  });
});
