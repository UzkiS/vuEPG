<script setup lang="ts">
import { computed, ref } from "vue";
import {
  analyzeNearest,
  DIRECTIONS,
  type Box,
  type Direction,
} from "../../../../src/core/navigation";
import { SCENARIOS, type Scenario, type ScenarioName } from "../navigation-scenarios";

const props = defineProps<{ scenario: ScenarioName }>();

const WIDTH = 420;
const HEIGHT = 260;
/** 与 src/core/navigation.ts 中的 OVERLAP_TOLERANCE 一致，仅用于绘制阴影带 */
const TOLERANCE = 0.05;

const ARROWS: Readonly<Record<Direction, string>> = { up: "↑", down: "↓", left: "←", right: "→" };
const SIDES: Readonly<Record<Direction, string>> = {
  up: "上",
  down: "下",
  left: "左",
  right: "右",
};
const STEPS = ["全部候选", "① 方向", "② 重叠", "③ 最近"] as const;

const scenario = computed((): Scenario => SCENARIOS[props.scenario]);
const direction = ref<Direction>(scenario.value.direction);
const step = ref(3);

const analysis = computed(() =>
  analyzeNearest(
    direction.value,
    scenario.value.origin,
    scenario.value.candidates.map((c) => ({ value: c.name, box: c.box })),
  ),
);

const names = (list: readonly { value: string }[]): string => list.map((c) => c.value).join("、");
const has = (list: readonly { value: string }[], name: string): boolean =>
  list.some((c) => c.value === name);

const target = computed(() => analysis.value.ranked[0]?.value ?? null);
const vertical = computed(() => direction.value === "up" || direction.value === "down");
const crossAxis = computed(() => (vertical.value ? "左右" : "上下"));
const side = computed(() => SIDES[direction.value]);

type Status = "idle" | "excluded" | "pool" | "chosen";

const statusOf = (name: string): Status => {
  const { ahead, pool } = analysis.value;
  if ((step.value >= 1 && !has(ahead, name)) || (step.value >= 2 && !has(pool, name))) {
    return "excluded";
  }
  if (step.value >= 3 && name === target.value) {
    return "chosen";
  }
  return step.value >= 2 ? "pool" : "idle";
};

/** 交叉轴重叠判定的范围（收缩 5% 后的起点投影） */
const band = computed(() => {
  const o = scenario.value.origin;
  return vertical.value
    ? {
        x: o.left + o.width * TOLERANCE,
        y: 0,
        width: o.width * (1 - 2 * TOLERANCE),
        height: HEIGHT,
      }
    : {
        x: 0,
        y: o.top + o.height * TOLERANCE,
        width: WIDTH,
        height: o.height * (1 - 2 * TOLERANCE),
      };
});

interface Point {
  readonly x: number;
  readonly y: number;
}

const center = (b: Box): Point => ({ x: b.left + b.width / 2, y: b.top + b.height / 2 });

/** 从矩形中心朝 `towards` 方向射出，与矩形边框的交点（再向外留出 `gap`） */
const edgePoint = (b: Box, towards: Point, gap: number): Point => {
  const c = center(b);
  const dx = towards.x - c.x;
  const dy = towards.y - c.y;
  const length = Math.hypot(dx, dy);
  const t = Math.min(
    dx === 0 ? Infinity : b.width / 2 / Math.abs(dx),
    dy === 0 ? Infinity : b.height / 2 / Math.abs(dy),
  );
  return { x: c.x + dx * t + (dx / length) * gap, y: c.y + dy * t + (dy / length) * gap };
};

const arrow = computed(() => {
  const chosen = analysis.value.ranked[0];
  if (step.value < 3 || chosen === undefined) {
    return null;
  }
  const origin = scenario.value.origin;
  const from = edgePoint(origin, center(chosen.box), 4);
  const to = edgePoint(chosen.box, center(origin), 6);
  return { x1: from.x, y1: from.y, x2: to.x, y2: to.y };
});

