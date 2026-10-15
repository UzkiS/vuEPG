import { mount } from "#mount";
import { describe, expect, it, vi } from "vitest";
import { useVuEPG } from "../../src";
import { byId, focusedId } from "../helpers/dom";
import { press } from "../helpers/keyboard";
import { box } from "../helpers/layout";

const epg = useVuEPG();

const sendFrom = (el: Element, code: string): KeyboardEvent => {
  const event = new KeyboardEvent("keydown", { code, bubbles: true, cancelable: true });
  el.dispatchEvent(event);
  return event;
};

describe("editable keyboard targets", () => {
  it("leaves text editing keys to the browser while retaining up and remote back", () => {
    const backHandler = vi.fn();
    mount(
      {
        template: `<div>
          <div id="left" v-epg-item style="${box(0, 0, 50, 50)}"></div>
          <div id="right" v-epg-item style="${box(60, 0, 50, 50)}"></div>
          <input id="input" />
        </div>`,
      },
      { backHandler },
    );
    epg.move(byId("right"));
    const input = byId("input");
    expect(sendFrom(input, "ArrowLeft").defaultPrevented).toBe(false);
    expect(sendFrom(input, "Backspace").defaultPrevented).toBe(false);
    expect(focusedId()).toBe("right");
    expect(backHandler).not.toHaveBeenCalled();
    expect(sendFrom(input, "ArrowUp").defaultPrevented).toBe(true);
    expect(sendFrom(input, "Escape").defaultPrevented).toBe(true);
    expect(backHandler).toHaveBeenCalledOnce();
  });

  it("handles remote keys on non-text inputs", () => {
    mount({
      template: `<div>
        <div id="left" v-epg-item style="${box(0, 0, 50, 50)}"></div>
        <div id="right" v-epg-item style="${box(60, 0, 50, 50)}"></div>
        <input id="button" type="button" />
      </div>`,
    });
    epg.move(byId("right"));
    expect(sendFrom(byId("button"), "ArrowLeft").defaultPrevented).toBe(true);
    expect(focusedId()).toBe("left");
  });

  it("leaves editing keys to textarea and select elements", () => {
    mount({
      template: `<div><textarea id="notes"></textarea><select id="choices"></select></div>`,
    });
    expect(sendFrom(byId("notes"), "Backspace").defaultPrevented).toBe(false);
    expect(sendFrom(byId("choices"), "ArrowLeft").defaultPrevented).toBe(false);
  });
});

describe("leaving an editable element", () => {
  const FORM = `<div>
    <div id="a" v-epg-item style="${box(0, 0, 50, 50)}"></div>
    <div id="b" v-epg-item style="${box(60, 0, 50, 50)}"></div>
    <label id="field" v-epg-item style="${box(0, 100, 110, 50)}"><input id="input" /></label>
  </div>`;

  it("blurs the input once the focus moves elsewhere, so other keys navigate again", () => {
    mount({ template: FORM });
    epg.move(byId("field"));
    byId("input").focus();
    expect(sendFrom(byId("input"), "ArrowUp").defaultPrevented).toBe(true);
    expect(focusedId()).toBe("a");
    expect(document.activeElement).toBe(document.body);
    press("ArrowRight");
    expect(focusedId()).toBe("b");
  });

  it("keeps the input focused while the focus stays on the item that contains it", () => {
    mount({ template: FORM });
    epg.move(byId("a"));
    byId("input").focus();
    epg.move(byId("field"));
    expect(document.activeElement).toBe(byId("input"));
  });
});

describe("keys inside editable elements", () => {
  const sendLegacyFrom = (el: Element, keyCode: number): KeyboardEvent => {
    const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "code", { value: undefined });
    Object.defineProperty(event, "keyCode", { value: keyCode });
    Object.defineProperty(event, "which", { value: keyCode });
    el.dispatchEvent(event);
    return event;
  };

  it("handles codes added to UP / DOWN / BACK unless they type text", () => {
    const backHandler = vi.fn();
    mount({ template: `<div><input id="input" /></div>` }, { backHandler });
    epg.addKeyCodes("BACK", ["BrowserBack"]);
    epg.addKeyCodes("DOWN", ["KeyJ"]);
    expect(sendFrom(byId("input"), "BrowserBack").defaultPrevented).toBe(true);
    expect(backHandler).toHaveBeenCalledOnce();
    expect(sendFrom(byId("input"), "KeyJ").defaultPrevented).toBe(false);
  });

  it("leaves numeric text keys to the browser on legacy kernels", () => {
    mount({ template: `<div><input id="input" /></div>` });
    const input = byId("input");
    // 87 W（UP）· 47 Android S（DOWN）· 8 退格（BACK）
    for (const keyCode of [87, 47, 8]) {
      expect(sendLegacyFrom(input, keyCode).defaultPrevented, String(keyCode)).toBe(false);
    }
    // 自定义的标点键值仍属于文字输入
    epg.addKeyCodes("BACK", [222]);
    expect(sendLegacyFrom(input, 222).defaultPrevented).toBe(false);
    // 38 上方向键 · 19 Android 上方向键 · 4 Android 返回键
    for (const keyCode of [38, 19, 4]) {
      expect(sendLegacyFrom(input, keyCode).defaultPrevented, String(keyCode)).toBe(true);
    }
  });

  it("ignores keys that belong to an input method composition", () => {
    const backHandler = vi.fn();
    mount(
      {
        template: `<div>
          <div id="a" v-epg-item style="${box(0, 0, 50, 50)}"></div>
          <div id="b" v-epg-item style="${box(0, 60, 50, 50)}"></div>
          <input id="input" />
        </div>`,
      },
      { backHandler },
    );
    epg.move(byId("a"));
    const input = byId("input");
    const composing = new KeyboardEvent("keydown", {
      code: "ArrowDown",
      isComposing: true,
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(composing);
    expect(composing.defaultPrevented).toBe(false);
    expect(focusedId()).toBe("a");
    // 不支持 isComposing 的内核以 keyCode 229 标记输入法按键
    const legacy = new KeyboardEvent("keydown", {
      code: "Escape",
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(legacy, "keyCode", { value: 229 });
    input.dispatchEvent(legacy);
    expect(legacy.defaultPrevented).toBe(false);
    expect(backHandler).not.toHaveBeenCalled();
  });
});
