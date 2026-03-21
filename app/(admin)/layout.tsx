"use client";

import { SessionProvider } from "next-auth/react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-surface text-on-surface">
        <AdminSidebar />
        <main className="flex-1 bg-surface-container-low min-w-0 overflow-y-auto">
          <AdminHeader />
          <div className="p-8 max-w-7xl mx-auto space-y-8">{children}</div>
        </main>
      </div>
    </SessionProvider>
  );
}
