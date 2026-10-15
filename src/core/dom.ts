/**
 * DOM 工具。旧内核的能力差异只在本模块处理，上层模块只表达焦点逻辑。
 */

/**
 * 元素是否处于未渲染状态：自身或祖先 `display: none`、已脱离文档（如被 KeepAlive 缓存）。
 * `visibility: hidden` 与 `position: fixed` 的元素视为已渲染。
 */
export const isHidden = (el: Element): boolean => {
  return el.getClientRects().length === 0;
};

/** 元素是否为 `position: fixed`：不随外层容器与文档滚动 */
export const isFixed = (el: Element): boolean => {
  return window.getComputedStyle(el).position === "fixed";
};

/** 是否为合法的单个 class 名（非空且不含空白字符） */
export const isValidClassName = (value: string): boolean => /^\S+$/.test(value);

/** 不能输入文字的 `<input>` 类型 */
const NON_TEXT_INPUT_TYPES = [
  "button",
  "checkbox",
  "color",
  "file",
  "hidden",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
];

/** 是否为可编辑元素：输入框、文本域、下拉框或可编辑内容 */
export const isEditable = (target: EventTarget | null): boolean => {
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
    return true;
  }
  if (target instanceof HTMLInputElement) {
    return NON_TEXT_INPUT_TYPES.indexOf(target.type) === -1;
  }
  return target instanceof HTMLElement && target.isContentEditable;
};

/**
 * 页面的输入焦点位于 `keep` 之外的可编辑元素时，使其失去焦点。
 * 否则焦点离开后，按键仍以该元素为目标，左右方向键与确定键会继续交给浏览器。
 */
export const blurEditableOutside = (keep: Element): void => {
  const active = document.activeElement;
  if (active instanceof HTMLElement && isEditable(active) && !keep.contains(active)) {
    active.blur();
  }
};

/** 模拟点击；部分旧 WebKit 内核只为表单元素提供 `click()`，其余元素改为派发事件 */
export const clickElement = (el: HTMLElement): void => {
  // 旧内核中该属性可能为 undefined（DOM 类型声明为方法）；只检测是否存在，调用时仍通过 el.click()
  // eslint-disable-next-line @typescript-eslint/unbound-method -- 不单独调用取出的方法
  const click: unknown = el.click;
  if (typeof click === "function") {
    el.click();
    return;
  }
  const event = document.createEvent("MouseEvents");
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- 旧内核没有 MouseEvent 构造函数
  event.initEvent("click", true, true);
  el.dispatchEvent(event);
};

/** 滚动文档视口的元素；旧内核没有 `scrollingElement` 时按文档模式回退 */
export const getScrollingElement = (): Element =>
  document.scrollingElement ??
  (document.compatMode === "BackCompat" ? document.body : document.documentElement);
