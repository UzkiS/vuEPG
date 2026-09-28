import { getConfig } from "./config";
import type { EPGItem } from "./nodes";

// #region scroll-options
/** 滚动对齐方式 */
export type ScrollMode = "nearest" | "start" | "center";
/** `v-epg-scroll` 的绑定值：省略或 `true` 为 `nearest`，`false` 为关闭 */
export type ScrollBinding = boolean | ScrollMode;
// #endregion scroll-options

/** 滚动容器与导航节点互不依赖；只在焦点变化时沿 DOM 祖先查找 */
const containers = new Map<HTMLElement, ScrollMode>();

/** 登记或更新滚动容器；`null` 表示关闭 */
export const setScroll = (el: HTMLElement, mode: ScrollMode | null): void => {
  if (mode === null) {
    containers.delete(el);
  } else {
    containers.set(el, mode);
  }
};

/** 注销滚动容器 */
export const removeScroll = (el: HTMLElement): void => {
  containers.delete(el);
};

/** @internal 仅供测试：清除滚动容器 */
export const resetScroll = (): void => {
  containers.clear();
};

/** 一个轴上需要移动的视觉距离 */
const scrollDelta = (
  mode: ScrollMode,
  start: number,
  size: number,
  viewStart: number,
  viewSize: number,
): number => {
  if (mode === "start") {
    return start - viewStart;
  }
  if (mode === "center") {
    return start + size / 2 - (viewStart + viewSize / 2);
  }
  if (start < viewStart || size > viewSize) {
    return start - viewStart;
  }
  return Math.max(0, start + size - (viewStart + viewSize));
};

/** getBoundingClientRect 使用视觉像素，滚动属性使用布局像素 */
const visualScale = (visualSize: number, layoutSize: number): number =>
  layoutSize > 0 && visualSize > 0 ? visualSize / layoutSize : 1;

/** 将目标滚入明确标记的滚动元素 */
const scrollElement = (item: EPGItem, el: HTMLElement, mode: ScrollMode): void => {
  const view = el.getBoundingClientRect();
  const rect = item.getRect();
  const scaleX = visualScale(view.width, el.offsetWidth);
  const scaleY = visualScale(view.height, el.offsetHeight);
  const dx =
    scrollDelta(
      mode,
      rect.left,
      rect.width,
      view.left + el.clientLeft * scaleX,
      el.clientWidth * scaleX,
    ) / scaleX;
  const dy =
    scrollDelta(
      mode,
      rect.top,
      rect.height,
      view.top + el.clientTop * scaleY,
      el.clientHeight * scaleY,
    ) / scaleY;
  if (dx !== 0) {
    el.scrollLeft += dx;
  }
  if (dy !== 0) {
    el.scrollTop += dy;
  }
};

/** 文档视口仅在配置启用时滚动；旧内核没有 scrollingElement 时按文档模式回退 */
const scrollDocument = (item: EPGItem, mode: ScrollMode): void => {
  const el =
    document.scrollingElement ??
    (document.compatMode === "BackCompat" ? document.body : document.documentElement);
  const rect = item.getRect();
  const dx = scrollDelta(mode, rect.left, rect.width, 0, window.innerWidth);
  const dy = scrollDelta(mode, rect.top, rect.height, 0, window.innerHeight);
  if (dx !== 0) {
    el.scrollLeft += dx;
  }
  if (dy !== 0) {
    el.scrollTop += dy;
  }
};

/** 由内向外处理标记的容器，最后按需处理文档视口 */
export const scrollIntoView = (item: EPGItem): void => {
  const viewport = getConfig().scrollViewport;
  if (containers.size === 0 && viewport === false) {
    return;
  }
  let fixed = viewport !== false && window.getComputedStyle(item.el).position === "fixed";
  for (let el = item.el.parentElement; el !== null; el = el.parentElement) {
    const mode = containers.get(el);
    if (mode !== undefined) {
      scrollElement(item, el, mode);
    }
    if (viewport !== false && window.getComputedStyle(el).position === "fixed") {
      fixed = true;
      break;
    }
  }
  if (viewport !== false && !fixed) {
    scrollDocument(item, viewport === true ? "nearest" : viewport);
  }
};
