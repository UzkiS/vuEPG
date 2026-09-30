// 在 Vue、vuEPG 与 webpack 开发客户端开始工作之前补齐旧设备能力。
import "core-js/stable";
// webpack 热更新需要 fetch；它属于 Web API，单独补齐。
import "whatwg-fetch";

// core-js 处理 JavaScript 内置 API；DOM CustomEvent 单独补齐。
if (typeof window.CustomEvent !== "function") {
  // eslint-disable-next-line @typescript-eslint/no-extraneous-class -- 需要可 new 的构造器，并遵守箭头函数规范
  class LegacyCustomEvent {
    constructor(type: string, options: CustomEventInit<unknown> = {}) {
      const event = document.createEvent("CustomEvent");
      // eslint-disable-next-line @typescript-eslint/no-deprecated -- 旧内核缺少 CustomEvent 构造器
      event.initCustomEvent(
        type,
        options.bubbles === true,
        options.cancelable === true,
        options.detail,
      );
      return event;
    }
  }
  Object.defineProperty(window, "CustomEvent", {
    value: LegacyCustomEvent,
    configurable: true,
    writable: true,
  });
}
