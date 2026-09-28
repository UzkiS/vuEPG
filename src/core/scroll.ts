import type { EPGItem, ScrollMode } from "./nodes";
import { getAncestorGroups } from "./tree";

/**
 * 计算一个轴上需要滚动的距离。
 * `start` / `size` 为元素在该轴上的位置与尺寸，`viewStart` / `viewSize` 为可视区域。
 */
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
  // nearest：超出起始边或比可视区域还大时对齐起始边，超出结束边时对齐结束边
  if (start < viewStart || size > viewSize) {
    return start - viewStart;
  }
  return Math.max(0, start + size - (viewStart + viewSize));
};

/**
 * 由内向外滚动开启了 `scroll` 的祖先分组，让元素可见。
 * 直接设置 `scrollLeft` / `scrollTop`（旧内核均支持）；需要平滑滚动时，
 * 在分组元素上声明 CSS `scroll-behavior: smooth` 即可。
 */
export const scrollIntoView = (item: EPGItem): void => {
  for (const group of getAncestorGroups(item)) {
    const mode = group.scrollMode;
    if (mode === null) {
      continue;
    }
    const { el } = group;
    const view = el.getBoundingClientRect();
    const rect = item.getRect();
    const dx = scrollDelta(mode, rect.left, rect.width, view.left + el.clientLeft, el.clientWidth);
    const dy = scrollDelta(mode, rect.top, rect.height, view.top + el.clientTop, el.clientHeight);
    if (dx !== 0) {
      el.scrollLeft += dx;
    }
    if (dy !== 0) {
      el.scrollTop += dy;
    }
  }
};
