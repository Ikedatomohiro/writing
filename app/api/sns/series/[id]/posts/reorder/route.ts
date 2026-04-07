import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/api-auth";
import { createServerClient } from "@/lib/supabase/server";
import type { SnsSeries, SnsPost, ReorderPostsRequest } from "@/lib/types/sns";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const supabase = createServerClient();

  const { data: existing, error: fetchError } = await supabase
    .from("sns_series")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Series not found" }, { status: 404 });
  }

  if ((existing as SnsSeries).is_posted) {
    return NextResponse.json(
      { error: "Cannot modify a posted series" },
      { status: 409 }
    );
  }

  let body: ReorderPostsRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updatedPosts: SnsPost[] = [];

  for (let i = 0; i < body.post_ids.length; i++) {
    const postId = body.post_ids[i];
    const { data: updated, error: updateError } = await supabase
      .from("sns_posts")
      .update({ position: i })
      .eq("id", postId)
      .eq("series_id", id)
      .select()
      .single();

    if (updateError || !updated) {
      return NextResponse.json(
        { error: updateError?.message ?? `Failed to update post ${postId}` },
        { status: 500 }
      );
    }

    updatedPosts.push(updated as SnsPost);
  }

  return NextResponse.json({ data: updatedPosts });
}
