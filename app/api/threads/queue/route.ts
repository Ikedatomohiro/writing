import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/api-auth";
import { createServerClient } from "@/lib/supabase/server";
import type { SnsSeriesWithPosts } from "@/lib/types/sns";

const THREADS_ACCOUNTS = ["pao-pao-cho", "matsumoto_sho", "morita_rin"] as const;
type ThreadsAccount = typeof THREADS_ACCOUNTS[number];

function isThreadsAccount(value: string | null): value is ThreadsAccount {
  return !!value && (THREADS_ACCOUNTS as readonly string[]).includes(value);
}

export async function GET(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const account = searchParams.get("account");

  if (account !== null && !isThreadsAccount(account)) {
    return NextResponse.json(
      { error: `Invalid account: ${account}` },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  let query = supabase
    .from("sns_series")
    .select("*, posts:sns_posts(*)")
    .eq("status", "queued")
    .order("queue_order", { ascending: true });

  if (isThreadsAccount(account)) {
    query = query.eq("account", account) as typeof query;
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data as SnsSeriesWithPosts[] });
}
