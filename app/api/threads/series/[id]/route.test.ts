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

type RouteParams = { params: Promise<{ id: string }> };

describe("GET /api/threads/series/[id]", () => {
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

    const request = new NextRequest("http://localhost:3000/api/threads/series/series-1");
    const params: RouteParams = { params: Promise.resolve({ id: "series-1" }) };
    const response = await GET(request, params);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("シリーズ詳細を投稿一覧とともに取得する", async () => {
    const singleMock = vi.fn().mockResolvedValue({ data: mockSeriesWithPosts, error: null });
    const eqMock = vi.fn().mockReturnValue({ single: singleMock });
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
    mockSupabase.from.mockReturnValue({ select: selectMock });
    const { GET } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/threads/series/series-1");
    const params: RouteParams = { params: Promise.resolve({ id: "series-1" }) };
    const response = await GET(request, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("data");
  });

  it("シリーズが見つからない場合は404を返す", async () => {
    const singleMock = vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } });
    const eqMock = vi.fn().mockReturnValue({ single: singleMock });
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
    mockSupabase.from.mockReturnValue({ select: selectMock });
    const { GET } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/threads/series/not-found");
    const params: RouteParams = { params: Promise.resolve({ id: "not-found" }) };
    const response = await GET(request, params);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBeDefined();
  });
});

describe("PATCH /api/threads/series/[id]", () => {
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

    const request = new NextRequest("http://localhost:3000/api/threads/series/series-1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ theme: "新テーマ" }),
    });
    const params: RouteParams = { params: Promise.resolve({ id: "series-1" }) };
    const response = await PATCH(request, params);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("シリーズを更新する", async () => {
    const updatedSeries: SnsSeries = { ...mockSeries, theme: "新テーマ" };
    const fetchSingleMock = vi.fn().mockResolvedValue({ data: mockSeries, error: null });
    const fetchEqMock = vi.fn().mockReturnValue({ single: fetchSingleMock });
    const fetchSelectMock = vi.fn().mockReturnValue({ eq: fetchEqMock });

    const updateSingleMock = vi.fn().mockResolvedValue({ data: updatedSeries, error: null });
    const updateSelectMock = vi.fn().mockReturnValue({ single: updateSingleMock });
    const updateEqMock = vi.fn().mockReturnValue({ select: updateSelectMock });
    const updateMock = vi.fn().mockReturnValue({ eq: updateEqMock });

    mockSupabase.from.mockReturnValue({
      select: fetchSelectMock,
      update: updateMock,
    });
    const { PATCH } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/threads/series/series-1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ theme: "新テーマ" }),
    });
    const params: RouteParams = { params: Promise.resolve({ id: "series-1" }) };
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

    const request = new NextRequest("http://localhost:3000/api/threads/series/series-1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ theme: "新テーマ" }),
    });
    const params: RouteParams = { params: Promise.resolve({ id: "series-1" }) };
    const response = await PATCH(request, params);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBeDefined();
  });
});

describe("DELETE /api/threads/series/[id]", () => {
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

    const request = new NextRequest("http://localhost:3000/api/threads/series/series-1", {
      method: "DELETE",
    });
    const params: RouteParams = { params: Promise.resolve({ id: "series-1" }) };
    const response = await DELETE(request, params);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("シリーズを削除する", async () => {
    const fetchSingleMock = vi.fn().mockResolvedValue({ data: mockSeries, error: null });
    const fetchEqMock = vi.fn().mockReturnValue({ single: fetchSingleMock });
    const fetchSelectMock = vi.fn().mockReturnValue({ eq: fetchEqMock });
    const deleteMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    mockSupabase.from.mockReturnValue({ select: fetchSelectMock, delete: deleteMock });
    const { DELETE } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/threads/series/series-1", {
      method: "DELETE",
    });
    const params: RouteParams = { params: Promise.resolve({ id: "series-1" }) };
    const response = await DELETE(request, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveProperty("id");
  });

  it("is_posted=trueのシリーズは409を返す", async () => {
    const postedSeries: SnsSeries = { ...mockSeries, is_posted: true };
    const singleMock = vi.fn().mockResolvedValue({ data: postedSeries, error: null });
    const eqMock = vi.fn().mockReturnValue({ single: singleMock });
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
    mockSupabase.from.mockReturnValue({ select: selectMock });
    const { DELETE } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/threads/series/series-1", {
      method: "DELETE",
    });
    const params: RouteParams = { params: Promise.resolve({ id: "series-1" }) };
    const response = await DELETE(request, params);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBeDefined();
  });
});
