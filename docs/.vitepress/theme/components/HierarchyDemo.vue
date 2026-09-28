<script setup lang="ts">
import { ref } from "vue";
import { useVuEPG, type EPGEvent } from "vuepg";
import { useDemo } from "../composables/use-demo";

const epg = useVuEPG();
const stage = ref<HTMLElement | null>(null);
const { active, activate } = useDemo(stage);
const logs = ref<string[]>([]);
const current = ref("");

const labelOf = (el: HTMLElement): string => el.dataset["label"] ?? "";
const log = (text: string): void => {
  logs.value = [text, ...logs.value].slice(0, 5);
};
const onFocus = (event: EPGEvent<"epg-focus">): void => {
  current.value = labelOf(event.detail.item.el);
  log(`epg-focus · ${current.value}`);
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
const focusLabel = (label: string): void => {
  activate();
  const item = Array.from(stage.value?.querySelectorAll<HTMLElement>("[data-label]") ?? []).find(
    (el) => el.dataset["label"] === label,
  );
  if (item !== undefined) {
    epg.move(item);
  }
};
const diagramItems = [
  { label: "A1", x: 34, y: 70 },
  { label: "A2", x: 34, y: 112 },
  { label: "A3", x: 34, y: 154 },
  { label: "B1", x: 210, y: 70 },
  { label: "B2", x: 280, y: 70 },
  { label: "B3", x: 210, y: 122 },
  { label: "B4", x: 280, y: 122 },
];
</script>

<template>
  <div class="hierarchy">
    <svg
      class="overview"
      viewBox="0 0 380 222"
      role="img"
      :aria-label="`分组导航实时示意，当前焦点：${current || '未选择'}`"
    >
      <text x="18" y="24" class="overview-title">点击图中的项目，观察焦点与事件</text>
      <rect x="18" y="41" width="142" height="160" rx="9" class="overview-group" />
      <rect x="194" y="41" width="166" height="160" rx="9" class="overview-group" />
      <text x="29" y="58" class="overview-label">分组 A</text>
      <text x="205" y="58" class="overview-label">分组 B · B2 为默认入口</text>
      <g
        v-for="item in diagramItems"
        :key="item.label"
        class="overview-item"
        :class="{ selected: current === item.label }"
        role="button"
        tabindex="0"
        :aria-label="`聚焦${item.label}`"
        @click="focusLabel(item.label)"
        @keydown.enter="focusLabel(item.label)"
      >
        <rect :x="item.x" :y="item.y" width="60" height="30" rx="5" />
        <text :x="item.x + 30" :y="item.y + 20">{{ item.label }}</text>
      </g>
    </svg>
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
.overview {
  grid-column: 1 / -1;
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
}
.overview-title {
  fill: var(--vp-c-text-1);
  font: 600 14px sans-serif;
}
.overview-group {
  fill: var(--vp-c-bg-soft);
  stroke: var(--vp-c-default-1);
  stroke-width: 2;
  stroke-dasharray: 5 4;
}
.overview-label {
  fill: var(--vp-c-text-2);
  font: 11px sans-serif;
}
.overview-item {
  cursor: pointer;
}
.overview-item rect {
  fill: var(--vp-c-default-soft);
  stroke: var(--vp-c-default-1);
  stroke-width: 2;
}
.overview-item.selected rect {
  fill: var(--vp-c-brand-soft);
  stroke: var(--vp-c-brand-1);
  stroke-width: 3;
}
.overview-item text {
  fill: var(--vp-c-text-1);
  text-anchor: middle;
  font: 12px sans-serif;
  pointer-events: none;
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
