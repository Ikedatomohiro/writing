"use client";

import { useEffect, useState, useCallback } from "react";
import type { SnsSeriesWithPosts } from "@/lib/types/sns";

export default function QueuePage() {
  const [series, setSeries] = useState<SnsSeriesWithPosts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/sns/queue");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setSeries(json.data ?? []);
    } catch {
      setError("キューの読み込みに失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMove = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === series.length - 1) return;

    const newSeries = [...series];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newSeries[index], newSeries[swapIndex]] = [newSeries[swapIndex], newSeries[index]];
    setSeries(newSeries);

    await fetch("/api/sns/queue/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ series_ids: newSeries.map((s) => s.id) }),
    });
  };

  if (isLoading) return <p className="text-slate-500">読み込み中...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-headline text-on-surface">キュー管理</h2>
      </div>

      {series.length === 0 ? (
        <p className="text-slate-500">キューにシリーズがありません</p>
      ) : (
        <div className="space-y-3">
          {series.map((s, index) => {
            const scheduledHours = (s.queue_order ?? index + 1) * 2;
            const scheduledTime = new Date(Date.now() + scheduledHours * 3600 * 1000);

            return (
              <div
                key={s.id}
                className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
              >
                <span className="text-2xl font-bold text-slate-300 w-8 text-center">
                  {index + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 text-sm truncate">
                    {s.theme ?? "（テーマなし）"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {s.posts.length}投稿
                  </p>
                  <p
                    data-testid="scheduled-time"
                    className="text-xs text-slate-400 mt-0.5"
                  >
                    予定: {scheduledTime.toLocaleString("ja-JP", { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" })}頃
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0}
                    className="p-1 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                    aria-label="上に移動"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_upward</span>
                  </button>
                  <button
                    onClick={() => handleMove(index, "down")}
                    disabled={index === series.length - 1}
                    className="p-1 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                    aria-label="下に移動"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_downward</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
