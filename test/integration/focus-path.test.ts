import { mount } from "#mount";
import { describe, expect, it } from "vitest";
import { nextTick, ref } from "vue";
import { useVuEPG } from "../../src";
import { byId, focusedId } from "../helpers/dom";
import { press } from "../helpers/keyboard";
import { box } from "../helpers/layout";

const epg = useVuEPG();

const setupLog = (): { log: (entry: string) => void; entries: string[] } => {
  const entries: string[] = [];
  return { entries, log: (entry) => entries.push(entry) };
};

describe("event pairing", () => {
  it("leaves a group whose focused item was unmounted once the focus goes elsewhere", async () => {
    const { log, entries } = setupLog();
    const show = ref(true);
    mount({
      template: `<div>
        <div v-epg-group @epg-enter="log('enter side')" @epg-leave="log('leave side')">
          <div id="x" v-if="show" v-epg-item style="${box(0, 0, 50, 50)}"></div>
        </div>
        <div v-epg-group="{ default: true }" @epg-enter="log('enter main')">
          <div id="y" v-epg-item style="${box(100, 0, 50, 50)}"></div>
        </div>
      </div>`,
      setup: () => ({ show, log }),
    });
    epg.move(byId("x"));
    show.value = false;
    await nextTick();
    epg.move(byId("y"));
    expect(entries).toEqual(["enter side", "leave side", "enter main"]);
  });

  it("does not enter a group twice when the focus is restored inside it", async () => {
    const { log, entries } = setupLog();
    const show = ref(true);
    mount({
      template: `<div v-epg-group @epg-enter="log('enter')" @epg-leave="log('leave')">
        <div id="a" v-epg-item style="${box(0, 0, 50, 50)}"></div>
        <div id="b" v-if="show" v-epg-item style="${box(0, 60, 50, 50)}"></div>
      </div>`,
      setup: () => ({ show, log }),
    });
    epg.move(byId("b"));
    show.value = false;
    await nextTick();
    press("ArrowDown");
    expect(focusedId()).toBe("a");
    expect(entries).toEqual(["enter"]);
  });

  it("never blurs an item that did not receive epg-focus", () => {
    const { log, entries } = setupLog();
    mount({
      template: `<div>
        <div id="a" v-epg-item style="${box(0, 0, 50, 50)}" @epg-blur="redirect"></div>
        <div id="b" v-epg-item style="${box(0, 60, 50, 50)}" @epg-blur="log('blur b')"></div>
        <div id="c" v-epg-item style="${box(0, 120, 50, 50)}"></div>
      </div>`,
      setup: () => ({ log, redirect: () => epg.move(byId("c")) }),
    });
    epg.move(byId("a"));
    epg.move(byId("b"));
    epg.move(byId("a"));
    expect(entries).toEqual([]);
    expect(focusedId()).toBe("a");
  });

  it("stops an outer group transition when blur redirects the focus", () => {
    mount({
      template: `<div>
        <div v-epg-group><div id="a" v-epg-item style="${box(0, 0, 50, 50)}" @epg-blur="redirect"></div></div>
        <div v-epg-group><div id="b" v-epg-item style="${box(0, 60, 50, 50)}"></div></div>
        <div v-epg-group><div id="c" v-epg-item style="${box(0, 120, 50, 50)}"></div></div>
      </div>`,
      setup: () => ({
        redirect: () => {
          epg.move(byId("c"));
        },
      }),
    });
    epg.move(byId("a"));
    expect(epg.move(byId("b"))).toBe(false);
    expect(focusedId()).toBe("c");
  });

  it("drops unmounted groups from the focus path without dispatching epg-leave", async () => {
    const { log, entries } = setupLog();
    const show = ref(true);
    mount({
      template: `<div>
        <div v-if="show" v-epg-group @epg-leave="log('leave')">
          <div id="a" v-epg-item style="${box(0, 0, 50, 50)}"></div>
        </div>
        <div id="b" v-epg-item style="${box(0, 60, 50, 50)}"></div>
      </div>`,
      setup: () => ({ show, log }),
    });
    epg.move(byId("a"));
    show.value = false;
    await nextTick();
    press("ArrowDown");
    expect(focusedId()).toBe("b");
    expect(entries).toEqual([]);
  });
});

