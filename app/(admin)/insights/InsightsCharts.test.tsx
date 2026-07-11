import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { BarChartPanel } from "./InsightsCharts";
import type { GroupStat } from "@/lib/insights/types";

function stat(over: Partial<GroupStat>): GroupStat {
  return { key: "k", avgRate: 0.1, n: 10, provisional: false, ...over };
}

describe("BarChartPanel", () => {
  afterEach(() => {
    cleanup();
  });

  it("タイトルを表示する", () => {
    render(<BarChartPanel title="パターン別" stats={[stat({})]} />);
    expect(screen.getByText("パターン別")).toBeInTheDocument();
  });

  it("stat ごとに率と n を表示する", () => {
    render(
      <BarChartPanel
        title="t"
        stats={[stat({ key: "体験談型", avgRate: 0.123, n: 8 })]}
      />,
    );
    expect(screen.getByText("体験談型")).toBeInTheDocument();
    expect(screen.getByText("12.3%")).toBeInTheDocument();
    expect(screen.getByText(/n=8/)).toBeInTheDocument();
  });

  it("provisional は参考値バッジを付け淡色にする", () => {
    render(<BarChartPanel title="t" stats={[stat({ n: 2, provisional: true })]} />);
    expect(screen.getByText(/参考値/)).toBeInTheDocument();
    const row = screen.getByTestId("bar-row");
    expect(row.className).toContain("opacity");
  });

  it("avgRate=null は em dash で表示する", () => {
    render(<BarChartPanel title="t" stats={[stat({ avgRate: null, n: 0 })]} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("空なら データなし を表示する", () => {
    render(<BarChartPanel title="t" stats={[]} />);
    expect(screen.getByTestId("chart-empty")).toBeInTheDocument();
  });

  it("keyFormatter でキー表示を変換できる", () => {
    render(
      <BarChartPanel
        title="t"
        stats={[stat({ key: "11" })]}
        keyFormatter={(k) => `${k}時`}
      />,
    );
    expect(screen.getByText("11時")).toBeInTheDocument();
  });
});
