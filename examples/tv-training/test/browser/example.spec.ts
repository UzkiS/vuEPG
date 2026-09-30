import type { VuEPG } from "vuepg";
import { expect, test } from "@playwright/test";
import packageInfo from "vuepg/package.json" with { type: "json" };

/** 对比绘制范围与裁剪范围，焦点描边也需要完整可见。 */
const focusOutsets = (
  element: Element,
): { horizontal: number; vertical: number; outline: number } => {
  const container = element.closest<HTMLElement>("[data-testid=lesson-scroll]");
  if (container === null) {
    throw new Error("[vuEPG] 未找到卡片滚动容器");
  }
  const card = element.getBoundingClientRect();
  const view = container.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  const scaleX = view.width / container.offsetWidth;
  const scaleY = view.height / container.offsetHeight;
  return {
    horizontal: Math.min(card.left - view.left, view.right - card.right) / scaleX,
    vertical: Math.min(card.top - view.top, view.bottom - card.bottom) / scaleY,
    outline: Number.parseFloat(style.outlineWidth) + Number.parseFloat(style.outlineOffset),
  };
};

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

test("首尾卡片在不同缩放下完整显示，包含焦点描边", async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1280, height: 900 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.keyboard.press("Enter");
    const first = page.getByTestId("lesson-1");
    const last = page.getByTestId("lesson-12");
    await expect(first).toHaveClass(/vuepg-focus/);
    for (let index = 1; index < 12; index += 1) {
      await page.keyboard.press("ArrowRight");
    }
    await expect(last).toHaveClass(/vuepg-focus/);
    const right = await last.evaluate(focusOutsets);
    expect(right.horizontal).toBeGreaterThanOrEqual(right.outline - 0.5);
    expect(right.vertical).toBeGreaterThanOrEqual(right.outline - 0.5);

    await page.keyboard.press("ArrowRight");
    await expect(first).toHaveClass(/vuepg-focus/);
    const left = await first.evaluate(focusOutsets);
    expect(left.horizontal).toBeGreaterThanOrEqual(left.outline - 0.5);
    expect(left.vertical).toBeGreaterThanOrEqual(left.outline - 0.5);
    await page.keyboard.press("ArrowLeft");
    await expect(last).toHaveClass(/vuepg-focus/);
    const wrapped = await last.evaluate(focusOutsets);
    expect(wrapped.horizontal).toBeGreaterThanOrEqual(wrapped.outline - 0.5);
  }
});

test("顶部文档与 GitHub 链接可打开项目页面，手机布局不溢出", async ({ page, context }) => {
  const links = [
    { id: "docs-link", url: packageInfo.homepage },
    {
      id: "github-link",
      url: packageInfo.repository.url.replace(/^git\+/, "").replace(/\.git$/, ""),
    },
  ];
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    for (const { id, url } of links) {
      // 只验证链接与打开链路，不依赖外部站点当前网络状态。
      await context.route(url, (route) =>
        route.fulfill({ contentType: "text/html", body: "<p>项目入口</p>" }),
      );
      const link = page.getByTestId(id);
      await expect(link).toBeVisible();
      const popupPromise = page.waitForEvent("popup");
      await link.click();
      const popup = await popupPromise;
      await popup.waitForURL(url);
      await popup.close();
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
});

test("筛选为短列表后没有多余滚动空间，首尾焦点框完整可见", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Enter");
  for (let id = 1; id <= 9; id += 1) {
    await page.getByTestId(`lesson-${String(id)}`).click();
    await page.getByTestId("complete").click();
    await page.getByTestId("dialog-confirm").click();
  }
  await page.getByTestId("filter-completed").click();
  await expect(page.locator(".lesson-card")).toHaveCount(3);
  expect(
    await page.getByTestId("lesson-scroll").evaluate((el) => el.scrollWidth === el.clientWidth),
  ).toBe(true);
  await page.keyboard.press("ArrowDown");
  const first = page.getByTestId("lesson-10");
  await expect(first).toHaveClass(/vuepg-focus/);
  const left = await first.evaluate(focusOutsets);
  expect(left.horizontal).toBeGreaterThanOrEqual(left.outline - 0.5);
  expect(left.vertical).toBeGreaterThanOrEqual(left.outline - 0.5);
  await page.keyboard.press("ArrowLeft");
  const last = page.getByTestId("lesson-12");
  await expect(last).toHaveClass(/vuepg-focus/);
  const right = await last.evaluate(focusOutsets);
  expect(right.horizontal).toBeGreaterThanOrEqual(right.outline - 0.5);
  expect(right.vertical).toBeGreaterThanOrEqual(right.outline - 0.5);
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
  const restored = await page.getByTestId("lesson-12").evaluate(focusOutsets);
  expect(restored.horizontal).toBeGreaterThanOrEqual(restored.outline - 0.5);
  expect(restored.vertical).toBeGreaterThanOrEqual(restored.outline - 0.5);
});
