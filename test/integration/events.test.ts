import { mount } from "#mount";
import { describe, expect, it, vi } from "vitest";
import { useVuEPG, type EPGEvent } from "../../src";
import { byId, focusedId } from "../helpers/dom";
import { press } from "../helpers/keyboard";
import { box } from "../helpers/layout";

const epg = useVuEPG();

const TWO_GROUPS = `<div>
  <div id="g1" v-epg-group @epg-enter="log('enter g1')" @epg-leave="log('leave g1')" @epg-down="log('down g1')">
    <div id="a" v-epg-item style="${box(0, 0, 50, 50)}"
      @epg-focus="log('focus a')" @epg-blur="log('blur a')" @epg-down="log('down a')"></div>
    <div id="a2" v-epg-item style="${box(60, 0, 50, 50)}" @epg-focus="log('focus a2')" @epg-blur="log('blur a2')"></div>
  </div>
  <div id="g2" v-epg-group @epg-enter="log('enter g2')" @epg-leave="log('leave g2')">
    <div id="b" v-epg-item style="${box(0, 60, 50, 50)}" @epg-focus="log('focus b')" @epg-blur="log('blur b')"></div>
  </div>
</div>`;

const setupLog = (): { log: (entry: string) => void; entries: string[] } => {
  const entries: string[] = [];
  return { entries, log: (entry) => entries.push(entry) };
};

describe("focus events", () => {
  it("dispatches blur → leave → enter → focus in order", () => {
    const { log, entries } = setupLog();
    mount({ template: TWO_GROUPS, setup: () => ({ log }) });
    epg.move(byId("a"));
    expect(entries).toEqual(["enter g1", "focus a"]);
    entries.length = 0;
    epg.move(byId("b"));
    expect(entries).toEqual(["blur a", "leave g1", "enter g2", "focus b"]);
  });

  it("does not re-enter groups that remain focused", () => {
    const { log, entries } = setupLog();
    mount({ template: TWO_GROUPS, setup: () => ({ log }) });
    epg.move(byId("a"));
    entries.length = 0;
    epg.move(byId("a2"));
    expect(entries).toEqual(["blur a", "focus a2"]);
  });

  it("passes the node in the event detail", () => {
    const onFocus = vi.fn<(event: EPGEvent<"epg-focus">) => void>();
    mount({
      template: `<div id="a" v-epg-item style="${box(0, 0, 50, 50)}" @epg-focus="onFocus"></div>`,
      setup: () => ({ onFocus }),
    });
    epg.move(byId("a"));
    expect(onFocus.mock.calls[0]?.[0].detail.item).toBe(epg.getCurrentItem());
  });

  it("stops dispatching once a handler moves the focus elsewhere", () => {
    const { log, entries } = setupLog();
    mount({
      template: `<div>
        <div id="a" v-epg-item style="${box(0, 0, 50, 50)}" @epg-blur="redirect"></div>
        <div id="b" v-epg-item style="${box(0, 60, 50, 50)}" @epg-focus="log('focus b')"></div>
        <div id="c" v-epg-item style="${box(0, 120, 50, 50)}" @epg-focus="log('focus c')"></div>
      </div>`,
      setup: () => ({ log, redirect: () => epg.move(byId("c")) }),
    });
    epg.move(byId("a"));
    expect(epg.move(byId("b"))).toBe(false);
    expect(entries).toEqual(["focus c"]);
    expect(focusedId()).toBe("c");
  });
});

describe("re-entrant focus changes", () => {
  const LAYOUT = `<div>
    <div v-epg-group @epg-leave="onLeave">
      <div id="a" v-epg-item style="${box(0, 0, 50, 50)}" @epg-blur="onBlur"></div>
    </div>
    <div v-epg-group @epg-enter="log('enter g2')">
      <div id="b" v-epg-item style="${box(0, 60, 50, 50)}" @epg-focus="log('focus b')"></div>
    </div>
    <div id="c" v-epg-item style="${box(0, 120, 50, 50)}"></div>
  </div>`;

  it.each(["blur", "leave"])("stops when a %s handler redirects the focus", (event) => {
    const { log, entries } = setupLog();
    const redirect = (): boolean => epg.move(byId("c"));
    const noop = (): void => undefined;
    mount({
      template: LAYOUT,
      setup: () => ({
        log,
        onBlur: event === "blur" ? redirect : noop,
        onLeave: event === "leave" ? redirect : noop,
      }),
    });
    epg.move(byId("a"));
    expect(epg.move(byId("b"))).toBe(false);
    expect(entries).toEqual([]);
    expect(focusedId()).toBe("c");
  });
});

