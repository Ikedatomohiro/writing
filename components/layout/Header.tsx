"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export function Header() {
  const { data: session } = useSession();

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="bg-surface-container-low border-b border-outline-variant/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Link href="/articles" className="font-headline font-bold text-lg text-on-surface">
            記事管理システム
          </Link>
          {session?.user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-on-surface-variant">
                {session.user.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container transition-colors"
              >
                ログアウト
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
