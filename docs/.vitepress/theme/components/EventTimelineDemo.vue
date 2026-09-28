<script setup lang="ts">
import { computed, ref } from "vue";
import { useVuEPG } from "vuepg";

const epg = useVuEPG();
const source = ref<HTMLElement | null>(null);
const target = ref<HTMLElement | null>(null);
const events = ref<string[]>([]);
const shown = ref(0);
const expected = ["当前项方向", "原组方向", "旧项失焦", "离开原组", "进入目标组", "新项聚焦"];
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
  <figure class="timeline-demo">
    <svg
      viewBox="0 0 440 268"
      role="img"
      :aria-label="`方向操作和焦点变化事件顺序，已显示${shown}步`"
    >
      <text x="15" y="21" class="title">按 ↓ 从原组进入目标组</text>
      <line x1="37" y1="43" x2="37" y2="237" class="spine" />
      <g
        v-for="(label, index) in expected"
        :key="label"
        class="step"
        :class="{ shown: index < shown }"
        role="button"
        tabindex="0"
        :aria-label="`查看第${index + 1}步：${label}`"
        @click="shown = Math.min(index + 1, events.length)"
        @keydown.enter="shown = Math.min(index + 1, events.length)"
      >
        <circle cx="37" :cy="49 + index * 37" r="12" />
        <text x="37" :y="53 + index * 37" class="number">{{ index + 1 }}</text>
        <rect x="61" :y="32 + index * 37" width="360" height="32" rx="5" />
        <text x="76" :y="53 + index * 37" class="event-label">
          {{ index < shown ? visibleEvents[index] : "等待事件" }}
        </text>
      </g>
    </svg>
    <div class="controls">
      <button type="button" @click="run">运行一次 ↓</button>
      <button type="button" @click="step">
        {{ events.length > 0 && shown >= events.length ? "从第一步重看" : "查看下一步" }}
      </button>
    </div>
    <div class="real" aria-hidden="true">
      <div
        v-epg-group
        class="real-group"
        @epg-enter="record('进入原组')"
        @epg-down="record('原组方向')"
        @epg-leave="record('离开原组')"
      >
        <button
          ref="source"
          v-epg-item
          type="button"
          @epg-focus="record('原项聚焦')"
          @epg-down="record('当前项方向')"
          @epg-blur="record('旧项失焦')"
        >
          原组项目
        </button>
      </div>
      <div v-epg-group class="real-group" @epg-enter="record('进入目标组')">
        <button ref="target" v-epg-item type="button" @epg-focus="record('新项聚焦')">
          目标组项目
        </button>
      </div>
    </div>
    <figcaption>图中记录的是实际派发的事件；前两步可取消方向移动。</figcaption>
  </figure>
</template>

<style scoped>
.timeline-demo {
  margin: 20px 0;
  padding: 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}
svg {
  display: block;
  width: 100%;
  max-width: 520px;
  margin: auto;
}
.title {
  fill: var(--vp-c-text-1);
  font: 600 14px sans-serif;
}
.spine {
  stroke: var(--vp-c-divider);
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
  fill: var(--vp-c-default-soft);
  stroke: var(--vp-c-default-1);
  stroke-width: 2;
}
.step.shown circle {
  fill: var(--vp-c-brand-1);
  stroke: var(--vp-c-brand-1);
}
.step rect {
  fill: var(--vp-c-bg);
  stroke: var(--vp-c-divider);
}
.step.shown rect {
  fill: var(--vp-c-brand-soft);
  stroke: var(--vp-c-brand-1);
}
.number {
  fill: var(--vp-c-text-1);
  text-anchor: middle;
  font: 600 12px sans-serif;
  pointer-events: none;
}
.step.shown .number {
  fill: #fff;
}
.event-label {
  fill: var(--vp-c-text-1);
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
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
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
  border: 1px dashed var(--vp-c-text-3);
  border-radius: 6px;
}
.real button.vuepg-focus {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}
figcaption {
  margin-top: 8px;
  text-align: center;
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
