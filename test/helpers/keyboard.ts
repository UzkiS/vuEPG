/** 在 document 上派发 keydown，返回事件以便断言 `defaultPrevented` */
export const press = (code: string, init: KeyboardEventInit = {}): KeyboardEvent => {
  const event = new KeyboardEvent("keydown", { code, bubbles: true, cancelable: true, ...init });
  document.dispatchEvent(event);
  return event;
};

/** 模拟只提供数字键值的老旧机顶盒浏览器：没有 `event.code` 属性（值为 undefined，而不是空字符串） */
export const pressLegacy = (keyCode: number): KeyboardEvent => {
  const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "code", { value: undefined });
  Object.defineProperty(event, "keyCode", { value: keyCode });
  Object.defineProperty(event, "which", { value: keyCode });
  document.dispatchEvent(event);
  return event;
};
