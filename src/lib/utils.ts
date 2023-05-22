import { currentConfig } from "./service";

/**
 * 获取所有后代元素
 * @param element HTMLElement | Node
 * @returns ChildNode[]
 */
export const getDescendant = (element: HTMLElement | Node): HTMLElement[] => {
  const children = element.childNodes;
  let buffer: HTMLElement[] = [];
  for (let i = 0; i < children.length; i++) {
    const childNode = children[i];
    if (childNode.nodeType == 1) {
      buffer.push(childNode as HTMLElement);
      buffer = [...buffer, ...getDescendant(childNode)];
    }
  }
  return buffer;
};

/**
 * 生成唯一 ID
 */
export const generateID = (pre: string = ""): string =>
  pre +
  Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substring(0, 10);

/**
 * 判断元素是否隐藏
 * @param el
 * @returns
 */
export const isHidden = (el: HTMLElement) => {
  return el.offsetParent == null;
};

/**
 * consle.log
 */
export const selfLog = (...data: any[]): void => {
  currentConfig.debug &&
    console.log(
      "%cvuEPG",
      "color:white; background: linear-gradient(270deg, skyblue, pink); padding: 5px 8px; border-radius: 15px 15px 0 15px",
      ...data
    );
};
