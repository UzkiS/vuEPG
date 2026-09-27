/** 按 id 获取元素，不存在时抛错 */
export const byId = (id: string): HTMLElement => {
  const el = document.getElementById(id);
  if (el === null) {
    throw new Error(`#${id} not found`);
  }
  return el;
};

/** 当前焦点元素的 id */
export const focusedId = (): string | undefined => document.querySelector(".vuepg-focus")?.id;
