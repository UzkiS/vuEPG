import type { Box, Direction } from "../../../src/core/navigation";

/** 示意图中的一个元素（坐标单位与 SVG viewBox 一致） */
export interface ScenarioBox {
  readonly name: string;
  readonly box: Box;
}

export interface Scenario {
  readonly direction: Direction;
  /** 是否允许读者切换方向 */
  readonly switchable?: boolean;
  readonly origin: Box;
  readonly candidates: readonly ScenarioBox[];
}

const box = (left: number, top: number, width: number, height: number): Box => ({
  left,
  top,
  width,
  height,
  right: left + width,
  bottom: top + height,
});

/** 移动规则示意图的场景：结果由真实导航算法实时计算 */
export const SCENARIOS = {
  /** 四个方向各有元素，并有一个斜向元素 */
  basic: {
    direction: "down",
    switchable: true,
    origin: box(170, 105, 80, 50),
    candidates: [
      { name: "A", box: box(170, 15, 80, 50) },
      { name: "B", box: box(40, 105, 80, 50) },
      { name: "C", box: box(300, 105, 80, 50) },
      { name: "D", box: box(170, 195, 80, 50) },
      { name: "E", box: box(310, 195, 80, 50) },
    ],
  },
  /** 斜向的元素更近，但同一列的元素优先 */
  overlap: {
    direction: "down",
    origin: box(40, 20, 120, 50),
    candidates: [
      { name: "X", box: box(210, 95, 90, 45) },
      { name: "Y", box: box(60, 190, 130, 45) },
    ],
  },
  /** 没有重叠时，只考虑完全越过的元素 */
  beyond: {
    direction: "down",
    origin: box(40, 20, 120, 60),
    candidates: [
      { name: "S", box: box(200, 50, 90, 80) },
      { name: "T", box: box(230, 170, 90, 50) },
      { name: "U", box: box(310, 20, 80, 40) },
    ],
  },
  /** 距离相同时，取更对齐的 */
  tie: {
    direction: "down",
    origin: box(150, 20, 100, 50),
    candidates: [
      { name: "L", box: box(10, 140, 150, 50) },
      { name: "R", box: box(175, 140, 110, 50) },
    ],
  },
  /** 仅边缘相接不算重叠 */
  tolerance: {
    direction: "down",
    origin: box(150, 20, 100, 50),
    candidates: [
      { name: "P", box: box(30, 110, 123, 50) },
      { name: "Q", box: box(190, 190, 70, 45) },
    ],
  },
} satisfies Record<string, Scenario>;

export type ScenarioName = keyof typeof SCENARIOS;
