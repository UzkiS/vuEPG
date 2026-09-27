/**
 * core 层门面：框架无关的焦点管理能力。
 * 本目录禁止依赖 vue（由 ESLint 强制），Vue 相关适配全部位于 `src/vue/`。
 */
import { mergeConfig, resetConfig, type EPGConfig } from "./config";
import { resetBack } from "./back";
import { moveInDirection, moveToNode, releaseFocus, resetFocus, syncFocusClass } from "./focus";
import { resetKeyboard } from "./keyboard";
import { debug, warn } from "./logger";
import { isDirection, type Direction } from "./navigation";
import {
  EPGGroup,
  EPGItem,
  type EPGGroupOptions,
  type EPGItemOptions,
  type EPGNode,
} from "./nodes";
import { addNode, findNode, removeNode, resetRegistry } from "./registry";

export { back, registerBackHandler, type BackEntry } from "./back";
export { getConfig, type BackHandler, type EPGConfig } from "./config";
export { isValidClassName } from "./dom";
export type { DirectionEventDetail, EPGEvent, EPGEventDetailMap, EPGEventName } from "./events";
export {
  findTarget,
  getCurrentGroup,
  getCurrentItem,
  getFocusClass,
  moveToGroup,
  moveToItem,
} from "./focus";
export {
  addKeyCodes,
  getKeyActions,
  type BuiltinKeyActionName,
  type KeyAction,
  type KeyActionCallback,
  type KeyActionOptions,
  type KeyCode,
  isPaused,
  listenKeyboard,
  pause,
  removeKeyAction,
  removeKeyCodes,
  resume,
  setKeyAction,
  updateKeyAction,
} from "./keyboard";
export { banner, warn } from "./logger";
export type { Direction } from "./navigation";
export type { EPGGroup, EPGGroupOptions, EPGItem, EPGItemOptions, EPGNode } from "./nodes";
export {
  getChildren,
  getGroups,
  getItems,
  getItemsInGroup,
  getNodeByElement,
  getParentGroup,
} from "./tree";

/** 可作为移动目标的值：节点、元素、组件实例（取其 `$el`） */
export type FocusTarget = EPGNode | Element | { readonly $el: unknown };

/**
 * 合并配置
 * @throws 当 `focusClass` 为空字符串或包含空白字符时
 */
export const setConfig = (patch: Partial<EPGConfig>): void => {
  mergeConfig(patch);
  syncFocusClass();
};

/** 判断值是否为 EPGItem */
export const isEPGItem = (value: unknown): value is EPGItem => value instanceof EPGItem;

/** 判断值是否为 EPGGroup */
export const isEPGGroup = (value: unknown): value is EPGGroup => value instanceof EPGGroup;

const resolveNode = (target: FocusTarget): EPGNode | null => {
  if (target instanceof EPGItem || target instanceof EPGGroup) {
    return target;
  }
  const el = target instanceof Element ? target : target.$el;
  return el instanceof Element ? findNode(el) : null;
};

/**
 * 移动焦点：
 * - 传入方向时，按移动规则移动到该方向上最近的目标；
 * - 传入节点、元素或组件实例时，移动到对应的 EPGItem，或进入对应的 EPGGroup。
 *
 * 编程式调用不会派发方向事件。
 * @returns 焦点是否移动到了目标
 */
export const move = (target: Direction | FocusTarget | null | undefined): boolean => {
  if (isDirection(target)) {
    return moveInDirection(target);
  }
  const node = target === null || target === undefined ? null : resolveNode(target);
  if (node === null) {
    debug("移动目标不是已注册的 EPGItem / EPGGroup", target);
    return false;
  }
  return moveToNode(node);
};

/** 向上移动，等同于 `move("up")` */
export const up = (): boolean => move("up");
/** 向下移动，等同于 `move("down")` */
export const down = (): boolean => move("down");
/** 向左移动，等同于 `move("left")` */
export const left = (): boolean => move("left");
/** 向右移动，等同于 `move("right")` */
export const right = (): boolean => move("right");

/** 登记节点；同一元素只能注册一次 */
const register = (node: EPGNode, attribute: string): void => {
  if (findNode(node.el) !== null) {
    warn("元素已被注册：同一元素不能同时使用 v-epg-item 与 v-epg-group", node.el);
    return;
  }
  addNode(node);
  node.el.setAttribute(attribute, node.id);
  debug("注册", node);
};

/** 注册 EPGItem */
export const registerItem = (el: HTMLElement, options: EPGItemOptions): void => {
  register(new EPGItem(el, options), "data-epg-item-id");
};

/** 注册 EPGGroup */
export const registerGroup = (el: HTMLElement, options: EPGGroupOptions): void => {
  register(new EPGGroup(el, options), "data-epg-group-id");
};

/** 更新 EPGItem 的配置，并修复可能被框架重渲染覆盖的焦点 class */
export const updateItem = (el: HTMLElement, options: EPGItemOptions): void => {
  const node = findNode(el);
  if (node instanceof EPGItem) {
    node.setOptions(options);
  }
  syncFocusClass();
};

/** 更新 EPGGroup 的配置 */
export const updateGroup = (el: HTMLElement, options: EPGGroupOptions): void => {
  const node = findNode(el);
  if (node instanceof EPGGroup) {
    node.setOptions(options);
  }
  syncFocusClass();
};

/** 注销节点；若它是当前焦点，焦点被清除 */
export const unregister = (el: HTMLElement): void => {
  const node = removeNode(el);
  if (node !== null) {
    node.el.removeAttribute(node instanceof EPGItem ? "data-epg-item-id" : "data-epg-group-id");
    releaseFocus(node);
    debug("注销", node);
  }
};

/** @internal 仅供测试：恢复全部初始状态 */
export const resetCore = (): void => {
  resetFocus();
  resetRegistry();
  resetKeyboard();
  resetBack();
  resetConfig();
};
