"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { icon: "dashboard", label: "Dashboard", href: "/dashboard" },
  { icon: "article", label: "All Posts", href: "/articles" },
  { icon: "monitoring", label: "Analytics", href: "/articles" },
  { icon: "category", label: "Categories", href: "/articles" },
  { icon: "forum", label: "Threads", href: "/sns" },
  { icon: "alternate_email", label: "X", href: "/x" },
  { icon: "settings", label: "Settings", href: "/articles" },
] as const;

export function AdminSidebar({ open }: { open: boolean }) {
  const pathname = usePathname();

  return (
    <aside
      data-testid="admin-sidebar"
      className={`h-screen w-64 border-r border-slate-200 bg-slate-50 flex flex-col py-6 px-4 shrink-0 sticky top-0${open ? "" : " hidden"}`}
    >
      <div className="mb-10 px-3">
        <h1 className="text-lg font-bold text-slate-900 font-headline">
          Editorial Admin
        </h1>
        <p className="text-xs text-slate-500 font-label uppercase tracking-widest mt-1">
          System Manager
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
          New Post
        </Link>
        <SidebarLink icon="account_circle" label="Account" />
        <SidebarLink icon="help" label="Help" />
        <SidebarLink icon="logout" label="Logout" />
      </div>
    </aside>
  );
}

function SidebarLink({ icon, label }: { icon: string; label: string }) {
  return (
    <button className="w-full flex items-center gap-3 text-slate-500 p-3 hover:text-slate-900 transition-all font-medium text-sm">
      <span className="material-symbols-outlined">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
