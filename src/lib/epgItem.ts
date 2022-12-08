import { isVue2, type VNode } from "vue-demi";
import type { CVNode, Events } from "./types";
import { generateID } from "./utils";

export default class EPGItem {
  /**
   * 当前 EPGItem 的 DOM 元素
   */
  el: HTMLElement | undefined = undefined;
  /**
   * 当前元素是否未默认选择的元素
   */
  isDefault: boolean = false;
  /**
   * 是否为当前焦点
   */
  isFocus: boolean = false;
  /**
   * 当前元素的唯一 ID
   */
  id: string = generateID();
  /**
   * 返回当前 EPGItem 的 HTMLElement 的 getBoundingClientRect
   */
  getRect() {
    return this.el?.getBoundingClientRect();
  }
  /**
   * 当前元素的所有监听器函数
   */
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
  focusClass: string | undefined = undefined;
  constructor(
    vnode: VNode,
    binding: {
      [x: string]: any;
      value: { default: boolean; class: string };
    }
  ) {
    if (isVue2) {
      this.el = (vnode as CVNode).elm as HTMLElement;
    } else {
      this.el = (vnode as CVNode).el as HTMLElement;
    }

    if (this.el.dataset.epgItemId) {
      this.id = this.el.dataset.epgItemId;
    } else {
      this.el.dataset.epgItemId = this.id;
    }
    this.isDefault = !!(binding.value && binding.value.default);
    this.isFocus = false;
    // 将binding中的default、value等信息进行赋值
    if (binding.value && binding.value.class) {
      binding.value.class && (this.focusClass = binding.value.class);
    }
    if (isVue2) {
      if ((vnode as CVNode).data?.on) {
        [
          "click",
          "focus",
          "blur",
          "left",
          "right",
          "up",
          "down",
          "enter",
        ].forEach((type) => {
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
      if ((vnode as CVNode).props?.onBlur) {
        this.events.blur = (vnode as CVNode).props.onBlur!;
      }
      if ((vnode as CVNode).props?.onFocus) {
        this.events.focus = (vnode as CVNode).props.onFocus!;
      }
      if ((vnode as CVNode).props?.onClick) {
        this.events.click = (vnode as CVNode).props.onClick!;
      }
      if ((vnode as CVNode).props?.onEnter) {
        this.events.click = (vnode as CVNode).props.onEnter!;
      }
    }
  }
}
