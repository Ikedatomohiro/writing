import { describe, it, expect, vi, beforeEach } from "vitest";

const mockAuth = vi.fn();
vi.mock("@/auth", () => ({
  auth: () => mockAuth(),
}));

const mockGetPageViewRanking = vi.fn();
vi.mock("@/lib/analytics/client", () => ({
  getPageViewRanking: () => mockGetPageViewRanking(),
}));

describe("GET /api/analytics/ranking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証されていない場合は401を返す", async () => {
    mockAuth.mockResolvedValue(null);

    const { GET } = await import("./route");
    const response = await GET();

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("認証済みの場合はランキングデータを返す", async () => {
    mockAuth.mockResolvedValue({ user: { email: "test@example.com" } });

    const mockData = {
      ranking: [
        { path: "/asset/test", title: "テスト記事", pageViews: 100 },
      ],
      period: { startDate: "2026-02-20", endDate: "2026-03-22" },
    };
    mockGetPageViewRanking.mockResolvedValue(mockData);

    const { GET } = await import("./route");
    const response = await GET();

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.ranking).toHaveLength(1);
    expect(data.ranking[0].title).toBe("テスト記事");
    expect(data.period).toBeDefined();
  });
});
