/* eslint-disable no-console -- 本模块是唯一允许直接使用 console 的地方 */
import { getConfig } from "./config";

const BADGE = "%cvuEPG";
const BADGE_STYLE =
  "color: white; background: linear-gradient(270deg, skyblue, pink); padding: 2px 8px; border-radius: 10px 10px 0 10px";

/** 调试日志，仅在 `debug: true` 时输出 */
export const debug = (...data: unknown[]): void => {
  if (getConfig().debug) {
    console.log(BADGE, BADGE_STYLE, ...data);
  }
};

/** 使用警告：调用方式有误但可以继续运行 */
export const warn = (message: string, ...data: unknown[]): void => {
  console.warn(`[vuEPG] ${message}`, ...data);
};

/** 插件加载横幅 */
export const banner = (version: string, homepage: string): void => {
  console.log(
    `%c vuEPG ${version} %c ${homepage} `,
    "color: white; background: pink; padding: 4px 0;",
    "background: skyblue; padding: 4px 0;",
  );
};
