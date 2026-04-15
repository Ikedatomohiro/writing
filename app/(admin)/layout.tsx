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
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar_collapsed");
    if (stored !== null) setSidebarCollapsed(stored === "true");
  }, []);

  const handleToggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleToggleCollapsed = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  };

  return (
    <SessionProvider>
      <ToastProvider>
      <div className="flex min-h-screen bg-surface text-on-surface">
        <AdminSidebar
          open={sidebarOpen}
          collapsed={sidebarCollapsed}
          onClose={() => setSidebarOpen(false)}
          onToggleCollapsed={handleToggleCollapsed}
        />
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
