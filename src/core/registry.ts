import type { EPGNode } from "./nodes";

/**
 * 节点注册表：元素 → 节点。
 * 这是「哪些元素参与焦点管理」的唯一事实源；层级关系不缓存，始终从 DOM 实时推导。
 */
const nodes = new Map<Element, EPGNode>();

export const addNode = (node: EPGNode): void => {
  nodes.set(node.el, node);
};

/** 移除并返回元素对应的节点 */
export const removeNode = (el: Element): EPGNode | null => {
  const node = nodes.get(el) ?? null;
  nodes.delete(el);
  return node;
};

/** 通过元素查找节点 */
export const findNode = (el: Element): EPGNode | null => {
  return nodes.get(el) ?? null;
};

/** 所有已注册节点，按注册顺序 */
export const listNodes = (): EPGNode[] => {
  return Array.from(nodes.values());
};

/** @internal 仅供测试：清空注册表 */
export const resetRegistry = (): void => {
  nodes.clear();
};
