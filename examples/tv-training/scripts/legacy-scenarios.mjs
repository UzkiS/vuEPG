import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

/** 发给 Chromium 30 的脚本文本仅使用 ES5；驱动使用 JSON Wire Protocol。 */
export const runScenarios = async ({
  execute,
  navigate,
  keys,
  screenshot,
  logs,
  results,
  hotUpdate,
}) => {
  const assertions = [];
  const check = async (name, script, expected) => {
    const start = Date.now();
    let actual;
    do {
      actual = await execute(script);
      if (JSON.stringify(actual) === JSON.stringify(expected)) {
        assertions.push({ name, passed: true, actual });
        await writeFile(resolve(results, "assertions.json"), JSON.stringify(assertions, null, 2));
        console.log(`[vuEPG] 通过：${name}`);
        return;
      }
      await new Promise((done) => setTimeout(done, 100));
    } while (Date.now() - start < 5000);
    assertions.push({ name, passed: false, expected, actual });
    await writeFile(resolve(results, "assertions.json"), JSON.stringify(assertions, null, 2));
    throw new Error(
      `[vuEPG] ${name}：期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`,
    );
  };
  const focus =
    'return document.querySelector(".vuepg-focus") && document.querySelector(".vuepg-focus").getAttribute("data-testid");';
  const click = async (selector) => {
    await execute("document.querySelector(arguments[0]).click();", [selector]);
  };
  const key = async (code) => {
    await keys([code]);
  };
  const validate = async (label, url) => {
    await navigate(url);
    await check(`${label}：默认焦点`, focus, "start");
    await check(
      `${label}：JavaScript / DOM API 已补齐`,
      "return [typeof Map, typeof Set, typeof Symbol, typeof Array.from, typeof Object.assign, typeof CustomEvent];",
      ["function", "function", "function", "function", "function", "function"],
    );
    await key("\uE007");
    await check(`${label}：确定进入页面`, focus, "lesson-1");
    await execute(
      'window.__vuepgTestPauseRelease = document.querySelector(".example-shell").__vue__.$epg.pause();',
    );
    for (const keyCode of [22, 23, 4]) {
      await execute(
        'window.dispatchEvent(new CustomEvent("vuepg-native-key", { detail: { keyCode: arguments[0] } }));',
        [keyCode],
      );
      await check(`${label}：暂停期间跳过原生按键 ${String(keyCode)}`, focus, "lesson-1");
    }
    await execute("window.__vuepgTestPauseRelease(); delete window.__vuepgTestPauseRelease;");
    await click("[data-testid=native-right]");
    await check(`${label}：暂停释放后恢复原生导航`, focus, "lesson-2");
    await key("\uE012");
    await key("\uE012");
    await check(`${label}：向左循环到末站`, focus, "lesson-12");
    await check(
      `${label}：自动滚动`,
      'return document.querySelector("[data-testid=lesson-scroll]").scrollLeft > 0;',
      true,
    );
    await screenshot(`${label}-scrolled`);
    await key("\uE014");
    await check(`${label}：向右循环到首站`, focus, "lesson-1");
    await key("\uE014");
    await check(`${label}：方向导航`, focus, "lesson-2");
    await key("\uE007");
    await check(`${label}：进入练习`, focus, "complete");
    await key("\uE00C");
    await check(`${label}：返回恢复业务位置`, focus, "lesson-2");
    await key("\uE007");
    await key("\uE007");
    await check(`${label}：完成后聚焦弹窗`, focus, "dialog-cancel");
    await key("\uE004");
    await check(`${label}：Tab 保持弹窗逻辑焦点`, focus, "dialog-confirm");
    await check(
      `${label}：Tab 保持弹窗 DOM 焦点`,
      'return document.activeElement.getAttribute("data-testid");',
      "dialog-confirm",
    );
    await keys(["\uE008", "\uE004", "\uE000"]);
    await check(`${label}：Shift Tab 循环返回弹窗入口`, focus, "dialog-cancel");
    await key("\uE012");
    await check(`${label}：弹窗左边界隔离`, focus, "dialog-cancel");
    await key("\uE013");
    await check(`${label}：弹窗上边界隔离`, focus, "dialog-cancel");
    await key("\uE015");
    await check(`${label}：弹窗下边界隔离`, focus, "dialog-cancel");
    await key("\uE014");
    await check(`${label}：弹窗内部导航`, focus, "dialog-confirm");
    await key("\uE014");
    await check(`${label}：弹窗右边界隔离`, focus, "dialog-confirm");
    await screenshot(`${label}-dialog`);
    await key("\uE00C");
    await check(`${label}：关闭复焦`, focus, "complete");
    await key("\uE00C");
    await check(`${label}：弹窗关闭后恢复页面返回`, focus, "lesson-2");
    await click("[data-testid=filter-completed]");
    await check(
      `${label}：Vue 卸载当前焦点项`,
      'return document.querySelector("[data-testid=lesson-2]") === null;',
      true,
    );
    await key("\uE014");
    await check(`${label}：Vue 卸载后在原组恢复`, focus, "lesson-1");
    await click("[data-testid=filter-completed]");
    await key("\uE014");
    await check(`${label}：重新显示项目可导航`, focus, "lesson-2");
    await click("[data-testid=native-right]");
    await check(`${label}：原生桥方向`, focus, "lesson-3");
    await execute('document.querySelector(".vuepg-focus").style.display = "none";');
    await key("\uE014");
    await check(`${label}：隐藏焦点恢复`, focus, "lesson-1");
    await execute(
      'var el = document.querySelector(".vuepg-focus"); el.parentNode.removeChild(el);',
    );
    await key("\uE014");
    await check(`${label}：焦点离开文档后恢复`, focus, "lesson-2");
    await click("[data-testid=native-back]");
    await check(`${label}：原生桥返回`, focus, "start");
    await key("\uE00C");
    await check(`${label}：首页返回打开退出弹窗`, focus, "dialog-cancel");
    await key("\uE00C");
    await check(`${label}：连续弹窗复焦`, focus, "start");
    await click("[data-testid=exit-open]");
    await execute('document.querySelector("[data-testid=start]").style.display = "none";');
    await key("\uE00C");
    await check(`${label}：弹窗原目标失效后回退`, focus, "home-nav");
    await execute('document.querySelector("[data-testid=start]").style.display = "";');
    await click("[data-testid=home-nav]");
    await check(`${label}：业务入口重新可用`, focus, "start");
    if (label === "webpack-development") {
      await hotUpdate(async () => {
        await check(
          "webpack 开发入口：CSS 热更新",
          'return window.getComputedStyle(document.querySelector("[data-testid=start]")).letterSpacing;',
          "3px",
        );
        await check("webpack 开发入口：热更新保留焦点", focus, "start");
      });
    }
    await key("\uE007");
    for (let id = 1; id <= 12; id += 1) {
      await click(`[data-testid=lesson-${String(id)}]`);
      await click("[data-testid=complete]");
      await check(`${label}：完成站点 ${String(id)}`, focus, "dialog-cancel");
      await click("[data-testid=dialog-confirm]");
      await check(`${label}：完成后返回站点 ${String(id)}`, focus, `lesson-${String(id)}`);
    }
    await click("[data-testid=filter-completed]");
    await check(
      `${label}：全部完成后的空状态`,
      'return document.querySelector("[data-testid=lesson-empty]") !== null;',
      true,
    );
    await check(
      `${label}：空状态没有多余滚动空间`,
      'var el = document.querySelector("[data-testid=lesson-scroll]"); return el.scrollWidth === el.clientWidth;',
      true,
    );
    await key("\uE015");
    await check(`${label}：空状态恢复到筛选入口`, focus, "filter-completed");
    await key("\uE007");
    await key("\uE015");
    await check(`${label}：重新显示后恢复列表入口`, focus, "lesson-12");
    await click("[data-testid=native-back]");
    await screenshot(label);
    const entries = await logs();
    await writeFile(resolve(results, `${label}-browser.json`), JSON.stringify(entries, null, 2));
    const errors = entries.filter(
      (entry) => entry.level === "SEVERE" && !entry.message.includes("favicon.ico"),
    );
    if (errors.length) {
      throw new Error(`[vuEPG] ${label} 浏览器错误：${JSON.stringify(errors)}`);
    }
  };
  await validate("production", "http://127.0.0.1:8300/");
  await validate("webpack-development", "http://host.docker.internal:5174/");
  await navigate("http://host.docker.internal:5175/");
  await check(
    "Vite 原生 ESM 开发入口在 Chromium 30 中不挂载应用",
    'return document.querySelectorAll("button").length;',
    0,
  );
  await check(
    "Vite 页面仍使用模块脚本",
    'return document.querySelectorAll("script[type=module]").length > 0;',
    true,
  );
  await screenshot("vite-development");
  await writeFile(resolve(results, "vite-browser.json"), JSON.stringify(await logs(), null, 2));
  return assertions;
};
