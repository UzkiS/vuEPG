/** 移动方向 */
export type Direction = "up" | "down" | "left" | "right";

/** 所有方向 */
export const DIRECTIONS: readonly Direction[] = ["up", "down", "left", "right"];

export const isDirection = (value: unknown): value is Direction => {
  return DIRECTIONS.some((direction) => direction === value);
};

/** 参与计算的矩形，与 `DOMRect` 兼容 */
export interface Box {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}

/** 候选目标 */
export interface Candidate<T> {
  readonly value: T;
  readonly box: Box;
}

/** 判定交叉轴是否重叠时，从起点两侧各向内收缩的比例，避免边缘相接被误判为重叠 */
const OVERLAP_TOLERANCE = 0.05;

const overlapsHorizontally = (from: Box, to: Box): boolean => {
  const inset = from.width * OVERLAP_TOLERANCE;
  return from.right - inset >= to.left && from.left + inset <= to.right;
};

const overlapsVertically = (from: Box, to: Box): boolean => {
  const inset = from.height * OVERLAP_TOLERANCE;
  return from.bottom - inset >= to.top && from.top + inset <= to.bottom;
};

/** 某一方向上的几何规则 */
interface DirectionRule {
  /** 目标是否位于该方向（前沿越过起点的同侧边） */
  isAhead(from: Box, to: Box): boolean;
  /** 目标是否完全越过起点（无任何交叠） */
  isBeyond(from: Box, to: Box): boolean;
  /** 交叉轴是否重叠 */
  overlaps(from: Box, to: Box): boolean;
  /** 主轴距离：越小越近 */
  distance(from: Box, to: Box): number;
  /** 交叉轴偏移：主轴距离相同时，越小越优先 */
  offset(from: Box, to: Box): number;
  /** 交叉轴间距：两者在交叉轴上重叠时为 0 */
  gap(from: Box, to: Box): number;
}

const horizontalGap = (from: Box, to: Box): number =>
  Math.max(0, to.left - from.right, from.left - to.right);

const verticalGap = (from: Box, to: Box): number =>
  Math.max(0, to.top - from.bottom, from.top - to.bottom);

const RULES: Readonly<Record<Direction, DirectionRule>> = {
  down: {
    isAhead: (from, to) => to.top > from.top,
    isBeyond: (from, to) => to.top > from.bottom,
    overlaps: overlapsHorizontally,
    distance: (from, to) => to.top - from.top,
    offset: (from, to) => Math.abs(to.left - from.left),
    gap: horizontalGap,
  },
  up: {
    isAhead: (from, to) => to.bottom < from.bottom,
    isBeyond: (from, to) => to.bottom < from.top,
    overlaps: overlapsHorizontally,
    distance: (from, to) => from.bottom - to.bottom,
    offset: (from, to) => Math.abs(to.left - from.left),
    gap: horizontalGap,
  },
  right: {
    isAhead: (from, to) => to.left > from.left,
    isBeyond: (from, to) => to.left > from.right,
    overlaps: overlapsVertically,
    distance: (from, to) => to.left - from.left,
    offset: (from, to) => Math.abs(to.top - from.top),
    gap: verticalGap,
  },
  left: {
    isAhead: (from, to) => to.right < from.right,
    isBeyond: (from, to) => to.right < from.left,
    overlaps: overlapsVertically,
    distance: (from, to) => from.right - to.right,
    offset: (from, to) => Math.abs(to.top - from.top),
    gap: verticalGap,
  },
};

/** 参与排序的候选 */
export interface RankedCandidate<T> extends Candidate<T> {
  /** 主轴距离：越小越近 */
  readonly distance: number;
  /** 与锚点的交叉轴间距：距离相同时越小越优先；未传锚点时为 0 */
  readonly gap: number;
  /** 交叉轴偏移：距离、间距都相同时越小越优先 */
  readonly offset: number;
}

