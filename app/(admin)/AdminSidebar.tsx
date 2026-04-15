"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ComponentType, type SVGProps } from "react";
import { SITE_CONFIG } from "@/lib/constants/site";
import {
  DashboardIcon,
  ArticleIcon,
  ThreadsIcon,
  XIcon,
  LogoutIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/icons/NavIcons";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const NAV_ITEMS: { Icon: IconComponent; label: string; href: string }[] = [
  { Icon: DashboardIcon, label: "ダッシュボード", href: "/dashboard" },
  { Icon: ArticleIcon, label: "記事", href: "/articles" },
  { Icon: ThreadsIcon, label: "Threads", href: "/threads" },
  { Icon: XIcon, label: "X", href: "/x" },
];

export function AdminSidebar({
  open,
  collapsed,
  onClose,
  onToggleCollapsed,
}: {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapsed: () => void;
}) {
  const pathname = usePathname();
  const firstNavRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open && window.matchMedia("(max-width: 639px)").matches) {
      const timer = setTimeout(() => firstNavRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const widthClass = collapsed ? "sm:w-16" : "sm:w-60";
  const showLabels = !collapsed;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 sm:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}
      <aside
        id="admin-sidebar"
        data-testid="admin-sidebar"
        role={open ? "dialog" : undefined}
        aria-modal={open ? "true" : undefined}
        aria-label="メインナビゲーション"
        className={[
          "h-screen border-r border-slate-200 bg-slate-50 flex-col py-4 px-2 shrink-0 transition-[width,transform] duration-200 ease-out",
          "w-60",
          widthClass,
          "sm:sticky sm:top-0 sm:flex sm:translate-x-0",
          "fixed inset-y-0 left-0 z-50",
          open ? "flex translate-x-0" : "hidden -translate-x-full sm:flex sm:translate-x-0",
        ].join(" ")}
      >
        {/* ヘッダー: ブランド + 折りたたみトグル */}
        <div className={`flex items-center gap-2 px-2 mb-6 ${collapsed ? "sm:justify-center" : "justify-between"}`}>
          {showLabels && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-slate-900 font-headline truncate">
                {SITE_CONFIG.name}
              </h1>
              <p className="text-[10px] text-slate-500 font-label uppercase tracking-widest">
                Admin
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "サイドバーを展開" : "サイドバーを折りたたむ"}
            title={collapsed ? "展開" : "折りたたむ"}
            className="hidden sm:inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </button>
        </div>

        <nav className="flex-1 space-y-1" aria-label="メインメニュー">
          {NAV_ITEMS.map(({ Icon, label, href }, i) => {
            const isActive = pathname === href || pathname?.startsWith(href + "/");
            return (
              <Link
                key={label}
                href={href}
                ref={i === 0 ? firstNavRef : undefined}
                aria-current={isActive ? "page" : undefined}
                title={collapsed ? label : undefined}
                className={[
                  "group relative flex items-center rounded-xl min-h-[44px] text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  collapsed ? "sm:justify-center sm:px-0" : "gap-3 px-3",
                  "px-3 gap-3",
                  isActive
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60",
                ].join(" ")}
              >
                <Icon className="shrink-0" />
                {showLabels && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-1 pt-4 border-t border-slate-200">
          <Link
            href="/articles/new"
            title={collapsed ? "新規記事" : undefined}
            className={[
              "w-full mb-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm flex items-center min-h-[44px] shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              collapsed ? "sm:justify-center sm:px-0" : "justify-center gap-2 px-3",
              "justify-center gap-2 px-3",
            ].join(" ")}
          >
            <PlusIcon className="shrink-0" />
            {showLabels && <span>新規記事</span>}
          </Link>
          <Link
            href="/login"
            title={collapsed ? "ログアウト" : undefined}
            className={[
              "w-full flex items-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 min-h-[44px] text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              collapsed ? "sm:justify-center sm:px-0" : "gap-3 px-3",
              "gap-3 px-3",
            ].join(" ")}
          >
            <LogoutIcon className="shrink-0" />
            {showLabels && <span>ログアウト</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
