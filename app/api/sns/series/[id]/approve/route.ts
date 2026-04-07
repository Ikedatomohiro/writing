import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/api-auth";
import { createServerClient } from "@/lib/supabase/server";
import type { SnsSeries } from "@/lib/types/sns";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: RouteParams) {
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

  const { data: updated, error: updateError } = await supabase
    .from("sns_series")
    .update({ status: "approved", approved_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (updateError || !updated) {
    return NextResponse.json(
      { error: updateError?.message ?? "Failed to approve series" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: updated as SnsSeries });
}
