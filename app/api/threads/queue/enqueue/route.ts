import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/api-auth";
import { createServerClient } from "@/lib/supabase/server";
import type { SnsSeries } from "@/lib/types/sns";

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  let body: { series_id: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { series_id } = body;
  const supabase = createServerClient();

  const { data: existing, error: fetchError } = await supabase
    .from("sns_series")
    .select("*")
    .eq("id", series_id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Series not found" }, { status: 404 });
  }

  const series = existing as SnsSeries;

  if (series.status !== "draft") {
    return NextResponse.json(
      { error: "Only draft series can be enqueued" },
      { status: 400 }
    );
  }

  // queue_order の UNIQUE は (account, queue_order) スコープのため、
  // max_order は対象アカウントのキュー内だけで集計する。
  // これを怠ると pao と rin が同じ番号を採番して reorder の前提を壊す。
  //
  // また reorder API が「全件 NULL → 順次採番」の2段階で動く都合上、途中で中断すると
  // status=queued / queue_order=NULL の行が残り得る。PostgREST の DESC 既定は
  // NULLS FIRST なので、NULL を除外せずに max を取ると 0 起点で再採番してしまい、
  // 既存の queue_order=1 と UNIQUE 衝突して 500 になる（"draft → 予約中" のエラーの主因）。
  // 実在する整数の最大値だけを採番に使うため、NULL は明示的に除外する。
  const { data: maxOrderData } = await supabase
    .from("sns_series")
    .select("queue_order")
    .eq("status", "queued")
    .eq("account", series.account)
    .not("queue_order", "is", null)
    .order("queue_order", { ascending: false })
    .limit(1);

  const maxOrder =
    maxOrderData && maxOrderData.length > 0
      ? ((maxOrderData[0] as { queue_order: number }).queue_order ?? 0)
      : 0;

  const { data: updated, error: updateError } = await supabase
    .from("sns_series")
    .update({ status: "queued", queue_order: maxOrder + 1 })
    .eq("id", series_id)
    .select()
    .single();

  if (updateError || !updated) {
    return NextResponse.json(
      { error: updateError?.message ?? "Failed to enqueue series" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: updated as SnsSeries });
}
