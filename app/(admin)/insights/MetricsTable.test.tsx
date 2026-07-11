import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MetricsTable } from "./MetricsTable";
import type { MetricRow } from "@/lib/insights/types";

function row(over: Partial<MetricRow> = {}): MetricRow {
  return {
    platform: "threads",
    account: "pao-pao-cho",
    post_id: "P1",
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
    theme: "AI",
    ...over,
  };
}

describe("MetricsTable", () => {
  afterEach(() => {
    cleanup();
  });

  it("行ごとに post_id・views・率を表示する", () => {
    render(<MetricsTable rows={[row({ post_id: "ABC", views: 100, likes: 10 })]} />);
    expect(screen.getByText("ABC")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("10.0%")).toBeInTheDocument();
  });

  it("views=0 の率は em dash", () => {
    render(<MetricsTable rows={[row({ views: 0 })]} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("空なら メッセージを表示する", () => {
    render(<MetricsTable rows={[]} />);
    expect(screen.getByTestId("table-empty")).toBeInTheDocument();
  });

  it("limit を超える行は切り詰める", () => {
    const rows = Array.from({ length: 10 }, (_, i) => row({ post_id: `P${i}` }));
    render(<MetricsTable rows={rows} limit={3} />);
    expect(screen.getAllByTestId("metric-row")).toHaveLength(3);
  });
});
