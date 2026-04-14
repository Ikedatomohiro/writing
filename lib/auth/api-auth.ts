import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * API route handler で認証を要求するヘルパー関数。
 * 未認証の場合は 401 レスポンスを返し、認証済みの場合は null を返す。
 * E2E_BYPASS_AUTH=1 の場合は認証をスキップする（開発・E2Eテスト用）。
 */
export async function requireAuth(): Promise<NextResponse | null> {
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.E2E_BYPASS_AUTH === "1"
  ) {
    return null;
  }
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
