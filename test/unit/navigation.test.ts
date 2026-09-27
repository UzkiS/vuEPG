import { describe, expect, it } from "vitest";
import {
  analyzeNearest,
  isDirection,
  pickNearest,
  type Box,
  type Candidate,
} from "../../src/core/navigation";

const rect = (left: number, top: number, width: number, height: number): Box => ({
  left,
  top,
  width,
  height,
  right: left + width,
  bottom: top + height,
});

const candidates = (entries: Record<string, Box>): Candidate<string>[] =>
  Object.entries(entries).map(([value, box]) => ({ value, box }));

/** 起点：位于 (100, 100)，100 × 100 */
const origin = rect(100, 100, 100, 100);

describe("isDirection", () => {
  it("recognizes the four directions only", () => {
    expect(["up", "down", "left", "right"].every(isDirection)).toBe(true);
    expect(isDirection("forward")).toBe(false);
    expect(isDirection(null)).toBe(false);
  });
});

describe("pickNearest", () => {
  it("returns null when nothing lies in the direction", () => {
    expect(pickNearest("down", origin, candidates({ above: rect(100, 0, 100, 50) }))).toBeNull();
    expect(pickNearest("down", origin, [])).toBeNull();
  });

  it("picks the nearest candidate that overlaps on the cross axis", () => {
    const result = pickNearest(
      "down",
      origin,
      candidates({ far: rect(100, 400, 100, 50), near: rect(120, 250, 50, 50) }),
    );
    expect(result).toBe("near");
  });

  it("prefers an overlapping candidate over a nearer non-overlapping one", () => {
    const result = pickNearest(
      "down",
      origin,
      candidates({ diagonal: rect(300, 210, 50, 50), below: rect(100, 500, 100, 50) }),
    );
    expect(result).toBe("below");
  });

  it("falls back to candidates fully beyond the origin when none overlap", () => {
    const result = pickNearest(
      "down",
      origin,
      candidates({
        // 位于下方但与起点纵向交叠：不算完全越过
        straddling: rect(300, 150, 50, 100),
        beyond: rect(300, 220, 50, 50),
      }),
    );
    expect(result).toBe("beyond");
  });

  it("breaks distance ties by the smaller cross-axis offset, then by order", () => {
    expect(
      pickNearest(
        "down",
        origin,
        candidates({ right: rect(180, 250, 100, 50), left: rect(90, 250, 100, 50) }),
      ),
    ).toBe("left");
    expect(
      pickNearest(
        "down",
        origin,
        candidates({ first: rect(80, 250, 100, 50), second: rect(120, 250, 100, 50) }),
      ),
    ).toBe("first");
  });

  it("ignores edge-touching neighbours thanks to the overlap tolerance", () => {
    const result = pickNearest(
      "down",
      origin,
      candidates({
        // 右边缘仅与起点左边缘相接（容差内），不视为重叠
        touching: rect(0, 210, 104, 50),
        overlapping: rect(150, 600, 50, 50),
      }),
    );
    expect(result).toBe("overlapping");
  });

  it("supports every direction symmetrically", () => {
    const around = candidates({
      up: rect(100, 0, 100, 50),
      down: rect(100, 250, 100, 50),
      left: rect(0, 100, 50, 100),
      right: rect(250, 100, 50, 100),
    });
    expect(pickNearest("up", origin, around)).toBe("up");
    expect(pickNearest("down", origin, around)).toBe("down");
    expect(pickNearest("left", origin, around)).toBe("left");
    expect(pickNearest("right", origin, around)).toBe("right");
  });

  it("measures up / left distances from the far edge", () => {
    expect(
      pickNearest(
        "up",
        origin,
        candidates({ far: rect(100, 0, 100, 20), near: rect(100, 40, 100, 20) }),
      ),
    ).toBe("near");
    expect(
      pickNearest(
        "left",
        origin,
        candidates({ far: rect(0, 100, 20, 100), near: rect(40, 100, 20, 100) }),
      ),
    ).toBe("near");
  });

  it("falls back to fully-beyond candidates in every direction", () => {
    const diagonal = candidates({
      upLeft: rect(0, 0, 50, 50),
      upRight: rect(250, 0, 50, 50),
      downLeft: rect(0, 250, 50, 50),
      downRight: rect(250, 250, 50, 50),
    });
    expect(pickNearest("up", origin, diagonal)).toBe("upLeft");
    expect(pickNearest("down", origin, diagonal)).toBe("downLeft");
    expect(pickNearest("left", origin, diagonal)).toBe("upLeft");
    expect(pickNearest("right", origin, diagonal)).toBe("upRight");
  });

  it("breaks ties by cross-axis offset horizontally too", () => {
    expect(
      pickNearest(
        "right",
        origin,
        candidates({ low: rect(250, 180, 50, 100), high: rect(250, 90, 50, 100) }),
      ),
    ).toBe("high");
  });
});

describe("analyzeNearest", () => {
  it("exposes every stage of the selection", () => {
    const analysis = analyzeNearest(
      "down",
      origin,
      candidates({
        above: rect(100, 0, 100, 50),
        diagonal: rect(300, 210, 50, 50),
        far: rect(100, 500, 100, 50),
        near: rect(120, 250, 50, 50),
      }),
    );
    const names = (list: readonly { value: string }[]): string[] => list.map((c) => c.value);
    expect(names(analysis.ahead)).toEqual(["diagonal", "far", "near"]);
    expect(names(analysis.overlapping)).toEqual(["far", "near"]);
    expect(names(analysis.pool)).toEqual(["far", "near"]);
    expect(analysis.ranked.map((c) => [c.value, c.distance, c.offset])).toEqual([
      ["near", 150, 20],
      ["far", 400, 0],
    ]);
  });
});
