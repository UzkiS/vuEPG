import { getConfig } from "./config";
import { emit } from "./events";
import { debug } from "./logger";
import { EPGItem, type EPGGroup, type EPGNode } from "./nodes";
import { scrollIntoView } from "./scroll";
import { entryOf, getAncestorGroups, getParentGroup, isFocusable } from "./tree";

/** 当前焦点：全局唯一事实源 */
let currentItem: EPGItem | null = null;

/** 已派发 `epg-focus`、尚未派发 `epg-blur` 的元素 */
let focusedItem: EPGItem | null = null;

/**
 * 焦点路径：已派发 `epg-enter`、尚未派发 `epg-leave` 的分组，由内向外。
 * 焦点元素被卸载后仍然保留，用于保证进入 / 离开成对派发，并在原来的分组内恢复焦点。
 */
let focusPath: EPGGroup[] = [];

interface AppliedClass {
  readonly el: HTMLElement;
  readonly className: string;
}

/** 实际写入 DOM 的焦点 class，用于在焦点或配置变化时精确撤销 */
let appliedClass: AppliedClass | null = null;

const isSameClass = (a: AppliedClass, b: AppliedClass | null): boolean =>
  b !== null && a.el === b.el && a.className === b.className;

/** 获取当前获得焦点的 EPGItem */
export const getCurrentItem = (): EPGItem | null => currentItem;

/** 获取当前焦点所在的 EPGGroup */
export const getCurrentGroup = (): EPGGroup | null =>
  currentItem === null ? null : getParentGroup(currentItem);

/** 焦点路径（由内向外），焦点元素被卸载后仍保留 */
export const getFocusPath = (): readonly EPGGroup[] => focusPath;

/** 当前焦点应使用的 class */
export const getFocusClass = (): string => currentItem?.focusClass ?? getConfig().focusClass;

/**
 * 让 DOM 上的焦点 class 与当前状态一致。
 * 在焦点变化、配置变化、元素重渲染（Vue 可能覆盖 class）之后调用。
 */
export const syncFocusClass = (): void => {
  const desired = currentItem === null ? null : { el: currentItem.el, className: getFocusClass() };
  if (appliedClass !== null && !isSameClass(appliedClass, desired)) {
    appliedClass.el.classList.remove(appliedClass.className);
  }
  if (desired !== null) {
    desired.el.classList.add(desired.className);
  }
  appliedClass = desired;
};

/**
 * 让指定 EPGItem 获得焦点，依次派发：旧元素 `epg-blur` → 离开的组 `epg-leave`（由内向外）
 * → 进入的组 `epg-enter`（由外向内）→ 新元素 `epg-focus`。
 * `epg-focus` / `epg-blur`、`epg-enter` / `epg-leave` 总是成对派发（元素已被卸载时除外）。
 * 任一事件处理函数中再次移动了焦点，则停止派发剩余事件。
 * @returns 焦点是否落在该元素上
 */
export const moveToItem = (item: EPGItem): boolean => {
  if (!isFocusable(item)) {
    debug("目标不可获得焦点（已禁用或未渲染）", item);
    return false;
  }
  if (currentItem === item) {
    syncFocusClass();
    scrollIntoView(item);
    return true;
  }
  debug("焦点移动", currentItem, "→", item);
  currentItem = item;
  syncFocusClass();

  const stillCurrent = (): boolean => currentItem === item;
  const targetGroups = getAncestorGroups(item);

  const blurred = focusedItem;
  if (blurred !== null) {
    focusedItem = null;
    emit(blurred.el, "epg-blur", { item: blurred });
  }
  for (const group of focusPath.filter((g) => targetGroups.indexOf(g) === -1)) {
    if (!stillCurrent()) {
      return false;
    }
    focusPath = focusPath.filter((g) => g !== group);
    emit(group.el, "epg-leave", { group });
  }
  for (const group of targetGroups.filter((g) => focusPath.indexOf(g) === -1).reverse()) {
    if (!stillCurrent()) {
      return false;
    }
    focusPath = [group].concat(focusPath);
    emit(group.el, "epg-enter", { group });
  }
  if (!stillCurrent()) {
    return false;
  }
  scrollIntoView(item);
  focusedItem = item;
  emit(item.el, "epg-focus", { item });
  return true;
};

/**
 * 进入指定 EPGGroup：焦点落在其 `default` 节点或第一个可获得焦点的节点上（可递归进入子组）。
 * @returns 是否成功
 */
export const moveToGroup = (group: EPGGroup): boolean => {
  const entry = entryOf(group);
  if (entry === null) {
    debug("组内没有可获得焦点的元素", group);
    return false;
  }
  return moveToItem(entry);
};

/** 移动到任意节点 */
export const moveToNode = (node: EPGNode): boolean =>
  node instanceof EPGItem ? moveToItem(node) : moveToGroup(node);

/** 模拟点击当前焦点 */
export const activate = (): void => {
  if (currentItem !== null && isFocusable(currentItem)) {
    currentItem.el.click();
  }
};

/**
 * 节点被注销时调用（元素已被移除，不派发 `epg-blur` / `epg-leave`）：
 * 若为当前焦点则清除，但保留焦点路径中仍然存在的分组。
 */
export const releaseFocus = (node: EPGNode): void => {
  if (node === focusedItem) {
    focusedItem = null;
  }
  if (node === currentItem) {
    currentItem = null;
    syncFocusClass();
  }
  focusPath = focusPath.filter((group) => group !== node);
};

/** @internal 仅供测试：清除焦点状态 */
export const resetFocus = (): void => {
  currentItem = null;
  focusedItem = null;
  focusPath = [];
  syncFocusClass();
};
