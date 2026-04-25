import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import type { SnsSeries, SnsSeriesWithPosts } from "@/lib/types/sns";

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

const mockSeries: SnsSeries = {
  id: "series-1",
  theme: "テストテーマ",
  pattern: null,
  quality_score: null,
  score_breakdown: null,
  status: "draft",
  queue_order: null,
  is_posted: false,
  posted_at: null,
  source: null,
  source_draft_id: null,
  account: "pao-pao-cho",
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
};

const mockSeriesWithPosts: SnsSeriesWithPosts = {
  ...mockSeries,
  posts: [
    {
      id: "post-1",
      series_id: "series-1",
      position: 0,
      text: "テスト投稿",
      type: "normal",
      threads_post_id: null,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z",
    },
  ],
};

describe("GET /api/threads/series", () => {
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

    const request = new NextRequest("http://localhost:3000/api/threads/series");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("シリーズ一覧を取得する", async () => {
    const orderMock = vi.fn().mockResolvedValue({ data: [mockSeries], error: null });
    const fromMock = {
      select: vi.fn().mockReturnValue({ order: orderMock }),
    };
    mockSupabase.from.mockReturnValue(fromMock);
    const { GET } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/threads/series");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("data");
  });

  it("statusクエリパラメータでフィルタリングする", async () => {
    const eqMock = vi.fn().mockResolvedValue({ data: [mockSeries], error: null });
    const orderMock = vi.fn().mockReturnValue({ eq: eqMock });
    const fromMock = {
      select: vi.fn().mockReturnValue({ order: orderMock }),
    };
    mockSupabase.from.mockReturnValue(fromMock);
    const { GET } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/threads/series?status=draft");
    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it("account=pao-pao-choのとき .eq('account','pao-pao-cho') でフィルタする", async () => {
    const eqAccountMock = vi.fn().mockResolvedValue({ data: [mockSeries], error: null });
    const orderMock = vi.fn().mockReturnValue({ eq: eqAccountMock });
    const fromMock = {
      select: vi.fn().mockReturnValue({ order: orderMock }),
    };
    mockSupabase.from.mockReturnValue(fromMock);
    const { GET } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/threads/series?account=pao-pao-cho");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("data");
    expect(eqAccountMock).toHaveBeenCalledWith("account", "pao-pao-cho");
  });

  it("account=matsumoto_shoのとき .eq('account','matsumoto_sho') でフィルタする", async () => {
    const matsumotoSeries: SnsSeries = { ...mockSeries, account: "matsumoto_sho" };
    const eqAccountMock = vi.fn().mockResolvedValue({ data: [matsumotoSeries], error: null });
    const orderMock = vi.fn().mockReturnValue({ eq: eqAccountMock });
    const fromMock = {
      select: vi.fn().mockReturnValue({ order: orderMock }),
    };
    mockSupabase.from.mockReturnValue(fromMock);
    const { GET } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/threads/series?account=matsumoto_sho");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual([matsumotoSeries]);
    expect(eqAccountMock).toHaveBeenCalledWith("account", "matsumoto_sho");
  });

  it("account=morita_rinのとき .eq('account','morita_rin') でフィルタする", async () => {
    const rinSeries: SnsSeries = { ...mockSeries, account: "morita_rin" };
    const eqAccountMock = vi.fn().mockResolvedValue({ data: [rinSeries], error: null });
    const orderMock = vi.fn().mockReturnValue({ eq: eqAccountMock });
    const fromMock = {
      select: vi.fn().mockReturnValue({ order: orderMock }),
    };
    mockSupabase.from.mockReturnValue(fromMock);
    const { GET } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/threads/series?account=morita_rin");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual([rinSeries]);
    expect(eqAccountMock).toHaveBeenCalledWith("account", "morita_rin");
  });

  it("account 未指定のとき account フィルタを適用しない（全アカウント返却）", async () => {
    const orderMock = vi.fn().mockResolvedValue({ data: [mockSeries], error: null });
    const fromMock = {
      select: vi.fn().mockReturnValue({ order: orderMock }),
    };
    mockSupabase.from.mockReturnValue(fromMock);
    const { GET } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/threads/series");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("data");
  });

  it("不正な account 値はバリデーションエラー400を返す", async () => {
    const { GET } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/threads/series?account=unknown_account");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
    // 不正なaccountで Supabase をクエリしてはならない
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });
});

describe("POST /api/threads/series", () => {
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
    const { POST } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/threads/series", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ posts: [] }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
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
      if (table === "sns_series") return { insert: insertSeriesMock };
      if (table === "sns_posts") return { insert: insertPostsMock };
      return {};
    });
    const { POST } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/threads/series", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        theme: "テストテーマ",
        posts: [{ position: 0, text: "テスト投稿", type: "normal" }],
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty("data");
  });

  it("postsが空配列でもシリーズを作成できる", async () => {
    const insertSeriesMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: mockSeries, error: null }),
      }),
    });
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "sns_series") return { insert: insertSeriesMock };
      return {};
    });
    const { POST } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/threads/series", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ posts: [] }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty("data");
  });
});
