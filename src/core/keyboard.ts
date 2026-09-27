import { back } from "./back";
import { activate, navigate } from "./focus";
import { debug } from "./logger";

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
/** 默认按键映射：兼顾 PC 键盘与常见机顶盒遥控器 */
const DEFAULT_KEY_ACTIONS: ReadonlyMap<string, KeyAction> = new Map([
  ["UP", { codes: ["ArrowUp", 87, 19, 38], preventDefault: true, callback: null }],
  ["DOWN", { codes: ["ArrowDown", 83, 40, 20, 47], preventDefault: true, callback: null }],
  ["LEFT", { codes: ["ArrowLeft", 65, 29, 21, 37], preventDefault: true, callback: null }],
  ["RIGHT", { codes: ["ArrowRight", 68, 22, 32, 39], preventDefault: true, callback: null }],
  [
    "ENTER",
    { codes: ["Enter", "NumpadEnter", 13, 73, 66, 23, 1], preventDefault: true, callback: null },
  ],
  ["BACK", { codes: ["Backspace", "Escape", 4, 27, 8], preventDefault: true, callback: null }],
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

let paused = false;

/** 暂停响应按键（如弹出原生输入框时） */
export const pause = (): void => {
  paused = true;
};

/** 恢复响应按键 */
export const resume = (): void => {
  paused = false;
};

/** 是否已暂停 */
export const isPaused = (): boolean => paused;

/**
 * 解析按键标识：优先 `event.code`，缺失或为 `"Unidentified"` 时依次回退到 `which`、`keyCode`。
 * 部分机顶盒浏览器只提供数字键值。
 */
export const resolveKeyCode = (event: KeyboardEvent): KeyCode | null => {
  if (event.code !== "" && event.code !== "Unidentified") {
    return event.code;
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

/** keydown 处理函数 */
export const handleKeydown = (event: KeyboardEvent): void => {
  if (paused) {
    return;
  }
  const code = resolveKeyCode(event);
  const name = code === null ? null : findActionName(code);
  debug("按键", code, "→", name);
  if (code === null || name === null) {
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
  paused = false;
};
