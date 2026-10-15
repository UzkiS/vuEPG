import { isHidden } from "./dom";
import { getConfig } from "./config";
import { emit } from "./events";
import { getCurrentItem, getFocusHistory, getFocusPath, moveToItem, moveToNode } from "./focus";
import { debug } from "./logger";
import { analyzeNearest, pickNearest, type Direction } from "./navigation";
import type { EPGGroup, EPGItem, EPGNode } from "./nodes";
import { entryOf, getChildren, getParentGroup, isFocusable, resolveEntry } from "./tree";

/**
 * 在 `parent` 这一层中，从 `origin` 出发按方向挑选目标。
 * 逐层向外时 `origin` 是分组，此时以实际获得焦点的 `anchor` 裁决并列。
 */
const searchLevel = (
  direction: Direction,
  origin: EPGNode,
  parent: EPGGroup | null,
  anchor: EPGItem,
): EPGNode | null => {
  const candidates = getChildren(parent)
    .filter((node) => node !== origin && entryOf(node) !== null)
    .map((node) => ({ value: node, box: node.getRect() }));
  const from = origin.getRect();
  const anchorRect = origin === anchor ? undefined : anchor.getRect();
  if (!getConfig().debug) {
    return pickNearest(direction, from, candidates, anchorRect);
  }
  const analysis = analyzeNearest(direction, from, candidates, anchorRect);
  const [best] = analysis.ranked;
  debug(`方向 ${direction}：在`, parent ?? "顶层", "中查找", {
    方向上的候选: analysis.ahead.map((c) => c.value),
    参与比较: analysis.ranked.map((c) => c.value),
    结果: best?.value ?? null,
  });
  return best === undefined ? null : best.value;
};

/** 当前焦点能否作为移动的起点：已被禁用但仍渲染的元素也可以 */
const currentOrigin = (): EPGItem | null => {
  const current = getCurrentItem();
  return current === null || isHidden(current.el) ? null : current;
};

/**
 * 计算从当前焦点出发、指定方向上的下一个目标（不移动焦点）。
 * 在当前层级找不到时，以父级 EPGGroup 为起点逐层向外查找。
 */
export const findTarget = (direction: Direction): EPGNode | null => {
  const current = currentOrigin();
  if (current === null) {
    return null;
  }
  let origin: EPGNode = current;
  for (;;) {
    const parent = getParentGroup(origin);
    const target = searchLevel(direction, origin, parent, current);
    if (target !== null || parent === null) {
      return target;
    }
    origin = parent;
  }
};

/**
 * 编程式按方向移动：不派发方向事件。
 * @returns 焦点是否发生移动
 */
export const moveInDirection = (direction: Direction): boolean => {
  if (currentOrigin() === null) {
    debug("当前没有可用焦点，无法按方向移动");
    return false;
  }
  const target = findTarget(direction);
  return target !== null && moveToNode(target);
};

/** `scope` 内（为 `null` 时为整个页面）最近获得过焦点、现在仍可获得焦点的元素 */
const recentIn = (scope: EPGGroup | null): EPGItem | null => {
  for (const item of getFocusHistory().slice().reverse()) {
    if ((scope === null || scope.el.contains(item.el)) && isFocusable(item)) {
      return item;
    }
  }
  return null;
};

/**
 * 当前焦点已失效（被卸载、隐藏）时恢复焦点：
 * 进入焦点路径中最内层仍可进入的分组；都不可用时进入页面入口。
 * 开启 `restoreFocus` 时，优先回到该范围内最近获得过焦点的元素。
 */
const recover = (): boolean => {
  const preferRecent = getConfig().restoreFocus;
  for (const group of getFocusPath()) {
    const entry = entryOf(group);
    if (entry !== null) {
      const target = (preferRecent ? recentIn(group) : null) ?? entry;
      debug("当前焦点不可用，在原来的分组内恢复", group, target);
      return moveToItem(target);
    }
  }
  const target = (preferRecent ? recentIn(null) : null) ?? resolveEntry();
  debug("当前焦点不可用，在页面内恢复", target);
  return target !== null && moveToItem(target);
};

let restoreTimer: number | null = null;

/**
 * 当前焦点被注销后，开启 `restoreFocus` 时恢复焦点。
 * 推迟到宏任务：框架在微任务中完成渲染，业务在 `nextTick` 中设置的焦点优先。
 */
export const scheduleRestore = (): void => {
  if (!getConfig().restoreFocus || restoreTimer !== null) {
    return;
  }
  restoreTimer = window.setTimeout(() => {
    restoreTimer = null;
    if (getCurrentItem() === null) {
      recover();
    }
  }, 0);
};

/** @internal 仅供测试：取消尚未执行的恢复 */
export const resetRestore = (): void => {
  if (restoreTimer !== null) {
    window.clearTimeout(restoreTimer);
    restoreTimer = null;
  }
};

/**
 * 响应用户的方向操作（按键或 `navigate()`）：
 * 1. 当前没有焦点或焦点已失效时，恢复焦点（见 {@link recover}）；
 * 2. 在当前 EPGItem 上派发方向事件；
 * 3. 逐层向外查找目标：某一层的组内找不到目标时，在该组上派发方向事件，再到外层继续；
 *    整页都没有目标时，每一层祖先分组都会收到方向事件；
 * 4. 任一事件被 `preventDefault()` 或处理函数自行移动了焦点，则停止。
 * @returns 焦点是否发生变化
 */
export const navigate = (direction: Direction): boolean => {
  const current = currentOrigin();
  if (current === null) {
    return recover();
  }
  const changed = (): boolean => getCurrentItem() !== current;
  const proceed = (node: EPGNode): boolean =>
    emit(node.el, `epg-${direction}` as const, { node, direction }) && !changed();

  if (!proceed(current)) {
    return changed();
  }
  let origin: EPGNode = current;
  for (;;) {
    const parent = getParentGroup(origin);
    const target = searchLevel(direction, origin, parent, current);
    if (target !== null) {
      moveToNode(target);
      return changed();
    }
    if (parent === null || !proceed(parent)) {
      return changed();
    }
    origin = parent;
  }
};
