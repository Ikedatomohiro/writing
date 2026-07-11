import { describe, it, expect, vi, beforeEach } from "vitest";

const mockAuth = vi.fn();
vi.mock("@/auth", () => ({
  auth: () => mockAuth(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({}),
}));

const mockFetchMetricRows = vi.fn();
vi.mock("@/lib/insights/query", () => ({
  fetchMetricRows: (client: unknown, filter: unknown) =>
    mockFetchMetricRows(client, filter),
}));

function req(url: string): Request {
  return new Request(url);
}

describe("GET /api/insights/summary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("未認証は 401", async () => {
    mockAuth.mockResolvedValue(null);
    const { GET } = await import("./route");
    const res = await GET(req("http://localhost/api/insights/summary"));
    expect(res.status).toBe(401);
  });

  it("認証済みで集計サマリを返す", async () => {
    mockAuth.mockResolvedValue({ user: { email: "a@b.c" } });
    mockFetchMetricRows.mockResolvedValue([
      {
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
      },
    ]);
    const { GET } = await import("./route");
    const res = await GET(req("http://localhost/api/insights/summary"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.totals.postCount).toBe(1);
    expect(data.patternStats[0].key).toBe("体験談型");
    expect(data.rowCount).toBe(1);
  });

  it("account/platform クエリを query に渡す", async () => {
    mockAuth.mockResolvedValue({ user: { email: "a@b.c" } });
    mockFetchMetricRows.mockResolvedValue([]);
    const { GET } = await import("./route");
    await GET(req("http://localhost/api/insights/summary?account=morita_rin&platform=x"));
    const [, filter] = mockFetchMetricRows.mock.calls[0];
    expect(filter).toEqual({ account: "morita_rin", platform: "x" });
  });

  it("不正な platform は無視して null 扱い", async () => {
    mockAuth.mockResolvedValue({ user: { email: "a@b.c" } });
    mockFetchMetricRows.mockResolvedValue([]);
    const { GET } = await import("./route");
    await GET(req("http://localhost/api/insights/summary?platform=bogus"));
    const [, filter] = mockFetchMetricRows.mock.calls[0];
    expect(filter).toEqual({ account: null, platform: null });
  });
});