/** 挑选过程中每一步的结果，供调试与文档示意图使用 */
export interface NearestAnalysis<T> {
  /** ① 位于该方向上的候选 */
  readonly ahead: readonly Candidate<T>[];
  /** ② 其中交叉轴与起点重叠的候选 */
  readonly overlapping: readonly Candidate<T>[];
  /** ② 实际参与比较的候选：有重叠的候选时为 `overlapping`，否则为完全越过起点的候选 */
  readonly pool: readonly Candidate<T>[];
  /** ③ `pool` 按距离、与锚点的间距、偏移、原始顺序排序，第一个即为目标 */
  readonly ranked: readonly RankedCandidate<T>[];
}

/** 打分与比较只定义一次，调试排序和普通导航使用同一规则。 */
const score = <T>(
  rule: DirectionRule,
  from: Box,
  candidate: Candidate<T>,
  anchor?: Box,
): RankedCandidate<T> => ({
  value: candidate.value,
  box: candidate.box,
  distance: rule.distance(from, candidate.box),
  gap: anchor === undefined ? 0 : rule.gap(anchor, candidate.box),
  offset: rule.offset(from, candidate.box),
});

const compare = <T>(a: RankedCandidate<T>, b: RankedCandidate<T>): number =>
  a.distance - b.distance || a.gap - b.gap || a.offset - b.offset;

/**
 * 在同一层级的候选中，分析指定方向上的目标：
 *
 * 1. 只保留位于该方向上的候选；
 * 2. 优先考虑交叉轴与起点重叠的候选；没有时，才考虑完全越过起点的候选；
 * 3. 取主轴距离最近者；距离相同时，先比较与锚点在交叉轴上的间距，再比较交叉轴偏移，仍相同则取靠前者。
 *
 * `anchor` 为实际获得焦点的元素：逐层向外查找时，`from` 是整个分组，
 * 用锚点裁决并列可以让结果贴近用户眼中焦点所在的位置。不传时不参与比较。
 */
export const analyzeNearest = <T>(
  direction: Direction,
  from: Box,
  candidates: readonly Candidate<T>[],
  anchor?: Box,
): NearestAnalysis<T> => {
  const rule = RULES[direction];
  const ahead = candidates.filter((c) => rule.isAhead(from, c.box));
  const overlapping = ahead.filter((c) => rule.overlaps(from, c.box));
  const pool =
    overlapping.length > 0 ? overlapping : ahead.filter((c) => rule.isBeyond(from, c.box));
  // 原始顺序作为最后的排序键：老旧浏览器的 Array.prototype.sort 不保证稳定
  const ranked = pool
    .map((c, index) => Object.assign(score(rule, from, c, anchor), { index }))
    .sort((a, b) => compare(a, b) || a.index - b.index)
    .map(({ value, box, distance, gap, offset }) => ({ value, box, distance, gap, offset }));
  return { ahead, overlapping, pool, ranked };
};

/** 选出指定方向上最近的目标，规则见 {@link analyzeNearest} */
export const pickNearest = <T>(
  direction: Direction,
  from: Box,
  candidates: readonly Candidate<T>[],
  anchor?: Box,
): T | null => {
  const rule = RULES[direction];
  let best: RankedCandidate<T> | null = null;
  let foundOverlap = false;
  for (const candidate of candidates) {
    if (!rule.isAhead(from, candidate.box)) {
      continue;
    }
    const overlapping = rule.overlaps(from, candidate.box);
    if (!overlapping && (foundOverlap || !rule.isBeyond(from, candidate.box))) {
      continue;
    }
    if (overlapping && !foundOverlap) {
      foundOverlap = true;
      best = null;
    }
    const ranked = score(rule, from, candidate, anchor);
    // 分数相同时保留先出现者，不依赖旧浏览器的排序稳定性。
    if (best === null || compare(ranked, best) < 0) {
      best = ranked;
    }
  }
  return best === null ? null : best.value;
};
