import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { DailyTrendChart } from "./DailyTrendChart";
import type { DailyPoint } from "@/lib/insights/types";

function points(...over: Partial<DailyPoint>[]): DailyPoint[] {
  const base: DailyPoint[] = [
    { date: "2026-04-01", views: 100, likes: 5 },
    { date: "2026-04-02", views: 300, likes: 12 },
    { date: "2026-04-03", views: 200, likes: 8 },
  ];
  return over.length ? (over as DailyPoint[]) : base;
}

describe("DailyTrendChart", () => {
  afterEach(() => cleanup());

  it("views と likes の両方のパネルを描画する（並列）", () => {
    render(<DailyTrendChart data={points()} />);
    expect(screen.getByTestId("daily-trend-views")).toBeInTheDocument();
    expect(screen.getByTestId("daily-trend-likes")).toBeInTheDocument();
  });

  it("日付ごとにデータ点を描画する（views）", () => {
    render(<DailyTrendChart data={points()} />);
    const dots = screen
      .getByTestId("daily-trend-views")
      .querySelectorAll('[data-testid="trend-dot"]');
    expect(dots.length).toBe(3);
  });

  it("各メトリクスの最大値を表示する", () => {
    render(<DailyTrendChart data={points()} />);
    // views 最大 300 / likes 最大 12
    expect(screen.getByTestId("daily-trend-views")).toHaveTextContent("300");
    expect(screen.getByTestId("daily-trend-likes")).toHaveTextContent("12");
  });

  it("データが空なら データなし を表示する", () => {
    render(<DailyTrendChart data={[]} />);
    const empties = screen.getAllByTestId("chart-empty");
    expect(empties.length).toBe(2);
  });

  it("1点でもクラッシュせず描画する", () => {
    render(<DailyTrendChart data={[{ date: "2026-04-01", views: 50, likes: 3 }]} />);
    const dots = screen
      .getByTestId("daily-trend-views")
      .querySelectorAll('[data-testid="trend-dot"]');
    expect(dots.length).toBe(1);
  });

  it("月ごとの横軸目盛ラベルを描画する", () => {
    const data: DailyPoint[] = [
      { date: "2026-03-31", views: 10, likes: 1 },
      { date: "2026-04-01", views: 20, likes: 2 },
      { date: "2026-05-01", views: 30, likes: 3 },
    ];
    render(<DailyTrendChart data={data} />);
    const panel = screen.getByTestId("daily-trend-views");
    const xLabels = panel.querySelectorAll('[data-testid="x-tick"]');
    const texts = Array.from(xLabels).map((el) => el.textContent);
    expect(texts).toEqual(["2026-03", "2026-04", "2026-05"]);
  });

  it("左に縦軸目盛（0 と最大を含む複数段）を描画する", () => {
    render(<DailyTrendChart data={points()} />);
    const panel = screen.getByTestId("daily-trend-views");
    const yLabels = panel.querySelectorAll('[data-testid="y-tick"]');
    expect(yLabels.length).toBeGreaterThanOrEqual(3);
    const texts = Array.from(yLabels).map((el) => el.textContent);
    // views 最大 300 → 0 と 300 を含む
    expect(texts).toContain("0");
    expect(texts).toContain("300");
  });

  it("日付ごとにホバー用の当たり判定（title 付き）を描画する", () => {
    render(<DailyTrendChart data={points()} />);
    const bands = screen
      .getByTestId("daily-trend-views")
      .querySelectorAll('[data-testid="trend-hover-band"]');
    expect(bands.length).toBe(3);
    // 各バンドは「日付: 値」の title を持つ
    const firstTitle = bands[0].querySelector("title");
    expect(firstTitle?.textContent).toContain("2026-04-01");
  });
});
