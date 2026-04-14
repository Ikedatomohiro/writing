import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/api-auth";
import { createServerClient } from "@/lib/supabase/server";
import type { XSeries, XSeriesWithPosts, UpdateXSeriesRequest } from "@/lib/types/x";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("x_series")
    .select("*, posts:x_posts(*)")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Series not found" }, { status: 404 });
  }

  return NextResponse.json({ data: data as XSeriesWithPosts });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

  let body: UpdateXSeriesRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { data: updated, error: updateError } = await supabase
    .from("x_series")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (updateError || !updated) {
    return NextResponse.json(
      { error: updateError?.message ?? "Failed to update series" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: updated as XSeries });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
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
      { error: "Cannot delete a posted series" },
      { status: 409 }
    );
  }

  const { error: deleteError } = await supabase
    .from("x_series")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ data: { id } });
}
