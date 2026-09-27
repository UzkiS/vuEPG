<script setup lang="ts">
import { ref } from "vue";
import { useVuEPG, type EPGEvent } from "vuepg";
import { useDemo } from "../composables/use-demo";

const epg = useVuEPG();
const stage = ref<HTMLElement | null>(null);
const { active, activate } = useDemo(stage);
const logs = ref<string[]>([]);

const labelOf = (el: HTMLElement): string => el.dataset["label"] ?? "";
const log = (text: string): void => {
  logs.value = [text, ...logs.value].slice(0, 5);
};
const onFocus = (event: EPGEvent<"epg-focus">): void => {
  log(`epg-focus · ${labelOf(event.detail.item.el)}`);
};
const onEnter = (event: EPGEvent<"epg-enter">): void => {
  log(`epg-enter · ${labelOf(event.detail.group.el)}`);
};
const onLeave = (event: EPGEvent<"epg-leave">): void => {
  log(`epg-leave · ${labelOf(event.detail.group.el)}`);
};
const focus = (event: MouseEvent): void => {
  activate();
  if (event.currentTarget instanceof HTMLElement) {
    epg.move(event.currentTarget);
  }
};
</script>

<template>
  <div class="hierarchy">
    <!-- 外层分组拦截所有方向，焦点不会离开演示区域 -->
    <div
      ref="stage"
      v-epg-group
      class="stage"
      @click="activate"
      @epg-up.prevent
      @epg-down.prevent
      @epg-left.prevent
      @epg-right.prevent
    >
      <section
        v-epg-group
        class="group column"
        data-label="分组 A"
        @epg-enter="onEnter"
        @epg-leave="onLeave"
      >
        <span class="tag">分组 A</span>
        <button
          v-for="n in 3"
          :key="n"
          v-epg-item
          class="item"
          type="button"
          :data-label="`A${n}`"
          :data-entry="n === 1 ? '' : undefined"
          @epg-focus="onFocus"
          @click.stop="focus"
        >
          A{{ n }}
        </button>
      </section>
      <section
        v-epg-group
        class="group grid"
        data-label="分组 B"
        @epg-enter="onEnter"
        @epg-leave="onLeave"
      >
        <span class="tag">分组 B</span>
        <button
          v-for="n in 4"
          :key="n"
          v-epg-item="{ default: n === 2 }"
          class="item"
          type="button"
          :data-label="`B${n}`"
          @epg-focus="onFocus"
          @click.stop="focus"
        >
          B{{ n }}<span v-if="n === 2" class="star" title="default">★</span>
        </button>
      </section>
      <div v-if="!active" class="overlay">点击后用方向键操作</div>
    </div>
    <ol class="log">
      <li v-for="(entry, index) in logs" :key="`${String(index)}-${entry}`">{{ entry }}</li>
      <li v-if="logs.length === 0" class="empty">事件日志</li>
    </ol>
  </div>
</template>

<style scoped>
.hierarchy {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: 16px;
  margin: 20px 0;
}

.stage {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
}

.group {
  position: relative;
  display: grid;
  gap: 10px;
  padding: 26px 12px 12px;
  border: 2px dashed var(--vp-c-text-3);
  border-radius: 10px;
}

.grid {
  grid-template-columns: 1fr 1fr;
  align-content: start;
}

.tag {
  position: absolute;
  top: 4px;
  left: 10px;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.item {
  position: relative;
  padding: 10px 0;
  border: 2px solid transparent;
  border-radius: 8px;
  font-weight: 600;
  background: var(--vp-c-default-soft);
  cursor: pointer;
  transition: all 0.15s ease;
}

.item.vuepg-focus {
  color: #fff;
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
  transform: scale(1.05);
}

.star {
  position: absolute;
  top: 2px;
  right: 6px;
  font-size: 12px;
  color: var(--vp-c-warning-1);
}

.item.vuepg-focus .star {
  color: #fff;
}

.overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  border-radius: 12px;
  font-weight: 600;
  background: color-mix(in srgb, var(--vp-c-bg) 70%, transparent);
}

.log {
  margin: 0;
  padding: 12px 16px;
  list-style: none;
  border-radius: 8px;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  background: var(--vp-c-bg-soft);
}

.log li {
  margin: 0;
}

.log .empty {
  color: var(--vp-c-text-3);
}

@media (max-width: 640px) {
  .hierarchy {
    grid-template-columns: 1fr;
  }
}
</style>
