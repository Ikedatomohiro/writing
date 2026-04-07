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
  approved_at: null,
  source: null,
  source_draft_id: null,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
};

const mockPosts: SnsPost[] = [
  {
    id: "post-1",
    series_id: "series-1",
    position: 0,
    text: "投稿1",
    type: "normal",
    threads_post_id: null,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "post-2",
    series_id: "series-1",
    position: 1,
    text: "投稿2",
    type: "normal",
    threads_post_id: null,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
];

type RouteParams = { params: Promise<{ id: string }> };

describe("POST /api/sns/series/[id]/posts/reorder", () => {
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

    const request = new NextRequest(
      "http://localhost:3000/api/sns/series/series-1/posts/reorder",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ post_ids: ["post-2", "post-1"] }),
      }
    );
    const params: RouteParams = { params: Promise.resolve({ id: "series-1" }) };
    const response = await POST(request, params);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("投稿を並び替える", async () => {
    const reorderedPosts = [
      { ...mockPosts[1], position: 0 },
      { ...mockPosts[0], position: 1 },
    ];
    const fetchSeriesSingleMock = vi.fn().mockResolvedValue({ data: mockSeries, error: null });
    const fetchSeriesEqMock = vi.fn().mockReturnValue({ single: fetchSeriesSingleMock });
    const fetchSeriesSelectMock = vi.fn().mockReturnValue({ eq: fetchSeriesEqMock });

    const updateSingleMock = vi.fn()
      .mockResolvedValueOnce({ data: reorderedPosts[0], error: null })
      .mockResolvedValueOnce({ data: reorderedPosts[1], error: null });
    const updateSelectMock = vi.fn().mockReturnValue({ single: updateSingleMock });
    const updateEqPostMock = vi.fn().mockReturnValue({ select: updateSelectMock });
    const updateEqSeriesMock = vi.fn().mockReturnValue({ eq: updateEqPostMock });
    const updateMock = vi.fn().mockReturnValue({ eq: updateEqSeriesMock });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "sns_series") return { select: fetchSeriesSelectMock };
      if (table === "sns_posts") return { update: updateMock };
      return {};
    });
    const { POST } = await import("./route");

    const request = new NextRequest(
      "http://localhost:3000/api/sns/series/series-1/posts/reorder",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ post_ids: ["post-2", "post-1"] }),
      }
    );
    const params: RouteParams = { params: Promise.resolve({ id: "series-1" }) };
    const response = await POST(request, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("data");
    expect(Array.isArray(data.data)).toBe(true);
  });

  it("is_posted=trueのシリーズは409を返す", async () => {
    const postedSeries: SnsSeries = { ...mockSeries, is_posted: true };
    const singleMock = vi.fn().mockResolvedValue({ data: postedSeries, error: null });
    const eqMock = vi.fn().mockReturnValue({ single: singleMock });
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
    mockSupabase.from.mockReturnValue({ select: selectMock });
    const { POST } = await import("./route");

    const request = new NextRequest(
      "http://localhost:3000/api/sns/series/series-1/posts/reorder",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ post_ids: ["post-2", "post-1"] }),
      }
    );
    const params: RouteParams = { params: Promise.resolve({ id: "series-1" }) };
    const response = await POST(request, params);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBeDefined();
  });
});
