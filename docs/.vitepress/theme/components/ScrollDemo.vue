<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import { useVuEPG } from "vuepg";

const props = defineProps<{ kind: "horizontal" | "vertical" | "nested" }>();
const epg = useVuEPG();
const stage = ref<HTMLElement | null>(null);
const current = ref("");
const outerOffset = ref(0);
const firstOffset = ref(0);
const secondOffset = ref(0);

interface Mark {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}
const marks = ref<Mark[]>([]);
const entries = Array.from({ length: 7 }, (_, index) => index);
const clipId = `scroll-demo-${props.kind}`;
const areaHeight = props.kind === "nested" ? 172 : props.kind === "vertical" ? 150 : 84;

const measure = (): void => {
  const root = stage.value;
  if (root === null) {
    return;
  }
  const view = root.getBoundingClientRect();
  const scale = Math.min(300 / view.width, areaHeight / view.height);
  marks.value = Array.from(root.querySelectorAll<HTMLElement>("[data-demo-id]"), (el) => {
    const box = el.getBoundingClientRect();
    return {
      id: el.dataset["demoId"] ?? "",
      label: el.textContent.trim(),
      x: 24 + (box.left - view.left) * scale,
      y: 36 + (box.top - view.top) * scale,
      width: box.width * scale,
      height: box.height * scale,
    };
  });
  outerOffset.value = root.scrollTop || root.scrollLeft;
  firstOffset.value = root.querySelector<HTMLElement>("[data-row='first']")?.scrollLeft ?? 0;
  secondOffset.value = root.querySelector<HTMLElement>("[data-row='second']")?.scrollLeft ?? 0;
};

const focus = (id: string): void => {
  const target = Array.from(
    stage.value?.querySelectorAll<HTMLElement>("[data-demo-id]") ?? [],
  ).find((el) => el.dataset["demoId"] === id);
  if (target !== undefined && epg.move(target)) {
    current.value = id;
    measure();
  }
};

const step = (difference: number): void => {
  const index = Number(current.value.slice(1));
  const next = Number.isNaN(index) ? 0 : Math.min(6, Math.max(0, index + difference));
  focus(`${props.kind === "vertical" ? "v" : "h"}${String(next)}`);
};

onMounted(() => {
  void nextTick(measure);
});
</script>

