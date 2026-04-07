import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/api-auth";
import { createServerClient } from "@/lib/supabase/server";
import type {
  SnsSeries,
  SnsSeriesWithPosts,
  SnsSeriesStatus,
  CreateSeriesRequest,
} from "@/lib/types/sns";

export async function GET(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as SnsSeriesStatus | null;

  let query = supabase
    .from("sns_series")
    .select("*, sns_posts(*)")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status) as typeof query;
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data as SnsSeries[] });
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  let body: CreateSeriesRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { posts, ...seriesFields } = body;

  const { data: series, error: seriesError } = await supabase
    .from("sns_series")
    .insert(seriesFields)
    .select()
    .single();

  if (seriesError || !series) {
    return NextResponse.json(
      { error: seriesError?.message ?? "Failed to create series" },
      { status: 500 }
    );
  }

  let insertedPosts = [];

  if (posts && posts.length > 0) {
    const postsToInsert = posts.map((p) => ({
      series_id: (series as SnsSeries).id,
      position: p.position,
      text: p.text,
      type: p.type ?? "normal",
    }));

    const { data: postsData, error: postsError } = await supabase
      .from("sns_posts")
      .insert(postsToInsert)
      .select();

    if (postsError) {
      return NextResponse.json({ error: postsError.message }, { status: 500 });
    }

    insertedPosts = postsData ?? [];
  }

  const result: SnsSeriesWithPosts = {
    ...(series as SnsSeries),
    posts: insertedPosts,
  };

  return NextResponse.json({ data: result }, { status: 201 });
}
