import { mount } from "#mount";
import { describe, expect, it, vi } from "vitest";
import { useVuEPG } from "../../src";
import { byId, focusedId } from "../helpers/dom";
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
