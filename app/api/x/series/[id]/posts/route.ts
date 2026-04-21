import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/api-auth";
import { createServerClient } from "@/lib/supabase/server";
import { X_CHAR_LIMIT, countXChars } from "@/lib/types/x";
import type { XSeries, XPost } from "@/lib/types/x";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
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

  let body: { text: string; source_url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.text !== "string" || body.text.length === 0) {
    return NextResponse.json(
      { error: "text is required" },
      { status: 400 }
    );
  }

  if (countXChars(body.text) > X_CHAR_LIMIT) {
    return NextResponse.json(
      { error: `Text must be ${X_CHAR_LIMIT} characters or less` },
      { status: 422 }
    );
  }

  const { data: maxPositionData } = await supabase
    .from("x_posts")
    .select("position")
    .eq("series_id", id)
    .order("position", { ascending: false })
    .limit(1);

  const maxPosition =
    maxPositionData && maxPositionData.length > 0
      ? (maxPositionData[0] as { position: number }).position
      : -1;

  const { data: newPost, error: insertError } = await supabase
    .from("x_posts")
    .insert({
      series_id: id,
      position: maxPosition + 1,
      text: body.text,
      source_url: body.source_url ?? null,
    })
    .select()
    .single();

  if (insertError || !newPost) {
    return NextResponse.json(
      { error: insertError?.message ?? "Failed to create post" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: newPost as XPost }, { status: 201 });
}
