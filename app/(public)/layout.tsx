import type { ReactNode } from "react";
import { BlogHeader } from "@/components/layout/BlogHeader/BlogHeader";
import { Footer } from "@/components/layout/Footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <BlogHeader />
      <main className="pt-24 pb-20">{children}</main>
      <Footer />
    </div>
  );
}
