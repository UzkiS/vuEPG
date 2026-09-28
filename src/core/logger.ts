/* eslint-disable no-console -- 本模块是唯一允许直接使用 console 的地方 */
import { getConfig } from "./config";

/** 品牌色，与文档站主题色一致 */
const BRAND = "#d81b60";

const BADGE = "%cvuEPG";
const BADGE_STYLE = `background: ${BRAND}; color: #fff; padding: 1px 6px; border-radius: 3px; font-size: 11px; font-weight: 600`;

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

/** 插件加载横幅：`[vuEPG|v2.x.x] 文档地址`，样式与 shields.io 徽章一致 */
export const banner = (version: string, homepage: string): void => {
  console.log(
    `%cvuEPG%cv${version}%c ${homepage}`,
    `background: ${BRAND}; color: #fff; padding: 2px 8px; border-radius: 4px 0 0 4px; font-weight: 600`,
    "background: #35495e; color: #fff; padding: 2px 8px; border-radius: 0 4px 4px 0",
    "color: #888",
  );
};
