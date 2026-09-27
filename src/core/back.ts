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

const findActiveHandler = (): BackHandler | null => {
  for (let i = registrations.length - 1; i >= 0; i -= 1) {
    const registration = registrations[i];
    if (registration?.active === true) {
      return registration.handler;
    }
  }
  return null;
};

/** 执行返回：调用优先级最高的生效中的处理函数，没有时调用全局 `backHandler` */
export const back = (): void => {
  const handler = findActiveHandler() ?? getConfig().backHandler;
  debug("返回", handler ?? "（未设置处理函数）");
  handler?.();
};

/** @internal 仅供测试：清空登记 */
export const resetBack = (): void => {
  registrations.length = 0;
};
