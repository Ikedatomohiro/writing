import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/api-auth";
import { createServerClient } from "@/lib/supabase/server";
import type { XSeriesWithPosts } from "@/lib/types/x";

export async function GET(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const account = searchParams.get("account");

  const supabase = createServerClient();

  let query = supabase
    .from("x_series")
    .select("*, posts:x_posts(*)")
    .eq("status", "queued")
    .order("queue_order", { ascending: true });

  if (account) {
    query = query.eq("account", account) as typeof query;
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data as XSeriesWithPosts[] });
}
