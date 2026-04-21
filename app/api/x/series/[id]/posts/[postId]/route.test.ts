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
  id: "post-1",
  series_id: "series-1",
  position: 1,
  text: "テスト投稿",
  x_post_id: null,
  source_url: null,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
};

type RouteParams = { params: Promise<{ id: string; postId: string }> };

describe("PATCH /api/x/series/[id]/posts/[postId]", () => {
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
      "http://localhost:3000/api/x/series/series-1/posts/post-1",
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: "更新テキスト" }),
      }
    );
    const params: RouteParams = {
      params: Promise.resolve({ id: "series-1", postId: "post-1" }),
    };
    const response = await PATCH(request, params);
    expect(response.status).toBe(401);
  });

  it("280字超の更新は422を返す", async () => {
    const fetchSingleMock = vi
      .fn()
      .mockResolvedValue({ data: mockSeries, error: null });
    mockSupabase.from.mockImplementation(() => ({
      select: () => ({ eq: () => ({ single: fetchSingleMock }) }),
    }));

    const { PATCH } = await import("./route");
    const request = new NextRequest(
      "http://localhost:3000/api/x/series/series-1/posts/post-1",
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: "a".repeat(281) }),
      }
    );
    const params: RouteParams = {
      params: Promise.resolve({ id: "series-1", postId: "post-1" }),
    };
    const response = await PATCH(request, params);
    expect(response.status).toBe(422);
  });

  it("投稿済みシリーズの更新は409を返す", async () => {
    const posted = { ...mockSeries, is_posted: true };
    const fetchSingleMock = vi
      .fn()
      .mockResolvedValue({ data: posted, error: null });
    mockSupabase.from.mockImplementation(() => ({
      select: () => ({ eq: () => ({ single: fetchSingleMock }) }),
    }));

    const { PATCH } = await import("./route");
    const request = new NextRequest(
      "http://localhost:3000/api/x/series/series-1/posts/post-1",
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: "更新テキスト" }),
      }
    );
    const params: RouteParams = {
      params: Promise.resolve({ id: "series-1", postId: "post-1" }),
    };
    const response = await PATCH(request, params);
    expect(response.status).toBe(409);
  });

  it("投稿を更新する", async () => {
    const updatedPost: XPost = { ...mockPost, text: "更新テキスト" };
    const fetchSeriesSingleMock = vi
      .fn()
      .mockResolvedValue({ data: mockSeries, error: null });
    const updateSingleMock = vi
      .fn()
      .mockResolvedValue({ data: updatedPost, error: null });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "x_series") {
        return { select: () => ({ eq: () => ({ single: fetchSeriesSingleMock }) }) };
      }
      return {
        update: () => ({
          eq: () => ({ eq: () => ({ select: () => ({ single: updateSingleMock }) }) }),
        }),
      };
    });

    const { PATCH } = await import("./route");
    const request = new NextRequest(
      "http://localhost:3000/api/x/series/series-1/posts/post-1",
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: "更新テキスト" }),
      }
    );
    const params: RouteParams = {
      params: Promise.resolve({ id: "series-1", postId: "post-1" }),
    };
    const response = await PATCH(request, params);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.data.text).toBe("更新テキスト");
  });
});

describe("DELETE /api/x/series/[id]/posts/[postId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockRequireAuth.mockResolvedValue(null);
  });

  it("position=0 の親投稿は削除不可（400）", async () => {
    const parent = { ...mockPost, position: 0 };
    const fetchSeriesSingleMock = vi
      .fn()
      .mockResolvedValue({ data: mockSeries, error: null });
    const fetchPostSingleMock = vi
      .fn()
      .mockResolvedValue({ data: parent, error: null });

    let tableCall = 0;
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "x_series") {
        return { select: () => ({ eq: () => ({ single: fetchSeriesSingleMock }) }) };
      }
      tableCall++;
      return {
        select: () => ({
          eq: () => ({ eq: () => ({ single: fetchPostSingleMock }) }),
        }),
      };
    });

    const { DELETE } = await import("./route");
    const request = new NextRequest(
      "http://localhost:3000/api/x/series/series-1/posts/post-1",
      { method: "DELETE" }
    );
    const params: RouteParams = {
      params: Promise.resolve({ id: "series-1", postId: "post-1" }),
    };
    const response = await DELETE(request, params);
    expect(response.status).toBe(400);
  });

  it("子投稿を削除する", async () => {
    const fetchSeriesSingleMock = vi
      .fn()
      .mockResolvedValue({ data: mockSeries, error: null });
    const fetchPostSingleMock = vi
      .fn()
      .mockResolvedValue({ data: mockPost, error: null });
    const deleteMock = vi.fn().mockResolvedValue({ error: null });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "x_series") {
        return { select: () => ({ eq: () => ({ single: fetchSeriesSingleMock }) }) };
      }
      return {
        select: () => ({
          eq: () => ({ eq: () => ({ single: fetchPostSingleMock }) }),
        }),
        delete: () => ({ eq: () => ({ eq: deleteMock }) }),
      };
    });

    const { DELETE } = await import("./route");
    const request = new NextRequest(
      "http://localhost:3000/api/x/series/series-1/posts/post-1",
      { method: "DELETE" }
    );
    const params: RouteParams = {
      params: Promise.resolve({ id: "series-1", postId: "post-1" }),
    };
    const response = await DELETE(request, params);
    expect(response.status).toBe(200);
  });
});
