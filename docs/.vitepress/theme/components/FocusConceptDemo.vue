<script setup lang="ts">
import { ref } from "vue";
import { useVuEPG } from "vuepg";
import { useDocsText } from "../composables/use-docs-text";

const { text } = useDocsText();

const epg = useVuEPG();
const current = ref<"none" | "home" | "movies">("none");
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
  <figure class="concept-demo vuepg-demo">
    <svg
      viewBox="0 0 420 180"
      role="img"
      :aria-label="text('焦点与分组概念', 'Focus items and groups')"
    >
      <text x="16" y="22" class="heading">
        {{ text("一个分组，两个可获得焦点的元素", "One group, two focus items") }}
      </text>
      <g
        class="group-target"
        role="button"
        tabindex="0"
        :aria-label="text('进入菜单组', 'Enter the menu group')"
        @click="choose('group')"
        @keydown.enter="choose('group')"
        @keydown.space.prevent="choose('group')"
      >
        <rect x="16" y="38" width="388" height="116" rx="12" />
      </g>
      <text x="30" y="59" class="group-label">
        {{ text("EPGGroup · 决定进入位置和边界", "EPGGroup · entry and boundaries") }}
      </text>
      <g
        class="item-target"
        :class="{ focused: current === 'home' }"
        role="button"
        tabindex="0"
        :aria-label="text('聚焦首页', 'Focus Home')"
        @click="choose('first')"
        @keydown.enter="choose('first')"
        @keydown.space.prevent="choose('first')"
      >
        <rect x="30" y="75" width="156" height="62" rx="8" />
        <text x="108" y="110">{{ text("首页", "Home") }}</text>
      </g>
      <g
        class="item-target"
        :class="{ focused: current === 'movies' }"
        role="button"
        tabindex="0"
        :aria-label="text('聚焦电影', 'Focus Movies')"
        @click="choose('second')"
        @keydown.enter="choose('second')"
        @keydown.space.prevent="choose('second')"
      >
        <rect x="202" y="75" width="156" height="62" rx="8" />
        <text x="280" y="110">{{ text("电影", "Movies") }}</text>
      </g>
      <text x="17" y="174" class="hint">
        {{
          text(
            "点整个组进入默认项；点单个卡片直接移动焦点。",
            "Select a group for its entry, or select an item directly.",
          )
        }}
      </text>
    </svg>
    <div ref="group" v-epg-group class="real-group" aria-hidden="true">
      <button
        ref="first"
        v-epg-item="{ default: true }"
        type="button"
        tabindex="-1"
        @epg-focus="current = 'home'"
        @click="choose('first')"
      >
        {{ text("首页", "Home") }}
      </button>
      <button
        ref="second"
        v-epg-item
        type="button"
        tabindex="-1"
        @epg-focus="current = 'movies'"
        @click="choose('second')"
      >
        {{ text("电影", "Movies") }}
      </button>
    </div>
    <figcaption>
      {{
        text(
          "粉色框表示 vuEPG 当前焦点。点击分组或卡片试试。",
          "The pink frame shows the selected focus item. Choose a group or card.",
        )
      }}
    </figcaption>
  </figure>
</template>

<style scoped>
.concept-demo {
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
.heading {
  fill: var(--demo-text);
  font: 600 14px sans-serif;
}
.group-target:focus,
.item-target:focus {
  outline: none;
}
.group-target:focus-visible rect,
.item-target:focus-visible rect {
  stroke: var(--demo-primary);
  stroke-width: 3;
}

.group-target {
  cursor: pointer;
}
.group-target rect {
  fill: var(--demo-surface);
  stroke: var(--demo-border);
  stroke-width: 2;
  stroke-dasharray: 6 4;
}
.group-label,
.hint {
  fill: var(--demo-text-muted);
  font: 12px sans-serif;
}
.item-target {
  cursor: pointer;
}
.item-target rect {
  fill: var(--demo-muted);
  stroke: var(--demo-border);
  stroke-width: 2;
}
.item-target.focused rect {
  fill: var(--demo-primary-soft);
  stroke: var(--demo-focus);
  stroke-width: 3;
}
.item-target.focused text {
  fill: var(--demo-text);
}
.item-target text {
  fill: var(--demo-text);
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
  border: 1px solid var(--demo-border);
  border-radius: 6px;
  background: var(--demo-surface);
  cursor: pointer;
}
.real-group button.vuepg-focus {
  border-color: var(--demo-primary);
  color: var(--demo-primary);
}
figcaption {
  text-align: center;
  color: var(--demo-text-muted);
  font-size: 13px;
}
</style>
