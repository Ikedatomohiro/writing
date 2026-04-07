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

  const { data: maxOrderData } = await supabase
    .from("sns_series")
    .select("queue_order")
    .eq("status", "queued")
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
