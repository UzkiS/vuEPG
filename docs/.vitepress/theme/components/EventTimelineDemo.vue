<script setup lang="ts">
import { useDocsText } from "../composables/use-docs-text";
import { computed, ref } from "vue";
import { useVuEPG } from "vuepg";

const { text } = useDocsText();
const epg = useVuEPG();
const source = ref<HTMLElement | null>(null);
const target = ref<HTMLElement | null>(null);
const events = ref<string[]>([]);
const shown = ref(0);
const expected = computed(() => [
  text("当前项方向", "Current item direction"),
  text("原组方向", "Source group direction"),
  text("旧项失焦", "Old item blur"),
  text("离开原组", "Leave source group"),
  text("进入目标组", "Enter target group"),
  text("新项聚焦", "New item focus"),
]);
const visibleEvents = computed(() => events.value.slice(0, shown.value));

const record = (name: string): void => {
  events.value.push(name);
};
const run = (): void => {
  if (source.value === null || target.value === null) {
    return;
  }
  epg.move(source.value);
  events.value = [];
  epg.navigate("down");
  shown.value = events.value.length;
};
const step = (): void => {
  if (events.value.length === 0) {
    run();
    shown.value = 1;
    return;
  }
  shown.value = shown.value >= events.value.length ? 1 : shown.value + 1;
};
</script>

<template>
  <figure class="timeline-demo vuepg-demo">
    <svg
      viewBox="0 0 440 268"
      role="img"
      :aria-label="
        text(
          `方向操作和焦点变化事件顺序，已显示${shown}步`,
          `Direction and focus event order, ${shown} steps shown`,
        )
      "
    >
      <text x="15" y="21" class="title">
        {{ text("按 ↓ 从原组进入目标组", "Press ↓ to enter the target group") }}
      </text>
      <line x1="37" y1="43" x2="37" y2="237" class="spine" />
      <g
        v-for="(label, index) in expected"
        :key="label"
        class="step"
        :class="{ shown: index < shown }"
        role="button"
        tabindex="0"
        :aria-label="text(`查看第${index + 1}步：${label}`, `View step ${index + 1}: ${label}`)"
        @click="shown = Math.min(index + 1, events.length)"
        @keydown.enter="shown = Math.min(index + 1, events.length)"
        @keydown.space.prevent="shown = Math.min(index + 1, events.length)"
      >
        <circle cx="37" :cy="49 + index * 37" r="12" />
        <text x="37" :y="53 + index * 37" class="number">{{ index + 1 }}</text>
        <rect x="61" :y="32 + index * 37" width="360" height="32" rx="5" />
        <text x="76" :y="53 + index * 37" class="event-label">
          {{ index < shown ? visibleEvents[index] : text("等待事件", "Waiting for event") }}
        </text>
      </g>
    </svg>
    <div class="controls">
      <button type="button" @click="run">{{ text("运行一次 ↓", "Run ↓") }}</button>
      <button type="button" @click="step">
        {{
          events.length > 0 && shown >= events.length
            ? text("从第一步重看", "Restart from step 1")
            : text("查看下一步", "Next step")
        }}
      </button>
    </div>
    <div class="real" aria-hidden="true">
      <div
        v-epg-group
        class="real-group"
        @epg-enter="record(text('进入原组', 'Enter source group'))"
        @epg-down="record(text('原组方向', 'Source group direction'))"
        @epg-leave="record(text('离开原组', 'Leave source group'))"
      >
        <button
          ref="source"
          v-epg-item
          type="button"
          tabindex="-1"
          @epg-focus="record(text('原项聚焦', 'Source item focus'))"
          @epg-down="record(text('当前项方向', 'Current item direction'))"
          @epg-blur="record(text('旧项失焦', 'Old item blur'))"
        >
          {{ text("原组项目", "Source group item") }}
        </button>
      </div>
      <div
        v-epg-group
        class="real-group"
        @epg-enter="record(text('进入目标组', 'Enter target group'))"
      >
        <button
          ref="target"
          v-epg-item
          type="button"
          tabindex="-1"
          @epg-focus="record(text('新项聚焦', 'New item focus'))"
        >
          {{ text("目标组项目", "Target group item") }}
        </button>
      </div>
    </div>
    <figcaption>
      {{
        text(
          "图中记录的是实际派发的事件；前两步可取消方向移动。",
          "These are actual dispatched events. The first two can cancel directional movement.",
        )
      }}
    </figcaption>
  </figure>
</template>

<style scoped>
[role="button"]:focus {
  outline: none;
}
[role="button"]:focus-visible rect {
  stroke: var(--demo-primary);
  stroke-width: 3;
}

.timeline-demo {
  margin: 20px 0;
  padding: 14px;
  border: 1px solid var(--demo-border);
  border-radius: 18px;
  background: var(--demo-canvas);
}
svg {
  display: block;
  width: 100%;
  max-width: 520px;
  margin: auto;
}
.title {
  fill: var(--demo-text);
  font: 600 14px sans-serif;
}
.spine {
  stroke: var(--demo-border);
  stroke-width: 3;
}
.step {
  cursor: pointer;
  opacity: 0.55;
}
.step.shown {
  opacity: 1;
}
.step circle {
  fill: var(--demo-muted);
  stroke: var(--demo-border);
  stroke-width: 2;
}
.step.shown circle {
  fill: var(--demo-primary);
  stroke: var(--demo-primary);
}
.step rect {
  fill: var(--demo-surface);
  stroke: var(--demo-border);
}
.step.shown rect {
  fill: var(--demo-primary-soft);
  stroke: var(--demo-primary);
}
.number {
  fill: var(--demo-text);
  text-anchor: middle;
  font: 600 12px sans-serif;
  pointer-events: none;
}
.step.shown .number {
  fill: var(--demo-on-primary);
}
.event-label {
  fill: var(--demo-text);
  font: 13px sans-serif;
  pointer-events: none;
}
.controls,
.real {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 10px;
}
.controls button,
.real button {
  padding: 6px 10px;
  border: 1px solid var(--demo-border);
  border-radius: 6px;
  background: var(--demo-surface);
  cursor: pointer;
}
.real {
  position: fixed;
  left: -10000px;
  top: 0;
  opacity: 0;
  pointer-events: none;
  flex-direction: column;
  align-items: center;
}
.real-group {
  padding: 3px;
  border: 1px dashed var(--demo-text-soft);
  border-radius: 6px;
}
.real button.vuepg-focus {
  color: var(--demo-primary);
  border-color: var(--demo-primary);
}
figcaption {
  margin-top: 8px;
  text-align: center;
  color: var(--demo-text-muted);
  font-size: 13px;
}
</style>
