import { mount } from "#mount";
import { describe, expect, it } from "vitest";
import { nextTick, ref } from "vue";
import { useVuEPG } from "../../src";
import { byId } from "../helpers/dom";
import { box } from "../helpers/layout";

const epg = useVuEPG();

describe("focus class", () => {
  it("moves the global focus class along with the focus", () => {
    mount({
      template: `<div>
        <div id="a" v-epg-item style="${box(0, 0, 50, 50)}"></div>
        <div id="b" v-epg-item style="${box(0, 60, 50, 50)}"></div>
      </div>`,
    });
    epg.move(byId("a"));
    epg.move(byId("b"));
    expect(byId("a").className).toBe("");
    expect(byId("b").className).toBe("vuepg-focus");
    expect(epg.getFocusClass()).toBe("vuepg-focus");
  });

  it("uses the per-item focusClass", () => {
    mount({
      template: `<div id="a" v-epg-item="{ focusClass: 'mine' }" style="${box(0, 0, 50, 50)}"></div>`,
    });
    epg.move(byId("a"));
    expect(byId("a").className).toBe("mine");
    expect(epg.getFocusClass()).toBe("mine");
  });

  it("follows focusClass changes in the config", () => {
    mount({ template: `<div id="a" v-epg-item style="${box(0, 0, 50, 50)}"></div>` });
    epg.move(byId("a"));
    epg.setConfig({ focusClass: "focused" });
    expect(byId("a").className).toBe("focused");
  });

  it("follows focusClass changes in the binding", async () => {
    const focusClass = ref("one");
    mount({
      template: `<div id="a" v-epg-item="{ focusClass }" style="${box(0, 0, 50, 50)}"></div>`,
      setup: () => ({ focusClass }),
    });
    epg.move(byId("a"));
    focusClass.value = "two";
    await nextTick();
    expect(byId("a").className).toBe("two");
  });

  it("restores the class after the framework re-renders the class attribute", async () => {
    const tone = ref("light");
    mount({
      template: `<div id="a" v-epg-item :class="tone" style="${box(0, 0, 50, 50)}"></div>`,
      setup: () => ({ tone }),
    });
    epg.move(byId("a"));
    tone.value = "dark";
    await nextTick();
    expect(byId("a").classList.contains("dark")).toBe(true);
    expect(byId("a").classList.contains("vuepg-focus")).toBe(true);
  });
});
