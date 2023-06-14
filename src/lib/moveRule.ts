import type EPGGroup from "./epgGroup";
import type EPGItem from "./epgItem";
import {
  dataContainer,
  getGlobalGroupChildren,
  getParentGroupByHTMLElement,
} from "./service";
import type { MoveType } from "./types";
import { isHidden, selfLog } from "./utils";

const RATE = 0.05;

/**
 * 获取最近元素的入口函数
 * @param direction 方向
 * @param currentTarget 移动前的 EPGGroup | EPGItem
 * @returns
 */
export const getRecentTarget = (
  direction: MoveType,
  currentTarget: EPGGroup | EPGItem | null = dataContainer.currentItem
): EPGGroup | EPGItem | null => {
  if (currentTarget == null) {
    return null;
  }
  /** 当前已是最顶层元素 */
  let isTopGroup: boolean = false;
  /** 获取父元素 */
  const parent = getParentGroupByHTMLElement(currentTarget.el!);
  selfLog("获取父元素", parent);
  /** 等待对比的元素数组 */
  let children: (EPGItem | EPGGroup)[];
  if (parent == null) {
    /** 无 Group 的独立元素，生成全局 parent */
    children = getGlobalGroupChildren();
    isTopGroup = true;
    selfLog("父元素获取失败，使用全局父元素");
  } else {
    children = parent.children;
  }
  selfLog("该层所有子元素", children);
  /** 如果是最顶层且只有该元素本身 直接返回 */
  if (isTopGroup && children.length == 1) {
    selfLog("已查询到最顶层且只有该元素", children);
    return null;
  }
  const availableChild = getAllAvailableChildren(
    children,
    currentTarget,
    direction
  );
  selfLog("符合要求的元素", availableChild);
  if (availableChild.length == 0) {
    //当前可用孩子元素组为0
    if (isTopGroup) {
      selfLog("当前已是最顶层，停止向上寻找");
      return null;
    }
    selfLog(
      "当前符合坐标要求的元素不存在，尝试使用上层作为当前元素",
      getParentGroupByHTMLElement(currentTarget.el!)
    );
    const result = getRecentTarget(
      direction,
      getParentGroupByHTMLElement(currentTarget.el!)
    );
    return result;
  }
  const bestChild = getBestChild(availableChild, currentTarget, direction);
  selfLog("当前获取的最佳目标", bestChild);
  if (bestChild == null) {
    if (isTopGroup) {
      selfLog("当前已是最顶层，停止向上寻找");
      return null;
    }
    selfLog(
      "在符合坐标要求的元素中找不到可移动元素，尝试使用上层作为当前元素",
      getParentGroupByHTMLElement(currentTarget.el!)
    );
    const result = getRecentTarget(
      direction,
      getParentGroupByHTMLElement(currentTarget.el!)
    );
    return result;
  }
  return bestChild;
};

/**
 * 获取符合坐标要求的全部元素
 * @param children 等待对比的元素数组
 * @param target 移动前 EPGGroup 或 EPGItem
 * @param direction 方向
 * @returns (EPGGroup | EPGItem)[]
 */
const getAllAvailableChildren = (
  children: (EPGItem | EPGGroup)[],
  target: EPGGroup | EPGItem,
  direction: MoveType
) => {
  const buffer: (EPGItem | EPGGroup)[] = [];
  const currentRect = target?.getRect()!;
  const targetArray = children.filter((child) => child != target);
  targetArray.forEach((child) => {
    if (isHidden(child.el!)) {
      return;
    }
    const targetRect = child.getRect()!;
    if (direction == "down") {
      if (currentRect.top < targetRect.top) {
        buffer.push(child);
      }
    } else if (direction == "right") {
      if (currentRect.left < targetRect.left) {
        buffer.push(child);
      }
    } else if (direction == "up") {
      if (currentRect.bottom > targetRect.bottom) {
        buffer.push(child);
      }
    } else if (direction == "left") {
      if (currentRect.right > targetRect.right) {
        buffer.push(child);
      }
    }
  });
  return buffer;
};

