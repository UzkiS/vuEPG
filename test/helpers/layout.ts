/**
 * jsdom 没有布局引擎：本文件按真实浏览器语义模拟元素几何信息。
 * - 带有内联 `left/top/width/height`（px）的元素使用该矩形（未滚动时的位置）；
 * - 其余元素的矩形为已渲染子元素矩形的并集；
 * - 自身或祖先 `display: none`、或已脱离文档时，`getClientRects()` 返回空列表；
 * - 祖先元素的 `scrollLeft` / `scrollTop` 会平移后代的矩形，滚动范围按内容尺寸限制；
 *   `clientWidth` / `clientHeight` 等于元素自身矩形的尺寸（不模拟边框与滚动条）。
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

/** 未滚动时的矩形 */
const layoutRect = (el: Element): DOMRect => {
  if (!isRendered(el)) {
    return EMPTY;
  }
  return ownRect(el) ?? contentRect(el);
};

/** 已渲染子元素（未滚动时）矩形的并集 */
const contentRect = (el: Element): DOMRect =>
  union(
    Array.from(el.children)
      .filter(isRendered)
      .map(layoutRect)
      .filter((rect) => rect.width > 0 || rect.height > 0),
  );

interface ScrollOffset {
  left: number;
  top: number;
}

const scrollOffsets = new WeakMap<Element, ScrollOffset>();

const offsetOf = (el: Element): ScrollOffset => scrollOffsets.get(el) ?? { left: 0, top: 0 };

/** 考虑祖先滚动后的实际矩形 */
const rectOf = (el: Element): DOMRect => {
  const rect = layoutRect(el);
  if (rect === EMPTY) {
    return rect;
  }
  let dx = 0;
  let dy = 0;
  for (let node = el.parentElement; node !== null; node = node.parentElement) {
    const offset = offsetOf(node);
    dx += offset.left;
    dy += offset.top;
  }
  return createRect(rect.left - dx, rect.top - dy, rect.width, rect.height);
};

/** 某一轴上的最大滚动距离：内容超出自身的部分 */
const maxScroll = (el: Element, axis: "left" | "top"): number => {
  const own = layoutRect(el);
  const content = contentRect(el);
  return axis === "left"
    ? Math.max(0, content.right - own.right)
    : Math.max(0, content.bottom - own.bottom);
};

const scrollAccessor = (axis: "left" | "top"): PropertyDescriptor => ({
  configurable: true,
  get(this: Element): number {
    return offsetOf(this)[axis];
  },
  set(this: Element, value: number): void {
    const offset = { ...offsetOf(this) };
    offset[axis] = Math.min(Math.max(0, value), maxScroll(this, axis));
    scrollOffsets.set(this, offset);
  },
});

const sizeAccessor = (dimension: "width" | "height"): PropertyDescriptor => ({
  configurable: true,
  get(this: Element): number {
    return layoutRect(this)[dimension];
  },
});

const zeroAccessor: PropertyDescriptor = {
  configurable: true,
  get: () => 0,
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
  Object.defineProperty(Element.prototype, "scrollLeft", scrollAccessor("left"));
  Object.defineProperty(Element.prototype, "scrollTop", scrollAccessor("top"));
  Object.defineProperty(Element.prototype, "clientWidth", sizeAccessor("width"));
  Object.defineProperty(Element.prototype, "clientHeight", sizeAccessor("height"));
  Object.defineProperty(Element.prototype, "clientLeft", zeroAccessor);
  Object.defineProperty(Element.prototype, "clientTop", zeroAccessor);
};
/* eslint-enable @typescript-eslint/unbound-method */