const caption = computed(() => {
  const { ahead, overlapping, pool, ranked } = analysis.value;
  const all = scenario.value.candidates.map((c) => ({ value: c.name }));
  const outside = all.filter((c) => !has(ahead, c.value));
  const dropped = ahead.filter((c) => !has(pool, c.value));
  switch (step.value) {
    case 0:
      return `红色 O 是当前焦点，灰色是同一层级的其他元素。按下 ${ARROWS[direction.value]} 键时，按以下三步挑选目标。`;
    case 1:
      return ahead.length === 0
        ? `O 的${side.value}方没有任何元素。`
        : `只看位于 O ${side.value}方的元素：${names(ahead)}。${outside.length > 0 ? `${names(outside)} 不在这个方向，排除。` : ""}`;
    case 2:
      if (overlapping.length > 0) {
        return `${names(overlapping)} 与 O 在${crossAxis.value}方向上有重叠（阴影带），优先只在它们之中挑选。${dropped.length > 0 ? `${names(dropped)} 没有重叠，排除。` : ""}`;
      }
      return pool.length > 0
        ? `没有元素与 O 在${crossAxis.value}方向上重叠，于是只看完全位于 O ${side.value}方的元素：${names(pool)}。${dropped.length > 0 ? `${names(dropped)} 与 O 有交叠，排除。` : ""}`
        : `既没有重叠的元素，也没有完全位于 O ${side.value}方的元素。`;
    default: {
      const [first, second] = ranked;
      if (first === undefined) {
        return "没有目标，焦点不动。如果 O 在分组中，会以整个分组为起点，向外一层继续查找。";
      }
      if (second?.distance === first.distance) {
        const tied = pool.filter((c) =>
          ranked.some((r) => r.value === c.value && r.distance === first.distance),
        );
        return `${names(tied)} 距离相同，取与 O 更对齐的 ${first.value}。`;
      }
      return `${first.value} 距离最近，成为目标。`;
    }
  }
});

const setDirection = (next: Direction): void => {
  direction.value = next;
  step.value = 3;
};
</script>

<template>
  <figure class="diagram">
    <svg :viewBox="`0 0 ${WIDTH} ${HEIGHT}`" role="img" :aria-label="caption">
      <defs>
        <marker
          :id="`arrow-${props.scenario}`"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" class="arrow-head" />
        </marker>
      </defs>
      <rect v-if="step === 2" class="band" v-bind="band" />
      <g v-for="c in scenario.candidates" :key="c.name" :class="['node', statusOf(c.name)]">
        <rect :x="c.box.left" :y="c.box.top" :width="c.box.width" :height="c.box.height" rx="6" />
        <text :x="center(c.box).x" :y="center(c.box).y">{{ c.name }}</text>
      </g>
      <g class="node origin">
        <rect
          :x="scenario.origin.left"
          :y="scenario.origin.top"
          :width="scenario.origin.width"
          :height="scenario.origin.height"
          rx="6"
        />
        <text :x="center(scenario.origin).x" :y="center(scenario.origin).y">O</text>
      </g>
      <line
        v-if="arrow"
        class="arrow"
        v-bind="arrow"
        :marker-end="`url(#arrow-${props.scenario})`"
      />
    </svg>

    <figcaption>
      <div class="controls">
        <div class="steps" role="group" aria-label="步骤">
          <button
            v-for="(label, index) in STEPS"
            :key="label"
            type="button"
            :class="{ on: step === index }"
            @click="step = index"
          >
            {{ label }}
          </button>
        </div>
        <div v-if="scenario.switchable" class="directions" role="group" aria-label="方向">
          <button
            v-for="d in DIRECTIONS"
            :key="d"
            type="button"
            :class="{ on: direction === d }"
            :aria-label="SIDES[d]"
            @click="setDirection(d)"
          >
            {{ ARROWS[d] }}
          </button>
        </div>
      </div>
      <p>{{ caption }}</p>
    </figcaption>
  </figure>
</template>

<style scoped>
.diagram {
  margin: 20px 0;
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}

svg {
  display: block;
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
}

.node rect {
  stroke-width: 2;
  transition: all 0.2s ease;
}

.node text {
  font-size: 15px;
  font-weight: 600;
  text-anchor: middle;
  dominant-baseline: central;
  pointer-events: none;
}

.idle rect {
  fill: var(--vp-c-default-soft);
  stroke: var(--vp-c-default-1);
}
.idle text {
  fill: var(--vp-c-text-1);
}

.excluded {
  opacity: 0.3;
}
.excluded rect {
  fill: transparent;
  stroke: var(--vp-c-text-3);
  stroke-dasharray: 5 4;
}
.excluded text {
  fill: var(--vp-c-text-3);
}

.pool rect {
  fill: rgba(245, 158, 11, 0.16);
  stroke: #f59e0b;
}
.pool text {
  fill: var(--vp-c-text-1);
}

.chosen rect {
  fill: var(--vp-c-success-soft);
  stroke: var(--vp-c-success-1);
  stroke-width: 3;
}
.chosen text {
  fill: var(--vp-c-success-1);
}

.origin rect {
  fill: var(--vp-c-brand-1);
  stroke: var(--vp-c-brand-1);
}
.origin text {
  fill: #fff;
}

.band {
  fill: rgba(245, 158, 11, 0.14);
}

.arrow {
  stroke: var(--vp-c-success-1);
  stroke-width: 3;
}
.arrow-head {
  fill: var(--vp-c-success-1);
}

.controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  margin-top: 12px;
}

.steps,
.directions {
  display: flex;
  gap: 4px;
}

.controls button {
  padding: 2px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 13px;
  background: var(--vp-c-bg);
  cursor: pointer;
}

.controls button.on {
  color: #fff;
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
}

figcaption p {
  margin: 10px 0 0;
  font-size: 14px;
  line-height: 1.7;
}
</style>
