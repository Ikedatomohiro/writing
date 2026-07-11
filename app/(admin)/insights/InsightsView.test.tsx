import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import { InsightsView } from "./InsightsView";
import { buildSummary } from "@/lib/insights/aggregate";
import type { MetricRow } from "@/lib/insights/types";

function tRow(over: Partial<MetricRow> = {}): MetricRow {
  return {
    platform: "threads",
    account: "pao-pao-cho",
    post_id: "T1",
    metric_window: "24h",
    posted_at: "2026-04-02T02:00:00+00:00",
    views: 100,
    likes: 10,
    replies: 0,
    reposts: 0,
    quotes: 0,
    saves: 0,
    fetched_at: "2026-04-03T00:00:00+00:00",
    pattern: "体験談型",
    theme: "AI活用術",
    ...over,
  };
}

describe("InsightsView", () => {
  afterEach(() => {
    cleanup();
  });

  it("KPI カード（累計views/likes・投稿数）を表示する", () => {
    const rows = [tRow({ post_id: "T1", views: 100, likes: 10 }), tRow({ post_id: "T2", views: 50, likes: 5 })];
    const summary = buildSummary(rows, null, null);
    render(<InsightsView summary={summary} rows={rows} account={null} platform={null} error={false} />);
    const kpi = screen.getByTestId("kpi-cards");
    expect(within(kpi).getByText("150")).toBeInTheDocument(); // views
    expect(within(kpi).getByText("2")).toBeInTheDocument(); // 投稿数
  });

  it("パターン別・テーマ別・時間帯別のグラフを表示する", () => {
    const rows = [tRow()];
    const summary = buildSummary(rows, null, null);
    render(<InsightsView summary={summary} rows={rows} account={null} platform={null} error={false} />);
    expect(screen.getByText(/パターン別 平均エンゲージメント率/)).toBeInTheDocument();
    expect(screen.getByText(/テーマ別 平均エンゲージメント率/)).toBeInTheDocument();
    expect(screen.getByText(/時間帯別 平均エンゲージメント率/)).toBeInTheDocument();
  });

  it("テーマ別・アカウント別の views(リーチ) グラフを表示する（C）", () => {
    const rows = [
      tRow({ platform: "threads", account: "pao-pao-cho", theme: "資産形成", views: 10000, post_id: "T1" }),
      tRow({ platform: "x", account: "tomohiro", theme: null, views: 200, post_id: "X1" }),
    ];
    const summary = buildSummary(rows, null, null);
    render(<InsightsView summary={summary} rows={rows} account={null} platform={null} error={false} />);
    expect(screen.getByText(/テーマ別 リーチ/)).toBeInTheDocument();
    expect(screen.getByText(/アカウント別 リーチ/)).toBeInTheDocument();
    // views 規模が出ている（資産形成 10000。views パネルとテーブルの両方に出うる）
    expect(screen.getAllByText("10,000").length).toBeGreaterThan(0);
  });

  it("リーチと刺さり度の軸の意味を説明するラベルがある（C）", () => {
    const summary = buildSummary([], null, null);
    render(<InsightsView summary={summary} rows={[]} account={null} platform={null} error={false} />);
    expect(screen.getAllByText(/リーチ.*views/).length).toBeGreaterThan(0);
    expect(screen.getByText(/刺さり度.*率/)).toBeInTheDocument();
  });

  it("error 時はエラーバナーを表示する", () => {
    const summary = buildSummary([], null, null);
    render(<InsightsView summary={summary} rows={[]} account={null} platform={null} error={true} />);
    expect(screen.getByTestId("insights-error")).toBeInTheDocument();
  });

  it("最小サンプル閾値の注記を表示する", () => {
    const summary = buildSummary([], null, null);
    render(<InsightsView summary={summary} rows={[]} account={null} platform={null} error={false} />);
    expect(screen.getByText(/参考値/)).toBeInTheDocument();
  });

  it("account=null（既定）はプール平均の注記を出す（W-a）", () => {
    const summary = buildSummary([], null, null);
    render(<InsightsView summary={summary} rows={[]} account={null} platform={null} error={false} />);
    expect(screen.getByTestId("pool-notice")).toBeInTheDocument();
  });

  it("account 指定時はプール注記を出さない", () => {
    const summary = buildSummary([], "morita_rin", null);
    render(<InsightsView summary={summary} rows={[]} account={"morita_rin"} platform={null} error={false} />);
    expect(screen.queryByTestId("pool-notice")).toBeNull();
  });

  it("アカウント・プラットフォームのフィルタリンクを表示する", () => {
    const summary = buildSummary([], null, null);
    render(<InsightsView summary={summary} rows={[]} account={null} platform={null} error={false} />);
    const filters = screen.getByTestId("insights-filters");
    expect(within(filters).getByText("Threads")).toBeInTheDocument();
    expect(within(filters).getByText("X")).toBeInTheDocument();
  });
});
