import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import type { XSeries, XPost } from "@/lib/types/x";

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
  account: "morita_rin",
  theme: "テストテーマ",
  category: null,
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

const mockPost: XPost = {
  id: "post-2",
  series_id: "series-1",
  position: 1,
  text: "新しい投稿",
  x_post_id: null,
  source_url: null,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
};

type RouteParams = { params: Promise<{ id: string }> };

describe("POST /api/x/series/[id]/posts", () => {
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
      "http://localhost:3000/api/x/series/series-1/posts",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: "新しい投稿" }),
      }
    );
    const params: RouteParams = { params: Promise.resolve({ id: "series-1" }) };
    const response = await POST(request, params);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("seriesが存在しない場合は404を返す", async () => {
    const fetchSeriesSingleMock = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: "Not found" } });
    mockSupabase.from.mockImplementation(() => ({
      select: () => ({ eq: () => ({ single: fetchSeriesSingleMock }) }),
    }));

    const { POST } = await import("./route");
    const request = new NextRequest(
      "http://localhost:3000/api/x/series/series-1/posts",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: "新しい投稿" }),
      }
    );
    const params: RouteParams = { params: Promise.resolve({ id: "series-1" }) };
    const response = await POST(request, params);
    expect(response.status).toBe(404);
  });

  it("投稿済みシリーズへの追加は409を返す", async () => {
    const posted = { ...mockSeries, is_posted: true };
    const fetchSeriesSingleMock = vi
      .fn()
      .mockResolvedValue({ data: posted, error: null });
    mockSupabase.from.mockImplementation(() => ({
      select: () => ({ eq: () => ({ single: fetchSeriesSingleMock }) }),
    }));

    const { POST } = await import("./route");
    const request = new NextRequest(
      "http://localhost:3000/api/x/series/series-1/posts",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: "新しい投稿" }),
      }
    );
    const params: RouteParams = { params: Promise.resolve({ id: "series-1" }) };
    const response = await POST(request, params);
    expect(response.status).toBe(409);
  });

  it("280文字を超える場合は422を返す", async () => {
    const fetchSeriesSingleMock = vi
      .fn()
      .mockResolvedValue({ data: mockSeries, error: null });
    mockSupabase.from.mockImplementation(() => ({
      select: () => ({ eq: () => ({ single: fetchSeriesSingleMock }) }),
    }));

    const { POST } = await import("./route");
    const request = new NextRequest(
      "http://localhost:3000/api/x/series/series-1/posts",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: "a".repeat(281) }),
      }
    );
    const params: RouteParams = { params: Promise.resolve({ id: "series-1" }) };
    const response = await POST(request, params);
    expect(response.status).toBe(422);
  });

  it("子投稿を追加する", async () => {
    const fetchSeriesSingleMock = vi
      .fn()
      .mockResolvedValue({ data: mockSeries, error: null });
    const maxPositionMock = vi
      .fn()
      .mockResolvedValue({ data: [{ position: 0 }], error: null });
    const insertSingleMock = vi
      .fn()
      .mockResolvedValue({ data: mockPost, error: null });

    let callIndex = 0;
    mockSupabase.from.mockImplementation((table: string) => {
      callIndex++;
      if (table === "x_series") {
        return { select: () => ({ eq: () => ({ single: fetchSeriesSingleMock }) }) };
      }
      if (callIndex === 2) {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({ limit: maxPositionMock }),
            }),
          }),
        };
      }
      return {
        insert: () => ({ select: () => ({ single: insertSingleMock }) }),
      };
    });

    const { POST } = await import("./route");
    const request = new NextRequest(
      "http://localhost:3000/api/x/series/series-1/posts",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: "新しい投稿" }),
      }
    );
    const params: RouteParams = { params: Promise.resolve({ id: "series-1" }) };
    const response = await POST(request, params);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data.position).toBe(1);
  });
});
