"use client";

import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/articles": "Articles",
  "/articles/new": "New Post",
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
}: {
  onToggleSidebar: () => void;
}) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-surface-container-lowest border-b border-outline-variant/15">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          aria-label="サイドバーを開閉"
          className="p-2 rounded-lg hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-on-surface-variant">
            menu
          </span>
        </button>
        <h2 className="text-xl font-extrabold tracking-tight font-headline">
          {title}
        </h2>
      </div>
      <div className="relative">
        <label className="sr-only" htmlFor="admin-search">リソースを検索</label>
        <span
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined text-lg"
        >
          search
        </span>
        <input
          id="admin-search"
          type="text"
          placeholder="Search resources..."
          className="pl-10 pr-4 py-2 bg-surface-container border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </header>
  );
}
