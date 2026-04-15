"use client";

import { usePathname } from "next/navigation";
import { MenuIcon } from "@/components/icons/NavIcons";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "ダッシュボード",
  "/articles": "記事一覧",
  "/articles/new": "新規記事",
  "/threads": "Threads",
  "/threads/new": "新規Threads投稿",
  "/x": "X",
  "/x/new": "新規X投稿",
};

function getPageTitle(pathname: string | null): string {
  if (!pathname) return "Dashboard";
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/threads/")) return "Threads";
  if (pathname.startsWith("/x/")) return "X";
  if (pathname.startsWith("/articles/")) return "Articles";
  return "Dashboard";
}

export function AdminHeader({
  onToggleSidebar,
  sidebarOpen = false,
}: {
  onToggleSidebar: () => void;
  sidebarOpen?: boolean;
}) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="h-16 flex items-center px-4 sm:px-8 bg-surface-container-lowest border-b border-outline-variant/15">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="メニューを開く"
          aria-expanded={sidebarOpen}
          aria-controls="admin-sidebar"
          className="sm:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-surface-container transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <MenuIcon />
        </button>
        <h2 className="text-lg sm:text-xl font-extrabold tracking-tight font-headline">
          {title}
        </h2>
      </div>
    </header>
  );
}
