"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/sns/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import type { SnsSeriesWithPosts, SnsPost, SnsSeriesStatus } from "@/lib/types/sns";

function formatCreatedAt(iso: string): string {
  return new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tokyo",
  });
}

export default function SnsPage() {
  const [series, setSeries] = useState<SnsSeriesWithPosts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SnsSeriesStatus | "all" | "posted">("draft");

  useEffect(() => {
    const stored = sessionStorage.getItem("threads_active_tab");
    if (stored) {
      setActiveTab(stored as SnsSeriesStatus | "all" | "posted");
    }
  }, []);

  const handleTabChange = (tab: SnsSeriesStatus | "all" | "posted") => {
    setActiveTab(tab);
    sessionStorage.setItem("threads_active_tab", tab);
  };

  const loadSeries = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/threads/series");
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
      await fetch(`/api/threads/series/${id}`, { method: "DELETE" });
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

    // queue_orderを位置に合わせて更新（ソート時に正しい順序を保つ）
    const reordered = newQueued.map((s, i) => ({ ...s, queue_order: i + 1 }));

    setSeries((prev) => {
      const nonQueued = prev.filter((s) => s.status !== "queued" || s.is_posted);
      return [...nonQueued, ...reordered];
    });

    const res = await fetch("/api/threads/queue/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ series_ids: reordered.map((s) => s.id) }),
    });

    if (!res.ok) {
      // API失敗時はDBの実際の状態に戻す
      loadSeries();
    }
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
        <h2 className="text-2xl font-bold font-headline text-on-surface">Threads管理</h2>
        <Link
          href="/threads/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span className="hidden sm:inline">新規作成</span>
        </Link>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {uniqueTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
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
        <EmptyState
          title="まだ投稿はありません"
          description="新しいシリーズを作成してThreadsに投稿しましょう"
          ctaHref="/threads/new"
          ctaLabel="最初の投稿を作成"
        />
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
  const childCount = series.posts?.filter((p) => p.position > 0).length ?? 0;
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
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 17a1 1 0 01-1-1V6.414L5.707 9.707a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L11 6.414V16a1 1 0 01-1 1z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => onMove(index, "down")}
            disabled={isLast}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20"
            aria-label="下に移動"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v9.586l3.293-3.293a1 1 0 011.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 011.414-1.414L9 13.586V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      <div className="relative flex-1 min-w-0">
        <Link
          href={`/threads/${series.id}`}
          className="bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-4 sm:px-5 sm:py-4 hover:shadow-sm hover:border-blue-200 transition-all cursor-pointer overflow-hidden"
        >
          {/* メタ情報 */}
          <div className="flex items-center gap-2 sm:w-44 sm:shrink-0 sm:flex-col sm:items-start sm:gap-0">
            <div className="flex items-center gap-2 sm:mb-1">
              <StatusBadge status={series.status} isPosted={series.is_posted} />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm leading-snug truncate min-w-0 flex-1 sm:flex-none sm:line-clamp-2 sm:whitespace-normal">
              {series.theme ?? "（テーマなし）"}
            </h3>
            <p className="hidden sm:block text-xs text-slate-400 mt-0.5">
              {formatCreatedAt(series.created_at)}
            </p>
            {series.quality_score != null && (
              <p className="hidden sm:block text-xs text-slate-400 mt-0.5">
                スコア: <span className="font-medium text-slate-600">{series.quality_score}</span>
              </p>
            )}
          </div>

          {/* 投稿テキストプレビュー＋子投稿数 */}
          <div className="flex-1 min-w-0">
            {parentPost?.text ? (
              <p className="text-sm text-slate-600 truncate leading-relaxed">
                {parentPost.text.split('\n').find(l => l.trim()) ?? ''}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">投稿なし</p>
            )}
            {childCount > 0 && (
              <p className="text-xs text-slate-400 mt-0.5">子投稿 {childCount}件</p>
            )}
          </div>
        </Link>

        {/* 削除ボタン */}
        {!series.is_posted && (
          <button
            onClick={(e) => { e.preventDefault(); onDelete(series.id); }}
            className="absolute right-2 top-2 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors"
            aria-label="削除"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
