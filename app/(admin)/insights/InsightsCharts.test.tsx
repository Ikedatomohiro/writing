import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { BarChartPanel, ViewsBarPanel } from "./InsightsCharts";
import type { GroupStat, ViewStat } from "@/lib/insights/types";

function stat(over: Partial<GroupStat>): GroupStat {
  return {
    key: "k",
    avgRate: 0.1,
    n: 10,
    provisional: false,
    avgViews: 1000,
    lowReach: false,
    ...over,
  };
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

describe("BarChartPanel: lowReach", () => {
  afterEach(() => cleanup());

  it("lowReach は淡色にし低リーチ印を付ける", () => {
    render(<BarChartPanel title="t" stats={[stat({ lowReach: true, avgViews: 40 })]} />);
    const row = screen.getByTestId("bar-row");
    expect(row.className).toContain("opacity");
    expect(screen.getByText(/低リーチ/)).toBeInTheDocument();
  });

  it("lowReach でなければ低リーチ印は出ない", () => {
    render(<BarChartPanel title="t" stats={[stat({ lowReach: false })]} />);
    expect(screen.queryByText(/低リーチ/)).toBeNull();
  });
});

describe("ViewsBarPanel", () => {
  afterEach(() => cleanup());

  function vstat(over: Partial<ViewStat>): ViewStat {
    return { key: "k", totalViews: 1000, n: 5, ...over };
  }

  it("タイトルと views 合計・n を表示する", () => {
    render(<ViewsBarPanel title="テーマ別リーチ" stats={[vstat({ key: "金融", totalViews: 12345, n: 8 })]} />);
    expect(screen.getByText("テーマ別リーチ")).toBeInTheDocument();
    expect(screen.getByText("金融")).toBeInTheDocument();
    expect(screen.getByText("12,345")).toBeInTheDocument();
    expect(screen.getByText(/n=8/)).toBeInTheDocument();
  });

  it("空なら データなし", () => {
    render(<ViewsBarPanel title="t" stats={[]} />);
    expect(screen.getByTestId("chart-empty")).toBeInTheDocument();
  });

  it("keyFormatter でキー表示を変換できる", () => {
    render(<ViewsBarPanel title="t" stats={[vstat({ key: "pao-pao-cho" })]} keyFormatter={(k) => `@${k}`} />);
    expect(screen.getByText("@pao-pao-cho")).toBeInTheDocument();
  });
});
