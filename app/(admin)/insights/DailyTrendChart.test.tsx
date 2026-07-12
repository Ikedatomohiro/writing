import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
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

/** from から n 日ぶんの連続した日次点を生成（昇順）。 */
function wideSeries(from: string, n: number): DailyPoint[] {
  const out: DailyPoint[] = [];
  for (let i = 0; i < n; i++) {
    const ms = Date.parse(`${from}T00:00:00Z`) + i * 86400000;
    const date = new Date(ms).toISOString().slice(0, 10);
    out.push({ date, views: 100 + i, likes: i });
  }
  return out;
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

  it("全期間では月ごとの横軸目盛ラベル（YYYY-MM）を描画する", () => {
    render(<DailyTrendChart data={wideSeries("2026-03-01", 100)} />);
    fireEvent.click(screen.getByTestId("period-option-all"));
    const panel = screen.getByTestId("daily-trend-views");
    const texts = Array.from(
      panel.querySelectorAll('[data-testid="x-tick"]'),
    ).map((el) => el.textContent);
    // 100日=複数月 → YYYY-MM ラベル
    expect(texts.every((t) => /^\d{4}-\d{2}$/.test(t ?? ""))).toBe(true);
    expect(texts).toContain("2026-03");
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

  it("日付ごとにホバー用の当たり判定（縦帯）を描画する", () => {
    render(<DailyTrendChart data={points()} />);
    const bands = screen
      .getByTestId("daily-trend-views")
      .querySelectorAll('[data-testid="trend-hover-band"]');
    expect(bands.length).toBe(3);
  });

  it("バンドにホバーするとツールチップに日付と値が表示される", () => {
    render(<DailyTrendChart data={points()} />);
    const panel = screen.getByTestId("daily-trend-views");
    // ホバー前はツールチップ非表示
    expect(panel.querySelector('[data-testid="trend-tooltip"]')).toBeNull();

    const bands = panel.querySelectorAll('[data-testid="trend-hover-band"]');
    fireEvent.mouseEnter(bands[1]); // 2番目の点（2026-04-02 / views 300）

    const tooltip = panel.querySelector('[data-testid="trend-tooltip"]');
    expect(tooltip).not.toBeNull();
    expect(tooltip?.textContent).toContain("2026-04-02");
    expect(tooltip?.textContent).toContain("300");
  });

  it("ホバー解除でツールチップが消える", () => {
    render(<DailyTrendChart data={points()} />);
    const panel = screen.getByTestId("daily-trend-views");
    const svg = panel.querySelector("svg")!;
    const bands = panel.querySelectorAll('[data-testid="trend-hover-band"]');

    fireEvent.mouseEnter(bands[0]);
    expect(panel.querySelector('[data-testid="trend-tooltip"]')).not.toBeNull();

    fireEvent.mouseLeave(svg);
    expect(panel.querySelector('[data-testid="trend-tooltip"]')).toBeNull();
  });

  // --- 期間セレクタ -------------------------------------------------------
  function dotCount(): number {
    return screen
      .getByTestId("daily-trend-views")
      .querySelectorAll('[data-testid="trend-dot"]').length;
  }

  it("期間セレクタ（30日/90日/全期間）を描画し、既定は30日", () => {
    render(<DailyTrendChart data={wideSeries("2026-03-01", 100)} />);
    const selector = screen.getByTestId("period-selector");
    expect(selector).toBeInTheDocument();
    expect(screen.getByTestId("period-option-30")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("period-option-90")).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByTestId("period-option-all")).toHaveAttribute("aria-pressed", "false");
  });

  it("既定表示は最新日から過去30日ぶんのみ", () => {
    render(<DailyTrendChart data={wideSeries("2026-03-01", 100)} />);
    // 100点あっても既定は30点だけ
    expect(dotCount()).toBe(30);
  });

  it("全期間に切り替えると全点が表示される", () => {
    render(<DailyTrendChart data={wideSeries("2026-03-01", 100)} />);
    expect(dotCount()).toBe(30);
    fireEvent.click(screen.getByTestId("period-option-all"));
    expect(dotCount()).toBe(100);
    expect(screen.getByTestId("period-option-all")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("period-option-30")).toHaveAttribute("aria-pressed", "false");
  });

  it("90日に切り替えると過去90日ぶんが表示される", () => {
    render(<DailyTrendChart data={wideSeries("2026-03-01", 100)} />);
    fireEvent.click(screen.getByTestId("period-option-90"));
    expect(dotCount()).toBe(90);
  });

  it("期間切替後もツールチップが機能する", () => {
    render(<DailyTrendChart data={wideSeries("2026-03-01", 100)} />);
    fireEvent.click(screen.getByTestId("period-option-all"));
    const panel = screen.getByTestId("daily-trend-views");
    const bands = panel.querySelectorAll('[data-testid="trend-hover-band"]');
    fireEvent.mouseEnter(bands[0]);
    const tooltip = panel.querySelector('[data-testid="trend-tooltip"]');
    expect(tooltip).not.toBeNull();
    expect(tooltip?.textContent).toContain("2026-03-01");
  });
});
