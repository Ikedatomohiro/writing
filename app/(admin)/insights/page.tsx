import { createServerClient } from "@/lib/supabase/server";
import { fetchMetricRows } from "@/lib/insights/query";
import { buildSummary } from "@/lib/insights/aggregate";
import type { MetricRow, Platform } from "@/lib/insights/types";
import { InsightsView } from "./InsightsView";

const ACCOUNTS = ["pao-pao-cho", "matsumoto_sho", "morita_rin"];

export const dynamic = "force-dynamic";

function parseAccount(raw?: string): string | null {
  return raw && ACCOUNTS.includes(raw) ? raw : null;
}

function parsePlatform(raw?: string): Platform | null {
  return raw === "threads" || raw === "x" ? raw : null;
}

async function loadRows(
  account: string | null,
  platform: Platform | null,
): Promise<{ rows: MetricRow[]; error: boolean }> {
  try {
    const client = createServerClient();
    const rows = await fetchMetricRows(client, { account, platform });
    return { rows, error: false };
  } catch {
    return { rows: [], error: true };
  }
}

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ account?: string; platform?: string }>;
}) {
  const sp = await searchParams;
  const account = parseAccount(sp.account);
  const platform = parsePlatform(sp.platform);

  const { rows, error } = await loadRows(account, platform);
  const summary = buildSummary(rows, account, platform);

  return (
    <InsightsView
      summary={summary}
      rows={rows}
      account={account}
      platform={platform}
      error={error}
    />
  );
}
