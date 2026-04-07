import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import type { SnsSeries, SnsPost } from "@/lib/types/sns";

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
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
};

const mockPost: SnsPost = {
  id: "post-1",
  series_id: "series-1",
  position: 1,
  text: "テスト投稿",
  type: "normal",
  threads_post_id: null,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
};

type RouteParams = { params: Promise<{ id: string; postId: string }> };

describe("PATCH /api/sns/series/[id]/posts/[postId]", () => {
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
    const { PATCH } = await import("./route");

    const request = new NextRequest(
      "http://localhost:3000/api/sns/series/series-1/posts/post-1",
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: "更新テキスト" }),
      }
    );
    const params: RouteParams = { params: Promise.resolve({ id: "series-1", postId: "post-1" }) };
    const response = await PATCH(request, params);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("投稿を更新する", async () => {
    const updatedPost: SnsPost = { ...mockPost, text: "更新テキスト" };

    const fetchSeriesSingleMock = vi.fn().mockResolvedValue({ data: mockSeries, error: null });
    const fetchSeriesEqMock = vi.fn().mockReturnValue({ single: fetchSeriesSingleMock });
    const fetchSeriesSelectMock = vi.fn().mockReturnValue({ eq: fetchSeriesEqMock });

    const updateSingleMock = vi.fn().mockResolvedValue({ data: updatedPost, error: null });
    const updateSelectMock = vi.fn().mockReturnValue({ single: updateSingleMock });
    const updateEqPostMock = vi.fn().mockReturnValue({ select: updateSelectMock });
    const updateEqSeriesMock = vi.fn().mockReturnValue({ eq: updateEqPostMock });
    const updateMock = vi.fn().mockReturnValue({ eq: updateEqSeriesMock });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "sns_series") return { select: fetchSeriesSelectMock };
      if (table === "sns_posts") return { update: updateMock };
      return {};
    });
    const { PATCH } = await import("./route");

    const request = new NextRequest(
      "http://localhost:3000/api/sns/series/series-1/posts/post-1",
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: "更新テキスト" }),
      }
    );
    const params: RouteParams = { params: Promise.resolve({ id: "series-1", postId: "post-1" }) };
    const response = await PATCH(request, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("data");
  });

  it("is_posted=trueのシリーズは409を返す", async () => {
    const postedSeries: SnsSeries = { ...mockSeries, is_posted: true };
    const singleMock = vi.fn().mockResolvedValue({ data: postedSeries, error: null });
    const eqMock = vi.fn().mockReturnValue({ single: singleMock });
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
    mockSupabase.from.mockReturnValue({ select: selectMock });
    const { PATCH } = await import("./route");

    const request = new NextRequest(
      "http://localhost:3000/api/sns/series/series-1/posts/post-1",
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: "更新テキスト" }),
      }
    );
    const params: RouteParams = { params: Promise.resolve({ id: "series-1", postId: "post-1" }) };
    const response = await PATCH(request, params);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBeDefined();
  });

  it("500文字超えのテキストは422を返す", async () => {
    const fetchSeriesSingleMock = vi.fn().mockResolvedValue({ data: mockSeries, error: null });
    const fetchSeriesEqMock = vi.fn().mockReturnValue({ single: fetchSeriesSingleMock });
    const fetchSeriesSelectMock = vi.fn().mockReturnValue({ eq: fetchSeriesEqMock });
    mockSupabase.from.mockReturnValue({ select: fetchSeriesSelectMock });
    const { PATCH } = await import("./route");

    const request = new NextRequest(
      "http://localhost:3000/api/sns/series/series-1/posts/post-1",
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: "a".repeat(501) }),
      }
    );
    const params: RouteParams = { params: Promise.resolve({ id: "series-1", postId: "post-1" }) };
    const response = await PATCH(request, params);
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.error).toBeDefined();
  });
});

describe("DELETE /api/sns/series/[id]/posts/[postId]", () => {
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
    const { DELETE } = await import("./route");

    const request = new NextRequest(
      "http://localhost:3000/api/sns/series/series-1/posts/post-1",
      { method: "DELETE" }
    );
    const params: RouteParams = { params: Promise.resolve({ id: "series-1", postId: "post-1" }) };
    const response = await DELETE(request, params);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("子投稿を削除する", async () => {
    const fetchSeriesSingleMock = vi.fn().mockResolvedValue({ data: mockSeries, error: null });
    const fetchSeriesEqMock = vi.fn().mockReturnValue({ single: fetchSeriesSingleMock });
    const fetchSeriesSelectMock = vi.fn().mockReturnValue({ eq: fetchSeriesEqMock });

    const fetchPostSingleMock = vi.fn().mockResolvedValue({ data: mockPost, error: null });
    const fetchPostEqSeriesMock = vi.fn().mockReturnValue({ single: fetchPostSingleMock });
    const fetchPostEqIdMock = vi.fn().mockReturnValue({ eq: fetchPostEqSeriesMock });
    const fetchPostSelectMock = vi.fn().mockReturnValue({ eq: fetchPostEqIdMock });

    const deleteMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "sns_series") return { select: fetchSeriesSelectMock };
      if (table === "sns_posts") return { select: fetchPostSelectMock, delete: deleteMock };
      return {};
    });
    const { DELETE } = await import("./route");

    const request = new NextRequest(
      "http://localhost:3000/api/sns/series/series-1/posts/post-1",
      { method: "DELETE" }
    );
    const params: RouteParams = { params: Promise.resolve({ id: "series-1", postId: "post-1" }) };
    const response = await DELETE(request, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveProperty("id");
  });

  it("position=0の親投稿は400を返す", async () => {
    const parentPost: SnsPost = { ...mockPost, position: 0 };
    const fetchSeriesSingleMock = vi.fn().mockResolvedValue({ data: mockSeries, error: null });
    const fetchSeriesEqMock = vi.fn().mockReturnValue({ single: fetchSeriesSingleMock });
    const fetchSeriesSelectMock = vi.fn().mockReturnValue({ eq: fetchSeriesEqMock });

    const fetchPostSingleMock = vi.fn().mockResolvedValue({ data: parentPost, error: null });
    const fetchPostEqSeriesMock = vi.fn().mockReturnValue({ single: fetchPostSingleMock });
    const fetchPostEqIdMock = vi.fn().mockReturnValue({ eq: fetchPostEqSeriesMock });
    const fetchPostSelectMock = vi.fn().mockReturnValue({ eq: fetchPostEqIdMock });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "sns_series") return { select: fetchSeriesSelectMock };
      if (table === "sns_posts") return { select: fetchPostSelectMock };
      return {};
    });
    const { DELETE } = await import("./route");

    const request = new NextRequest(
      "http://localhost:3000/api/sns/series/series-1/posts/post-1",
      { method: "DELETE" }
    );
    const params: RouteParams = { params: Promise.resolve({ id: "series-1", postId: "post-1" }) };
    const response = await DELETE(request, params);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});
