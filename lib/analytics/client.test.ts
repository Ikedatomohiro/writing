import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { getPageViewRanking } from "./client";

const mockRunReport = vi.fn();

vi.mock("@google-analytics/data", () => {
  return {
    BetaAnalyticsDataClient: class {
      runReport = mockRunReport;
    },
  };
});

describe("getPageViewRanking", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("環境変数が未設定の場合は空のランキングを返す", async () => {
    delete process.env.GA4_PROPERTY_ID;
    delete process.env.GA_CLIENT_EMAIL;
    delete process.env.GA_PRIVATE_KEY;

    const result = await getPageViewRanking();

    expect(result.ranking).toEqual([]);
    expect(result.period.startDate).toBeDefined();
    expect(result.period.endDate).toBeDefined();
    expect(mockRunReport).not.toHaveBeenCalled();
  });

  it("GA4 APIからランキングデータを取得する", async () => {
    process.env.GA4_PROPERTY_ID = "123456789";
    process.env.GA_CLIENT_EMAIL = "test@test.iam.gserviceaccount.com";
    process.env.GA_PRIVATE_KEY = "test-key";

    mockRunReport.mockResolvedValue([
      {
        rows: [
          {
            dimensionValues: [
              { value: "/asset/investment-basics" },
              { value: "投資の基礎知識" },
            ],
            metricValues: [{ value: "1234" }],
          },
          {
            dimensionValues: [
              { value: "/tech/nextjs-guide" },
              { value: "Next.jsガイド" },
            ],
            metricValues: [{ value: "567" }],
          },
        ],
      },
    ]);

    const result = await getPageViewRanking();

    expect(result.ranking).toHaveLength(2);
    expect(result.ranking[0]).toEqual({
      path: "/asset/investment-basics",
      title: "投資の基礎知識",
      pageViews: 1234,
    });
    expect(result.ranking[1]).toEqual({
      path: "/tech/nextjs-guide",
      title: "Next.jsガイド",
      pageViews: 567,
    });
  });

  it("API呼び出しでエラーが発生した場合は空のランキングを返す", async () => {
    process.env.GA4_PROPERTY_ID = "123456789";
    process.env.GA_CLIENT_EMAIL = "test@test.iam.gserviceaccount.com";
    process.env.GA_PRIVATE_KEY = "test-key";

    mockRunReport.mockRejectedValue(new Error("API error"));

    const result = await getPageViewRanking();

    expect(result.ranking).toEqual([]);
  });

  it("記事ページのみをフィルタリングする", async () => {
    process.env.GA4_PROPERTY_ID = "123456789";
    process.env.GA_CLIENT_EMAIL = "test@test.iam.gserviceaccount.com";
    process.env.GA_PRIVATE_KEY = "test-key";

    mockRunReport.mockResolvedValue([
      {
        rows: [
          {
            dimensionValues: [{ value: "/asset/test" }, { value: "記事" }],
            metricValues: [{ value: "100" }],
          },
          {
            dimensionValues: [{ value: "/about" }, { value: "About" }],
            metricValues: [{ value: "50" }],
          },
          {
            dimensionValues: [{ value: "/" }, { value: "Home" }],
            metricValues: [{ value: "200" }],
          },
          {
            dimensionValues: [
              { value: "/tech/react" },
              { value: "React入門" },
            ],
            metricValues: [{ value: "80" }],
          },
        ],
      },
    ]);

    const result = await getPageViewRanking();

    expect(result.ranking).toHaveLength(2);
    expect(result.ranking[0].path).toBe("/asset/test");
    expect(result.ranking[1].path).toBe("/tech/react");
  });
});
