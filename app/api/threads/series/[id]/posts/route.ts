import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/api-auth";
import { createServerClient } from "@/lib/supabase/server";
import type { SnsSeries, SnsPost } from "@/lib/types/sns";

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

  let body: { text: string; type?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { data: maxPositionData } = await supabase
    .from("sns_posts")
    .select("position")
    .eq("series_id", id)
    .order("position", { ascending: false })
    .limit(1);

  const maxPosition =
    maxPositionData && maxPositionData.length > 0
      ? (maxPositionData[0] as { position: number }).position
      : -1;

  const { data: newPost, error: insertError } = await supabase
    .from("sns_posts")
    .insert({
      series_id: id,
      position: maxPosition + 1,
      text: body.text,
      type: body.type ?? "normal",
    })
    .select()
    .single();

  if (insertError || !newPost) {
    return NextResponse.json(
      { error: insertError?.message ?? "Failed to create post" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: newPost as SnsPost }, { status: 201 });
}
