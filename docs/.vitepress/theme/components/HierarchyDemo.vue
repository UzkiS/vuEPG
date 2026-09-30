<script setup lang="ts">
import { useDocsText } from "../composables/use-docs-text";
import { ref } from "vue";
import { useVuEPG, type EPGEvent } from "vuepg";
import { useDemo } from "../composables/use-demo";

const { text } = useDocsText();
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
  <div class="hierarchy vuepg-demo">
    <svg
      class="overview"
      viewBox="0 0 380 222"
      role="img"
      :aria-label="
        text(
          `分组导航实时示意，当前焦点：${current || '未选择'}`,
          `Group navigation, current focus: ${current || 'None'}`,
        )
      "
    >
      <text x="18" y="24" class="overview-title">
        {{ text("点击图中的项目，观察焦点与事件", "Select an item to see focus and events") }}
      </text>
      <rect x="18" y="41" width="142" height="160" rx="9" class="overview-group" />
      <rect x="194" y="41" width="166" height="160" rx="9" class="overview-group" />
      <text x="29" y="58" class="overview-label">{{ text("分组 A", "Group A") }}</text>
      <text x="205" y="58" class="overview-label">
        {{ text("分组 B · B2 为默认入口", "Group B · B2 is default") }}
      </text>
      <g
        v-for="item in diagramItems"
        :key="item.label"
        class="overview-item"
        :class="{ selected: current === item.label }"
        role="button"
        tabindex="0"
        :aria-label="text(`聚焦${item.label}`, `Focus ${item.label}`)"
        @click="focusLabel(item.label)"
        @keydown.enter="focusLabel(item.label)"
        @keydown.space.prevent="focusLabel(item.label)"
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
        :data-label="text('分组 A', 'Group A')"
        @epg-enter="onEnter"
        @epg-leave="onLeave"
      >
        <span class="tag">{{ text("分组 A", "Group A") }}</span>
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
        :data-label="text('分组 B', 'Group B')"
        @epg-enter="onEnter"
        @epg-leave="onLeave"
      >
        <span class="tag">{{ text("分组 B", "Group B") }}</span>
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
      <div v-if="!active" class="overlay">
        {{ text("点击后用方向键操作", "Click, then use arrow keys") }}
      </div>
    </div>
    <ol class="log">
      <li v-for="(entry, index) in logs" :key="`${String(index)}-${entry}`">{{ entry }}</li>
      <li v-if="logs.length === 0" class="empty">{{ text("事件日志", "Event log") }}</li>
    </ol>
  </div>
</template>

<style scoped>
[role="button"]:focus {
  outline: none;
}
[role="button"]:focus-visible rect {
  stroke: var(--demo-primary);
  stroke-width: 3;
}

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
  fill: var(--demo-text);
  font: 600 14px sans-serif;
}
.overview-group {
  fill: var(--demo-canvas);
  stroke: var(--demo-border);
  stroke-width: 2;
  stroke-dasharray: 5 4;
}
.overview-label {
  fill: var(--demo-text-muted);
  font: 11px sans-serif;
}
.overview-item {
  cursor: pointer;
}
.overview-item rect {
  fill: var(--demo-muted);
  stroke: var(--demo-border);
  stroke-width: 2;
}
.overview-item.selected rect {
  fill: var(--demo-primary-soft);
  stroke: var(--demo-focus);
  stroke-width: 3;
}
.overview-item.selected text {
  fill: var(--demo-text);
}
.overview-item text {
  fill: var(--demo-text);
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
  border: 1px solid var(--demo-border);
  border-radius: 12px;
  background: var(--demo-canvas);
  cursor: pointer;
}

.group {
  position: relative;
  display: grid;
  gap: 10px;
  padding: 26px 12px 12px;
  border: 2px dashed var(--demo-text-soft);
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
  color: var(--demo-text-muted);
}

.item {
  position: relative;
  padding: 10px 0;
  border: 2px solid transparent;
  border-radius: 8px;
  font-weight: 600;
  background: var(--demo-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.item.vuepg-focus {
  color: var(--demo-on-primary);
  border-color: var(--demo-focus);
  background: var(--demo-primary);
  box-shadow: 0 0 0 3px var(--demo-focus-soft);
}

.star {
  position: absolute;
  top: 2px;
  right: 6px;
  font-size: 12px;
  color: var(--demo-focus);
}

.item.vuepg-focus .star {
  color: var(--demo-on-primary);
}

.overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  border-radius: 12px;
  font-weight: 600;
  background: var(--demo-overlay);
}

.log {
  margin: 0;
  padding: 12px 16px;
  list-style: none;
  border-radius: 8px;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  background: var(--demo-canvas);
}

.log li {
  margin: 0;
}

.log .empty {
  color: var(--demo-text-soft);
}

@media (max-width: 640px) {
  .hierarchy {
    grid-template-columns: 1fr;
  }
}
</style>
