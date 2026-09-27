import { isHidden } from "./dom";
import { EPGGroup, EPGItem, type EPGNode } from "./nodes";
import { findNode, listNodes } from "./registry";

/** 通过元素获取已注册的节点 */
export const getNodeByElement = (el: Element): EPGNode | null => {
  return findNode(el);
};

/** 获取节点（或元素）最近的父级 EPGGroup */
export const getParentGroup = (target: EPGNode | Element): EPGGroup | null => {
  let el = (target instanceof Element ? target : target.el).parentElement;
  while (el !== null) {
    const node = findNode(el);
    if (node instanceof EPGGroup) {
      return node;
    }
    el = el.parentElement;
  }
  return null;
};

/** 获取节点的所有祖先 EPGGroup，由内向外 */
export const getAncestorGroups = (node: EPGNode): EPGGroup[] => {
  const groups: EPGGroup[] = [];
  let group = getParentGroup(node);
  while (group !== null) {
    groups.push(group);
    group = getParentGroup(group);
  }
  return groups;
};

/**
 * 获取直接子节点：`group` 内部第一层的 EPGItem / EPGGroup（中间可隔任意普通元素）。
 * 不传 `group` 时返回顶层节点（不属于任何 EPGGroup 的节点）。
 */
export const getChildren = (group?: EPGGroup | null): EPGNode[] => {
  const root = group ? group.el : typeof document === "undefined" ? null : document.documentElement;
  return root === null ? [] : collectChildren(root);
};

const collectChildren = (root: Element): EPGNode[] => {
  const result: EPGNode[] = [];
  // Array.from 可回退到类数组遍历；老旧浏览器中 HTMLCollection 不可迭代，不能直接 for-of
  for (const child of Array.from(root.children)) {
    const node = findNode(child);
    if (node === null) {
      result.push(...collectChildren(child));
    } else {
      result.push(node);
    }
  }
  return result;
};

/** 获取 EPGGroup 内部的全部 EPGItem（任意深度），按文档顺序 */
export const getItemsInGroup = (group: EPGGroup): EPGItem[] => {
  const items: EPGItem[] = [];
  for (const el of Array.from(group.el.getElementsByTagName("*"))) {
    const node = findNode(el);
    if (node instanceof EPGItem) {
      items.push(node);
    }
  }
  return items;
};

/** 所有已注册的 EPGItem */
export const getItems = (): EPGItem[] => {
  return listNodes().filter((node): node is EPGItem => node instanceof EPGItem);
};

/** 所有已注册的 EPGGroup */
export const getGroups = (): EPGGroup[] => {
  return listNodes().filter((node): node is EPGGroup => node instanceof EPGGroup);
};

/** EPGItem 当前能否获得焦点：未禁用且已渲染 */
export const isFocusable = (item: EPGItem): boolean => {
  return !item.isDisabled && !isHidden(item.el);
};

/**
 * 解析进入某一层级时应获得焦点的 EPGItem：
 * 优先 `default` 节点，其次按文档顺序第一个；遇到 EPGGroup 则递归进入。
 * 不传 `group` 时从顶层开始解析。
 */
export const resolveEntry = (group?: EPGGroup | null): EPGItem | null => {
  const children = getChildren(group);
  const ordered = children.filter((n) => n.isDefault).concat(children.filter((n) => !n.isDefault));
  for (const node of ordered) {
    const entry = entryOf(node);
    if (entry !== null) {
      return entry;
    }
  }
  return null;
};

/** 节点作为导航目标时实际获得焦点的 EPGItem；不可达时返回 `null` */
export const entryOf = (node: EPGNode): EPGItem | null => {
  if (node instanceof EPGItem) {
    return isFocusable(node) ? node : null;
  }
  return node.isDisabled || isHidden(node.el) ? null : resolveEntry(node);
};
