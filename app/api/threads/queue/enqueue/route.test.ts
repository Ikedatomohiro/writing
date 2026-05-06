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

const mockDraftSeries: SnsSeries = {
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

describe("POST /api/threads/queue/enqueue", () => {
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

    const request = new NextRequest("http://localhost:3000/api/threads/queue/enqueue", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ series_id: "series-1" }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("draftシリーズをキューに追加する（pao の max_order=30 → 31 で採番）", async () => {
    const queuedSeries: SnsSeries = { ...mockDraftSeries, status: "queued", queue_order: 31 };

    const fetchSingleMock = vi.fn().mockResolvedValue({ data: mockDraftSeries, error: null });
    const fetchEqMock = vi.fn().mockReturnValue({ single: fetchSingleMock });
    const fetchSelectMock = vi.fn().mockReturnValue({ eq: fetchEqMock });

    // max_order クエリは account でもフィルタするため eq が2段、さらに NULL 除外の .not() が入る
    const maxOrderLimitMock = vi.fn().mockResolvedValue({ data: [{ queue_order: 30 }], error: null });
    const maxOrderOrderMock = vi.fn().mockReturnValue({ limit: maxOrderLimitMock });
    const maxOrderNotMock = vi.fn().mockReturnValue({ order: maxOrderOrderMock });
    const maxOrderAccountEqMock = vi.fn().mockReturnValue({ not: maxOrderNotMock });
    const maxOrderStatusEqMock = vi.fn().mockReturnValue({ eq: maxOrderAccountEqMock });
    const maxOrderSelectMock = vi.fn().mockReturnValue({ eq: maxOrderStatusEqMock });

    const updateSingleMock = vi.fn().mockResolvedValue({ data: queuedSeries, error: null });
    const updateSelectMock = vi.fn().mockReturnValue({ single: updateSingleMock });
    const updateEqMock = vi.fn().mockReturnValue({ select: updateSelectMock });
    const updateMock = vi.fn().mockReturnValue({ eq: updateEqMock });

    let callCount = 0;
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "sns_series") {
        callCount++;
        if (callCount === 1) return { select: fetchSelectMock };
        if (callCount === 2) return { select: maxOrderSelectMock };
        return { update: updateMock };
      }
      return {};
    });
    const { POST } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/threads/queue/enqueue", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ series_id: "series-1" }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("data");
    // max_order クエリは status=queued + account=対象アカウント の両方でフィルタする
    expect(maxOrderStatusEqMock).toHaveBeenCalledWith("status", "queued");
    expect(maxOrderAccountEqMock).toHaveBeenCalledWith("account", "pao-pao-cho");
    // 採番は 30 + 1 = 31
    const updatePayload = updateMock.mock.calls[0][0];
    expect(updatePayload.queue_order).toBe(31);
  });

  it("rin シリーズの max_order は rin 内だけで集計する（pao と独立）", async () => {
    const rinDraft: SnsSeries = { ...mockDraftSeries, id: "rin-1", account: "morita_rin" };
    const rinQueued: SnsSeries = { ...rinDraft, status: "queued", queue_order: 2005 };

    const fetchSingleMock = vi.fn().mockResolvedValue({ data: rinDraft, error: null });
    const fetchEqMock = vi.fn().mockReturnValue({ single: fetchSingleMock });
    const fetchSelectMock = vi.fn().mockReturnValue({ eq: fetchEqMock });

    const maxOrderLimitMock = vi.fn().mockResolvedValue({ data: [{ queue_order: 2004 }], error: null });
    const maxOrderOrderMock = vi.fn().mockReturnValue({ limit: maxOrderLimitMock });
    const maxOrderNotMock = vi.fn().mockReturnValue({ order: maxOrderOrderMock });
    const maxOrderAccountEqMock = vi.fn().mockReturnValue({ not: maxOrderNotMock });
    const maxOrderStatusEqMock = vi.fn().mockReturnValue({ eq: maxOrderAccountEqMock });
    const maxOrderSelectMock = vi.fn().mockReturnValue({ eq: maxOrderStatusEqMock });

    const updateSingleMock = vi.fn().mockResolvedValue({ data: rinQueued, error: null });
    const updateSelectMock = vi.fn().mockReturnValue({ single: updateSingleMock });
    const updateEqMock = vi.fn().mockReturnValue({ select: updateSelectMock });
    const updateMock = vi.fn().mockReturnValue({ eq: updateEqMock });

    let callCount = 0;
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "sns_series") {
        callCount++;
        if (callCount === 1) return { select: fetchSelectMock };
        if (callCount === 2) return { select: maxOrderSelectMock };
        return { update: updateMock };
      }
      return {};
    });
    const { POST } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/threads/queue/enqueue", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ series_id: "rin-1" }),
    });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(maxOrderAccountEqMock).toHaveBeenCalledWith("account", "morita_rin");
    const updatePayload = updateMock.mock.calls[0][0];
    expect(updatePayload.queue_order).toBe(2005);
  });

  it("queue_order=NULL の queued 行が存在しても、NULL は max 集計から除外される（reorder 中断対策）", async () => {
    // 背景: reorder API は (1) 全件 queue_order を NULL にする → (2) 順番に再採番する、という2段階で動く。
    // 途中でリクエストが切断されると status=queued / queue_order=NULL の行が残り、
    // PostgREST の DESC 既定は NULLS FIRST なので、そのまま max を取ると NULL を返してしまう。
    // 結果 maxOrder=0 になり、queue_order=1 で UPDATE → 既存の queue_order=1 と UNIQUE 衝突。
    // 対策として max クエリ側で NULL を明示的に除外し、実在する整数の最大値だけを採番に使う。
    const queuedSeries: SnsSeries = { ...mockDraftSeries, status: "queued", queue_order: 6 };

    const fetchSingleMock = vi.fn().mockResolvedValue({ data: mockDraftSeries, error: null });
    const fetchEqMock = vi.fn().mockReturnValue({ single: fetchSingleMock });
    const fetchSelectMock = vi.fn().mockReturnValue({ eq: fetchEqMock });

    // .not("queue_order", "is", null) により NULL 行は集計対象外。実在する最大値=5 のみが返る想定
    const maxOrderLimitMock = vi.fn().mockResolvedValue({ data: [{ queue_order: 5 }], error: null });
    const maxOrderOrderMock = vi.fn().mockReturnValue({ limit: maxOrderLimitMock });
    const maxOrderNotMock = vi.fn().mockReturnValue({ order: maxOrderOrderMock });
    const maxOrderAccountEqMock = vi.fn().mockReturnValue({ not: maxOrderNotMock });
    const maxOrderStatusEqMock = vi.fn().mockReturnValue({ eq: maxOrderAccountEqMock });
    const maxOrderSelectMock = vi.fn().mockReturnValue({ eq: maxOrderStatusEqMock });

    const updateSingleMock = vi.fn().mockResolvedValue({ data: queuedSeries, error: null });
    const updateSelectMock = vi.fn().mockReturnValue({ single: updateSingleMock });
    const updateEqMock = vi.fn().mockReturnValue({ select: updateSelectMock });
    const updateMock = vi.fn().mockReturnValue({ eq: updateEqMock });

    let callCount = 0;
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "sns_series") {
        callCount++;
        if (callCount === 1) return { select: fetchSelectMock };
        if (callCount === 2) return { select: maxOrderSelectMock };
        return { update: updateMock };
      }
      return {};
    });
    const { POST } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/threads/queue/enqueue", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ series_id: "series-1" }),
    });
    const response = await POST(request);

    expect(response.status).toBe(200);
    // NULL 除外フィルタが適用されていること
    expect(maxOrderNotMock).toHaveBeenCalledWith("queue_order", "is", null);
    // 採番は max(5) + 1 = 6（NULL を 0 と誤認していた頃は queue_order=1 になり既存と衝突していた）
    const updatePayload = updateMock.mock.calls[0][0];
    expect(updatePayload.queue_order).toBe(6);
  });

  it("status=draftでないシリーズは400を返す", async () => {
    const draftSeries: SnsSeries = { ...mockDraftSeries, status: "queued" };
    const singleMock = vi.fn().mockResolvedValue({ data: draftSeries, error: null });
    const eqMock = vi.fn().mockReturnValue({ single: singleMock });
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
    mockSupabase.from.mockReturnValue({ select: selectMock });
    const { POST } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/threads/queue/enqueue", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ series_id: "series-1" }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});
