import { describe, it, expect } from "vitest";
import { monthlyTicks, yAxisTicks, filterByPeriod, dateTicks } from "./chartAxis";

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

describe("filterByPeriod", () => {
  // 昇順の日次点を生成（2026-01-01 から n 日ぶん）。
  function daily(n: number) {
    const out: { date: string; value: number }[] = [];
    for (let i = 0; i < n; i++) {
      const ms = Date.parse("2026-01-01T00:00:00Z") + i * 86400000;
      out.push({ date: new Date(ms).toISOString().slice(0, 10), value: i });
    }
    return out;
  }

  it("days=null は全件を返す", () => {
    const data = daily(50);
    expect(filterByPeriod(data, null)).toHaveLength(50);
  });

  it("最新データ日を基準に過去 days 日（inclusive）だけ返す", () => {
    const data = daily(50); // 2026-01-01 .. 2026-02-19
    const out = filterByPeriod(data, 30);
    // 基準 = 最新日 2026-02-19、cutoff = 2026-01-21（30日窓）
    expect(out).toHaveLength(30);
    expect(out[0].date).toBe("2026-01-21");
    expect(out[out.length - 1].date).toBe("2026-02-19");
  });

  it("基準は今日ではなく最新データ日（データが古くても空にならない）", () => {
    const data = daily(10); // 全体で10日分
    // 40日窓でも全10点が入る（最新日基準なので）
    expect(filterByPeriod(data, 40)).toHaveLength(10);
  });

  it("空データは空を返す", () => {
    expect(filterByPeriod([], 30)).toEqual([]);
  });
});

describe("dateTicks", () => {
  function dates(from: string, n: number) {
    const out: string[] = [];
    for (let i = 0; i < n; i++) {
      const ms = Date.parse(`${from}T00:00:00Z`) + i * 86400000;
      out.push(new Date(ms).toISOString().slice(0, 10));
    }
    return out;
  }

  it("長期間（>60日）は月目盛 YYYY-MM を返す", () => {
    const ticks = dateTicks(dates("2026-03-01", 100)); // 約100日
    expect(ticks.every((t) => /^\d{4}-\d{2}$/.test(t.label))).toBe(true);
    expect(ticks.map((t) => t.label)).toContain("2026-03");
  });

  it("短期間（<=60日）は MM-DD の均等目盛を返す", () => {
    const ticks = dateTicks(dates("2026-06-01", 30), 6); // 30日
    expect(ticks.length).toBeLessThanOrEqual(6);
    expect(ticks.every((t) => /^\d{2}-\d{2}$/.test(t.label))).toBe(true);
    // 先頭と末尾を含む
    expect(ticks[0].index).toBe(0);
    expect(ticks[ticks.length - 1].index).toBe(29);
  });

  it("空配列は空", () => {
    expect(dateTicks([])).toEqual([]);
  });
});
