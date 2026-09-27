import type { Direction } from "./navigation";
import type { EPGGroup, EPGItem, EPGNode } from "./nodes";

/** 方向事件的 `detail` */
export interface DirectionEventDetail {
  /** 派发事件的节点 */
  readonly node: EPGNode;
  readonly direction: Direction;
}

/**
 * 各事件的 `detail` 类型。
 * 事件名统一带 `epg-` 前缀，避免与浏览器原生事件（如 `focus`、`blur`）冲突。
 */
export interface EPGEventDetailMap {
  /** EPGItem 获得焦点 */
  "epg-focus": { readonly item: EPGItem };
  /** EPGItem 失去焦点 */
  "epg-blur": { readonly item: EPGItem };
  /** 焦点进入 EPGGroup */
  "epg-enter": { readonly group: EPGGroup };
  /** 焦点离开 EPGGroup */
  "epg-leave": { readonly group: EPGGroup };
  /** 按下方向键（可取消） */
  "epg-up": DirectionEventDetail;
  "epg-down": DirectionEventDetail;
  "epg-left": DirectionEventDetail;
  "epg-right": DirectionEventDetail;
}

/** 事件名 */
export type EPGEventName = keyof EPGEventDetailMap;

/** vuEPG 派发的 DOM 事件 */
export type EPGEvent<Name extends EPGEventName = EPGEventName> = CustomEvent<
  EPGEventDetailMap[Name]
>;

/**
 * 在元素上派发不冒泡、可取消的 CustomEvent。
 * @returns 事件未被 `preventDefault()` 时返回 `true`
 */
export const emit = <Name extends EPGEventName>(
  el: Element,
  name: Name,
  detail: EPGEventDetailMap[Name],
): boolean => el.dispatchEvent(new CustomEvent(name, { bubbles: false, cancelable: true, detail }));
