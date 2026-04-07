import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import type { SnsSeries } from "@/lib/types/sns";

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

type RouteParams = { params: Promise<{ id: string }> };

describe("POST /api/sns/series/[id]/approve", () => {
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

    const request = new NextRequest("http://localhost:3000/api/sns/series/series-1/approve", {
      method: "POST",
    });
    const params: RouteParams = { params: Promise.resolve({ id: "series-1" }) };
    const response = await POST(request, params);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("シリーズを承認する", async () => {
    const approvedSeries: SnsSeries = { ...mockSeries, status: "approved", approved_at: "2024-01-02T00:00:00.000Z" };
    const fetchSingleMock = vi.fn().mockResolvedValue({ data: mockSeries, error: null });
    const fetchEqMock = vi.fn().mockReturnValue({ single: fetchSingleMock });
    const fetchSelectMock = vi.fn().mockReturnValue({ eq: fetchEqMock });

    const updateSingleMock = vi.fn().mockResolvedValue({ data: approvedSeries, error: null });
    const updateSelectMock = vi.fn().mockReturnValue({ single: updateSingleMock });
    const updateEqMock = vi.fn().mockReturnValue({ select: updateSelectMock });
    const updateMock = vi.fn().mockReturnValue({ eq: updateEqMock });

    mockSupabase.from.mockReturnValue({ select: fetchSelectMock, update: updateMock });
    const { POST } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/sns/series/series-1/approve", {
      method: "POST",
    });
    const params: RouteParams = { params: Promise.resolve({ id: "series-1" }) };
    const response = await POST(request, params);
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
    const { POST } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/sns/series/series-1/approve", {
      method: "POST",
    });
    const params: RouteParams = { params: Promise.resolve({ id: "series-1" }) };
    const response = await POST(request, params);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBeDefined();
  });

  it("シリーズが見つからない場合は404を返す", async () => {
    const singleMock = vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } });
    const eqMock = vi.fn().mockReturnValue({ single: singleMock });
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
    mockSupabase.from.mockReturnValue({ select: selectMock });
    const { POST } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/sns/series/not-found/approve", {
      method: "POST",
    });
    const params: RouteParams = { params: Promise.resolve({ id: "not-found" }) };
    const response = await POST(request, params);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBeDefined();
  });
});
