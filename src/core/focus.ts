import { getConfig } from "./config";
import { emit } from "./events";
import { debug } from "./logger";
import { pickNearest, type Direction } from "./navigation";
import { EPGItem, type EPGGroup, type EPGNode } from "./nodes";
import {
  entryOf,
  getAncestorGroups,
  getChildren,
  getParentGroup,
  isFocusable,
  resolveEntry,
} from "./tree";

/** 当前焦点：全局唯一事实源 */
let currentItem: EPGItem | null = null;

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
 * 任一事件处理函数中再次移动了焦点，则停止派发剩余事件。
 * @returns 焦点是否落在该元素上
 */
export const moveToItem = (item: EPGItem): boolean => {
  if (!isFocusable(item)) {
    debug("目标不可获得焦点（已禁用或未渲染）", item);
    return false;
  }
  const previous = currentItem;
  if (previous === item) {
    syncFocusClass();
    return true;
  }
  currentItem = item;
  syncFocusClass();
  debug("焦点移动", previous, "→", item);

  const stillCurrent = (): boolean => currentItem === item;
  const previousGroups = previous === null ? [] : getAncestorGroups(previous);
  const nextGroups = getAncestorGroups(item);

  if (previous !== null) {
    emit(previous.el, "epg-blur", { item: previous });
  }
  const leaving = previousGroups.filter((group) => nextGroups.indexOf(group) === -1);
  const entering = nextGroups.filter((group) => previousGroups.indexOf(group) === -1).reverse();
  for (const group of leaving) {
    if (!stillCurrent()) {
      return false;
    }
    emit(group.el, "epg-leave", { group });
  }
  for (const group of entering) {
    if (!stillCurrent()) {
      return false;
    }
    emit(group.el, "epg-enter", { group });
  }
  if (!stillCurrent()) {
    return false;
  }
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

/**
 * 计算从当前焦点出发、指定方向上的下一个目标（不移动焦点）。
 * 在当前层级找不到时，以父级 EPGGroup 为起点逐层向外查找。
 */
export const findTarget = (direction: Direction): EPGNode | null => {
  if (currentItem === null) {
    return null;
  }
  let origin: EPGNode = currentItem;
  for (;;) {
    const parent = getParentGroup(origin);
    const from: EPGNode = origin;
    const candidates = getChildren(parent)
      .filter((node) => node !== from && entryOf(node) !== null)
      .map((node) => ({ value: node, box: node.getRect() }));
    const target = pickNearest(direction, from.getRect(), candidates);
    if (target !== null) {
      return target;
    }
    if (parent === null) {
      return null;
    }
    origin = parent;
  }
};

/**
 * 编程式按方向移动：不派发方向事件。
 * @returns 焦点是否发生移动
 */
export const moveInDirection = (direction: Direction): boolean => {
  if (currentItem === null || !isFocusable(currentItem)) {
    debug("当前没有可用焦点，无法按方向移动");
    return false;
  }
  const target = findTarget(direction);
  return target !== null && moveToNode(target);
};

/**
 * 响应方向键：
 * 1. 当前没有焦点或焦点已失效（被卸载、隐藏、禁用）时，焦点回到顶层入口；
 * 2. 在当前 EPGItem 上派发方向事件；
 * 3. 对即将离开的每个 EPGGroup（由内向外）派发方向事件；
 * 4. 以上任一事件被 `preventDefault()` 或处理函数自行移动了焦点，则不再执行默认移动。
 */
export const navigate = (direction: Direction): void => {
  const current = currentItem;
  if (current === null || !isFocusable(current)) {
    const entry = resolveEntry();
    debug("当前焦点不可用，回到入口", entry);
    if (entry !== null) {
      moveToItem(entry);
    }
    return;
  }
  const proceed = (el: Element, node: EPGNode): boolean =>
    emit(el, `epg-${direction}` as const, { node, direction }) && currentItem === current;

  if (!proceed(current.el, current)) {
    return;
  }
  const target = findTarget(direction);
  const entry = target === null ? null : entryOf(target);
  if (entry === null) {
    debug(`方向 ${direction} 上没有可移动的目标`);
    return;
  }
  const targetGroups = getAncestorGroups(entry);
  for (const group of getAncestorGroups(current)) {
    if (targetGroups.indexOf(group) === -1 && !proceed(group.el, group)) {
      return;
    }
  }
  moveToItem(entry);
};

/** 模拟点击当前焦点 */
export const activate = (): void => {
  if (currentItem !== null && isFocusable(currentItem)) {
    currentItem.el.click();
  }
};

/** 节点被注销时调用：若为当前焦点则清除（不派发 `epg-blur`，元素已被移除） */
export const releaseFocus = (node: EPGNode): void => {
  if (node === currentItem) {
    currentItem = null;
    syncFocusClass();
  }
};

/** @internal 仅供测试：清除焦点状态 */
export const resetFocus = (): void => {
  currentItem = null;
  syncFocusClass();
};
