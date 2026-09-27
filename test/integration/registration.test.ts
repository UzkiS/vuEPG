import { mount } from "#mount";
import { describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import { useVuEPG } from "../../src";
import { press } from "../helpers/keyboard";
import { byId } from "../helpers/dom";
import { box } from "../helpers/layout";

const epg = useVuEPG();

describe("registration", () => {
  it("registers items and groups and marks them with data attributes", () => {
    mount({
      template: `<div id="g" v-epg-group>
        <div id="a" v-epg-item style="${box(0, 0, 50, 50)}"></div>
      </div>`,
    });
    expect(epg.getItems().map((item) => item.el.id)).toEqual(["a"]);
    expect(epg.getGroups().map((group) => group.el.id)).toEqual(["g"]);
    expect(byId("a").dataset["epgItemId"]).toMatch(/^epg-item-\d+$/);
    expect(byId("g").dataset["epgGroupId"]).toMatch(/^epg-group-\d+$/);
  });

  it("unregisters on unmount and clears the focus if needed", async () => {
    const show = ref(true);
    mount({
      template: `<div>
        <div id="a" v-if="show" v-epg-item style="${box(0, 0, 50, 50)}"></div>
        <div id="b" v-epg-item style="${box(0, 60, 50, 50)}"></div>
      </div>`,
      setup: () => ({ show }),
    });
    const a = byId("a");
    epg.move(a);
    show.value = false;
    await nextTick();
    expect(epg.getItems().map((item) => item.el.id)).toEqual(["b"]);
    expect(epg.getCurrentItem()).toBeNull();
    expect(a.classList.contains("vuepg-focus")).toBe(false);
    expect(a.dataset["epgItemId"]).toBeUndefined();
  });

  it("derives group membership from the live DOM (no stale snapshots)", async () => {
    const list = ref([1]);
    mount({
      template: `<div v-epg-group>
        <div v-for="n in list" :key="n" :id="'item' + n" v-epg-item :style="style(n)"></div>
      </div>`,
      setup: () => ({ list, style: (n: number) => box(0, n * 60, 50, 50) }),
    });
    epg.move(byId("item1"));
    list.value = [1, 2];
    await nextTick();
    press("ArrowDown");
    expect(epg.getCurrentItem()?.el.id).toBe("item2");
  });

  it("keeps identity and focus when the binding value changes", async () => {
    const options = ref({ default: false });
    mount({
      template: `<div id="a" v-epg-item="options" style="${box(0, 0, 50, 50)}"></div>`,
      setup: () => ({ options }),
    });
    epg.move(byId("a"));
    const item = epg.getCurrentItem();
    options.value = { default: true };
    await nextTick();
    expect(epg.getCurrentItem()).toBe(item);
    expect(item?.isDefault).toBe(true);
  });

  it("warns about invalid binding values", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    mount({
      template: `<div>
        <div id="a" v-epg-item="'oops'" style="${box(0, 0, 50, 50)}"></div>
        <div id="b" v-epg-item="{ focusClass: 'a b' }" style="${box(0, 60, 50, 50)}"></div>
        <div v-epg-group="42"></div>
      </div>`,
    });
    expect(warn).toHaveBeenCalledTimes(3);
    expect(epg.getNodeByElement(byId("b"))?.options).toEqual({ default: false, disabled: false });
  });

  it.each([
    ["v-epg-group v-epg-item", "group"],
    ["v-epg-item v-epg-group", "item"],
  ])("refuses to register an element twice (%s)", async (directives) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const tone = ref("a");
    mount({
      template: `<div id="both" ${directives} :class="tone" style="${box(0, 0, 50, 50)}"></div>`,
      setup: () => ({ tone }),
    });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("已被注册"), byId("both"));
    expect(epg.getItems().length + epg.getGroups().length).toBe(1);
    // 两个指令的 updated 钩子都会触发，只更新实际注册的那一种
    tone.value = "b";
    await nextTick();
    expect(epg.getItems().length + epg.getGroups().length).toBe(1);
  });
});
