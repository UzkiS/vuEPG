/**
 * jsdom 没有布局引擎：本文件按真实浏览器语义模拟元素几何信息。
 * - 带有内联 `left/top/width/height`（px）的元素使用该矩形；
 * - 其余元素的矩形为已渲染子元素矩形的并集；
 * - 自身或祖先 `display: none`、或已脱离文档时，`getClientRects()` 返回空列表。
 */

/** 生成声明元素矩形的内联样式 */
export const box = (left: number, top: number, width: number, height: number): string =>
  `left:${String(left)}px;top:${String(top)}px;width:${String(width)}px;height:${String(height)}px`;

const createRect = (left: number, top: number, width: number, height: number): DOMRect => {
  const rect = {
    x: left,
    y: top,
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
  };
  return { ...rect, toJSON: () => rect };
};

const EMPTY = createRect(0, 0, 0, 0);

const px = (value: string): number | null => {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const ownRect = (el: Element): DOMRect | null => {
  if (!(el instanceof HTMLElement)) {
    return null;
  }
  const [left, top, width, height] = [
    el.style.left,
    el.style.top,
    el.style.width,
    el.style.height,
  ].map(px);
  if (left === undefined || top === undefined || width === undefined || height === undefined) {
    return null;
  }
  if (left === null || top === null || width === null || height === null) {
    return null;
  }
  return createRect(left, top, width, height);
};

const isRendered = (el: Element): boolean => {
  if (!el.isConnected) {
    return false;
  }
  for (let node: Element | null = el; node !== null; node = node.parentElement) {
    if (node instanceof HTMLElement && node.style.display === "none") {
      return false;
    }
  }
  return true;
};

const union = (rects: readonly DOMRect[]): DOMRect => {
  if (rects.length === 0) {
    return EMPTY;
  }
  const left = Math.min(...rects.map((r) => r.left));
  const top = Math.min(...rects.map((r) => r.top));
  const right = Math.max(...rects.map((r) => r.right));
  const bottom = Math.max(...rects.map((r) => r.bottom));
  return createRect(left, top, right - left, bottom - top);
};

const rectOf = (el: Element): DOMRect => {
  if (!isRendered(el)) {
    return EMPTY;
  }
  return (
    ownRect(el) ??
    union(
      Array.from(el.children)
        .filter(isRendered)
        .map(rectOf)
        .filter((rect) => rect.width > 0 || rect.height > 0),
    )
  );
};

const geometry = {
  getBoundingClientRect(this: Element): DOMRect {
    return rectOf(this);
  },
  getClientRects(this: Element): DOMRectList {
    const rects = isRendered(this) ? [rectOf(this)] : [];
    return Object.assign(rects, { item: (index: number) => rects[index] ?? null });
  },
};

/* eslint-disable @typescript-eslint/unbound-method -- 替换原型方法，调用时 this 由 DOM 元素提供 */
export const installLayout = (): void => {
  Object.defineProperty(Element.prototype, "getBoundingClientRect", {
    configurable: true,
    value: geometry.getBoundingClientRect,
  });
  Object.defineProperty(Element.prototype, "getClientRects", {
    configurable: true,
    value: geometry.getClientRects,
  });
};
/* eslint-enable @typescript-eslint/unbound-method */
