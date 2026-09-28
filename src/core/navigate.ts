import { isHidden } from "./dom";
import { getConfig } from "./config";
import { emit } from "./events";
import { getCurrentItem, getFocusPath, moveToItem, moveToNode } from "./focus";
import { debug } from "./logger";
import { analyzeNearest, type Direction } from "./navigation";
import type { EPGGroup, EPGItem, EPGNode } from "./nodes";
import { entryOf, getChildren, getParentGroup, resolveEntry } from "./tree";

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
  const analysis = analyzeNearest(
    direction,
    origin.getRect(),
    candidates,
    origin === anchor ? undefined : anchor.getRect(),
  );
  const [best] = analysis.ranked;
  if (getConfig().debug) {
    debug(`方向 ${direction}：在`, parent ?? "顶层", "中查找", {
      方向上的候选: analysis.ahead.map((c) => c.value),
      参与比较: analysis.ranked.map((c) => c.value),
      结果: best?.value ?? null,
    });
  }
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

/**
 * 当前焦点已失效（被卸载、隐藏）时恢复焦点：
 * 进入焦点路径中最内层仍可进入的分组；都不可用时进入页面入口。
 */
const recover = (): boolean => {
  for (const group of getFocusPath()) {
    const entry = entryOf(group);
    if (entry !== null) {
      debug("当前焦点不可用，在原来的分组内恢复", group);
      return moveToItem(entry);
    }
  }
  const entry = resolveEntry();
  debug("当前焦点不可用，回到页面入口", entry);
  return entry !== null && moveToItem(entry);
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