/**
 * 获取最佳元素
 * @param children 等待对比的元素数组（不包含 target 本身）
 * @param target 移动前 EPGGroup 或 EPGItem
 * @param direction 方向
 * @returns
 */
const getBestChild = (
  children: (EPGItem | EPGGroup)[],
  target: EPGGroup | EPGItem,
  direction: MoveType
) => {
  if (direction == "down") {
    return getBestDownChild(children, target);
  } else if (direction == "right") {
    return getBestRightChild(children, target);
  } else if (direction == "up") {
    return getBestUpChild(children, target);
  } else if (direction == "left") {
    return getBestLeftChild(children, target);
  }
  return null;
};

/**
 * 获取向下时的最佳元素
 * @param children 等待对比的元素数组（不包含 target 本身）
 * @param target 移动前 EPGGroup 或 EPGItem
 * @returns EPGItem | EPGGroup | null
 */
const getBestDownChild = (
  children: (EPGItem | EPGGroup)[],
  target: EPGGroup | EPGItem
) => {
  let buffer: (EPGItem | EPGGroup)[] = [];
  let bufferNoOverlap: (EPGItem | EPGGroup)[] = [];
  const currentRect = target?.getRect()!;
  /** 重叠元素的临时基线 */
  let tempLine: number | null = null;
  /** 非重叠元素的临时基线 */
  let tempLineNoOverlap: number | null = null;
  /** 整个循环是否存在重叠元素 */
  let hasOverlap: boolean = false;
  children.forEach((child) => {
    /** 目标Rect */
    const targetRect = child.getRect()!;
    /** 目标与当前元素不重叠 */
    const noOverlap =
      currentRect.right - RATE * currentRect.width < targetRect.left ||
      currentRect.left + RATE * currentRect.width > targetRect.right;
    /** 目标与当前元素不重叠且完全低于当前元素的底部 */
    const availableNoOverlap = currentRect.bottom < targetRect.top;
    if (!noOverlap && tempLine == null) {
      /** 当前元素重叠且无第一个可用元素时赋值 */
      tempLine = targetRect.top;
      buffer.push(child);
      hasOverlap = true;
      selfLog("当前元素重叠且无第一个可用元素", buffer);
    } else if (noOverlap && tempLineNoOverlap == null) {
      /** 当前元素不重叠且无第一个可用元素时赋值 */
      if (availableNoOverlap) {
        /** 是否为未重叠允许元素 */
        tempLineNoOverlap = targetRect.top;
        bufferNoOverlap.push(child);
        selfLog("当前元素不重叠且无第一个可用元素", bufferNoOverlap);
      }
    } else {
      /** 已经有基线元素时 */
      if (!noOverlap) hasOverlap = true;
      if (tempLine! > targetRect.top) {
        /** 基线元素的 top 在目标元素之下 */
        if (!noOverlap) {
          /** X轴存在重叠 */
          buffer.splice(0, buffer.length);
          buffer.push(child);
        } else {
          /** X轴不存在重叠 */
          if (availableNoOverlap) {
            /** 是否为未重叠允许元素 */
            bufferNoOverlap.splice(0, buffer.length);
            bufferNoOverlap.push(child);
          }
        }
      } else {
        /** 基线元素的 top 与目标元素相等，推入buffer */
        if (!noOverlap) {
          if (tempLine == targetRect.top) {
            buffer.push(child);
          }
        } else {
          if (tempLineNoOverlap == targetRect.top && availableNoOverlap) {
            bufferNoOverlap.push(child);
          }
        }
      }
    }
  });
  if (hasOverlap == false) {
    // X轴完全无重叠时，考虑使用非重叠元素
    buffer = bufferNoOverlap;
    selfLog("X轴完全无重叠时，考虑使用非重叠元素", buffer);
  }
  if (buffer.length > 0) {
    // 寻找X方向最合适的 Item
    let absBuffer: number;
    let targetBuffer: EPGGroup | EPGItem | null = null;
    buffer.forEach((child, index) => {
      const targetRect = child.getRect()!;
      if (index != 0) {
        const abs = Math.abs(currentRect.left - targetRect.left);
        if (abs < absBuffer) {
          absBuffer = abs;
          targetBuffer = child;
        }
      } else {
        absBuffer = Math.abs(currentRect.left - targetRect.left);
        targetBuffer = child;
      }
    });
    return targetBuffer;
  } else {
    if (buffer[0] != undefined) {
      return buffer[0];
    } else {
      return null;
    }
  }
};

