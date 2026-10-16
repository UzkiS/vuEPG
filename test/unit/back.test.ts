import { describe, expect, it, vi } from "vitest";
import { back, registerBackHandler } from "../../src/core/back";
import { setConfig } from "../../src/core";

describe("back registry", () => {
  it("prefers the latest active registration", () => {
    const first = vi.fn();
    const second = vi.fn();
    const a = registerBackHandler(first);
    const b = registerBackHandler(second);
    a.activate();
    back();
    expect(first).toHaveBeenCalledOnce();
    b.activate();
    back();
    expect(second).toHaveBeenCalledOnce();
    b.deactivate();
    back();
    expect(first).toHaveBeenCalledTimes(2);
  });

  it("ignores repeated dispose calls without touching other registrations", () => {
    const keep = vi.fn();
    registerBackHandler(keep).activate();
    const entry = registerBackHandler(vi.fn());
    entry.dispose();
    entry.dispose();
    back();
    expect(keep).toHaveBeenCalledOnce();
  });
});

describe("passing Back on", () => {
  it("moves to the next active handler when a handler returns false", () => {
    const calls: string[] = [];
    registerBackHandler(() => {
      calls.push("page");
    }).activate();
    registerBackHandler(() => {
      calls.push("list");
      return false;
    }).activate();
    expect(back()).toBe(true);
    expect(calls).toEqual(["list", "page"]);
  });

  it("falls back to the global backHandler and reports unhandled Back", () => {
    registerBackHandler(() => false).activate();
    expect(back()).toBe(false);
    const global = vi.fn(() => false);
    setConfig({ backHandler: global });
    expect(back()).toBe(false);
    expect(global).toHaveBeenCalledOnce();
    setConfig({ backHandler: () => undefined });
    expect(back()).toBe(true);
  });

  it("keeps the call order when a handler disposes registrations", () => {
    const calls: string[] = [];
    const page = registerBackHandler(() => {
      calls.push("page");
    });
    page.activate();
    const dialog = registerBackHandler(() => {
      calls.push("dialog");
      dialog.dispose();
      page.dispose();
      return false;
    });
    dialog.activate();
    back();
    expect(calls).toEqual(["dialog", "page"]);
  });
});
