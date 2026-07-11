import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/api-auth";
import { createServerClient } from "@/lib/supabase/server";
import { fetchMetricRows } from "@/lib/insights/query";
import { buildSummary } from "@/lib/insights/aggregate";
import type { Platform } from "@/lib/insights/types";

function parsePlatform(raw: string | null): Platform | null {
  return raw === "threads" || raw === "x" ? raw : null;
}

export async function GET(request: Request) {
  const authError = await requireAuth();
  if (authError) return authError;

  const url = new URL(request.url);
  const account = url.searchParams.get("account") || null;
  const platform = parsePlatform(url.searchParams.get("platform"));

  const client = createServerClient();
  const rows = await fetchMetricRows(client, { account, platform });
  const summary = buildSummary(rows, account, platform);

  return NextResponse.json(summary);
}
