import { useVuEPG } from "vuepg";

/** Android 按键到逻辑操作的映射，不依赖 KeyboardEvent 构造器。 */
export const dispatchNativeKey = (keyCode: number): boolean => {
  const epg = useVuEPG();
  if (epg.isPaused()) {
    return false;
  }
  switch (keyCode) {
    case 19:
      return epg.navigate("up");
    case 20:
      return epg.navigate("down");
    case 21:
      return epg.navigate("left");
    case 22:
      return epg.navigate("right");
    case 4:
      epg.back();
      return true;
    case 23: {
      const current = epg.getCurrentItem();
      if (current === null || current.isDisabled || current.el.getClientRects().length === 0) {
        return false;
      }
      current.el.click();
      return true;
    }
    default:
      return false;
  }
};

/** 示例原生桥契约：宿主在 window 上派发 { keyCode: number }。 */
export const attachNativeBridge = (record: (keyCode: number) => void): (() => void) => {
  const listener = (event: Event): void => {
    if (!("detail" in event)) {
      return;
    }
    const detail: unknown = event.detail;
    if (
      typeof detail !== "object" ||
      detail === null ||
      !("keyCode" in detail) ||
      typeof detail.keyCode !== "number"
    ) {
      return;
    }
    record(detail.keyCode);
    dispatchNativeKey(detail.keyCode);
  };
  window.addEventListener("vuepg-native-key", listener);
  return () => {
    window.removeEventListener("vuepg-native-key", listener);
  };
};