describe("recovery", () => {
  const DIALOG = `<div>
    <div v-epg-group="{ default: true }">
      <div id="p1" v-epg-item style="${box(0, 0, 50, 50)}"></div>
    </div>
    <div v-epg-group @epg-up.prevent @epg-down.prevent @epg-left.prevent @epg-right.prevent>
      <div id="ok" key="ok" v-if="step === 1" v-epg-item style="${box(300, 300, 50, 50)}"></div>
      <div id="done" key="done" v-else v-epg-item="{ default: true }" style="${box(300, 300, 50, 50)}"></div>
      <div id="cancel" v-epg-item style="${box(360, 300, 50, 50)}"></div>
    </div>
  </div>`;

  it("restores the focus inside the dialog after the focused button is replaced", async () => {
    const step = ref(1);
    mount({ template: DIALOG, setup: () => ({ step }) });
    epg.move(byId("ok"));
    step.value = 2;
    await nextTick();
    expect(epg.getCurrentItem()).toBeNull();
    press("ArrowUp");
    expect(focusedId()).toBe("done");
  });

  it("recovers in the innermost group that can still be entered", async () => {
    const show = ref(true);
    mount({
      template: `<div>
        <div id="top" v-epg-item style="${box(0, 0, 50, 50)}"></div>
        <div v-epg-group>
          <div id="first" v-epg-item style="${box(0, 100, 50, 50)}"></div>
          <div v-epg-group>
            <div id="only" v-if="show" v-epg-item style="${box(0, 200, 50, 50)}"></div>
          </div>
        </div>
      </div>`,
      setup: () => ({ show }),
    });
    epg.move(byId("only"));
    show.value = false;
    await nextTick();
    expect(epg.navigate("down")).toBe(true);
    expect(focusedId()).toBe("first");
  });

  it("falls back to the page entry once every group on the path is gone", async () => {
    const show = ref(true);
    mount({
      template: `<div>
        <div id="top" v-epg-item style="${box(0, 0, 50, 50)}"></div>
        <div v-if="show" v-epg-group>
          <div id="a" v-epg-item style="${box(0, 100, 50, 50)}"></div>
        </div>
      </div>`,
      setup: () => ({ show }),
    });
    epg.move(byId("a"));
    show.value = false;
    await nextTick();
    press("ArrowDown");
    expect(focusedId()).toBe("top");
  });

  it("returns false when nothing can receive the focus", () => {
    mount({ template: `<div v-epg-group><div v-epg-item="{ disabled: true }"></div></div>` });
    expect(epg.navigate("down")).toBe(false);
  });

  it("gives the same result on Vue 2 and Vue 3 when an unkeyed v-if swaps the focused button", async () => {
    const step = ref(1);
    mount({
      template: `<div v-epg-group>
        <div id="ok" v-if="step === 1" v-epg-item style="${box(0, 0, 50, 50)}"></div>
        <div id="done" v-else v-epg-item style="${box(0, 0, 50, 50)}"></div>
        <div id="cancel" v-epg-item style="${box(60, 0, 50, 50)}"></div>
      </div>`,
      setup: () => ({ step }),
    });
    const original = byId("ok");
    epg.move(original);
    step.value = 2;
    await nextTick();
    // Vue 2 复用了同一个元素，焦点仍在其上；Vue 3 替换了元素，焦点在下一次按键时于分组内恢复
    const isVue2 = document.querySelector("#done") === original;
    expect(epg.getCurrentItem()?.el.id ?? null).toBe(isVue2 ? "done" : null);
    press("ArrowRight");
    expect(focusedId()).toBe(isVue2 ? "cancel" : "done");
  });
});

describe("disabled focused item", () => {
  const LAYOUT = `<div>
    <div v-epg-group="{ default: true }">
      <div id="t" v-epg-item style="${box(0, 0, 50, 50)}"></div>
    </div>
    <div v-epg-group>
      <div id="buy" v-epg-item="{ disabled }" style="${box(0, 100, 50, 50)}" @click="onClick"></div>
      <div id="below" v-epg-item style="${box(0, 160, 50, 50)}"></div>
    </div>
  </div>`;

  it("keeps serving as the origin of the next move", async () => {
    const disabled = ref(false);
    mount({ template: LAYOUT, setup: () => ({ disabled, onClick: () => undefined }) });
    epg.move(byId("buy"));
    disabled.value = true;
    await nextTick();
    expect(focusedId()).toBe("buy");
    expect(epg.findTarget("down")?.el.id).toBe("below");
    press("ArrowDown");
    expect(focusedId()).toBe("below");
    expect(epg.move("up")).toBe(true);
    expect(focusedId()).toBe("t");
  });

  it("supports programmatic moves from a disabled item", async () => {
    const disabled = ref(false);
    mount({ template: LAYOUT, setup: () => ({ disabled, onClick: () => undefined }) });
    epg.move(byId("buy"));
    disabled.value = true;
    await nextTick();
    expect(epg.move("down")).toBe(true);
    expect(focusedId()).toBe("below");
  });
});
