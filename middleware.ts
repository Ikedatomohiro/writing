import { auth } from "@/auth";
import { NextResponse } from "next/server";

// 認証が必要な管理画面のパス接頭辞。
// 公開ブログ経路（[category] = /asset, /tech, /health 等・/about・/tag 等）は
// 絶対に含めないこと（含めると公開サイトがログイン必須になり壊れる）。
const PROTECTED_PREFIXES = [
  "/articles",
  "/dashboard",
  "/threads",
  "/x",
  "/insights",
];

// 接頭辞の完全セグメント一致（/x が /xyz を巻き込まないようにする）。
function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );
}

export default auth((req) => {
  // E2Eテスト用認証バイパス（dev環境かつE2E_BYPASS_AUTH=1のみ有効）
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.E2E_BYPASS_AUTH === "1"
  ) {
    return NextResponse.next();
  }

  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // 認証APIはそのまま通す
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // ログイン済みユーザーが /login にアクセスした場合は /articles にリダイレクト
  if (pathname === "/login") {
    return isLoggedIn
      ? NextResponse.redirect(new URL("/articles", req.nextUrl))
      : NextResponse.next();
  }

  // 保護パスへの未認証アクセスは /login へ
  if (isProtectedPath(pathname) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // 公開ブログ経路は列挙しない。保護ページ・保護 API・認証 API のみを対象にする。
  matcher: [
    "/articles/:path*",
    "/dashboard/:path*",
    "/threads/:path*",
    "/x/:path*",
    "/insights/:path*",
    "/login",
    "/api/auth/:path*",
    "/api/articles/:path*",
    "/api/analytics/:path*",
    "/api/insights/:path*",
  ],
};
