"use client";

import { useState, useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { ToastProvider } from "@/components/common/ToastProvider";
import { SITE_CONFIG } from "@/lib/constants/site";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // hydration後にlocalStorageから状態を復元（mismatch回避）
  // モバイル（sm未満）では初期値を常に閉じた状態にする
  useEffect(() => {
    const isMobile = !window.matchMedia("(min-width: 640px)").matches;
    if (isMobile) {
      setSidebarOpen(false);
      return;
    }
    const stored = localStorage.getItem("sidebar_open");
    if (stored !== null) {
      setSidebarOpen(stored === "true");
    }
  }, []);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_open", String(next));
      return next;
    });
  };

  return (
    <SessionProvider>
      <ToastProvider>
      <div className="flex min-h-screen bg-surface text-on-surface">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 bg-surface-container-low min-w-0 overflow-y-auto flex flex-col">
          <AdminHeader onToggleSidebar={handleToggleSidebar} sidebarOpen={sidebarOpen} />
          <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">{children}</div>
          <footer className="mt-auto py-6 px-8 text-center">
            <p className="font-label text-xs tracking-wider text-slate-600">
              &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
            </p>
          </footer>
        </main>
      </div>
      </ToastProvider>
    </SessionProvider>
  );
}
