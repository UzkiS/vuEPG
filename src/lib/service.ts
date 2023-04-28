import {
  addCodeToAction,
  getCurrentKeyActions,
  keyActions,
  removeAction,
  removeCodeFromAction,
  setAction,
  setActionCallback,
  setActionPreventDefault,
} from "./keyActions";
import type EPGItem from "./epgItem";
import type EPGGroup from "./epgGroup";
import type { DataContainer, EPGConfig, EPGDocument, MoveType } from "./types";
import { getDescendant, selfLog } from "./utils";
import { onActivated, onDeactivated, onMounted, onUnmounted } from "vue-demi";
import { getRecentTarget } from "./moveRule";
import { getItemByDirectionOld } from "./compatible/move";

export const dataContainer: DataContainer = {
  currentItem: null,
  itemArray: [],
  currentGroup: null,
  groupArray: [],
};

export const currentConfig: EPGConfig = {
  focusClass: "vuepg-focus",
  defBackHandler: null,
  tempBackHandler: null,
  useOldMoveRule: false,
  debug: false,
};

/**
 * 设置配置
 * @param config EPGConfig
 */
export const setConfig = (config: EPGConfig) => {
  Object.assign(currentConfig, config);
};

/**
 * 设置临时返回处理函数
 * @param func 回调函数
 */
const setTempBack = (func: Function) => {
  Object.assign(currentConfig, {
    tempBackHandler: func,
  });
};

/**
 * 设置临时返回处理函数
 */
const unsetTempBack = () => {
  Object.assign(currentConfig, {
    tempBackHandler: null,
  });
};
/**
 * 设置临时的返回的回调函数
 * @param func 回调函数
 */
export const onBack = (func: Function) => {
  selfLog("注册 onBack 生命周期");
  onMounted(() => {
    setTempBack(func);
  });
  onActivated(() => {
    setTempBack(func);
  });
  onDeactivated(() => {
    unsetTempBack();
  });
  onUnmounted(() => {
    unsetTempBack();
  });
};

/** 获取当前 Item */
export const getCurrentItem = () => dataContainer.currentItem;
/** 获取所有 Item */
export const getItems = () => dataContainer.itemArray;
/** 获取当前 Group */
export const getCurrentGroup = () => dataContainer.currentGroup;
/** 获取所有 Group */
export const getGroups = () => dataContainer.groupArray;
/** 获取当前选中元素的 Class */
export const getFoucsClass = () =>
  dataContainer.currentItem?.focusClass || currentConfig.focusClass;

/** 返回处理 */
const backHandler = () => {
  if (currentConfig.tempBackHandler) {
    selfLog("调用页面临时 BackHandler");
    currentConfig.tempBackHandler();
  } else {
    selfLog("调用全局默认 BackHandler");
    currentConfig.defBackHandler && currentConfig.defBackHandler();
  }
};
/** 注册 EPGItem */
export const registerItem = (item: EPGItem) => {
  dataContainer.itemArray.push(item);
};
/** 更新 EPGItem 状态 */
export const updateItem = (newItem: EPGItem) => {
  dataContainer.itemArray.forEach((item) => {
    if (item.id === newItem.id) {
      Object.assign(item, newItem);
    }
  });
};
/** 注册EPGGroup */
export const registerGroup = (group: EPGGroup) => {
  dataContainer.groupArray.push(group);
};
/** 更新 EPGGroup 状态 */
export const updateGroup = (newGroup: EPGGroup) => {
  dataContainer.groupArray.forEach((group) => {
    if (group.id === newGroup.id) {
      Object.assign(group, newGroup);
    }
  });
};

export const move = (target: MoveType | HTMLElement | EPGItem | EPGGroup) => {
  if (dataContainer.itemArray.length == 0) return;
  selfLog("-移动逻辑开始-");
  /** 目标 EPGItem */
  let targetItem: EPGItem | EPGGroup | null = null;
  if (typeof target === "object") {
    /* target 为 HTMLElement 或 EPGItem 或 EPGGroup 或 VueComponent 时 */
    if ((target as EPGItem).el) {
      /* target为 EPGItem/EPGGroup 时，获取其本身 */
      targetItem = target as EPGItem;
    } else if ((target as unknown as { $el: HTMLElement }).$el) {
      /* target为 VueComponent 时，获取其 EPGItem 或 EPGGroup*/
      targetItem =
        getItemByHTMLElement((target as unknown as { $el: HTMLElement }).$el) ??
        getGroupByHTMLElement((target as unknown as { $el: HTMLElement }).$el);
    } else {
      /* target为 HTMLElement 时，获取其 EPGItem 或 EPGGroup */
      targetItem =
        getItemByHTMLElement(target as HTMLElement) ??
        getGroupByHTMLElement(target as HTMLElement);
    }
  } else if (["up", "down", "right", "left"].includes(target)) {
    targetItem = getTargetByDirection(target);
    /* target 为上下左右事件时 */
    let nextGroup;
    const currentGroup = getGroupByItem(dataContainer.currentItem!);
    if (targetItem != null) {
      if (isEPGGroup(targetItem.el!)) {
        nextGroup = targetItem;
      } else {
        nextGroup = getGroupByItem(targetItem as EPGItem);
      }
      if (!(currentGroup === nextGroup) && currentGroup) {
        if (currentGroup.events[target] != null) {
          return (currentGroup.events[target] as Function)();
        }
      }
    } else {
      selfLog("无法获取目标元素");
    }
  }
  if (targetItem) {
    if (isEPGItem(targetItem.el!)) {
      moveToItem(targetItem as EPGItem);
    } else if (isEPGGroup(targetItem.el!)) {
      moveToGroup(targetItem as EPGGroup);
    }
    selfLog("移动至：", targetItem);
  } else {
    selfLog("无可用元素");
  }
  selfLog("-移动逻辑结束-");
};

