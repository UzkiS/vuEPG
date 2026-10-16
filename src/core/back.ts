import { getConfig, type BackHandler } from "./config";
import { debug } from "./logger";

/** 页面级返回处理函数的登记项 */
export interface BackEntry {
  /** 开始生效（组件挂载 / 激活） */
  readonly activate: () => void;
  /** 暂时失效（组件失活） */
  readonly deactivate: () => void;
  /** 永久移除（组件卸载） */
  readonly dispose: () => void;
}

interface Registration {
  readonly handler: BackHandler;
  active: boolean;
}

/**
 * 登记顺序即优先级：越晚登记越优先。
 * 组件在 setup 阶段登记（先父后子、先创建先登记），因此嵌套组件中最内层、最新打开的优先。
 */
const registrations: Registration[] = [];

/** 登记页面级返回处理函数，初始为未生效 */
export const registerBackHandler = (handler: BackHandler): BackEntry => {
  const registration: Registration = { handler, active: false };
  registrations.push(registration);
  return {
    activate: () => {
      registration.active = true;
    },
    deactivate: () => {
      registration.active = false;
    },
    dispose: () => {
      const index = registrations.indexOf(registration);
      if (index !== -1) {
        registrations.splice(index, 1);
      }
    },
  };
};

/**
 * 执行返回：从最后登记的生效中的处理函数开始调用，返回 `false` 时交给下一个，
 * 最后交给全局 `backHandler`。
 * @returns 是否有处理函数处理了返回（全局 `backHandler` 返回 `false` 时也视为未处理）
 */
export const back = (): boolean => {
  // 处理函数可能关闭弹窗、注销自己，先取快照
  const handlers = registrations
    .filter((registration) => registration.active)
    .map((registration) => registration.handler)
    .reverse();
  const global = getConfig().backHandler;
  if (global !== null) {
    handlers.push(global);
  }
  for (const handler of handlers) {
    if (handler() !== false) {
      debug("返回已处理", handler);
      return true;
    }
  }
  debug("返回未被处理");
  return false;
};

/** @internal 仅供测试：清空登记 */
export const resetBack = (): void => {
  registrations.length = 0;
};
