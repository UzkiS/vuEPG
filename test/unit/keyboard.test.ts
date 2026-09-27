import { describe, expect, it, vi } from "vitest";
import {
  addKeyCodes,
  getKeyActions,
  handleKeydown,
  isPaused,
  pause,
  removeKeyAction,
  removeKeyCodes,
  resolveKeyCode,
  resume,
  setKeyAction,
  updateKeyAction,
} from "../../src/core/keyboard";

/** `legacy` 模拟老旧浏览器提供的 which / keyCode */
const keydown = ({ code, legacy }: { code?: string; legacy?: number }): KeyboardEvent => {
  const event = new KeyboardEvent("keydown", { cancelable: true, code: code ?? "" });
  if (legacy !== undefined) {
    Object.defineProperty(event, "keyCode", { value: legacy });
    Object.defineProperty(event, "which", { value: legacy });
  }
  return event;
};

describe("resolveKeyCode", () => {
  it("prefers event.code", () => {
    expect(resolveKeyCode(keydown({ code: "ArrowUp", legacy: 38 }))).toBe("ArrowUp");
  });

  it("falls back to which / keyCode when code is missing or unidentified", () => {
    expect(resolveKeyCode(keydown({ legacy: 19 }))).toBe(19);
    expect(resolveKeyCode(keydown({ code: "Unidentified", legacy: 19 }))).toBe(19);
  });

  it("returns null when no key information is available", () => {
    expect(resolveKeyCode(keydown({}))).toBeNull();
  });
});

describe("key action registry", () => {
  it("ships the default actions", () => {
    const actions = getKeyActions();
    expect(Object.keys(actions)).toEqual([
      "UP",
      "DOWN",
      "LEFT",
      "RIGHT",
      "ENTER",
      "BACK",
      "PAGE",
      "NUMBER",
    ]);
    expect(actions["NUMBER"]?.preventDefault).toBe(false);
    expect(Object.isFrozen(actions)).toBe(true);
  });

  it("creates actions with de-duplicated codes and sensible defaults", () => {
    setKeyAction("MENU", { codes: ["KeyM", 77, 77] });
    expect(getKeyActions()["MENU"]).toEqual({
      codes: ["KeyM", 77],
      preventDefault: false,
      callback: null,
    });
  });

  it("updates only the given fields", () => {
    const callback = vi.fn();
    setKeyAction("MENU", { codes: ["KeyM"], preventDefault: true, callback });
    updateKeyAction("MENU", { preventDefault: false });
    expect(getKeyActions()["MENU"]).toEqual({ codes: ["KeyM"], preventDefault: false, callback });
    updateKeyAction("MENU", { callback: null });
    expect(getKeyActions()["MENU"]?.callback).toBeNull();
  });

  it("adds and removes codes", () => {
    addKeyCodes("ENTER", [66, "Space"]);
    expect(getKeyActions()["ENTER"]?.codes).toContain("Space");
    removeKeyCodes("ENTER", ["Space", 13]);
    expect(getKeyActions()["ENTER"]?.codes).not.toContain("Space");
    expect(getKeyActions()["ENTER"]?.codes).not.toContain(13);
  });

  it("removes custom actions but protects built-in ones", () => {
    setKeyAction("MENU", { codes: ["KeyM"] });
    expect(removeKeyAction("MENU")).toBe(true);
    expect(removeKeyAction("MENU")).toBe(false);
    expect(removeKeyAction("PAGE")).toBe(true);
    expect(() => removeKeyAction("ENTER")).toThrow(/不可删除/);
  });

  it("throws when modifying an unknown action", () => {
    expect(() => {
      updateKeyAction("NOPE", { preventDefault: true });
    }).toThrow(/不存在/);
    expect(() => {
      addKeyCodes("NOPE", [1]);
    }).toThrow(/不存在/);
    expect(() => {
      removeKeyCodes("NOPE", [1]);
    }).toThrow(/不存在/);
  });
});

describe("handleKeydown", () => {
  it("invokes the callback with the resolved code and event", () => {
    const callback = vi.fn();
    setKeyAction("MENU", { codes: ["KeyM"], preventDefault: true, callback });
    const event = keydown({ code: "KeyM" });
    handleKeydown(event);
    expect(callback).toHaveBeenCalledWith("KeyM", event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("leaves the default behaviour alone when preventDefault is false", () => {
    const event = keydown({ code: "Digit1" });
    handleKeydown(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("ignores unknown keys and keys without information", () => {
    const unknown = keydown({ code: "KeyQ" });
    handleKeydown(unknown);
    handleKeydown(keydown({}));
    expect(unknown.defaultPrevented).toBe(false);
  });

  it("ignores every key while paused", () => {
    const callback = vi.fn();
    setKeyAction("MENU", { codes: ["KeyM"], callback });
    pause();
    expect(isPaused()).toBe(true);
    handleKeydown(keydown({ code: "KeyM" }));
    expect(callback).not.toHaveBeenCalled();
    resume();
    expect(isPaused()).toBe(false);
    handleKeydown(keydown({ code: "KeyM" }));
    expect(callback).toHaveBeenCalledOnce();
  });
});
