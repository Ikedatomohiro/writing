import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/api-auth";
import { createServerClient } from "@/lib/supabase/server";
import type { SnsSeries, ReorderQueueRequest } from "@/lib/types/sns";

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  let body: ReorderQueueRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { series_ids } = body;
  const supabase = createServerClient();

  const { data: seriesList, error: fetchError } = await supabase
    .from("sns_series")
    .select("*")
    .in("id", series_ids);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  const postedSeries = (seriesList as SnsSeries[]).filter((s) => s.is_posted);
  if (postedSeries.length > 0) {
    return NextResponse.json(
      { error: "Cannot reorder queue containing posted series" },
      { status: 400 }
    );
  }

  const updatedSeries: SnsSeries[] = [];

  for (let i = 0; i < series_ids.length; i++) {
    const seriesId = series_ids[i];
    const { data: updated, error: updateError } = await supabase
      .from("sns_series")
      .update({ queue_order: i + 1 })
      .eq("id", seriesId)
      .select()
      .single();

    if (updateError || !updated) {
      return NextResponse.json(
        { error: updateError?.message ?? `Failed to update series ${seriesId}` },
        { status: 500 }
      );
    }

    updatedSeries.push(updated as SnsSeries);
  }

  return NextResponse.json({ data: updatedSeries });
}
