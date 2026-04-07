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

const mockQueuedSeries: SnsSeries[] = [
  {
    id: "series-1",
    theme: "テーマ1",
    pattern: null,
    quality_score: null,
    score_breakdown: null,
    status: "queued",
    queue_order: 1,
    is_posted: false,
    posted_at: null,
    approved_at: "2024-01-01T00:00:00.000Z",
    source: null,
    source_draft_id: null,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "series-2",
    theme: "テーマ2",
    pattern: null,
    quality_score: null,
    score_breakdown: null,
    status: "queued",
    queue_order: 2,
    is_posted: false,
    posted_at: null,
    approved_at: "2024-01-01T00:00:00.000Z",
    source: null,
    source_draft_id: null,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
];

describe("POST /api/sns/queue/reorder", () => {
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

    const request = new NextRequest("http://localhost:3000/api/sns/queue/reorder", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ series_ids: ["series-2", "series-1"] }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("キューを並び替える", async () => {
    const reorderedSeries = [
      { ...mockQueuedSeries[1], queue_order: 1 },
      { ...mockQueuedSeries[0], queue_order: 2 },
    ];

    const fetchInMock = vi.fn().mockResolvedValue({ data: mockQueuedSeries, error: null });
    const fetchSelectMock = vi.fn().mockReturnValue({ in: fetchInMock });

    const updateSingleMock = vi.fn()
      .mockResolvedValueOnce({ data: reorderedSeries[0], error: null })
      .mockResolvedValueOnce({ data: reorderedSeries[1], error: null });
    const updateSelectMock = vi.fn().mockReturnValue({ single: updateSingleMock });
    const updateEqMock = vi.fn().mockReturnValue({ select: updateSelectMock });
    const updateMock = vi.fn().mockReturnValue({ eq: updateEqMock });

    let callCount = 0;
    mockSupabase.from.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return { select: fetchSelectMock };
      return { update: updateMock };
    });
    const { POST } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/sns/queue/reorder", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ series_ids: ["series-2", "series-1"] }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("data");
    expect(Array.isArray(data.data)).toBe(true);
  });

  it("is_posted=trueのシリーズが含まれている場合は400を返す", async () => {
    const postedSeries: SnsSeries = { ...mockQueuedSeries[0], is_posted: true };
    const inMock = vi.fn().mockResolvedValue({ data: [postedSeries, mockQueuedSeries[1]], error: null });
    const selectMock = vi.fn().mockReturnValue({ in: inMock });
    mockSupabase.from.mockReturnValue({ select: selectMock });
    const { POST } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/sns/queue/reorder", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ series_ids: ["series-1", "series-2"] }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});
