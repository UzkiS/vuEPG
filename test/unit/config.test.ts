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
    });
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
