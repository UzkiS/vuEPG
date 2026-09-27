import { onBeforeUnmount, onMounted, ref, type Ref } from "vue";
import { useVuEPG } from "vuepg";

interface Demo {
  readonly active: Ref<boolean>;
  readonly activate: () => void;
  readonly deactivate: () => void;
}

/**
 * 文档中的交互演示：文档站平时暂停 vuEPG，点击演示区域后才接管键盘。
 * 点击演示区域外、按返回键或离开页面时退出。
 */
export const useDemo = (stage: Ref<HTMLElement | null>): Demo => {
  const epg = useVuEPG();
  const active = ref(false);

  const activate = (): void => {
    if (active.value) {
      return;
    }
    active.value = true;
    epg.resume();
    epg.move(stage.value?.querySelector("[data-entry]"));
  };

  const deactivate = (): void => {
    active.value = false;
    epg.pause();
  };

  // 用派发时的传播路径判断：点击遮罩激活后遮罩会被移除，此时 event.target 已脱离文档
  const onDocumentClick = (event: MouseEvent): void => {
    if (active.value && stage.value !== null && !event.composedPath().includes(stage.value)) {
      deactivate();
    }
  };

  epg.onBack(deactivate);
  onMounted(() => {
    document.addEventListener("click", onDocumentClick);
  });
  onBeforeUnmount(() => {
    document.removeEventListener("click", onDocumentClick);
    deactivate();
  });

  return { active, activate, deactivate };
};
