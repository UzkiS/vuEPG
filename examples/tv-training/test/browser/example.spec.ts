import type { VuEPG } from "vuepg";
import { expect, test } from "@playwright/test";

const missingApis = (): void => {
  for (const name of ["Map", "Set", "Symbol", "CustomEvent", "Array.from", "Object.assign"]) {
    const parts = name.split(".");
    const property = parts[parts.length - 1];
    const target = parts.length === 1 ? window : parts[0] === "Array" ? Array : Object;
    if (property !== undefined) {
      Object.defineProperty(target, property, {
        value: undefined,
        configurable: true,
        writable: true,
      });
    }
  }
};

test("兼容产物在缺失 API 后正常启动、循环导航、滚动与返回记忆", async ({ page }) => {
  await page.route("**/assets/app.js", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      body: `(${missingApis.toString()})();\n${await response.text()}`,
    });
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => {
    errors.push(error.stack ?? error.message);
  });
  await page.goto("/");
  await expect(page.getByTestId("start")).toHaveClass(/vuepg-focus/);
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("lesson-1")).toHaveClass(/vuepg-focus/);
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByTestId("lesson-12")).toHaveClass(/vuepg-focus/);
  expect(await page.getByTestId("lesson-scroll").evaluate((el) => el.scrollLeft)).toBeGreaterThan(
    0,
  );
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("lesson-1")).toHaveClass(/vuepg-focus/);
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("complete")).toHaveClass(/vuepg-focus/);
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("lesson-2")).toHaveClass(/vuepg-focus/);
  expect(errors).toEqual([]);
});

test("弹窗隔离、返回优先级与关闭复焦", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("exit-open").click();
  await expect(page.getByTestId("dialog-cancel")).toHaveClass(/vuepg-focus/);
  await page.keyboard.press("Tab");
  await expect(page.getByTestId("dialog-confirm")).toHaveClass(/vuepg-focus/);
  await expect(page.getByTestId("dialog-confirm")).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByTestId("dialog-cancel")).toHaveClass(/vuepg-focus/);
  await expect(page.getByTestId("dialog-cancel")).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByTestId("dialog-cancel")).toHaveClass(/vuepg-focus/);
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("dialog-confirm")).toHaveClass(/vuepg-focus/);
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("dialog-confirm")).toHaveClass(/vuepg-focus/);
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("dialog-cancel")).toHaveCount(0);
  await expect(page.getByTestId("start")).toHaveClass(/vuepg-focus/);
});

test("完成练习后恢复业务位置与原生桥", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Enter");
  await page.getByTestId("native-right").click();
  await expect(page.getByTestId("lesson-2")).toHaveClass(/vuepg-focus/);
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("dialog-cancel")).toHaveClass(/vuepg-focus/);
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("lesson-2")).toHaveClass(/vuepg-focus/);
  await page.getByTestId("filter-completed").click();
  await expect(page.getByTestId("lesson-2")).toHaveCount(0);
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("lesson-1")).toHaveClass(/vuepg-focus/);
  await page.getByTestId("native-back").click();
  await expect(page.getByTestId("start")).toHaveClass(/vuepg-focus/);
});

for (const port of [5174, 5175]) {
  test(`开发入口 ${String(port)} 可以启动与导航`, async ({ page }) => {
    if (port === 5174) {
      await page.route("**/assets/app.js", async (route) => {
        const response = await route.fetch();
        await route.fulfill({
          response,
          body: `(${missingApis.toString()})();\n${await response.text()}`,
        });
      });
    }
    const errors: string[] = [];
    page.on("pageerror", (error) => {
      errors.push(error.stack ?? error.message);
    });
    await page.goto(`http://127.0.0.1:${String(port)}/`);
    await expect(page.getByTestId("start")).toHaveClass(/vuepg-focus/);
    await page.keyboard.press("Enter");
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("lesson-2")).toHaveClass(/vuepg-focus/);
    expect(errors).toEqual([]);
  });
}

test("弹窗原焦点失效后回退到可用入口", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("exit-open").click();
  await expect(page.getByTestId("dialog-cancel")).toHaveClass(/vuepg-focus/);
  await page.getByTestId("start").evaluate((element) => {
    element.style.display = "none";
  });
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("home-nav")).toHaveClass(/vuepg-focus/);
});

test("原生方向、确定与返回在暂停期间不执行，释放后恢复", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("lesson-1")).toHaveClass(/vuepg-focus/);
  await page.evaluate(() => {
    const element = document.querySelector(".example-shell");
    if (element === null) {
      throw new Error("[vuEPG] 示例根元素不存在");
    }
    const app = element as HTMLElement & {
      __vue__: { $epg: VuEPG };
    };
    const release = app.__vue__.$epg.pause();
    window.addEventListener("test-release-pause", release, { once: true });
  });
  for (const keyCode of [22, 23, 4]) {
    await page.evaluate((code) => {
      window.dispatchEvent(new CustomEvent("vuepg-native-key", { detail: { keyCode: code } }));
    }, keyCode);
    await expect(page.getByTestId("lesson-1")).toHaveClass(/vuepg-focus/);
  }
  await page.evaluate(() => {
    window.dispatchEvent(new Event("test-release-pause"));
  });
  await page.getByTestId("native-right").click();
  await expect(page.getByTestId("lesson-2")).toHaveClass(/vuepg-focus/);
});

test("全部完成后筛选显示空状态，恢复列表没有多余滚动空间", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Enter");
  for (let id = 1; id <= 12; id += 1) {
    await page.getByTestId(`lesson-${String(id)}`).click();
    await page.getByTestId("complete").click();
    await page.getByTestId("dialog-confirm").click();
  }
  await page.getByTestId("filter-completed").click();
  await expect(page.getByTestId("lesson-empty")).toBeVisible();
  expect(
    await page.getByTestId("lesson-scroll").evaluate((el) => el.scrollWidth === el.clientWidth),
  ).toBe(true);
  await page.keyboard.press("ArrowDown");
  await expect(page.getByTestId("filter-completed")).toHaveClass(/vuepg-focus/);
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("lesson-empty")).toHaveCount(0);
  await page.keyboard.press("ArrowDown");
  await expect(page.getByTestId("lesson-12")).toHaveClass(/vuepg-focus/);
});
