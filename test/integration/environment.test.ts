import { vueVersion } from "#mount";
import { expect, it } from "vitest";
import { version } from "vue";

it("runs against the Vue version of the current test project", () => {
  expect(version.startsWith(`${String(vueVersion)}.`)).toBe(true);
});
