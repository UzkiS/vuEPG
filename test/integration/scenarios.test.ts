/**
 * 布局场景基线：用表格描述常见 TV 页面中每一步按键的预期结果。
 * 导航算法的任何改动都必须保持这些场景不变（或同步更新并说明原因）。
 */
import { mount } from "#mount";
import { describe, expect, it } from "vitest";
import { useVuEPG, type Direction } from "../../src";
import { byId, focusedId } from "../helpers/dom";
import { press } from "../helpers/keyboard";
import { box } from "../helpers/layout";

const epg = useVuEPG();

const KEYS: Readonly<Record<Direction, string>> = {
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
};

/** [起点, 方向, 期望的焦点] */
type Step = readonly [from: string, direction: Direction, expected: string];

const scenario = (name: string, template: string, steps: readonly Step[]): void => {
  describe(name, () => {
    it.each(steps)("%s → %s = %s", (from, direction, expected) => {
      mount({ template });
      epg.move(byId(from));
      press(KEYS[direction]);
      expect(focusedId()).toBe(expected);
    });
  });
};

const items = (prefix: string, count: number, place: (i: number) => string): string =>
  Array.from(
    { length: count },
    (_, i) => `<div id="${prefix}${String(i)}" v-epg-item style="${place(i)}"></div>`,
  ).join("");

scenario(
  "左侧菜单 + 多行内容（每行一个分组）",
  `<div>
    <div v-epg-group>
      <div id="m1" v-epg-item style="${box(0, 100, 300, 50)}"></div>
      <div id="m2" v-epg-item style="${box(0, 500, 300, 50)}"></div>
      <div id="m3" v-epg-item style="${box(0, 900, 300, 50)}"></div>
    </div>
    <div v-epg-group>${items("r1_", 3, (i) => box(320 + i * 210, 100, 200, 150))}</div>
    <div v-epg-group>${items("r2_", 3, (i) => box(320 + i * 210, 450, 200, 150))}</div>
    <div v-epg-group>${items("r3_", 3, (i) => box(320 + i * 210, 800, 200, 150))}</div>
  </div>`,
  [
    // 跨层并列时以当前焦点的位置裁决：进入与焦点同一高度的行
    ["m1", "right", "r1_0"],
    ["m2", "right", "r2_0"],
    ["m3", "right", "r3_0"],
    // 进入分组时落在入口（第一个），而不是几何上最近的元素
    ["r1_2", "down", "r2_0"],
    ["r3_1", "left", "r3_0"],
    ["r3_0", "left", "m1"],
  ],
);

scenario(
  "全宽顶栏 + 左侧菜单 / 右侧内容",
  `<div>
    <div v-epg-group>
      <div id="logo" v-epg-item style="${box(0, 0, 100, 60)}"></div>
      <div id="search" v-epg-item style="${box(1500, 0, 200, 60)}"></div>
    </div>
    <div v-epg-group><div id="menu" v-epg-item style="${box(0, 100, 300, 800)}"></div></div>
    <div v-epg-group><div id="content" v-epg-item style="${box(320, 100, 1500, 800)}"></div></div>
  </div>`,
  [
    ["search", "down", "content"],
    ["logo", "down", "menu"],
    ["content", "up", "logo"],
    ["menu", "right", "content"],
  ],
);

scenario(
  "选项卡 + 网格（选中的选项卡为默认焦点）",
  `<div>
    <div v-epg-group>
      <div id="t0" v-epg-item style="${box(0, 0, 100, 40)}"></div>
      <div id="t1" v-epg-item="{ default: true }" style="${box(110, 0, 100, 40)}"></div>
      <div id="t2" v-epg-item style="${box(220, 0, 100, 40)}"></div>
    </div>
    <div v-epg-group>${items("g", 6, (i) => box((i % 3) * 110, 60 + Math.floor(i / 3) * 110, 100, 100))}</div>
  </div>`,
  [
    ["t2", "down", "g0"],
    ["g2", "up", "t1"],
    ["g0", "right", "g1"],
    ["g1", "down", "g4"],
    ["g5", "right", "g5"],
  ],
);

scenario(
  "Metro 式不规则网格（单个分组）",
  `<div v-epg-group>
    <div id="A" v-epg-item style="${box(0, 0, 300, 200)}"></div>
    <div id="B" v-epg-item style="${box(310, 0, 150, 95)}"></div>
    <div id="C" v-epg-item style="${box(310, 105, 150, 95)}"></div>
    <div id="D" v-epg-item style="${box(0, 210, 145, 190)}"></div>
    <div id="E" v-epg-item style="${box(155, 210, 305, 190)}"></div>
  </div>`,
  [
    ["A", "right", "B"],
    ["A", "down", "D"],
    ["B", "down", "C"],
    ["C", "left", "A"],
    ["C", "down", "E"],
    ["E", "up", "A"], // A、C 距离与偏移都相同，按文档顺序
    ["D", "right", "E"],
  ],
);
