import { BetaAnalyticsDataClient } from "@google-analytics/data";
import type { RankingResponse } from "./types";

const ARTICLE_PATH_PREFIXES = ["/asset/", "/tech/", "/health/"];
const DEFAULT_LIMIT = 10;
const DEFAULT_DATE_RANGE = "30daysAgo";

function isArticlePath(path: string): boolean {
  return ARTICLE_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function buildPeriod(): { startDate: string; endDate: string } {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  return {
    startDate: thirtyDaysAgo.toISOString().split("T")[0],
    endDate: today.toISOString().split("T")[0],
  };
}

export async function getPageViewRanking(): Promise<RankingResponse> {
  const propertyId = process.env.GA4_PROPERTY_ID;
  const clientEmail = process.env.GA_CLIENT_EMAIL;
  const privateKey = process.env.GA_PRIVATE_KEY;

  if (!propertyId || !clientEmail || !privateKey) {
    return { ranking: [], period: buildPeriod() };
  }

  try {
    const client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, "\n"),
      },
    });

    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: DEFAULT_DATE_RANGE, endDate: "today" }],
      dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [
        { metric: { metricName: "screenPageViews" }, desc: true },
      ],
      limit: 50,
    });

    const ranking = (response.rows ?? [])
      .map((row) => ({
        path: row.dimensionValues?.[0]?.value ?? "",
        title: row.dimensionValues?.[1]?.value ?? "",
        pageViews: Number(row.metricValues?.[0]?.value ?? 0),
      }))
      .filter((item) => isArticlePath(item.path))
      .slice(0, DEFAULT_LIMIT);

    return { ranking, period: buildPeriod() };
  } catch {
    return { ranking: [], period: buildPeriod() };
  }
}
