<script setup lang="ts">
import { useDocsText } from "../composables/use-docs-text";
import { ref } from "vue";
import { useVuEPG, type EPGEvent } from "vuepg";

const { text } = useDocsText();
const epg = useVuEPG();
const current = ref(text("未选择", "None"));
const lastAction = ref(text("点一个组，观察入口项", "Choose a group to see its entry"));
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
        ? text("进入左组 → 第一个可用项", "Left group → first available item")
        : name === "preferred"
          ? text("进入右组 → default 项", "Right group → default item")
          : text("直接聚焦指定项", "Focus the item directly");
  }
};
const onFocus = (event: EPGEvent<"epg-focus">): void => {
  current.value = event.detail.item.el.textContent.trim();
};
</script>

<template>
  <figure class="entry-demo vuepg-demo">
    <svg
      viewBox="0 0 440 230"
      role="img"
      :aria-label="
        text(`分组入口演示，当前焦点：${current}`, `Group entry demo, current focus: ${current}`)
      "
    >
      <text x="14" y="21" class="title">
        {{ text("进入分组时，入口由 default 决定", "Entering a group uses its default") }}
      </text>
      <g
        class="group-shape"
        role="button"
        tabindex="0"
        :aria-label="text('进入左组', 'Enter left group')"
        @click="choose('plain')"
        @keydown.enter="choose('plain')"
        @keydown.space.prevent="choose('plain')"
      >
        <rect x="14" y="37" width="192" height="142" rx="10" />
        <text x="29" y="58">{{ text("左组 · 无 default", "Left · no default") }}</text>
      </g>
      <g
        class="group-shape"
        role="button"
        tabindex="0"
        :aria-label="text('进入右组', 'Enter right group')"
        @click="choose('preferred')"
        @keydown.enter="choose('preferred')"
        @keydown.space.prevent="choose('preferred')"
      >
        <rect x="234" y="37" width="192" height="142" rx="10" />
        <text x="249" y="58">
          {{ text("右组 · 第二项为 default ★", "Right · B2 is default ★") }}
        </text>
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
        :aria-label="text(`聚焦${item.label}`, `Focus ${item.label}`)"
        @click="
          choose(item.id === 'a1' ? 'a1' : item.id === 'a2' ? 'a2' : item.id === 'b1' ? 'b1' : 'b2')
        "
        @keydown.enter="
          choose(item.id === 'a1' ? 'a1' : item.id === 'a2' ? 'a2' : item.id === 'b1' ? 'b1' : 'b2')
        "
        @keydown.space.prevent="
          choose(item.id === 'a1' ? 'a1' : item.id === 'a2' ? 'a2' : item.id === 'b1' ? 'b1' : 'b2')
        "
      >
        <rect :x="item.x" y="79" width="76" height="66" rx="6" />
        <text :x="item.x + 38" y="116">{{ item.label }}</text>
      </g>
      <text x="15" y="207" class="status">
        {{ lastAction }} · {{ text("当前焦点：", "Current focus: ") }}{{ current }}
      </text>
    </svg>
    <div class="controls">
      <button type="button" @click="choose('plain')">
        {{ text("进入左组", "Enter left group") }}
      </button>
      <button type="button" @click="choose('preferred')">
        {{ text("进入右组", "Enter right group") }}
      </button>
    </div>
    <div class="real" aria-hidden="true">
      <div ref="plain" v-epg-group>
        <button
          ref="first"
          v-epg-item
          type="button"
          tabindex="-1"
          @epg-focus="onFocus"
          @click="choose('a1')"
        >
          A1</button
        ><button
          ref="second"
          v-epg-item
          type="button"
          tabindex="-1"
          @epg-focus="onFocus"
          @click="choose('a2')"
        >
          A2
        </button>
      </div>
      <div ref="preferred" v-epg-group>
        <button
          ref="p1"
          v-epg-item
          type="button"
          tabindex="-1"
          @epg-focus="onFocus"
          @click="choose('b1')"
        >
          B1</button
        ><button
          ref="p2"
          v-epg-item="{ default: true }"
          type="button"
          tabindex="-1"
          @epg-focus="onFocus"
          @click="choose('b2')"
        >
          B2 ★
        </button>
      </div>
    </div>
    <figcaption>
      {{
        text(
          "点击组观察入口，再点击单个卡片比较直接移动。",
          "Choose a group to see its entry, then an item to compare direct movement.",
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

.entry-demo {
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
.group-shape {
  cursor: pointer;
}
.group-shape rect {
  fill: var(--demo-surface);
  stroke: var(--demo-border);
  stroke-width: 2;
  stroke-dasharray: 5 4;
}
.group-shape text {
  fill: var(--demo-text-muted);
  font: 12px sans-serif;
}
.item {
  cursor: pointer;
}
.item rect {
  fill: var(--demo-muted);
  stroke: var(--demo-border);
  stroke-width: 2;
}
.item.focused rect {
  fill: var(--demo-primary-soft);
  stroke: var(--demo-focus);
  stroke-width: 3;
}
.item.focused text {
  fill: var(--demo-text);
}
.item text {
  fill: var(--demo-text);
  text-anchor: middle;
  dominant-baseline: middle;
  font: 12px sans-serif;
  pointer-events: none;
}
.status {
  fill: var(--demo-text-muted);
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
  border-color: var(--demo-primary);
  color: var(--demo-primary);
}
figcaption {
  margin-top: 8px;
  text-align: center;
  color: var(--demo-text-muted);
  font-size: 13px;
}
</style>
