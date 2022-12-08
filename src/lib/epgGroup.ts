import { isVue2, type VNode } from "vue-demi";
import type EPGItem from "./epgItem";
import { getGroupChildrenByHTMLElement } from "./service";
import type { CVNode, Events } from "./types";
import { generateID } from "./utils";

export default class EPGGroup {
  /**
   * 当前组的唯一 ID
   */
  id: string = generateID();
  /**
   * 当前 EPGGroup 的 DOM 元素
   */
  el: HTMLElement | undefined = undefined;
  /**
   * 当前元素的第一层子 EPGItem / EPGGroup
   */
  children: (EPGItem | EPGGroup)[] = [];
  /**
   * 更新当前元素的首层子 EPGItem / EPGGroup
   */
  updateChildren() {
    this.children = getGroupChildrenByHTMLElement(this.el as HTMLElement);
    return this.children;
  }
  /**
   * 返回当前 EPGGroup 的 HTMLElement 的 getBoundingClientRect
   */
  getRect() {
    return this.el?.getBoundingClientRect();
  }
  events: Events = {
    click: null,
    focus: null,
    blur: null,
    left: null,
    right: null,
    up: null,
    down: null,
    enter: null,
  };
  constructor(vnode: VNode, binding: any) {
    if (isVue2) {
      this.el = (vnode as CVNode).elm as HTMLElement;
    } else {
      this.el = (vnode as CVNode).el as HTMLElement;
    }
    if (this.el.dataset.epgGroupId) {
      this.id = this.el.dataset.epgGroupId;
    } else {
      this.el.dataset.epgGroupId = this.id;
    }
    this.updateChildren();
    if (isVue2) {
      if ((vnode as CVNode).data?.on) {
        ["left", "right", "up", "down", "enter"].forEach((type) => {
          if ((vnode as CVNode).data.on!.hasOwnProperty(type)) {
            this.events[type] = (vnode as CVNode).data.on![type];
          }
        });
      }
    } else {
      if ((vnode as CVNode).props?.onUp) {
        this.events.up = (vnode as CVNode).props.onUp!;
      }
      if ((vnode as CVNode).props?.onDown) {
        this.events.down = (vnode as CVNode).props.onDown!;
      }
      if ((vnode as CVNode).props?.onLeft) {
        this.events.left = (vnode as CVNode).props.onLeft!;
      }
      if ((vnode as CVNode).props?.onRight) {
        this.events.right = (vnode as CVNode).props.onRight!;
      }
      if ((vnode as CVNode).props?.onEnter) {
        this.events.right = (vnode as CVNode).props.onEnter!;
      }
    }
  }
}
