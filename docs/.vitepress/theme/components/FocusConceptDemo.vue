<script setup lang="ts">
import { ref } from "vue";
import { useVuEPG } from "vuepg";

const epg = useVuEPG();
const current = ref("未选择");
const group = ref<HTMLElement | null>(null);
const first = ref<HTMLElement | null>(null);
const second = ref<HTMLElement | null>(null);

const choose = (name: "first" | "second" | "group"): void => {
  const target = name === "group" ? group.value : name === "first" ? first.value : second.value;
  if (target !== null) {
    epg.move(target);
  }
};
</script>

<template>
  <figure class="concept-demo">
    <svg viewBox="0 0 420 180" role="img" :aria-label="`焦点与分组概念，当前焦点：${current}`">
      <text x="16" y="22" class="heading">一个分组，两个可获得焦点的元素</text>
      <g
        class="group-target"
        role="button"
        tabindex="0"
        aria-label="进入菜单组"
        @click="choose('group')"
        @keydown.enter="choose('group')"
      >
        <rect x="16" y="38" width="388" height="116" rx="12" />
      </g>
      <text x="30" y="59" class="group-label">EPGGroup · 决定进入位置和边界</text>
      <g
        class="item-target"
        :class="{ focused: current === '首页' }"
        role="button"
        tabindex="0"
        aria-label="聚焦首页"
        @click="choose('first')"
        @keydown.enter="choose('first')"
      >
        <rect x="30" y="75" width="156" height="62" rx="8" />
        <text x="108" y="110">首页</text>
      </g>
      <g
        class="item-target"
        :class="{ focused: current === '电影' }"
        role="button"
        tabindex="0"
        aria-label="聚焦电影"
        @click="choose('second')"
        @keydown.enter="choose('second')"
      >
        <rect x="202" y="75" width="156" height="62" rx="8" />
        <text x="280" y="110">电影</text>
      </g>
      <text x="17" y="174" class="hint">点整个组进入默认项；点单个卡片直接移动焦点。</text>
    </svg>
    <div ref="group" v-epg-group class="real-group" aria-hidden="true">
      <button
        ref="first"
        v-epg-item="{ default: true }"
        type="button"
        @epg-focus="current = '首页'"
        @click="choose('first')"
      >
        首页
      </button>
      <button
        ref="second"
        v-epg-item
        type="button"
        @epg-focus="current = '电影'"
        @click="choose('second')"
      >
        电影
      </button>
    </div>
    <figcaption>粉色框表示 vuEPG 当前焦点。点击分组或卡片试试。</figcaption>
  </figure>
</template>

<style scoped>
.concept-demo {
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
.heading {
  fill: var(--vp-c-text-1);
  font: 600 14px sans-serif;
}
.group-target {
  cursor: pointer;
}
.group-target rect {
  fill: var(--vp-c-bg);
  stroke: var(--vp-c-default-1);
  stroke-width: 2;
  stroke-dasharray: 6 4;
}
.group-label,
.hint {
  fill: var(--vp-c-text-2);
  font: 12px sans-serif;
}
.item-target {
  cursor: pointer;
}
.item-target rect {
  fill: var(--vp-c-default-soft);
  stroke: var(--vp-c-default-1);
  stroke-width: 2;
}
.item-target.focused rect {
  fill: var(--vp-c-brand-soft);
  stroke: var(--vp-c-brand-1);
  stroke-width: 3;
}
.item-target text {
  fill: var(--vp-c-text-1);
  text-anchor: middle;
  dominant-baseline: middle;
  font: 600 15px sans-serif;
  pointer-events: none;
}
.real-group {
  position: fixed;
  left: -10000px;
  top: 0;
  opacity: 0;
  pointer-events: none;
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}
.real-group button {
  padding: 6px 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  cursor: pointer;
}
.real-group button.vuepg-focus {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
figcaption {
  text-align: center;
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
