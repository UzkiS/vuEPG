<script setup lang="ts">
import { ref } from "vue";
import { useVuEPG, type EPGEvent } from "vuepg";

const epg = useVuEPG();
const current = ref("未选择");
const lastAction = ref("点一个组，观察入口项");
const plain = ref<HTMLElement | null>(null);
const preferred = ref<HTMLElement | null>(null);
const first = ref<HTMLElement | null>(null);
const second = ref<HTMLElement | null>(null);
const p1 = ref<HTMLElement | null>(null);
const p2 = ref<HTMLElement | null>(null);

const choose = (name: "plain" | "preferred" | "a1" | "a2" | "b1" | "b2"): void => {
  const target =
    name === "plain"
      ? plain.value
      : name === "preferred"
        ? preferred.value
        : name === "a1"
          ? first.value
          : name === "a2"
            ? second.value
            : name === "b1"
              ? p1.value
              : p2.value;
  if (target !== null) {
    epg.move(target);
    lastAction.value =
      name === "plain"
        ? "进入左组 → 第一个可用项"
        : name === "preferred"
          ? "进入右组 → default 项"
          : "直接聚焦指定项";
  }
};
const onFocus = (event: EPGEvent<"epg-focus">): void => {
  current.value = event.detail.item.el.textContent.trim();
};
</script>

<template>
  <figure class="entry-demo">
    <svg viewBox="0 0 440 230" role="img" :aria-label="`分组入口演示，当前焦点：${current}`">
      <text x="14" y="21" class="title">进入分组时，入口由 default 决定</text>
      <g
        class="group-shape"
        role="button"
        tabindex="0"
        aria-label="进入左组"
        @click="choose('plain')"
        @keydown.enter="choose('plain')"
      >
        <rect x="14" y="37" width="192" height="142" rx="10" />
        <text x="29" y="58">左组 · 无 default</text>
      </g>
      <g
        class="group-shape"
        role="button"
        tabindex="0"
        aria-label="进入右组"
        @click="choose('preferred')"
        @keydown.enter="choose('preferred')"
      >
        <rect x="234" y="37" width="192" height="142" rx="10" />
        <text x="249" y="58">右组 · 第二项为 default ★</text>
      </g>
      <g
        v-for="item in [
          { label: 'A1', x: 28, id: 'a1' },
          { label: 'A2', x: 116, id: 'a2' },
          { label: 'B1', x: 248, id: 'b1' },
          { label: 'B2 ★', x: 336, id: 'b2' },
        ]"
        :key="item.label"
        class="item"
        :class="{ focused: current === item.label }"
        role="button"
        tabindex="0"
        :aria-label="`聚焦${item.label}`"
        @click="
          choose(item.id === 'a1' ? 'a1' : item.id === 'a2' ? 'a2' : item.id === 'b1' ? 'b1' : 'b2')
        "
        @keydown.enter="
          choose(item.id === 'a1' ? 'a1' : item.id === 'a2' ? 'a2' : item.id === 'b1' ? 'b1' : 'b2')
        "
      >
        <rect :x="item.x" y="79" width="76" height="66" rx="6" />
        <text :x="item.x + 38" y="116">{{ item.label }}</text>
      </g>
      <text x="15" y="207" class="status">{{ lastAction }} · 当前焦点：{{ current }}</text>
    </svg>
    <div class="controls">
      <button type="button" @click="choose('plain')">进入左组</button>
      <button type="button" @click="choose('preferred')">进入右组</button>
    </div>
    <div class="real" aria-hidden="true">
      <div ref="plain" v-epg-group>
        <button ref="first" v-epg-item type="button" @epg-focus="onFocus" @click="choose('a1')">
          A1</button
        ><button ref="second" v-epg-item type="button" @epg-focus="onFocus" @click="choose('a2')">
          A2
        </button>
      </div>
      <div ref="preferred" v-epg-group>
        <button ref="p1" v-epg-item type="button" @epg-focus="onFocus" @click="choose('b1')">
          B1</button
        ><button
          ref="p2"
          v-epg-item="{ default: true }"
          type="button"
          @epg-focus="onFocus"
          @click="choose('b2')"
        >
          B2 ★
        </button>
      </div>
    </div>
    <figcaption>点击组观察入口，再点击单个卡片比较直接移动。</figcaption>
  </figure>
</template>

<style scoped>
.entry-demo {
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
.group-shape {
  cursor: pointer;
}
.group-shape rect {
  fill: var(--vp-c-bg);
  stroke: var(--vp-c-default-1);
  stroke-width: 2;
  stroke-dasharray: 5 4;
}
.group-shape text {
  fill: var(--vp-c-text-2);
  font: 12px sans-serif;
}
.item {
  cursor: pointer;
}
.item rect {
  fill: var(--vp-c-default-soft);
  stroke: var(--vp-c-default-1);
  stroke-width: 2;
}
.item.focused rect {
  fill: var(--vp-c-brand-soft);
  stroke: var(--vp-c-brand-1);
  stroke-width: 3;
}
.item text {
  fill: var(--vp-c-text-1);
  text-anchor: middle;
  dominant-baseline: middle;
  font: 12px sans-serif;
  pointer-events: none;
}
.status {
  fill: var(--vp-c-text-2);
  font: 12px sans-serif;
}
.controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
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
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 10px;
}
.real > div {
  display: flex;
  gap: 6px;
}
.real button.vuepg-focus {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
figcaption {
  margin-top: 8px;
  text-align: center;
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
