"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { icon: "dashboard", label: "Dashboard", href: "/dashboard" },
  { icon: "article", label: "Articles", href: "/articles" },
  { icon: "forum", label: "Threads", href: "/threads" },
  { icon: "alternate_email", label: "X", href: "/x" },
] as const;

export function AdminSidebar({ open }: { open: boolean }) {
  const pathname = usePathname();

  return (
    <>
      {/* モバイル: open時にオーバーレイ背景 */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 sm:hidden"
          aria-hidden="true"
        />
      )}
      <aside
        data-testid="admin-sidebar"
        className={`h-screen w-64 border-r border-slate-200 bg-slate-50 flex-col py-6 px-4 shrink-0 sticky top-0 hidden sm:flex${open ? " !flex fixed inset-y-0 left-0 z-50 sm:static sm:z-auto" : ""}`}
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
        <SidebarLink icon="account_circle" label="Account" disabled />
        <SidebarLink icon="help" label="Help" disabled />
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

function SidebarLink({ icon, label, disabled = false }: { icon: string; label: string; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      aria-disabled={disabled ? "true" : undefined}
      className={`w-full flex items-center gap-3 p-3 transition-all font-medium text-sm${disabled ? " text-slate-300 opacity-40 cursor-not-allowed" : " text-slate-500 hover:text-slate-900"}`}
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
