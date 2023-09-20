import type { VNode } from "vue-demi";
import type EPGGroup from "./epgGroup";
import type EPGItem from "./epgItem";

export interface Events {
  [x: string]: null | Function | Function[];
  click: null | Function | Function[];
  focus: null | Function | Function[];
  blur: null | Function | Function[];
  left: null | Function | Function[];
  right: null | Function | Function[];
  up: null | Function | Function[];
  down: null | Function | Function[];
  enter: null | Function | Function[];
}

export type MoveType = "right" | "left" | "down" | "up";

export interface EPGConfig {
  /** 焦点元素的 Class */
  focusClass?: string;
  /** 默认返回处理函数 */
  defBackHandler?: Function | null;
  /** 临时返回处理函数 */
  tempBackHandler?: Function | null;
  /** 开启控制台输出 */
  debug?: boolean;
}

export interface EPGDocument extends Document {
  onsystemevent: ((this: GlobalEventHandlers, ev: KeyboardEvent) => any) | null;
  onirkeypress: ((this: GlobalEventHandlers, ev: KeyboardEvent) => any) | null;
  onkeypress: ((this: GlobalEventHandlers, ev: KeyboardEvent) => any) | null;
}

export interface KeyActions {
  [x: string]: {
    code: (string | number)[];
    preventDefault: boolean;
    callback: Function | null;
  };
}

export interface DataContainer {
  currentItem: EPGItem | null;
  itemArray: EPGItem[];
  currentGroup: EPGGroup | null;
  groupArray: EPGGroup[];
}

/**
 * Vue2、3 VNode 的兼容 Type
 */
export interface CVNode extends VNode {
  props: {
    onClick?: null | Function | Function[];
    onFocus?: null | Function | Function[];
    onBlur?: null | Function | Function[];
    onLeft?: null | Function | Function[];
    onRight?: null | Function | Function[];
    onUp?: null | Function | Function[];
    onDown?: null | Function | Function[];
    onEnter?: null | Function | Function[];
  };
  el: Node | null;
  elm: Node | undefined;
  data: { on?: { [key: string]: Function | Function[] } };
}
