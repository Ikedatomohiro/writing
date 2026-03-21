import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * API route handler で認証を要求するヘルパー関数。
 * 未認証の場合は 401 レスポンスを返し、認証済みの場合は null を返す。
 */
export async function requireAuth(): Promise<NextResponse | null> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
