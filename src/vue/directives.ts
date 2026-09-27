import { version } from "vue";
import {
  isValidClassName,
  registerGroup,
  registerItem,
  unregister,
  updateGroup,
  updateItem,
  warn,
  type EPGGroupOptions,
  type EPGItemOptions,
} from "../core";

/** 指令钩子实际用到的绑定信息（Vue 2 / 3 通用的最小子集） */
interface Binding {
  /** 来自模板，需运行时校验 */
  readonly value: unknown;
}

type Hook = (el: HTMLElement, binding: Binding) => void;

/** 与框架版本无关的指令生命周期 */
interface DirectiveLifecycle {
  readonly mounted: Hook;
  readonly updated: Hook;
  readonly unmounted: Hook;
}

/** Vue 2 与 Vue 3 的指令钩子名不同，这是整个库唯一需要区分版本的地方 */
const isVue2 = version.startsWith("2.");

const defineDirective = (lifecycle: DirectiveLifecycle): object =>
  isVue2
    ? {
        inserted: lifecycle.mounted,
        componentUpdated: lifecycle.updated,
        unbind: lifecycle.unmounted,
      }
    : lifecycle;

/** 绑定值只接受对象或空值，其余情况给出警告并按空值处理 */
const toObject = (value: unknown, directive: string): object => {
  if (value === undefined || value === null) {
    return {};
  }
  if (typeof value !== "object") {
    warn(`${directive} 的绑定值必须是对象，收到`, value);
    return {};
  }
  return value;
};

const parseGroupOptions = (value: unknown): EPGGroupOptions => {
  const source = toObject(value, "v-epg-group");
  return {
    default: "default" in source && source.default === true,
    disabled: "disabled" in source && source.disabled === true,
  };
};

const parseItemOptions = (value: unknown): EPGItemOptions => {
  const source = toObject(value, "v-epg-item");
  const focusClass = "focusClass" in source ? source.focusClass : undefined;
  const options: EPGItemOptions = {
    default: "default" in source && source.default === true,
    disabled: "disabled" in source && source.disabled === true,
  };
  if (typeof focusClass === "string" && isValidClassName(focusClass)) {
    options.focusClass = focusClass;
  } else if (focusClass !== undefined) {
    warn("v-epg-item 的 focusClass 必须是不含空白字符的非空字符串，已忽略", focusClass);
  }
  return options;
};

/** `v-epg-item` */
export const itemDirective = defineDirective({
  mounted: (el, { value }) => {
    registerItem(el, parseItemOptions(value));
  },
  updated: (el, { value }) => {
    updateItem(el, parseItemOptions(value));
  },
  unmounted: (el) => {
    unregister(el);
  },
});

/** `v-epg-group` */
export const groupDirective = defineDirective({
  mounted: (el, { value }) => {
    registerGroup(el, parseGroupOptions(value));
  },
  updated: (el, { value }) => {
    updateGroup(el, parseGroupOptions(value));
  },
  unmounted: (el) => {
    unregister(el);
  },
});
