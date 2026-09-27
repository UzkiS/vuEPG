import { describe, expect, it, vi } from "vitest";
import { back, registerBackHandler } from "../../src/core/back";

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
