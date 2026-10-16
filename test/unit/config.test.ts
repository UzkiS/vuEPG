import { describe, expect, it } from "vitest";
import { useVuEPG } from "../../src";

describe("config", () => {
  const epg = useVuEPG();

  it("provides defaults", () => {
    expect(epg.getConfig()).toEqual({
      focusClass: "vuepg-focus",
      backHandler: null,
      debug: false,
      scrollViewport: false,
      restoreFocus: false,
      keyRepeatInterval: 0,
    });
  });

  it("accepts key repeat intervals and rejects invalid values", () => {
    epg.setConfig({ keyRepeatInterval: 150 });
    expect(epg.getConfig().keyRepeatInterval).toBe(150);
    for (const value of [-1, Number.NaN, Number.POSITIVE_INFINITY, "100"]) {
      expect(() => {
        epg.setConfig({ keyRepeatInterval: value as number });
      }, String(value)).toThrow(TypeError);
    }
    expect(epg.getConfig().keyRepeatInterval).toBe(150);
  });

  it("ignores fields whose value is undefined", () => {
    const handler = (): void => undefined;
    epg.setConfig({ focusClass: "focused", backHandler: handler, scrollViewport: "start" });
    // JavaScript 调用方，或未开启 exactOptionalPropertyTypes 的 TypeScript 工程
    const patch = { focusClass: undefined, backHandler: undefined, scrollViewport: undefined };
    epg.setConfig(patch as unknown as Parameters<typeof epg.setConfig>[0]);
    expect(epg.getConfig()).toMatchObject({
      focusClass: "focused",
      backHandler: handler,
      scrollViewport: "start",
    });
    epg.setConfig({ backHandler: null });
    expect(epg.getConfig().backHandler).toBeNull();
  });

  it("merges partial updates", () => {
    epg.setConfig({ debug: true });
    epg.setConfig({ focusClass: "focused" });
    expect(epg.getConfig()).toMatchObject({ focusClass: "focused", debug: true });
  });

  it("rejects invalid focus classes", () => {
    expect(() => {
      epg.setConfig({ focusClass: "" });
    }).toThrow(TypeError);
    expect(() => {
      epg.setConfig({ focusClass: "two words" });
    }).toThrow(TypeError);
    expect(epg.getConfig().focusClass).toBe("vuepg-focus");
  });

  it("accepts viewport scroll modes and rejects invalid values", () => {
    epg.setConfig({ scrollViewport: "center" });
    expect(epg.getConfig().scrollViewport).toBe("center");
    expect(() => {
      epg.setConfig({ scrollViewport: "smooth" as "center" });
    }).toThrow(TypeError);
    expect(epg.getConfig().scrollViewport).toBe("center");
  });
});
