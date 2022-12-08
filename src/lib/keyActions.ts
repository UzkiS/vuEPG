import type { KeyActions } from "./types";

export const keyActions: KeyActions = {
  UP: {
    code: ["ArrowUp", 87, 19, 38],
    preventDefault: true,
    callback: null,
  },
  DOWN: {
    code: ["ArrowDown", 83, 40, 20, 47],
    preventDefault: true,
    callback: null,
  },
  LEFT: {
    code: ["ArrowLeft", 65, 29, 21, 37],
    preventDefault: true,
    callback: null,
  },
  RIGHT: {
    code: ["ArrowRight", 68, 22, 32, 39],
    preventDefault: true,
    callback: null,
  },
  ENTER: {
    code: ["Enter", "NumpadEnter", 13, 73, 66, 23, 1],
    preventDefault: true,
    callback: null,
  },
  BACK: {
    code: ["Backspace", 4, 27, 8],
    preventDefault: true,
    callback: null,
  },
  PAGEACTION: {
    code: ["PageUp", "PageDown", 33, 34],
    preventDefault: true,
    callback: null,
  },
  NUMBER: {
    code: [
      "Digit1",
      "Digit2",
      "Digit3",
      "Digit4",
      "Digit5",
      "Digit6",
      "Digit7",
      "Digit8",
      "Digit9",
      "Digit0",
      "Numpad1",
      "Numpad2",
      "Numpad3",
      "Numpad4",
      "Numpad5",
      "Numpad6",
      "Numpad7",
      "Numpad8",
      "Numpad9",
      "Numpad0",
      49,
      50,
      51,
      52,
      53,
      54,
      55,
      56,
      57,
      48,
      96,
      97,
      98,
      99,
      100,
      101,
      102,
      103,
      104,
      105,
    ],
    preventDefault: false,
    callback: null,
  },
};

/**
 * 获取当前 keyActions 对象
 * @returns
 */
export const getCurrentKeyActions = () => keyActions;

/**
 * 设置一个新的按键事件
 * @param actionName 事件名称
 * @param code 对应按键的 code/keyCode/which 数组
 * @param preventDefault 是否阻止自定义事件
 * @param callback 回调函数 存在 keyCode 传参
 */
export const setAction = (
  actionName: string,
  code: (string | number)[],
  callback: Function | null = null,
  preventDefault: boolean = false
) => {
  keyActions[actionName] = {
    code: [...new Set(code)],
    preventDefault,
    callback,
  };
};

/**
 * 设置事件的回调函数
 * @param actionName 事件名称
 * @param callback 回调函数, 不设置时为清除回调
 */
export const setActionCallback = (
  actionName: string,
  callback: Function | null = null
) => {
  if (keyActions[actionName]) {
    keyActions[actionName].callback = callback;
  } else {
    console.error(`action: ${actionName} 不存在`);
  }
};

/**
 * 将按键添加到事件中
 * @param actionName 事件名称
 * @param code 按键 code/keyCode/which 数组
 */
export const addCodeToAction = (
  actionName: string,
  code: (string | number)[]
) => {
  if (keyActions[actionName]) {
    keyActions[actionName].code = [
      ...new Set([...keyActions[actionName].code, ...code]),
    ];
  } else {
    console.error(`action: ${actionName} 不存在`);
  }
};

/**
 * 从某事件中移除 code
 * @param actionName 事件名称
 * @param code 按键 code/keyCode/which 数组
 * @returns boolean
 */
export const removeCodeFromAction = (
  actionName: string,
  code: (string | number)[]
) => {
  const buffer = [...new Set(code)];
  if (keyActions[actionName]) {
    buffer.forEach((code) => {
      const index = keyActions[actionName].code.findIndex(
        (item) => item == code
      );
      index > -1 && keyActions[actionName].code.splice(index, 1);
    });
    return true;
  } else {
    console.error(`action: ${actionName} 不存在`);
    return false;
  }
};
