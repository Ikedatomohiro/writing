import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/api-auth";
import { createServerClient } from "@/lib/supabase/server";
import { X_CHAR_LIMIT, countXChars } from "@/lib/types/x";
import type { XSeries, XPost, UpdateXPostRequest } from "@/lib/types/x";

type RouteParams = { params: Promise<{ id: string; postId: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id, postId } = await params;
  const supabase = createServerClient();

  const { data: existing, error: fetchError } = await supabase
    .from("x_series")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Series not found" }, { status: 404 });
  }

  if ((existing as XSeries).is_posted) {
    return NextResponse.json(
      { error: "Cannot modify a posted series" },
      { status: 409 }
    );
  }

  let body: UpdateXPostRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.text !== undefined && countXChars(body.text) > X_CHAR_LIMIT) {
    return NextResponse.json(
      { error: `Text must be ${X_CHAR_LIMIT} characters or less` },
      { status: 422 }
    );
  }

  const { data: updated, error: updateError } = await supabase
    .from("x_posts")
    .update(body)
    .eq("id", postId)
    .eq("series_id", id)
    .select()
    .single();

  if (updateError || !updated) {
    return NextResponse.json(
      { error: updateError?.message ?? "Failed to update post" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: updated as XPost });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id, postId } = await params;
  const supabase = createServerClient();

  const { data: series, error: seriesFetchError } = await supabase
    .from("x_series")
    .select("*")
    .eq("id", id)
    .single();

  if (seriesFetchError || !series) {
    return NextResponse.json({ error: "Series not found" }, { status: 404 });
  }

  if ((series as XSeries).is_posted) {
    return NextResponse.json(
      { error: "Cannot modify a posted series" },
      { status: 409 }
    );
  }

  const { data: post, error: postFetchError } = await supabase
    .from("x_posts")
    .select("*")
    .eq("id", postId)
    .eq("series_id", id)
    .single();

  if (postFetchError || !post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if ((post as XPost).position === 0) {
    return NextResponse.json(
      { error: "Cannot delete the parent post (position 0)" },
      { status: 400 }
    );
  }

  const { error: deleteError } = await supabase
    .from("x_posts")
    .delete()
    .eq("id", postId)
    .eq("series_id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ data: { id: postId } });
}
