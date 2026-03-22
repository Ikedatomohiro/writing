import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/api-auth";
import { getPageViewRanking } from "@/lib/analytics/client";

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  const data = await getPageViewRanking();
  return NextResponse.json(data);
}
