import { describe, expect, it, vi } from "vitest";
import VuEPG, { useVuEPG } from "../../src";

describe("without a DOM (SSR)", () => {
  it("installs without touching document", () => {
    const app = { directive: vi.fn(), config: { globalProperties: {} } };
    vi.stubGlobal("document", undefined);
    try {
      VuEPG.install(app);
      expect(useVuEPG().getChildren()).toEqual([]);
    } finally {
      vi.unstubAllGlobals();
    }
    expect(app.directive).toHaveBeenCalledTimes(3);
    expect(Object.keys(app.config.globalProperties)).toEqual(["$epg"]);
  });
});