/**
 * 移动到指定 EPGItem
 * @param target 指定的 EPGItem
 * @returns
 */
export const moveToItem = (target: EPGItem) => {
  if (dataContainer.currentItem) {
    dataContainer.currentItem.isFocus = false;
    dataContainer.currentItem.el?.classList.remove(getFoucsClass() as string);
    if (dataContainer.currentItem.events.blur) {
      (dataContainer.currentItem.events.blur as Function)();
    }
  } else {
    dataContainer.currentItem = dataContainer.itemArray[0] ?? null;
  }

  dataContainer.currentItem = target;
  dataContainer.currentGroup = getGroupByItem(dataContainer.currentItem);
  dataContainer.currentItem.isFocus = true;
  dataContainer.currentItem.el?.classList.add(getFoucsClass() as string);
  if (dataContainer.currentItem.events.focus) {
    (dataContainer.currentItem.events.focus as Function)();
  }
  if (target.events.enter) (target.events.enter as Function)();
};

/**
 * 移动到指定 EPGGroup 的第一个 EPGItem
 * @param target 指定的 EPGGroup
 * @returns
 */
export const moveToGroup = (target: EPGGroup) => {
  let buffer: EPGItem | EPGGroup | undefined = target.children.find(
    (item) => item.isDefault == true
  );
  if (buffer == undefined) {
    buffer = target.children[0];
    if (buffer == undefined) {
      throw new Error("当前 EPGGroup 不存在 EPGItem");
    }
  }
  if (isEPGGroup(buffer.el!)) {
    if (target.events.enter) (target.events.enter as Function)();
    moveToGroup(buffer as EPGGroup);
  } else {
    moveToItem(buffer as EPGItem);
  }
};

/** 设置按下按键事件的监听 */
const setKeyboardEventListener = () => {
  document.onkeydown = (event) => {
    const keyCode = event.code
      ? event.code
      : event.which
      ? event.which
      : event.keyCode;

    eventHandler(event, keyCode);
  };
};
/** 按键事件处理器 */
const eventHandler = (event: KeyboardEvent, keyCode: string | number) => {
  if (!dataContainer.itemArray.length) {
    !dataContainer.currentItem &&
      (dataContainer.currentItem = dataContainer.itemArray[0]);
  }
  let keyAction: string | null = null;
  for (let action in keyActions) {
    if (keyActions[action].code.includes(keyCode)) {
      keyAction = action;
      break;
    }
  }
  selfLog("按键KeyCode:", keyCode, "触发事件:", keyAction);

  if (keyAction) {
    if (keyActions[keyAction].preventDefault) {
      /** 阻止默认事件 */
      event.preventDefault();
      selfLog(`事件 ${keyAction} 将阻止默认事件发生`);
    }
    if (["DOWN", "UP", "LEFT", "RIGHT"].includes(keyAction)) {
      if (dataContainer.currentItem == null) {
        if (dataContainer.itemArray.length != 0) {
          dataContainer.currentItem = dataContainer.itemArray[0];
        } else {
          return;
        }
      }
      switch (keyAction) {
        case "DOWN":
          if (dataContainer.currentItem.events.down) {
            (dataContainer.currentItem.events.down as Function)(
              dataContainer.currentItem,
              down
            );
          } else {
            move("down");
          }
          break;
        case "UP":
          if (dataContainer.currentItem.events.up) {
            (dataContainer.currentItem.events.up as Function)(
              dataContainer.currentItem,
              up
            );
          } else {
            move("up");
          }
          break;
        case "LEFT":
          if (dataContainer.currentItem.events.left) {
            (dataContainer.currentItem.events.left as Function)(
              dataContainer.currentItem,
              left
            );
          } else {
            move("left");
          }
          break;
        case "RIGHT":
          if (dataContainer.currentItem.events.right) {
            (dataContainer.currentItem.events.right as Function)(
              dataContainer.currentItem,
              right
            );
          } else {
            move("right");
          }
          break;
      }
    } else if (["ENTER", "BACK"].includes(keyAction)) {
      switch (keyAction) {
        case "ENTER":
          if (dataContainer.currentItem == null) {
            return;
          }
          dataContainer.currentItem.el!.click();
          break;
        case "BACK":
          backHandler();
          break;
      }
    }
    if (keyActions[keyAction].callback != null) {
      keyActions[keyAction].callback!(keyCode);
    }
  }
};