/**
 * 获取向上时的最佳元素
 * @param children 等待对比的元素数组（不包含 target 本身）
 * @param target 移动前 EPGGroup 或 EPGItem
 * @returns EPGItem | EPGGroup | null
 */
const getBestUpChild = (
  children: (EPGItem | EPGGroup)[],
  target: EPGGroup | EPGItem
) => {
  let buffer: (EPGItem | EPGGroup)[] = [];
  let bufferNoOverlap: (EPGItem | EPGGroup)[] = [];
  const currentRect = target?.getRect()!;
  /** 重叠元素的临时基线 */
  let tempLine: number | null = null;
  /** 非重叠元素的临时基线 */
  let tempLineNoOverlap: number | null = null;
  /** 整个循环是否存在重叠元素 */
  let hasOverlap: boolean = false;
  children.forEach((child) => {
    /** 目标Rect */
    const targetRect = child.getRect()!;
    /** 目标与当前元素不重叠 */
    const noOverlap =
      currentRect.right - RATE * currentRect.width < targetRect.left ||
      currentRect.left + RATE * currentRect.width > targetRect.right;
    /** 目标与当前元素不重叠且完全高于当前元素的顶部 */
    const availableNoOverlap = currentRect.top > targetRect.bottom;
    if (!noOverlap && tempLine == null) {
      /** 当前元素重叠且无第一个可用元素时赋值 */
      tempLine = targetRect.bottom;
      buffer.push(child);
      hasOverlap = true;
      selfLog("当前元素重叠且无第一个可用元素", buffer);
    } else if (noOverlap && tempLineNoOverlap == null) {
      /** 当前元素不重叠且无第一个可用元素时赋值 */
      if (availableNoOverlap) {
        /** 是否为未重叠允许元素 */
        tempLineNoOverlap = targetRect.bottom;
        bufferNoOverlap.push(child);
        selfLog("当前元素不重叠且无第一个可用元素", bufferNoOverlap);
      }
    } else {
      /** 已经有基线元素时 */
      if (!noOverlap) hasOverlap = true;
      if (tempLine! < targetRect.bottom) {
        /** 基线元素的 top 在目标元素之下 */
        if (!noOverlap) {
          /** X轴存在重叠 */
          buffer.splice(0, buffer.length);
          buffer.push(child);
        } else {
          /** X轴不存在重叠 */
          if (availableNoOverlap) {
            /** 是否为未重叠允许元素 */
            bufferNoOverlap.splice(0, buffer.length);
            bufferNoOverlap.push(child);
          }
        }
      } else {
        /** 基线元素的 top 与目标元素相等，推入buffer */
        if (!noOverlap) {
          if (tempLine == targetRect.bottom) {
            buffer.push(child);
          }
        } else {
          if (tempLineNoOverlap == targetRect.bottom && availableNoOverlap) {
            bufferNoOverlap.push(child);
          }
        }
      }
    }
  });
  if (hasOverlap == false) {
    // X轴完全无重叠时，考虑使用非重叠元素
    buffer = bufferNoOverlap;
    selfLog("X轴完全无重叠时，考虑使用非重叠元素", buffer);
  }
  if (buffer.length > 0) {
    // 寻找X方向最合适的 Item
    let absBuffer: number;
    let targetBuffer: EPGGroup | EPGItem | null = null;
    buffer.forEach((child, index) => {
      const targetRect = child.getRect()!;
      if (index != 0) {
        const abs = Math.abs(currentRect.left - targetRect.left);
        if (abs < absBuffer) {
          absBuffer = abs;
          targetBuffer = child;
        }
      } else {
        absBuffer = Math.abs(currentRect.left - targetRect.left);
        targetBuffer = child;
      }
    });
    return targetBuffer;
  } else {
    if (buffer[0] != undefined) {
      return buffer[0];
    } else {
      return null;
    }
  }
};

