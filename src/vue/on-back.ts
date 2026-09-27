import { onActivated, onDeactivated, onMounted, onUnmounted } from "vue";
import { registerBackHandler, type BackHandler } from "../core";

/**
 * 注册页面级返回处理函数，需在 `setup()`（或 Options API 的 `created()`）中调用。
 * 组件挂载 / 激活时生效，失活时暂停，卸载时移除；
 * 同时生效多个时，嵌套最深、创建最晚的组件优先。
 */
export const onBack = (handler: BackHandler): void => {
  const entry = registerBackHandler(handler);
  onMounted(entry.activate);
  onActivated(entry.activate);
  onDeactivated(entry.deactivate);
  onUnmounted(entry.dispose);
};
