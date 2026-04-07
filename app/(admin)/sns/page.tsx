"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/sns/StatusBadge";
import type { SnsSeriesWithPosts, SnsPost, SnsSeriesStatus } from "@/lib/types/sns";

export default function SnsPage() {
  const [series, setSeries] = useState<SnsSeriesWithPosts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SnsSeriesStatus | "all" | "posted">("draft");

  const loadSeries = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/sns/series");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setSeries(json.data ?? []);
    } catch {
      setError("シリーズの読み込みに失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSeries();
  }, [loadSeries]);

  const handleDelete = async (id: string) => {
    if (!confirm("このシリーズを削除しますか？")) return;
    try {
      await fetch(`/api/sns/series/${id}`, { method: "DELETE" });
      setSeries((prev) => prev.filter((s) => s.id !== id));
    } catch {
      // ignore
    }
  };

  const baseFiltered =
    activeTab === "all"
      ? series
      : activeTab === "posted"
      ? series.filter((s) => s.is_posted)
      : series.filter((s) => s.status === activeTab && !s.is_posted);

  const filteredSeries =
    activeTab === "queued"
      ? [...baseFiltered].sort((a, b) => (a.queue_order ?? 0) - (b.queue_order ?? 0))
      : baseFiltered;

  const handleMove = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === filteredSeries.length - 1) return;

    const newQueued = [...filteredSeries];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newQueued[index], newQueued[swapIndex]] = [newQueued[swapIndex], newQueued[index]];

    setSeries((prev) => {
      const nonQueued = prev.filter((s) => s.status !== "queued" || s.is_posted);
      return [...nonQueued, ...newQueued];
    });

    await fetch("/api/sns/queue/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ series_ids: newQueued.map((s) => s.id) }),
    });
  };

  const uniqueTabs: Array<{ label: string; value: SnsSeriesStatus | "all" | "posted" }> = [
    { label: "all", value: "all" },
    { label: "draft", value: "draft" },
    { label: "queued", value: "queued" },
    { label: "posted", value: "posted" },
  ];

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-headline text-on-surface">SNS管理</h2>
        <Link
          href="/sns/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          新規作成
        </Link>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {uniqueTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-slate-500">読み込み中...</p>
      ) : filteredSeries.length === 0 ? (
        <p className="text-slate-500">シリーズがありません</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredSeries.map((s, index) => (
            <SeriesCard
              key={s.id}
              series={s}
              onDelete={handleDelete}
              index={activeTab === "queued" ? index : undefined}
              isFirst={index === 0}
              isLast={index === filteredSeries.length - 1}
              onMove={activeTab === "queued" ? handleMove : undefined}
            />
          ))}
        </div>
      )}
    </>
  );
}

function SeriesCard({
  series,
  onDelete,
  index,
  isFirst,
  isLast,
  onMove,
}: {
  series: SnsSeriesWithPosts;
  onDelete: (id: string) => void;
  index?: number;
  isFirst?: boolean;
  isLast?: boolean;
  onMove?: (index: number, direction: "up" | "down") => void;
}) {
  const parentPost: SnsPost | undefined = series.posts?.find((p) => p.position === 0);
  const isQueued = onMove !== undefined && index !== undefined;

  return (
    <div className="relative flex items-stretch gap-2">
      {/* 並び替えボタン (queued時のみ) */}
      {isQueued && (
        <div className="flex flex-col justify-center gap-0.5">
          <button
            onClick={() => onMove(index, "up")}
            disabled={isFirst}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20"
            aria-label="上に移動"
          >
            <span className="material-symbols-outlined text-base">arrow_upward</span>
          </button>
          <button
            onClick={() => onMove(index, "down")}
            disabled={isLast}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20"
            aria-label="下に移動"
          >
            <span className="material-symbols-outlined text-base">arrow_downward</span>
          </button>
        </div>
      )}

      <div className="relative flex-1">
        <Link
          href={`/sns/${series.id}`}
          className="bg-white border border-slate-200 rounded-xl px-4 py-4 pr-12 flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4 sm:px-5 hover:shadow-sm hover:border-blue-200 transition-all cursor-pointer"
        >
          {/* メタ情報 */}
          <div className="sm:w-44 sm:shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={series.status} isPosted={series.is_posted} />
              {series.pattern && (
                <p className="text-xs text-slate-400 truncate sm:hidden">{series.pattern}</p>
              )}
            </div>
            <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 leading-snug">
              {series.theme ?? "（テーマなし）"}
            </h3>
            {series.pattern && (
              <p className="hidden sm:block text-xs text-slate-400 mt-0.5 truncate">{series.pattern}</p>
            )}
            {series.quality_score != null && (
              <p className="text-xs text-slate-400 mt-0.5">
                スコア: <span className="font-medium text-slate-600">{series.quality_score}</span>
              </p>
            )}
          </div>

          {/* 投稿テキストプレビュー */}
          <div className="flex-1 min-w-0">
            {parentPost?.text ? (
              <p className="text-sm text-slate-600 truncate leading-relaxed">
                {parentPost.text.split('\n').find(l => l.trim()) ?? ''}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">投稿なし</p>
            )}
          </div>
        </Link>

        {/* 削除ボタン */}
        {!series.is_posted && (
          <button
            onClick={(e) => { e.preventDefault(); onDelete(series.id); }}
            className="absolute right-3 top-3 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors"
            aria-label="削除"
          >
            <span className="material-symbols-outlined text-base">delete</span>
          </button>
        )}
      </div>
    </div>
  );
}