describe("direction events", () => {
  it("fires on the item, then on each group being left, then moves", () => {
    const { log, entries } = setupLog();
    mount({ template: TWO_GROUPS, setup: () => ({ log }) });
    epg.move(byId("a"));
    entries.length = 0;
    press("ArrowDown");
    expect(entries).toEqual(["down a", "down g1", "blur a", "leave g1", "enter g2", "focus b"]);
  });

  it("does not fire group events when staying inside the group", () => {
    const { log, entries } = setupLog();
    mount({ template: TWO_GROUPS, setup: () => ({ log }) });
    epg.move(byId("a2"));
    entries.length = 0;
    press("ArrowLeft");
    expect(entries).toEqual(["blur a2", "focus a"]);
  });

  it("is not fired by programmatic moves", () => {
    const { log, entries } = setupLog();
    mount({ template: TWO_GROUPS, setup: () => ({ log }) });
    epg.move(byId("a"));
    entries.length = 0;
    expect(epg.down()).toBe(true);
    expect(entries).not.toContain("down a");
  });

  it("cancels the default move with .prevent on the item", () => {
    mount({
      template: `<div>
        <div id="a" v-epg-item style="${box(0, 0, 50, 50)}" @epg-down.prevent></div>
        <div id="b" v-epg-item style="${box(0, 60, 50, 50)}"></div>
      </div>`,
    });
    epg.move(byId("a"));
    press("ArrowDown");
    expect(focusedId()).toBe("a");
  });

  it("cancels the default move with .prevent on a group being left", () => {
    mount({
      template: `<div>
        <div v-epg-group @epg-down.prevent>
          <div id="a" v-epg-item style="${box(0, 0, 50, 50)}"></div>
        </div>
        <div id="b" v-epg-item style="${box(0, 60, 50, 50)}"></div>
      </div>`,
    });
    epg.move(byId("a"));
    press("ArrowDown");
    expect(focusedId()).toBe("a");
  });

  it("skips the default move when the handler moves the focus itself", () => {
    mount({
      template: `<div>
        <div id="top" v-epg-item style="${box(0, 0, 50, 50)}"></div>
        <div id="a" v-epg-item style="${box(0, 60, 50, 50)}" @epg-down="$epg.move('up')"></div>
        <div id="b" v-epg-item style="${box(0, 120, 50, 50)}"></div>
      </div>`,
    });
    epg.move(byId("a"));
    press("ArrowDown");
    expect(focusedId()).toBe("top");
  });

  it("does nothing when no target exists in the direction", () => {
    const onDown = vi.fn();
    mount({
      template: `<div id="a" v-epg-item style="${box(0, 0, 50, 50)}" @epg-down="onDown"></div>`,
      setup: () => ({ onDown }),
    });
    epg.move(byId("a"));
    press("ArrowDown");
    expect(onDown).toHaveBeenCalledOnce();
    expect(focusedId()).toBe("a");
  });
});

describe("direction events bubble until the move is resolved", () => {
  const ROW = `<div>
    <div id="row" v-epg-group @epg-right="onRowRight">
      <div id="r1" v-epg-item style="${box(0, 0, 50, 50)}"></div>
      <div id="r2" v-epg-item style="${box(60, 0, 50, 50)}"></div>
    </div>
  </div>`;

  it("fires on the group at the edge of the page, where no target exists at all", () => {
    const { log, entries } = setupLog();
    mount({
      template: ROW,
      setup: () => ({
        onRowRight: () => {
          log("row right");
        },
      }),
    });
    epg.move(byId("r2"));
    press("ArrowRight");
    expect(entries).toEqual(["row right"]);
  });

  it("lets a group wrap around by moving the focus itself", () => {
    mount({
      template: ROW,
      setup: () => ({
        onRowRight: () => {
          epg.move(byId("r1"));
        },
      }),
    });
    epg.move(byId("r2"));
    press("ArrowRight");
    expect(focusedId()).toBe("r1");
  });

  it("stops bubbling once the group handler cancels the move", () => {
    const { log, entries } = setupLog();
    mount({
      template: `<div v-epg-group @epg-right="log('outer')">
        <div v-epg-group @epg-right.prevent="log('inner')">
          <div id="a" v-epg-item style="${box(0, 0, 50, 50)}"></div>
        </div>
        <div id="b" v-epg-item style="${box(100, 0, 50, 50)}"></div>
      </div>`,
      setup: () => ({ log }),
    });
    epg.move(byId("a"));
    press("ArrowRight");
    expect(entries).toEqual(["inner"]);
    expect(focusedId()).toBe("a");
  });

  it("fires on every ancestor group at the edge, from the inside out", () => {
    const { log, entries } = setupLog();
    mount({
      template: `<div v-epg-group @epg-up="log('outer')">
        <div v-epg-group @epg-up="log('inner')">
          <div id="a" v-epg-item style="${box(0, 0, 50, 50)}"></div>
        </div>
      </div>`,
      setup: () => ({ log }),
    });
    epg.move(byId("a"));
    press("ArrowUp");
    expect(entries).toEqual(["inner", "outer"]);
  });
});

describe("navigate", () => {
  it("behaves exactly like a key press, including direction events and .prevent", () => {
    const { log, entries } = setupLog();
    mount({ template: TWO_GROUPS, setup: () => ({ log }) });
    epg.move(byId("a"));
    entries.length = 0;
    expect(epg.navigate("down")).toBe(true);
    expect(entries).toEqual(["down a", "down g1", "blur a", "leave g1", "enter g2", "focus b"]);
  });

  it("returns false when the move is cancelled", () => {
    mount({
      template: `<div>
        <div id="a" v-epg-item style="${box(0, 0, 50, 50)}" @epg-down.prevent></div>
        <div id="b" v-epg-item style="${box(0, 60, 50, 50)}"></div>
      </div>`,
    });
    epg.move(byId("a"));
    expect(epg.navigate("down")).toBe(false);
    expect(epg.navigate("up")).toBe(false);
  });

  it("returns true when a direction handler moves the focus itself", () => {
    mount({
      template: `<div>
        <div id="top" v-epg-item style="${box(0, 0, 50, 50)}"></div>
        <div id="a" v-epg-item style="${box(0, 60, 50, 50)}" @epg-down="$epg.move('up')"></div>
      </div>`,
    });
    epg.move(byId("a"));
    expect(epg.navigate("down")).toBe(true);
    expect(focusedId()).toBe("top");
  });

  it("focuses the page entry when nothing is focused yet", () => {
    mount({ template: TWO_GROUPS, setup: () => ({ log: () => undefined }) });
    expect(epg.navigate("right")).toBe(true);
    expect(focusedId()).toBe("a");
  });

  it("rejects invalid directions", () => {
    expect(() => epg.navigate("forward" as "up")).toThrow(TypeError);
  });
});
