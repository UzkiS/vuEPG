import { isValidClassName } from "./dom";
import type { ScrollMode } from "./scroll";

// #region config
/** 返回处理函数 */
export type BackHandler = () => void;

/** 全局配置 */
export interface EPGConfig {
  /**
   * 焦点元素的 class 名，可被 `v-epg-item` 的 `focusClass` 覆盖
   * @defaultValue `"vuepg-focus"`
   */
  focusClass: string;
  /**
   * 全局返回处理函数：按下返回键且没有生效中的 `onBack` 时调用
   * @defaultValue `null`
   */
  backHandler: BackHandler | null;
  /**
   * 是否在控制台输出调试日志
   * @defaultValue `false`
   */
  debug: boolean;
  /**
   * 文档视口的滚动方式；`true` 等同于 `"nearest"`，`false` 关闭
   * @defaultValue `false`
   */
  scrollViewport: boolean | ScrollMode;
}
// #endregion config

const DEFAULT_CONFIG: Readonly<EPGConfig> = {
  focusClass: "vuepg-focus",
  backHandler: null,
  debug: false,
  scrollViewport: false,
};

let config: Readonly<EPGConfig> = DEFAULT_CONFIG;

/** 获取当前配置（只读快照） */
export const getConfig = (): Readonly<EPGConfig> => {
  return config;
};

/**
 * 合并配置。仅负责存储与校验，焦点 class 的同步由上层完成。
 * @throws 当 `focusClass` 为空字符串或包含空白字符时
 */
export const mergeConfig = (patch: Partial<EPGConfig>): void => {
  if (patch.focusClass !== undefined && !isValidClassName(patch.focusClass)) {
    throw new TypeError(
      `[vuEPG] focusClass 必须是不含空白字符的非空字符串，收到 "${patch.focusClass}"`,
    );
  }
  const viewport: unknown = patch.scrollViewport;
  if (
    viewport !== undefined &&
    typeof viewport !== "boolean" &&
    viewport !== "nearest" &&
    viewport !== "start" &&
    viewport !== "center"
  ) {
    throw new TypeError(`[vuEPG] scrollViewport 必须是布尔值或有效滚动方式`);
  }
  config = Object.assign({}, config, patch);
};

/** @internal 仅供测试：恢复默认配置 */
export const resetConfig = (): void => {
  config = DEFAULT_CONFIG;
};