<template>
  <figure class="scroll-demo">
    <svg
      viewBox="0 0 350 245"
      role="img"
      :aria-label="`滚动位置实时示意，当前焦点：${current || '未选择'}`"
    >
      <defs>
        <clipPath :id="clipId">
          <rect x="24" y="36" width="300" :height="areaHeight" rx="8" />
        </clipPath>
      </defs>
      <text x="24" y="24" class="title">
        {{
          kind === "horizontal" ? "横向列表" : kind === "vertical" ? "纵向列表" : "跨组与嵌套容器"
        }}
      </text>
      <rect x="24" y="36" width="300" :height="areaHeight" rx="8" class="viewport" />
      <g :clip-path="`url(#${clipId})`">
        <g
          v-for="mark in marks"
          :key="mark.id"
          class="mark"
          :class="{ selected: mark.id === current }"
          role="button"
          tabindex="0"
          :aria-label="`移动到${mark.label}`"
          @click="focus(mark.id)"
          @keydown.enter="focus(mark.id)"
        >
          <rect :x="mark.x" :y="mark.y" :width="mark.width" :height="mark.height" rx="5" />
          <text :x="mark.x + mark.width / 2" :y="mark.y + mark.height / 2">{{ mark.label }}</text>
        </g>
      </g>
      <text x="24" y="228" class="status">
        {{
          kind === "nested"
            ? `外层 ↓ ${outerOffset}px · 上排 → ${firstOffset}px · 下排 → ${secondOffset}px`
            : `${kind === "vertical" ? "纵向" : "横向"}滚动 ${outerOffset}px · 焦点 ${current || "未选择"}`
        }}
      </text>
    </svg>

    <div
      v-if="kind === 'horizontal'"
      ref="stage"
      v-epg-scroll
      class="real horizontal"
      @scroll="measure"
    >
      <button
        v-for="index in entries"
        :key="index"
        v-epg-item
        type="button"
        :data-demo-id="`h${String(index)}`"
        :class="{ selected: current === `h${String(index)}` }"
        @click="focus(`h${String(index)}`)"
      >
        卡片 {{ index + 1 }}
      </button>
    </div>
    <div
      v-else-if="kind === 'vertical'"
      ref="stage"
      v-epg-scroll
      class="real vertical"
      @scroll="measure"
    >
      <button
        v-for="index in entries"
        :key="index"
        v-epg-item
        type="button"
        :data-demo-id="`v${String(index)}`"
        :class="{ selected: current === `v${String(index)}` }"
        @click="focus(`v${String(index)}`)"
      >
        频道 {{ index + 1 }}
      </button>
    </div>
    <div v-else ref="stage" v-epg-scroll class="real outer" @scroll="measure">
      <div v-epg-group v-epg-scroll data-row="first" class="row" @scroll="measure">
        <button
          v-for="index in entries"
          :key="index"
          v-epg-item
          type="button"
          :data-demo-id="`a${String(index)}`"
          :class="{ selected: current === `a${String(index)}` }"
          @click="focus(`a${String(index)}`)"
        >
          上 {{ index + 1 }}
        </button>
      </div>
      <div v-epg-group v-epg-scroll data-row="second" class="row" @scroll="measure">
        <button
          v-for="index in entries"
          :key="index"
          v-epg-item
          type="button"
          :data-demo-id="`b${String(index)}`"
          :class="{ selected: current === `b${String(index)}` }"
          @click="focus(`b${String(index)}`)"
        >
          下 {{ index + 1 }}
        </button>
      </div>
    </div>

    <figcaption>
      <div v-if="kind === 'nested'" class="controls">
        <button type="button" @click="focus('a6')">上排末项</button>
        <button type="button" @click="focus('b0')">进入下排</button>
        <button type="button" @click="focus('b6')">下排末项</button>
        <button type="button" @click="focus('a0')">回到上排</button>
      </div>
      <div v-else class="controls">
        <button type="button" @click="step(-1)">
          {{ kind === "vertical" ? "↑ 上一项" : "← 上一项" }}
        </button>
        <button type="button" @click="step(1)">
          {{ kind === "vertical" ? "↓ 下一项" : "→ 下一项" }}
        </button>
        <button type="button" @click="focus(`${kind === 'vertical' ? 'v' : 'h'}6`)">
          跳到末项
        </button>
      </div>
      <p>点击按钮或图中的卡片，观察真实容器与上方 SVG 同步移动。</p>
    </figcaption>
  </figure>
</template>

<style scoped>
.scroll-demo {
  margin: 20px 0;
  padding: 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}
svg {
  display: block;
  width: 100%;
  max-width: 440px;
  margin: 0 auto 12px;
}
.title {
  fill: var(--vp-c-text-1);
  font: 600 14px sans-serif;
}
.status {
  fill: var(--vp-c-text-2);
  font: 12px sans-serif;
}
.viewport {
  fill: var(--vp-c-bg);
  stroke: var(--vp-c-brand-1);
  stroke-width: 2;
}
.mark {
  cursor: pointer;
}
.mark rect {
  fill: var(--vp-c-default-soft);
  stroke: var(--vp-c-default-1);
  stroke-width: 2;
}
.mark.selected rect {
  fill: var(--vp-c-brand-soft);
  stroke: var(--vp-c-brand-1);
  stroke-width: 3;
}
.mark text {
  fill: var(--vp-c-text-1);
  text-anchor: middle;
  dominant-baseline: middle;
  font: 12px sans-serif;
  pointer-events: none;
}
.real {
  max-width: 300px;
  margin: 0 auto;
  border: 1px dashed var(--vp-c-text-3);
  border-radius: 7px;
}
.real button {
  flex: 0 0 auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 5px;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  cursor: pointer;
}
.real button.selected {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.horizontal {
  display: flex;
  gap: 8px;
  height: 64px;
  padding: 6px;
  overflow-x: auto;
}
.horizontal button {
  width: 86px;
}
.vertical {
  display: grid;
  gap: 8px;
  height: 150px;
  padding: 6px;
  overflow-y: auto;
}
.vertical button {
  height: 36px;
}
.outer {
  display: grid;
  gap: 100px;
  height: 172px;
  padding: 6px;
  overflow-y: auto;
}
.row {
  display: flex;
  gap: 8px;
  height: 70px;
  overflow-x: auto;
}
.row button {
  width: 78px;
}
.controls {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.controls button {
  padding: 6px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  cursor: pointer;
}
.controls button:hover {
  border-color: var(--vp-c-brand-1);
}
figcaption p {
  margin: 8px 0 0;
  text-align: center;
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
