<script setup lang="ts">
import { useDocsText } from "../composables/use-docs-text";
import { computed, nextTick, onMounted, ref } from "vue";
import { useVuEPG } from "vuepg";

const { text } = useDocsText();
const props = defineProps<{ kind: "horizontal" | "vertical" | "nested" }>();
const epg = useVuEPG();
const stage = ref<HTMLElement | null>(null);
const current = ref("");
const step = ref(-1);
const outerOffset = ref(0);
const firstOffset = ref(0);
const secondOffset = ref(0);
const contentSize = ref(0);
const viewSize = ref(1);
const frameHeight = ref(80);

interface Mark {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

const marks = ref<Mark[]>([]);
const entries = Array.from({ length: 7 }, (_, index) => index);
const clipId = `scroll-demo-${props.kind}`;
const frame = computed(() => {
  if (props.kind === "vertical") {
    return { x: 62, y: 60, width: 296, height: 275 };
  }
  if (props.kind === "nested") {
    return { x: 42, y: 60, width: 322, height: 330 };
  }
  return { x: 26, y: 64, width: 368, height: 222 };
});
const title = computed(() =>
  props.kind === "horizontal"
    ? text("横向列表", "Horizontal list")
    : props.kind === "vertical"
      ? text("纵向列表", "Vertical list")
      : text("跨组与嵌套容器", "Groups and nested scrolling"),
);
const labels = computed(() =>
  props.kind === "nested"
    ? [
        text("起点", "Start"),
        text("① 上排向右", "① Top row right"),
        text("② 进入下排", "② Enter bottom row"),
        text("③ 下排向右", "③ Bottom row right"),
      ]
    : props.kind === "vertical"
      ? [
          text("起点", "Start"),
          text("① 超出下缘", "① Below view"),
          text("② 到达末项", "② Last item"),
        ]
      : [
          text("起点", "Start"),
          text("① 超出右缘", "① Beyond right"),
          text("② 到达末项", "② Last item"),
        ],
);
const caption = computed(() => {
  if (step.value < 0) {
    return current.value === ""
      ? text(
          "点击步骤，看焦点进入可视区域时滚动了哪个容器。",
          "Choose a step to see which container scrolls to reveal focus.",
        )
      : text(
          `当前焦点是${focusLabel.value}，滚动位置由真实容器计算。`,
          `Focus is ${focusLabel.value}; offsets come from the actual containers.`,
        );
  }
  if (props.kind === "nested") {
    return [
      text(
        "焦点从上排第一项开始，三个容器都未滚动。",
        "Focus starts at the first top-row item; no container has scrolled.",
      ),
      text(
        "上排向右滚动；下排和外层目录保持原位。",
        "The top row scrolls right; the bottom row and outer list stay in place.",
      ),
      text(
        "进入下排时，外层目录向下滚动；上排保留原位置。",
        "Entering the bottom row scrolls the outer list down; the top row keeps its position.",
      ),
      text(
        "下排再向右滚动；上排的滚动位置仍然保留。",
        "The bottom row scrolls right; the top row retains its position.",
      ),
    ][step.value];
  }
  const offset = outerOffset.value;
  if (step.value === 0) {
    return text(
      "焦点已在可视区域内，nearest 不会滚动。",
      "Focus is already visible; nearest does not scroll.",
    );
  }
  return text(
    `${props.kind === "vertical" ? "列表向下" : "列表向右"}滚动 ${String(offset)}px，让焦点项完整可见。`,
    `The list scrolls ${props.kind === "vertical" ? "down" : "right"} by ${String(offset)}px to reveal the whole item.`,
  );
});
const focusLabel = computed(() => {
  if (current.value === "") {
    return text("未选择", "None");
  }
  const number = Number(current.value.slice(1)) + 1;
  if (props.kind === "nested") {
    return `${current.value.startsWith("a") ? text("上排", "Top row") : text("下排", "Bottom row")} ${String(number)}`;
  }
  return `${props.kind === "vertical" ? text("频道", "Channel") : text("卡片", "Card")} ${String(number)}`;
});
const progress = computed(() => {
  const max = Math.max(0, contentSize.value - viewSize.value);
  const width = frame.value.width;
  const visible = max === 0 ? width : Math.max(44, (viewSize.value / contentSize.value) * width);
  const position = max === 0 ? 0 : (Math.min(outerOffset.value, max) / max) * (width - visible);
  return { visible, position };
});
const lanes = computed(() => [
  {
    id: "first",
    label: text("组 A · 上排", "Group A · Top row"),
    y: 93,
    offset: firstOffset.value,
    marks: marks.value.filter((mark) => mark.id.startsWith("a")),
    active: current.value.startsWith("a"),
  },
  {
    id: "second",
    label: text("组 B · 下排", "Group B · Bottom row"),
    y: 194,
    offset: secondOffset.value,
    marks: marks.value.filter((mark) => mark.id.startsWith("b")),
    active: current.value.startsWith("b"),
  },
]);
const outerProgress = computed(() => {
  const height = 161;
  const max = Math.max(0, contentSize.value - viewSize.value);
  const visible = max === 0 ? height : Math.max(32, (viewSize.value / contentSize.value) * height);
  const position = max === 0 ? 0 : (Math.min(outerOffset.value, max) / max) * (height - visible);
  return { visible, position };
});

const measure = (): void => {
  const root = stage.value;
  if (root === null) {
    return;
  }
  const view = root.getBoundingClientRect();
  const scene = frame.value;
  const scale = scene.width / view.width;
  frameHeight.value = view.height * scale;
  marks.value = Array.from(root.querySelectorAll<HTMLElement>("[data-demo-id]"), (el) => {
    const box = el.getBoundingClientRect();
    const row = props.kind === "nested" ? el.closest<HTMLElement>("[data-row]") : null;
    const rowBox = row?.getBoundingClientRect();
    const itemScale = rowBox === undefined ? scale : scene.width / rowBox.width;
    const top = row?.dataset["row"] === "first" ? 93 : 194;
    return {
      id: el.dataset["demoId"] ?? "",
      label: el.textContent.trim(),
      x: scene.x + (box.left - (rowBox?.left ?? view.left)) * itemScale,
      y: rowBox === undefined ? scene.y + (box.top - view.top) * scale : top + 5,
      width: box.width * itemScale,
      height: props.kind === "nested" ? 49 : box.height * scale,
    };
  });
  outerOffset.value = props.kind === "horizontal" ? root.scrollLeft : root.scrollTop;
  firstOffset.value = root.querySelector<HTMLElement>("[data-row='first']")?.scrollLeft ?? 0;
  secondOffset.value = root.querySelector<HTMLElement>("[data-row='second']")?.scrollLeft ?? 0;
  contentSize.value = props.kind === "horizontal" ? root.scrollWidth : root.scrollHeight;
  viewSize.value = props.kind === "horizontal" ? root.clientWidth : root.clientHeight;
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

const chooseItem = (id: string): void => {
  focus(id);
  step.value = -1;
};

const selectStep = (index: number): void => {
  const root = stage.value;
  if (root === null) {
    return;
  }
  if (props.kind !== "nested") {
    root.scrollLeft = 0;
    root.scrollTop = 0;
    focus(`${props.kind === "vertical" ? "v" : "h"}0`);
    focus(`${props.kind === "vertical" ? "v" : "h"}${String([0, 3, 6][index])}`);
    step.value = index;
    return;
  }
  const first = root.querySelector<HTMLElement>("[data-row='first']");
  const second = root.querySelector<HTMLElement>("[data-row='second']");
  root.scrollTop = 0;
  if (first !== null) {
    first.scrollLeft = 0;
  }
  if (second !== null) {
    second.scrollLeft = 0;
  }
  focus("a0");
  if (index >= 1) {
    focus("a6");
  }
  if (index >= 2 && epg.navigate("down")) {
    current.value = epg.getCurrentItem()?.el.dataset["demoId"] ?? current.value;
  }
  if (index >= 3) {
    focus("b6");
  }
  step.value = index;
  measure();
};

onMounted(() => {
  void nextTick(() => {
    selectStep(0);
  });
});
</script>

<template>
  <figure class="scroll-demo vuepg-demo">
    <svg
      :viewBox="`0 0 420 ${frame.height}`"
      role="img"
      :aria-label="
        text(`${title}实时演示，焦点：${focusLabel}`, `${title} demo, focus: ${focusLabel}`)
      "
    >
      <defs>
        <clipPath :id="clipId">
          <rect :x="frame.x" :y="frame.y" :width="frame.width" :height="frameHeight" rx="10" />
        </clipPath>
        <clipPath v-for="lane in lanes" :id="`${clipId}-${lane.id}`" :key="lane.id">
          <rect x="42" :y="lane.y" width="322" height="60" rx="8" />
        </clipPath>
      </defs>
      <text x="26" y="27" class="title">{{ title }}</text>
      <text x="26" y="46" class="subtitle">
        {{
          kind === "nested"
            ? text(
                "两排展开显示，右侧滑块记录目录滚动",
                "Rows shown separately; the right thumb tracks outer scrolling",
              )
            : text("可视区域固定，内容随焦点移动", "Fixed viewport; content follows focus")
        }}
      </text>
      <template v-if="kind === 'nested'">
        <rect class="outer-frame" x="26" y="61" width="354" height="216" rx="12" />
        <g v-for="lane in lanes" :key="lane.id" class="lane" :class="{ active: lane.active }">
          <text x="43" :y="lane.y - 10" class="lane-label">{{ lane.label }}</text>
          <text x="363" :y="lane.y - 10" text-anchor="end" class="lane-offset">
            {{ lane.offset }}px
          </text>
          <rect class="lane-frame" x="42" :y="lane.y" width="322" height="60" rx="8" />
          <g :clip-path="`url(#${clipId}-${lane.id})`">
            <g
              v-for="mark in lane.marks"
              :key="mark.id"
              class="mark"
              :class="{ selected: mark.id === current }"
              role="button"
              tabindex="0"
              :aria-label="text(`聚焦${mark.label}`, `Focus ${mark.label}`)"
              @click="chooseItem(mark.id)"
              @keydown.enter="chooseItem(mark.id)"
              @keydown.space.prevent="chooseItem(mark.id)"
            >
              <rect :x="mark.x" :y="mark.y" :width="mark.width" :height="mark.height" rx="7" />
              <text :x="mark.x + mark.width / 2" :y="mark.y + mark.height / 2">
                {{ mark.label }}
              </text>
            </g>
          </g>
        </g>
        <rect class="rail" x="396" y="93" width="6" height="161" rx="3" />
        <rect
          class="thumb"
          x="393"
          :y="93 + outerProgress.position"
          width="12"
          :height="outerProgress.visible"
          rx="6"
        />
        <text x="26" y="306" class="readout">{{ text("焦点：", "Focus: ") }} {{ focusLabel }}</text>
        <text x="380" y="306" text-anchor="end" class="readout">
          {{ text("目录向下", "Outer list down") }} {{ outerOffset }}px
        </text>
      </template>
      <template v-else>
        <rect
          class="viewport"
          :x="frame.x"
          :y="frame.y"
          :width="frame.width"
          :height="frameHeight"
          rx="10"
        />
        <g :clip-path="`url(#${clipId})`">
          <g
            v-for="mark in marks"
            :key="mark.id"
            class="mark"
            :class="{ selected: mark.id === current }"
            role="button"
            tabindex="0"
            :aria-label="text(`聚焦${mark.label}`, `Focus ${mark.label}`)"
            @click="chooseItem(mark.id)"
            @keydown.enter="chooseItem(mark.id)"
            @keydown.space.prevent="chooseItem(mark.id)"
          >
            <rect :x="mark.x" :y="mark.y" :width="mark.width" :height="mark.height" rx="7" />
            <text :x="mark.x + mark.width / 2" :y="mark.y + mark.height / 2">{{ mark.label }}</text>
          </g>
        </g>
        <g v-if="kind === 'horizontal'">
          <rect class="rail" :x="frame.x" y="158" :width="frame.width" height="7" rx="3.5" />
          <rect
            class="thumb"
            :x="frame.x + progress.position"
            y="155"
            :width="progress.visible"
            height="13"
            rx="6.5"
          />
          <text :x="frame.x" y="195" class="readout">
            {{ text("焦点：", "Focus: ") }}{{ focusLabel }}
          </text>
          <text :x="frame.x + frame.width" y="195" text-anchor="end" class="readout">
            {{ text("向右滚动", "Scroll right") }} {{ outerOffset }}px
          </text>
        </g>
        <g v-else>
          <rect
            class="rail"
            :x="frame.x + frame.width + 9"
            :y="frame.y"
            width="7"
            :height="frameHeight"
            rx="3.5"
          />
          <rect
            class="thumb"
            :x="frame.x + frame.width + 6"
            :y="frame.y + progress.position * (frameHeight / frame.width)"
            width="13"
            :height="progress.visible * (frameHeight / frame.width)"
            rx="6.5"
          />
          <text :x="frame.x" y="251" class="readout">
            {{ text("焦点：", "Focus: ") }}{{ focusLabel }}
          </text>
          <text :x="frame.x + frame.width" y="251" text-anchor="end" class="readout">
            {{ text("向下滚动", "Scroll down") }} {{ outerOffset }}px
          </text>
        </g>
      </template>
    </svg>

    <div
      v-if="kind === 'horizontal'"
      ref="stage"
      v-epg-scroll
      class="real horizontal"
      aria-hidden="true"
      @scroll="measure"
    >
      <button
        v-for="index in entries"
        :key="index"
        v-epg-item
        type="button"
        tabindex="-1"
        :data-demo-id="`h${String(index)}`"
      >
        {{ text("卡片", "Card") }} {{ index + 1 }}
      </button>
    </div>
    <div
      v-else-if="kind === 'vertical'"
      ref="stage"
      v-epg-scroll
      class="real vertical"
      aria-hidden="true"
      @scroll="measure"
    >
      <button
        v-for="index in entries"
        :key="index"
        v-epg-item
        type="button"
        tabindex="-1"
        :data-demo-id="`v${String(index)}`"
      >
        {{ text("频道", "Channel") }} {{ index + 1 }}
      </button>
    </div>
    <div
      v-else
      ref="stage"
      v-epg-group
      v-epg-scroll
      class="real outer"
      aria-hidden="true"
      @scroll="measure"
      @epg-up.prevent
      @epg-down.prevent
      @epg-left.prevent
      @epg-right.prevent
    >
      <div v-epg-group v-epg-scroll data-row="first" class="row" @scroll="measure">
        <button
          v-for="index in entries"
          :key="index"
          v-epg-item
          type="button"
          tabindex="-1"
          :data-demo-id="`a${String(index)}`"
        >
          {{ text("上", "Top") }} {{ index + 1 }}
        </button>
      </div>
      <div v-epg-group v-epg-scroll data-row="second" class="row" @scroll="measure">
        <button
          v-for="index in entries"
          :key="index"
          v-epg-item
          type="button"
          tabindex="-1"
          :data-demo-id="`b${String(index)}`"
        >
          {{ text("下", "Bottom") }} {{ index + 1 }}
        </button>
      </div>
    </div>

    <figcaption>
      <div class="steps" role="group" :aria-label="text(`${title}演示步骤`, `${title} demo steps`)">
        <button
          v-for="(label, index) in labels"
          :key="label"
          type="button"
          :class="{ on: step === index }"
          @click="selectStep(index)"
        >
          {{ label }}
        </button>
      </div>
      <p>{{ caption }}</p>
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

.scroll-demo {
  margin: 20px 0;
  padding: 16px;
  border: 1px solid var(--demo-border);
  border-radius: 18px;
  background: var(--demo-canvas);
}
svg {
  display: block;
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
}
.title {
  fill: var(--demo-text);
  font: 600 16px sans-serif;
}
.subtitle {
  fill: var(--demo-text-muted);
  font: 12px sans-serif;
}
.viewport {
  fill: var(--demo-surface);
  stroke: var(--demo-primary);
  stroke-width: 2;
}
.outer-frame {
  fill: var(--demo-surface);
  stroke: var(--demo-border);
  stroke-width: 2;
}
.lane-frame {
  fill: var(--demo-canvas);
  stroke: var(--demo-border);
  stroke-width: 2;
  stroke-dasharray: 5 4;
}
.lane.active .lane-frame {
  fill: var(--demo-primary-soft);
  stroke: var(--demo-primary);
}
.lane-label {
  fill: var(--demo-text);
  font: 600 13px sans-serif;
}
.lane-offset {
  fill: var(--demo-text-muted);
  font: 12px sans-serif;
}
.mark {
  cursor: pointer;
}
.mark rect {
  fill: var(--demo-muted);
  stroke: var(--demo-border);
  stroke-width: 2;
  transition:
    fill 0.18s ease,
    stroke 0.18s ease;
}
.mark.selected rect {
  fill: var(--demo-primary-soft);
  stroke: var(--demo-focus);
  stroke-width: 3;
}
.mark text {
  fill: var(--demo-text);
  text-anchor: middle;
  dominant-baseline: central;
  font: 600 15px sans-serif;
  pointer-events: none;
}
.mark.selected text {
  fill: var(--demo-text);
}
.rail {
  fill: var(--demo-muted);
}
.thumb {
  fill: var(--demo-primary);
  transition:
    x 0.18s ease,
    y 0.18s ease;
}
.readout {
  fill: var(--demo-text-muted);
  font: 12px sans-serif;
}
.real {
  position: fixed;
  left: -10000px;
  top: 0;
  opacity: 0;
  pointer-events: none;
  width: 300px;
  border: 1px solid transparent;
}
.real button {
  flex: 0 0 auto;
  border: 0;
  border-radius: 5px;
  background: var(--demo-surface);
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
.steps {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
}
.steps button {
  padding: 4px 10px;
  border: 1px solid var(--demo-border);
  border-radius: 6px;
  font-size: 13px;
  background: var(--demo-surface);
  cursor: pointer;
}
.steps button.on {
  color: var(--demo-on-primary);
  border-color: var(--demo-primary);
  background: var(--demo-primary);
}
figcaption p {
  margin: 10px 0 0;
  font-size: 14px;
  line-height: 1.7;
}
</style>
