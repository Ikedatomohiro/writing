import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import type { XSeries, XSeriesWithPosts } from "@/lib/types/x";

const mockSupabase = {
  from: vi.fn(),
};
const mockRequireAuth = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => mockSupabase,
}));

vi.mock("@/lib/auth/api-auth", () => ({
  requireAuth: () => mockRequireAuth(),
}));

const mockSeries: XSeries = {
  id: "series-1",
  account: "pao-pao-cho",
  theme: "テストテーマ",
  category: "note_article",
  quality_score: null,
  score_breakdown: null,
  status: "draft",
  queue_order: null,
  is_posted: false,
  posted_at: null,
  source: null,
  source_draft_id: null,
  note_url: null,
  hashtags: null,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
};

const mockSeriesWithPosts: XSeriesWithPosts = {
  ...mockSeries,
  posts: [
    {
      id: "post-1",
      series_id: "series-1",
      position: 0,
      text: "テスト投稿",
      x_post_id: null,
      source_url: null,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z",
    },
  ],
};

describe("GET /api/x/series", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockRequireAuth.mockResolvedValue(null);
  });

  it("未認証の場合は401を返す", async () => {
    const { NextResponse } = await import("next/server");
    mockRequireAuth.mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );
    const { GET } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/x/series");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("シリーズ一覧を取得する", async () => {
    const orderMock = vi.fn().mockResolvedValue({ data: [mockSeries], error: null });
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({ order: orderMock }),
    });
    const { GET } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/x/series");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("data");
  });

  it("accountクエリパラメータでフィルタリングする", async () => {
    const eqMock = vi.fn().mockResolvedValue({ data: [mockSeries], error: null });
    const orderMock = vi.fn().mockReturnValue({ eq: eqMock });
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({ order: orderMock }),
    });
    const { GET } = await import("./route");

    const request = new NextRequest(
      "http://localhost:3000/api/x/series?account=pao-pao-cho"
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
  });
});

describe("POST /api/x/series", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockRequireAuth.mockResolvedValue(null);
  });

  it("accountがない場合は400を返す", async () => {
    const { POST } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/x/series", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ posts: [] }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("account");
  });

  it("シリーズと投稿を作成する", async () => {
    const insertSeriesMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: mockSeries, error: null }),
      }),
    });
    const insertPostsMock = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: mockSeriesWithPosts.posts, error: null }),
    });
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "x_series") return { insert: insertSeriesMock };
      if (table === "x_posts") return { insert: insertPostsMock };
      return {};
    });
    const { POST } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/x/series", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        account: "pao-pao-cho",
        theme: "テストテーマ",
        category: "note_article",
        posts: [{ position: 0, text: "テスト投稿" }],
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty("data");
  });
});
