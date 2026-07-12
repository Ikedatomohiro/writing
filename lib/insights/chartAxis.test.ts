import { describe, it, expect } from "vitest";
import { monthlyTicks, yAxisTicks } from "./chartAxis";

describe("monthlyTicks", () => {
  it("月が変わる最初の点を目盛として返す（label は YYYY-MM）", () => {
    const dates = [
      "2026-03-30",
      "2026-03-31",
      "2026-04-01",
      "2026-04-02",
      "2026-05-01",
    ];
    expect(monthlyTicks(dates)).toEqual([
      { label: "2026-03", index: 0 },
      { label: "2026-04", index: 2 },
      { label: "2026-05", index: 4 },
    ]);
  });

  it("単一月なら 1 目盛のみ", () => {
    expect(monthlyTicks(["2026-04-01", "2026-04-02"])).toEqual([
      { label: "2026-04", index: 0 },
    ]);
  });

  it("空配列なら空", () => {
    expect(monthlyTicks([])).toEqual([]);
  });
});

describe("yAxisTicks", () => {
  it("0..max を steps 等分した値を昇順で返す（要素数 steps+1）", () => {
    expect(yAxisTicks(100, 4)).toEqual([0, 25, 50, 75, 100]);
  });

  it("既定 steps は 4", () => {
    expect(yAxisTicks(200)).toEqual([0, 50, 100, 150, 200]);
  });

  it("max<=0 なら [0] のみ（0除算・無意味な目盛を避ける）", () => {
    expect(yAxisTicks(0)).toEqual([0]);
    expect(yAxisTicks(-10)).toEqual([0]);
  });
});