/**
 * 获取向右时的最佳元素
 * @param children 等待对比的元素数组（不包含 target 本身）
 * @param target 移动前 EPGGroup 或 EPGItem
 * @returns EPGItem | EPGGroup | null
 */
const getBestRightChild = (
  children: (EPGItem | EPGGroup)[],
  target: EPGGroup | EPGItem
) => {
  let buffer: (EPGItem | EPGGroup)[] = [];
  let bufferNoOverlap: (EPGItem | EPGGroup)[] = [];
  const currentRect = target?.getRect()!;
  /** 重叠元素的临时基线 */
  let tempLine: number | null = null;
  /** 非重叠元素的临时基线 */
  let tempLineNoOverlap: number | null = null;
  /** 整个循环是否存在重叠元素 */
  let hasOverlap: boolean = false;
  children.forEach((child) => {
    /** 目标Rect */
    const targetRect = child.getRect()!;
    /** 目标与当前元素不重叠 */
    const noOverlap =
      currentRect.top + RATE * currentRect.height > targetRect.bottom ||
      currentRect.bottom - RATE * currentRect.height < targetRect.top;
    /** 目标与当前元素不重叠且完在当前元素的右侧 */
    const availableNoOverlap = currentRect.right < targetRect.left;
    if (!noOverlap && tempLine == null) {
      /** 当前元素重叠且无第一个可用元素时赋值 */
      tempLine = targetRect.left;
      buffer.push(child);
      hasOverlap = true;
      selfLog("当前元素重叠且无第一个可用元素", buffer);
    } else if (noOverlap && tempLineNoOverlap == null) {
      /** 当前元素不重叠且无第一个可用元素时赋值 */
      if (availableNoOverlap) {
        /** 是否为未重叠允许元素 */
        tempLineNoOverlap = targetRect.left;
        bufferNoOverlap.push(child);
        selfLog("当前元素不重叠且无第一个可用元素", bufferNoOverlap);
      }
    } else {
      /** 已经有基线元素时 */
      if (!noOverlap) hasOverlap = true;
      if (tempLine! > targetRect.left) {
        /** 基线元素的 top 在目标元素之下 */
        if (!noOverlap) {
          /** X轴存在重叠 */
          buffer.splice(0, buffer.length);
          buffer.push(child);
        } else {
          /** X轴不存在重叠 */
          if (availableNoOverlap) {
            /** 是否为未重叠允许元素 */
            bufferNoOverlap.splice(0, buffer.length);
            bufferNoOverlap.push(child);
          }
        }
      } else {
        /** 基线元素的 top 与目标元素相等，推入buffer */
        if (!noOverlap) {
          if (tempLine == targetRect.left) {
            buffer.push(child);
          }
        } else {
          if (tempLineNoOverlap == targetRect.left && availableNoOverlap) {
            bufferNoOverlap.push(child);
          }
        }
      }
    }
  });
  if (hasOverlap == false) {
    // Y轴完全无重叠时，考虑使用非重叠元素
    buffer = bufferNoOverlap;
    selfLog("Y轴完全无重叠时，考虑使用非重叠元素", buffer);
  }
  if (buffer.length > 0) {
    // 寻找Y向最合适的 Item
    let absBuffer: number;
    let targetBuffer: EPGGroup | EPGItem | null = null;
    buffer.forEach((child, index) => {
      const targetRect = child.getRect()!;
      if (index != 0) {
        const abs = Math.abs(currentRect.top - targetRect.top);
        if (abs < absBuffer) {
          absBuffer = abs;
          targetBuffer = child;
        }
      } else {
        absBuffer = Math.abs(currentRect.top - targetRect.top);
        targetBuffer = child;
      }
    });
    return targetBuffer;
  } else {
    if (buffer[0] != undefined) {
      return buffer[0];
    } else {
      return null;
    }
  }
};

