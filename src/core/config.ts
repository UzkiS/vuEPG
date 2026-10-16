import { isValidClassName } from "./dom";
import type { ScrollMode } from "./scroll";

/* eslint-disable @typescript-eslint/no-invalid-void-type -- 保持既有的 () => void 处理函数可直接传入 */
// #region config
/** 返回处理函数：返回 `false` 表示不处理，交给下一个处理函数 */
export type BackHandler = () => boolean | void;

/** 全局配置 */
export interface EPGConfig {
  /**
   * 焦点元素的 class 名，可被 `v-epg-item` 的 `focusClass` 覆盖
   * @defaultValue `"vuepg-focus"`
   */
  focusClass: string;
  /**
   * 全局返回处理函数：按下返回键，且生效中的 `onBack` 都没有处理时调用
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
  /**
   * 当前焦点元素被卸载后，是否在 DOM 更新完成后自动恢复焦点；
   * 开启后，恢复焦点时优先回到原分组内最近获得过焦点的元素
   * @defaultValue `false`
   */
  restoreFocus: boolean;
  /**
   * 按住按键时，自动重复的按键至少间隔多少毫秒才处理一次；`0` 表示不限制
   * @defaultValue `0`
   */
  keyRepeatInterval: number;
}
// #endregion config
/* eslint-enable @typescript-eslint/no-invalid-void-type */

const DEFAULT_CONFIG: Readonly<EPGConfig> = {
  focusClass: "vuepg-focus",
  backHandler: null,
  debug: false,
  scrollViewport: false,
  restoreFocus: false,
  keyRepeatInterval: 0,
};

let config: Readonly<EPGConfig> = DEFAULT_CONFIG;

/** 获取当前配置（只读快照） */
export const getConfig = (): Readonly<EPGConfig> => {
  return config;
};

/**
 * 合并配置。仅负责存储与校验，焦点 class 的同步由上层完成。
 * 值为 `undefined` 的字段视为未传入，不覆盖当前配置。
 * @throws 当 `focusClass`、`scrollViewport` 或 `keyRepeatInterval` 无效时
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
  const interval: unknown = patch.keyRepeatInterval;
  if (
    interval !== undefined &&
    (typeof interval !== "number" || !Number.isFinite(interval) || interval < 0)
  ) {
    throw new TypeError(`[vuEPG] keyRepeatInterval 必须是不小于 0 的毫秒数`);
  }
  config = {
    focusClass: patch.focusClass ?? config.focusClass,
    backHandler: patch.backHandler === undefined ? config.backHandler : patch.backHandler,
    debug: patch.debug ?? config.debug,
    scrollViewport: patch.scrollViewport ?? config.scrollViewport,
    restoreFocus: patch.restoreFocus ?? config.restoreFocus,
    keyRepeatInterval: patch.keyRepeatInterval ?? config.keyRepeatInterval,
  };
};

/** @internal 仅供测试：恢复默认配置 */
export const resetConfig = (): void => {
  config = DEFAULT_CONFIG;
};