/**
 * 根据方向获取下一个 Item
 * @param direction "up" | "down" | "right" | "left"
 * @returns EPGItem
 */
export const getTargetByDirection = (
  direction: "up" | "down" | "right" | "left"
): EPGItem | EPGGroup | null => {
  if (!currentConfig.useOldMoveRule) {
    return getRecentTarget(direction);
  } else {
    return getItemByDirectionOld(direction);
  }
};

/**
 * 获取指定 HTMLElement 的 EPGItem
 * @param element HTMLElement
 * @returns EPGGroup | null
 */
export const getItemByHTMLElement = (element: HTMLElement) => {
  return (
    dataContainer.itemArray.find(
      (item) => item.id === element.dataset.epgItemId
    ) ?? null
  );
};

/**
 * 获取指定 EPGGroup 下的所有 EPGItem
 * @param group HTMLElement
 * @returns EPGGroup | null
 */
export const getItemsByGroup = (group: EPGGroup) => {
  return getDescendant(group.el as HTMLElement).filter(
    (item) => item.dataset.epgItemId != undefined
  );
};

/**
 * 获取指定 HTMLElement 的 EPGGroup
 * @param element HTMLElement
 * @returns EPGGroup | null
 */
export const getGroupByHTMLElement = (element: HTMLElement) => {
  return (
    dataContainer.groupArray.find(
      (group) => group.id === element.dataset.epgGroupId
    ) ?? null
  );
};

/**
 * 获取指定 EPGItem 的 EPGGroup
 * @param item EPGItem
 * @returns EPGGroup | null
 */
export const getGroupByItem = (item: EPGItem) => {
  if (getParentsByHTMLElement(item.el!).length > 0) {
    return (
      dataContainer.groupArray.find(
        (group) =>
          group.id ===
          getParentGroupByHTMLElement(dataContainer.currentItem!.el!)?.el!
            .dataset.epgGroupId
      ) ?? null
    );
  } else {
    return null;
  }
};

/**
 * 获取 Group 的第一层子元素
 * @param element HTMLElement
 * @returns (EPGGroup | EPGItem)[]
 */
export const getGroupChildrenByHTMLElement = (element: HTMLElement | Node) => {
  const children = element.childNodes;
  let buffer: (EPGItem | EPGGroup)[] = [];
  for (let i = 0; i < children.length; i++) {
    const childNode = children[i];
    if (childNode.nodeType == 1) {
      const buf = getChild(childNode as HTMLElement);
      if (buf) {
        buffer.push(buf);
      } else {
        buffer = [...buffer, ...getGroupChildrenByHTMLElement(childNode)];
      }
    }
  }
  return buffer;
};

/**
 * 获取全局 GroupChildren
 * @returns (EPGItem | EPGGroup)[]
 */
export const getGlobalGroupChildren = (): (EPGItem | EPGGroup)[] => {
  return getGroupChildrenByHTMLElement(
    document.getElementsByTagName("html")[0]
  );
};

/**
 * 通过 HTMLElement 获取 EPGGroup 或 EPGItem
 * @param element HTMLElement
 * @returns EPGGroup 或 EPGItem, 找不到则返回 null
 */
export const getChild = (element: HTMLElement): (EPGItem | EPGGroup) | null => {
  let child: EPGItem | EPGGroup | null;
  if (isEPGGroup(element)) {
    child = getGroupByHTMLElement(element);
  } else if (isEPGItem(element)) {
    child = getItemByHTMLElement(element);
  } else {
    child = null;
  }
  return child;
};

/**
 * 通过 HTMLElement 获取父 Group
 * @param element HTMLElement
 * @returns 父元素到 html 节点排序的 HTMLElement[]
 */
export const getParentsByHTMLElement = (element: HTMLElement) => {
  const elements = [];
  let buffer: HTMLElement | null = element;
  while (buffer) {
    buffer = buffer.parentElement as HTMLElement;
    buffer && elements.push(buffer);
  }
  return elements;
};

/**
 * 通过 HTMLElement 获取父 EPGGroup
 * @param element HTMLElement
 * @returns 第一个父层 EPGGroup
 */
export const getParentGroupByHTMLElement = (
  element: HTMLElement
): EPGGroup | null => {
  const parent = getParentsByHTMLElement(element).find(
    (el) => el.dataset.epgGroupId != undefined
  );
  if (parent) {
    return getGroupByHTMLElement(parent);
  } else {
    return null;
  }
};

/**
 * 判断 HTMLElement 是否为 EPGGroup
 * @param element HTMLElement
 * @returns boolean
 */
export const isEPGGroup = (element: HTMLElement): boolean => {
  try {
    if (element.dataset.epgGroupId != undefined) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
};

/**
 * 判断 HTMLElement 是否为 EPGItem
 * @param element HTMLElement
 * @returns boolean
 */
export const isEPGItem = (element: HTMLElement): boolean => {
  try {
    if (element.dataset.epgItemId != undefined) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
};

/** 左移  */
export const left = () => move("left");
/** 右移  */
export const right = () => move("right");
/** 上移  */
export const up = () => move("up");
/** 下移  */
export const down = () => move("down");

setKeyboardEventListener();
