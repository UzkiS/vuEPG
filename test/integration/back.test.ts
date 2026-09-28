import { mount } from "#mount";
import { describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import { useVuEPG } from "../../src";
import { press, pressLegacy } from "../helpers/keyboard";

const epg = useVuEPG();

describe("back", () => {
  it("does nothing without handlers", () => {
    expect(() => {
      epg.back();
    }).not.toThrow();
  });

  it("calls the global backHandler on the BACK key", () => {
    const backHandler = vi.fn();
    mount({ template: `<div></div>` }, { backHandler });
    press("Backspace");
    press("Escape");
    expect(backHandler).toHaveBeenCalledTimes(2);
  });

  it("accepts Tizen and webOS legacy back codes", () => {
    const backHandler = vi.fn();
    mount({ template: `<div></div>` }, { backHandler });
    pressLegacy(10009);
    pressLegacy(461);
    expect(backHandler).toHaveBeenCalledTimes(2);
  });

  it("lets onBack take over while the component is mounted", async () => {
    const backHandler = vi.fn();
    const page = vi.fn();
    const show = ref(true);
    mount(
      {
        template: `<div><Page v-if="show" /></div>`,
        components: {
          Page: {
            template: `<div></div>`,
            setup: () => {
              epg.onBack(page);
              return {};
            },
          },
        },
        setup: () => ({ show }),
      },
      { backHandler },
    );
    epg.back();
    expect(page).toHaveBeenCalledOnce();
    expect(backHandler).not.toHaveBeenCalled();

    show.value = false;
    await nextTick();
    epg.back();
    expect(backHandler).toHaveBeenCalledOnce();
  });

  it("stacks nested handlers so the innermost one wins", async () => {
    const outer = vi.fn();
    const inner = vi.fn();
    const dialog = ref(true);
    mount({
      template: `<div><Dialog v-if="dialog" /></div>`,
      components: {
        Dialog: {
          template: `<div></div>`,
          setup: () => {
            epg.onBack(inner);
            return {};
          },
        },
      },
      setup: () => {
        epg.onBack(outer);
        return { dialog };
      },
    });
    epg.back();
    expect(inner).toHaveBeenCalledOnce();

    dialog.value = false;
    await nextTick();
    epg.back();
    expect(outer).toHaveBeenCalledOnce();
    expect(inner).toHaveBeenCalledOnce();
  });

  it("follows KeepAlive activation", async () => {
    const first = vi.fn();
    const second = vi.fn();
    const view = ref("First");
    const page = (handler: () => void): { template: string; setup: () => object } => ({
      template: `<div></div>`,
      setup: () => {
        epg.onBack(handler);
        return {};
      },
    });
    mount({
      template: `<div><keep-alive><component :is="view" /></keep-alive></div>`,
      components: { First: page(first), Second: page(second) },
      setup: () => ({ view }),
    });
    epg.back();
    expect(first).toHaveBeenCalledTimes(1);

    view.value = "Second";
    await nextTick();
    epg.back();
    expect(second).toHaveBeenCalledTimes(1);
    expect(first).toHaveBeenCalledTimes(1);

    view.value = "First";
    await nextTick();
    epg.back();
    expect(first).toHaveBeenCalledTimes(2);
  });

  it("works from the Options API created() hook", () => {
    const handler = vi.fn();
    mount({
      template: `<div></div>`,
      created: () => {
        epg.onBack(handler);
      },
    });
    epg.back();
    expect(handler).toHaveBeenCalledOnce();
  });
});
