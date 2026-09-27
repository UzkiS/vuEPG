import { unmountAll } from "#mount";
import { afterEach, beforeAll, beforeEach, vi } from "vitest";
import { resetCore } from "../src/core";
import { installLayout } from "./helpers/layout";

beforeAll(() => {
  installLayout();
});

beforeEach(() => {
  // 插件横幅与调试日志不干扰测试输出
  vi.spyOn(console, "log").mockImplementation(() => undefined);
});

afterEach(() => {
  unmountAll();
  resetCore();
  document.body.innerHTML = "";
});