/**
 * 获取向左时的最佳元素
 * @param children 等待对比的元素数组（不包含 target 本身）
 * @param target 移动前 EPGGroup 或 EPGItem
 * @returns EPGItem | EPGGroup | null
 */
const getBestLeftChild = (
  children: (EPGItem | EPGGroup)[],
  target: EPGGroup | EPGItem
) => {
  let buffer: (EPGItem | EPGGroup)[] = [];
  let bufferNoOverlap: (EPGItem | EPGGroup)[] = [];
  const currentRect = target?.getRect()!;
  /** 重叠元素的临时基线 */
  let tempLine: number | null = null;
  /** 非重叠元素的临时基线 */
  let tempLineNoOverlap: number | null = null;
  /** 整个循环是否存在重叠元素 */
  let hasOverlap: boolean = false;
  children.forEach((child) => {
    /** 目标Rect */
    const targetRect = child.getRect()!;
    /** 目标与当前元素不重叠 */
    const noOverlap =
      currentRect.top + RATE * currentRect.height > targetRect.bottom ||
      currentRect.bottom - RATE * currentRect.height < targetRect.top;
    /** 目标与当前元素不重叠且完在当前元素的左侧 */
    const availableNoOverlap = currentRect.left > targetRect.right;
    if (!noOverlap && tempLine == null) {
      /** 当前元素重叠且无第一个可用元素时赋值 */
      tempLine = targetRect.right;
      buffer.push(child);
      hasOverlap = true;
      selfLog("当前元素重叠且无第一个可用元素", buffer);
    } else if (noOverlap && tempLineNoOverlap == null) {
      /** 当前元素不重叠且无第一个可用元素时赋值 */
      if (availableNoOverlap) {
        /** 是否为未重叠允许元素 */
        tempLineNoOverlap = targetRect.right;
        bufferNoOverlap.push(child);
        selfLog("当前元素不重叠且无第一个可用元素", bufferNoOverlap);
      }
    } else {
      /** 已经有基线元素时 */
      if (!noOverlap) hasOverlap = true;
      if (tempLine! < targetRect.right) {
        /** 基线元素的 top 在目标元素之下 */
        if (!noOverlap) {
          /** X轴存在重叠 */
          buffer.splice(0, buffer.length);
          buffer.push(child);
        } else {
          /** X轴不存在重叠 */
          if (availableNoOverlap) {
            /** 是否为未重叠允许元素 */
            bufferNoOverlap.splice(0, buffer.length);
            bufferNoOverlap.push(child);
          }
        }
      } else {
        /** 基线元素的 top 与目标元素相等，推入buffer */
        if (!noOverlap) {
          if (tempLine == targetRect.right) {
            buffer.push(child);
          }
        } else {
          if (tempLineNoOverlap == targetRect.right && availableNoOverlap) {
            bufferNoOverlap.push(child);
          }
        }
      }
    }
  });
  if (hasOverlap == false) {
    // Y轴完全无重叠时，考虑使用非重叠元素
    buffer = bufferNoOverlap;
    selfLog("Y轴完全无重叠时，考虑使用非重叠元素", buffer);
  }
  if (buffer.length > 0) {
    // 寻找Y向最合适的 Item
    let absBuffer: number;
    let targetBuffer: EPGGroup | EPGItem | null = null;
    buffer.forEach((child, index) => {
      const targetRect = child.getRect()!;
      if (index != 0) {
        const abs = Math.abs(currentRect.top - targetRect.top);
        if (abs < absBuffer) {
          absBuffer = abs;
          targetBuffer = child;
        }
      } else {
        absBuffer = Math.abs(currentRect.top - targetRect.top);
        targetBuffer = child;
      }
    });
    return targetBuffer;
  } else {
    if (buffer[0] != undefined) {
      return buffer[0];
    } else {
      return null;
    }
  }
};
