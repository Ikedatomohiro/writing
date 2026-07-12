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
});
