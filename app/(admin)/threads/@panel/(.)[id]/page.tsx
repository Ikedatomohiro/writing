"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ThreadsSeriesEditor } from "@/components/sns/ThreadsSeriesEditor";

export default function ThreadsPanelPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <>
      <div
        onClick={() => router.back()}
        className="fixed inset-0 z-40 bg-black/40 md:bg-black/20"
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="シリーズ編集"
        className="fixed inset-0 z-50 bg-white overflow-y-auto md:inset-y-0 md:right-0 md:left-auto md:w-[min(640px,50vw)] md:shadow-2xl md:border-l md:border-slate-200"
      >
        <div className="p-4 sm:p-6">
          <ThreadsSeriesEditor seriesId={id} onClose={() => router.back()} />
        </div>
      </aside>
    </>
  );
}
