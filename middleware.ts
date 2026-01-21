import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnArticles = req.nextUrl.pathname.startsWith("/articles");
  const isOnLogin = req.nextUrl.pathname === "/login";
  const isOnAuthApi = req.nextUrl.pathname.startsWith("/api/auth");

  // 認証APIはそのまま通す
  if (isOnAuthApi) {
    return NextResponse.next();
  }

  // /articles/* へのアクセスは認証が必要
  if (isOnArticles && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // ログイン済みユーザーが /login にアクセスした場合は /articles にリダイレクト
  if (isOnLogin && isLoggedIn) {
    return NextResponse.redirect(new URL("/articles", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/articles/:path*", "/login", "/api/auth/:path*"],
};
