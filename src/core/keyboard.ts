import { back } from "./back";
import { isEditable } from "./dom";
import { activate } from "./focus";
import { debug } from "./logger";
import { navigate } from "./navigate";

/** 按键标识：`event.code`（字符串）或 `event.which` / `event.keyCode`（数字） */
export type KeyCode = string | number;

/** 按键事件回调 */
export type KeyActionCallback = (code: KeyCode, event: KeyboardEvent) => void;

/** 按键事件 */
export interface KeyAction {
  /** 触发该事件的按键 */
  readonly codes: readonly KeyCode[];
  /** 是否阻止浏览器默认行为 */
  readonly preventDefault: boolean;
  /** 触发后的回调，在内置行为之后执行 */
  readonly callback: KeyActionCallback | null;
}

/** 创建按键事件时的参数 */
export interface KeyActionOptions {
  codes: readonly KeyCode[];
  /** @defaultValue `false` */
  preventDefault?: boolean;
  /** @defaultValue `null` */
  callback?: KeyActionCallback | null;
}

/** 内置按键事件：驱动焦点移动、点击与返回，不可删除 */
export type BuiltinKeyActionName = "UP" | "DOWN" | "LEFT" | "RIGHT" | "ENTER" | "BACK";

const BUILTIN_HANDLERS: Readonly<Record<BuiltinKeyActionName, () => void>> = {
  UP: () => {
    navigate("up");
  },
  DOWN: () => {
    navigate("down");
  },
  LEFT: () => {
    navigate("left");
  },
  RIGHT: () => {
    navigate("right");
  },
  ENTER: activate,
  BACK: back,
};

const isBuiltin = (name: string): name is BuiltinKeyActionName =>
  Object.prototype.hasOwnProperty.call(BUILTIN_HANDLERS, name);

// #region default-key-actions
/**
 * 默认按键映射：兼顾 PC 键盘与常见机顶盒遥控器。
 * 字符串为 `event.code`；数字为 `event.which` / `event.keyCode`，
 * 只在 `event.code` 缺失（旧内核）或为 `"Unidentified"` 时参与匹配。
 */
const DEFAULT_KEY_ACTIONS: ReadonlyMap<string, KeyAction> = new Map([
  // 38 方向键 · 19 Android 方向键 · 87 W 键
  ["UP", { codes: ["ArrowUp", 87, 19, 38], preventDefault: true, callback: null }],
  // 40 方向键 · 20 Android 方向键 · 83 S 键 · 47 Android S 键
  ["DOWN", { codes: ["ArrowDown", 83, 40, 20, 47], preventDefault: true, callback: null }],
  // 37 方向键 · 21 Android 方向键 · 65 A 键 · 29 Android A 键
  ["LEFT", { codes: ["ArrowLeft", 65, 29, 21, 37], preventDefault: true, callback: null }],
  // 39 方向键 · 22 Android 方向键 · 68 D 键 · 32 Android D 键（亦为空格键）
  ["RIGHT", { codes: ["ArrowRight", 68, 22, 32, 39], preventDefault: true, callback: null }],
  // 13 回车 · 23 Android 确定键 · 66 Android 回车键 · 73、1 沿用自 vue-epg
  [
    "ENTER",
    { codes: ["Enter", "NumpadEnter", 13, 73, 66, 23, 1], preventDefault: true, callback: null },
  ],
  // 8 退格 · 27 Esc · 4 Android 返回键 · 10009 Tizen 返回键 · 461 webOS 返回键
  [
    "BACK",
    {
      codes: ["Backspace", "Escape", 4, 27, 8, 10009, 461],
      preventDefault: true,
      callback: null,
    },
  ],
  ["PAGE", { codes: ["PageUp", "PageDown", 33, 34], preventDefault: true, callback: null }],
  [
    "NUMBER",
    {
      // prettier-ignore
      codes: [
        "Digit0", "Digit1", "Digit2", "Digit3", "Digit4",
        "Digit5", "Digit6", "Digit7", "Digit8", "Digit9",
        "Numpad0", "Numpad1", "Numpad2", "Numpad3", "Numpad4",
        "Numpad5", "Numpad6", "Numpad7", "Numpad8", "Numpad9",
        48, 49, 50, 51, 52, 53, 54, 55, 56, 57,
        96, 97, 98, 99, 100, 101, 102, 103, 104, 105,
      ],
      preventDefault: false,
      callback: null,
    },
  ],
]);
// #endregion default-key-actions

/** 按键映射：唯一事实源，按插入顺序匹配 */
let actions = new Map(DEFAULT_KEY_ACTIONS);

const unique = (codes: readonly KeyCode[]): KeyCode[] =>
  codes.filter((code, index) => codes.indexOf(code) === index);

const requireAction = (name: string): KeyAction => {
  const action = actions.get(name);
  if (action === undefined) {
    throw new Error(`[vuEPG] 按键事件 "${name}" 不存在`);
  }
  return action;
};

/** 获取全部按键事件（只读快照） */
export const getKeyActions = (): Readonly<Record<string, KeyAction>> => {
  const snapshot: Record<string, KeyAction> = {};
  actions.forEach((action, name) => {
    snapshot[name] = action;
  });
  return Object.freeze(snapshot);
};

/** 新增或替换一个按键事件 */
export const setKeyAction = (name: string, options: KeyActionOptions): void => {
  actions.set(name, {
    codes: Object.freeze(unique(options.codes)),
    preventDefault: options.preventDefault ?? false,
    callback: options.callback ?? null,
  });
};

