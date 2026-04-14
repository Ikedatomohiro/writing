"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { SITE_CONFIG } from "@/lib/constants/site";

const NAV_ITEMS = [
  { icon: "dashboard", label: "ダッシュボード", href: "/dashboard" },
  { icon: "article", label: "記事一覧", href: "/articles" },
  { icon: "forum", label: "Threads", href: "/threads" },
  { icon: "alternate_email", label: "X", href: "/x" },
] as const;

export function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <>
      {/* モバイル: open時にオーバーレイ背景 */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 sm:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}
      <aside
        data-testid="admin-sidebar"
        className={[
          "h-screen w-64 border-r border-slate-200 bg-slate-50 flex-col py-6 px-4 shrink-0 transition-transform duration-200",
          // デスクトップ: sticky push レイアウト（常に表示）
          "sm:sticky sm:top-0 sm:flex sm:translate-x-0",
          // モバイル: fixed overlay
          "fixed inset-y-0 left-0 z-50",
          open ? "flex translate-x-0" : "hidden -translate-x-full sm:flex sm:translate-x-0",
        ].join(" ")}
      >
      <div className="mb-10 px-3">
        <h1 className="text-lg font-bold text-slate-900 font-headline">
          {SITE_CONFIG.name} Admin
        </h1>
        <p className="text-xs text-slate-500 font-label uppercase tracking-widest mt-1">
          管理ダッシュボード
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={
                isActive
                  ? "flex items-center gap-3 bg-white text-blue-600 shadow-sm rounded-xl p-3 translate-x-1 transition-transform font-medium text-sm"
                  : "flex items-center gap-3 text-slate-500 p-3 hover:text-slate-900 hover:bg-slate-200/50 transition-all font-medium text-sm"
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1 pt-6 border-t border-slate-200">
        <Link
          href="/articles/new"
          className="w-full mb-4 bg-gradient-to-br from-primary to-primary-container text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          新規記事
        </Link>
        <Link
          href="/login"
          className="w-full flex items-center gap-3 text-slate-500 p-3 hover:text-slate-900 transition-all font-medium text-sm"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Logout</span>
        </Link>
      </div>
    </aside>
    </>
  );
}
