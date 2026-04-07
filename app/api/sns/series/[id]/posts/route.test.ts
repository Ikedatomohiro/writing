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

const mockPost: SnsPost = {
  id: "post-2",
  series_id: "series-1",
  position: 1,
  text: "新しい投稿",
  type: "normal",
  threads_post_id: null,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
};

type RouteParams = { params: Promise<{ id: string }> };

describe("POST /api/sns/series/[id]/posts", () => {
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

    const request = new NextRequest("http://localhost:3000/api/sns/series/series-1/posts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "新しい投稿" }),
    });
    const params: RouteParams = { params: Promise.resolve({ id: "series-1" }) };
    const response = await POST(request, params);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("子投稿を追加する", async () => {
    const fetchSeriesSingleMock = vi.fn().mockResolvedValue({ data: mockSeries, error: null });
    const fetchSeriesEqMock = vi.fn().mockReturnValue({ single: fetchSeriesSingleMock });
    const fetchSeriesSelectMock = vi.fn().mockReturnValue({ eq: fetchSeriesEqMock });

    const maxPosMock = vi.fn().mockResolvedValue({ data: [{ position: 0 }], error: null });
    const maxPosEqMock = vi.fn().mockReturnValue({ order: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue({ data: [{ position: 0 }], error: null }) }) });
    const maxPosSelectMock = vi.fn().mockReturnValue({ eq: maxPosEqMock });

    const insertSingleMock = vi.fn().mockResolvedValue({ data: mockPost, error: null });
    const insertSelectMock = vi.fn().mockReturnValue({ single: insertSingleMock });
    const insertMock = vi.fn().mockReturnValue({ select: insertSelectMock });

    let callCount = 0;
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "sns_series") return { select: fetchSeriesSelectMock };
      if (table === "sns_posts") {
        callCount++;
        if (callCount === 1) return { select: maxPosSelectMock };
        return { insert: insertMock };
      }
      return {};
    });
    const { POST } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/sns/series/series-1/posts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "新しい投稿", type: "normal" }),
    });
    const params: RouteParams = { params: Promise.resolve({ id: "series-1" }) };
    const response = await POST(request, params);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty("data");
  });

  it("is_posted=trueのシリーズは409を返す", async () => {
    const postedSeries: SnsSeries = { ...mockSeries, is_posted: true };
    const singleMock = vi.fn().mockResolvedValue({ data: postedSeries, error: null });
    const eqMock = vi.fn().mockReturnValue({ single: singleMock });
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
    mockSupabase.from.mockReturnValue({ select: selectMock });
    const { POST } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/sns/series/series-1/posts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "新しい投稿" }),
    });
    const params: RouteParams = { params: Promise.resolve({ id: "series-1" }) };
    const response = await POST(request, params);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBeDefined();
  });
});
