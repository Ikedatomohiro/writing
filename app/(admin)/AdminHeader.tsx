"use client";

import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/articles": "Dashboard Overview",
  "/articles/new": "New Post",
};

export function AdminHeader() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || "Dashboard Overview";

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-surface-container-lowest border-b border-outline-variant/15">
      <h2 className="text-xl font-extrabold tracking-tight font-headline">
        {title}
      </h2>
      <div className="flex items-center gap-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Search resources..."
            className="pl-10 pr-4 py-2 bg-surface-container border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/30 flex items-center justify-center">
          <span className="material-symbols-outlined text-on-surface-variant text-lg">
            account_circle
          </span>
        </div>
      </div>
    </header>
  );
}
