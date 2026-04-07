import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/api-auth";
import { createServerClient } from "@/lib/supabase/server";
import type { SnsSeriesWithPosts } from "@/lib/types/sns";

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("sns_series")
    .select("*, posts:sns_posts(*)")
    .eq("status", "queued")
    .order("queue_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data as SnsSeriesWithPosts[] });
}
