/**
 * 元素是否处于未渲染状态：自身或祖先 `display: none`、已脱离文档（如被 KeepAlive 缓存）。
 * `visibility: hidden` 与 `position: fixed` 的元素视为已渲染。
 */
export const isHidden = (el: Element): boolean => {
  return el.getClientRects().length === 0;
};

/** 是否为合法的单个 class 名（非空且不含空白字符） */
export const isValidClassName = (value: string): boolean => /^\S+$/.test(value);