/**
 * 修改已有按键事件的部分字段
 * @throws 事件不存在时
 */
export const updateKeyAction = (name: string, patch: Partial<KeyActionOptions>): void => {
  const action = requireAction(name);
  setKeyAction(name, {
    codes: patch.codes ?? action.codes,
    preventDefault: patch.preventDefault ?? action.preventDefault,
    callback: patch.callback === undefined ? action.callback : patch.callback,
  });
};

/**
 * 删除按键事件
 * @returns 是否删除了事件
 * @throws 尝试删除内置事件时
 */
export const removeKeyAction = (name: string): boolean => {
  if (isBuiltin(name)) {
    throw new Error(`[vuEPG] 内置按键事件 "${name}" 不可删除`);
  }
  return actions.delete(name);
};

/**
 * 为按键事件追加按键
 * @throws 事件不存在时
 */
export const addKeyCodes = (name: string, codes: readonly KeyCode[]): void => {
  updateKeyAction(name, { codes: requireAction(name).codes.concat(codes) });
};

/**
 * 从按键事件中移除按键
 * @throws 事件不存在时
 */
export const removeKeyCodes = (name: string, codes: readonly KeyCode[]): void => {
  updateKeyAction(name, {
    codes: requireAction(name).codes.filter((code) => codes.indexOf(code) === -1),
  });
};

/** 暂停的持有者：每次 `pause()` 登记一个，全部释放后恢复响应 */
const pauseHolds = new Set<object>();

/**
 * 暂停响应按键（如弹出原生输入框、全屏播放时）
 * @returns 释放本次暂停的函数；多处同时暂停时，全部释放后才恢复
 */
export const pause = (): (() => void) => {
  const hold = {};
  pauseHolds.add(hold);
  return () => {
    pauseHolds.delete(hold);
  };
};

/** 立即恢复响应按键（同时释放所有暂停） */
export const resume = (): void => {
  pauseHolds.clear();
};

/** 是否已暂停 */
export const isPaused = (): boolean => pauseHolds.size > 0;

/**
 * 解析按键标识：优先 `event.code`，缺失或为 `"Unidentified"` 时依次回退到 `which`、`keyCode`。
 * 部分机顶盒浏览器只提供数字键值。
 */
export const resolveKeyCode = (event: KeyboardEvent): KeyCode | null => {
  // 不支持 KeyboardEvent.code 的内核上该属性为 undefined（DOM 类型声明为 string）
  const code: unknown = event.code;
  if (typeof code === "string" && code !== "" && code !== "Unidentified") {
    return code;
  }
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- 老旧机顶盒只提供 which / keyCode
  const legacy = event.which || event.keyCode;
  return legacy === 0 ? null : legacy;
};

const findActionName = (code: KeyCode): string | null => {
  let found: string | null = null;
  actions.forEach((action, name) => {
    if (found === null && action.codes.indexOf(code) !== -1) {
      found = name;
    }
  });
  return found;
};

/** 在可编辑元素中仍由 vuEPG 处理的按键事件：上下移动与返回 */
const EDITABLE_ACTIONS: readonly string[] = ["UP", "DOWN", "BACK"];

/** 输入或删除文字的 `event.code` */
const TEXT_CODE = /^(?:Key[A-Z]|Digit\d|Numpad\d|Space|Backspace|Delete)$/;

/**
 * 是否为输入或删除文字的按键：即使属于上述事件，在可编辑元素中也交给浏览器。
 * 数字键值：8 退格 · 32 空格 · 46 删除 · 48–111 数字、字母与小键盘 · 186–222 标点 · 47 Android S 键
 */
const isTextKey = (code: KeyCode): boolean => {
  if (typeof code === "string") {
    return TEXT_CODE.test(code);
  }
  return (
    code === 8 ||
    code === 32 ||
    code === 46 ||
    code === 47 ||
    (code >= 48 && code <= 111) ||
    (code >= 186 && code <= 222)
  );
};

/** 输入法正在组字：此时的按键（包括方向键与 Esc）属于输入法 */
const isComposing = (event: KeyboardEvent): boolean =>
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- 不支持 isComposing 的内核以 keyCode 229 标记输入法按键
  event.isComposing || event.keyCode === 229;

/** keydown 处理函数 */
export const handleKeydown = (event: KeyboardEvent): void => {
  if (isPaused() || isComposing(event)) {
    return;
  }
  const code = resolveKeyCode(event);
  const name = code === null ? null : findActionName(code);
  debug("按键", code, "→", name);
  if (code === null || name === null) {
    return;
  }
  if (isEditable(event.target) && (EDITABLE_ACTIONS.indexOf(name) === -1 || isTextKey(code))) {
    debug("按键目标是可编辑元素，交给浏览器处理");
    return;
  }
  const action = requireAction(name);
  if (action.preventDefault) {
    event.preventDefault();
  }
  if (isBuiltin(name)) {
    BUILTIN_HANDLERS[name]();
  }
  action.callback?.(code, event);
};

let listening = false;

/** 开始监听键盘（重复调用无副作用） */
export const listenKeyboard = (target: Document): void => {
  if (!listening) {
    target.addEventListener("keydown", handleKeydown);
    listening = true;
  }
};

/** @internal 仅供测试：恢复默认按键映射并取消暂停 */
export const resetKeyboard = (): void => {
  actions = new Map(DEFAULT_KEY_ACTIONS);
  pauseHolds.clear();
};
