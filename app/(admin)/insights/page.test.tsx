import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

// unstable_cache は Next ランタイム外では動かないため、テストでは passthrough にする
// （本番では next/cache の実体がキャッシュする）。
vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({}),
}));

const mockFetchMetricRows = vi.fn();
vi.mock("@/lib/insights/query", () => ({
  fetchMetricRows: (client: unknown, filter: unknown) =>
    mockFetchMetricRows(client, filter),
}));

describe("InsightsPage (server shell)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    cleanup();
  });

  it("取得成功時はビューを描画する", async () => {
    mockFetchMetricRows.mockResolvedValue([]);
    const { default: InsightsPage } = await import("./page");
    const ui = await InsightsPage({ searchParams: Promise.resolve({}) });
    render(ui);
    expect(screen.getByText("エンゲージメント解析")).toBeInTheDocument();
    expect(screen.queryByTestId("insights-error")).toBeNull();
  });

  it("searchParams の account/platform を検証して query に渡す", async () => {
    mockFetchMetricRows.mockResolvedValue([]);
    const { default: InsightsPage } = await import("./page");
    await InsightsPage({
      searchParams: Promise.resolve({ account: "morita_rin", platform: "x" }),
    });
    expect(mockFetchMetricRows).toHaveBeenCalledWith(
      expect.anything(),
      { account: "morita_rin", platform: "x" },
    );
  });

  it("不正な account/platform は null に落とす", async () => {
    mockFetchMetricRows.mockResolvedValue([]);
    const { default: InsightsPage } = await import("./page");
    await InsightsPage({
      searchParams: Promise.resolve({ account: "bogus", platform: "bogus" }),
    });
    expect(mockFetchMetricRows).toHaveBeenCalledWith(expect.anything(), {
      account: null,
      platform: null,
    });
  });

  it("取得失敗時はエラーバナーを描画する", async () => {
    mockFetchMetricRows.mockRejectedValue(new Error("boom"));
    const { default: InsightsPage } = await import("./page");
    const ui = await InsightsPage({ searchParams: Promise.resolve({}) });
    render(ui);
    expect(screen.getByTestId("insights-error")).toBeInTheDocument();
  });
});
