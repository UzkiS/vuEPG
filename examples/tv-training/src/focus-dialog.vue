<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import { useVuEPG } from "vuepg";

const props = defineProps<{ title: string; message: string; confirmLabel: string }>();
const emit = defineEmits<(event: "close" | "confirm") => void>();
const epg = useVuEPG();
const cancel = ref<HTMLElement>();
const dialogElement = ref<HTMLElement>();
const previous = epg.getCurrentItem()?.el;

epg.onBack(() => {
  emit("close");
});
const handleTab = (event: KeyboardEvent): void => {
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- 旧内核通过 keyCode 识别 Tab
  if (epg.isPaused() || (event.key !== "Tab" && event.keyCode !== 9)) {
    return;
  }
  const buttons = Array.from(dialogElement.value?.querySelectorAll("button") ?? []).filter(
    (button) => button.getClientRects().length > 0 && !button.disabled,
  );
  if (buttons.length === 0) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  const current = epg.getCurrentItem()?.el;
  const index = buttons.findIndex((button) => button === current);
  const nextIndex =
    index === -1
      ? event.shiftKey
        ? buttons.length - 1
        : 0
      : (index + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length;
  const next = buttons[nextIndex];
  if (next !== undefined) {
    epg.move(next);
    next.focus();
  }
};
onMounted(() => {
  document.addEventListener("keydown", handleTab, true);
  void nextTick().then(() => {
    epg.move(cancel.value);
  });
});
onUnmounted(() => {
  document.removeEventListener("keydown", handleTab, true);
  void nextTick().then(() => {
    // 页面切换已经设置新焦点时，保留业务选择。
    if (epg.getCurrentItem() !== null) {
      return;
    }
    if (!epg.move(previous)) {
      epg.navigate("down");
    }
  });
});
</script>

<template>
  <div class="dialog-mask">
    <section
      ref="dialogElement"
      v-epg-group
      class="focus-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      @epg-up.prevent
      @epg-down.prevent
      @epg-left.prevent
      @epg-right.prevent
    >
      <span class="eyebrow">稍作停留</span>
      <h2 id="dialog-title">{{ props.title }}</h2>
      <p>{{ props.message }}</p>
      <div class="dialog-actions">
        <button ref="cancel" v-epg-item data-testid="dialog-cancel" @click="emit('close')">
          继续探索
        </button>
        <button
          v-epg-item
          data-testid="dialog-confirm"
          class="button-primary"
          @click="emit('confirm')"
        >
          {{ props.confirmLabel }}
        </button>
      </div>
      <small>返回键关闭 · 焦点保持在弹窗内 · 关闭后回到原位置</small>
    </section>
  </div>
</template>
