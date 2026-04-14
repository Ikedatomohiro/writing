"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useToastContext } from "@/components/common/ToastProvider";
import { StatusBadge } from "@/components/sns/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingIndicator } from "@/components/common/LoadingIndicator";
import { ErrorState } from "@/components/common/ErrorState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import type { SnsSeriesWithPosts, SnsPost, SnsSeriesStatus } from "@/lib/types/sns";

const PAGE_SIZE = 20;

function formatCreatedAt(iso: string): string {
  return new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tokyo",
  });
}

export default function SnsPage() {
  const { toast } = useToastContext();
  const [series, setSeries] = useState<SnsSeriesWithPosts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SnsSeriesStatus | "all" | "posted">("draft");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("threads_active_tab");
    if (stored) {
      setActiveTab(stored as SnsSeriesStatus | "all" | "posted");
    }
  }, []);

  const handleTabChange = (tab: SnsSeriesStatus | "all" | "posted") => {
    setActiveTab(tab);
    setCurrentPage(1);
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

  const handleDelete = (id: string) => {
    setDeleteTarget(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setDeleteTarget(null);
    try {
      await fetch(`/api/threads/series/${id}`, { method: "DELETE" });
      setSeries((prev) => prev.filter((s) => s.id !== id));
      toast.success("シリーズを削除しました");
    } catch {
      toast.error("削除に失敗しました");
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

  const totalPages = Math.ceil(filteredSeries.length / PAGE_SIZE);
  const pagedSeries = filteredSeries.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

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
    { label: "すべて", value: "all" },
    { label: "下書き", value: "draft" },
    { label: "予約中", value: "queued" },
    { label: "投稿済み", value: "posted" },
  ];

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <ErrorState message={error} onRetry={loadSeries} />
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog
        open={deleteTarget !== null}
        title="シリーズを削除しますか？"
        description="この操作は取り消せません。"
        confirmLabel="削除"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
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

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
        {uniqueTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0 ${
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
        <LoadingIndicator />
      ) : filteredSeries.length === 0 ? (
        <EmptyState
          title="まだ投稿はありません"
          description="新しいシリーズを作成してThreadsに投稿しましょう"
          ctaHref="/threads/new"
          ctaLabel="最初の投稿を作成"
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {pagedSeries.map((s, index) => {
              const globalIndex = (currentPage - 1) * PAGE_SIZE + index;
              return (
                <SeriesCard
                  key={s.id}
                  series={s}
                  onDelete={handleDelete}
                  index={activeTab === "queued" ? globalIndex : undefined}
                  isFirst={globalIndex === 0}
                  isLast={globalIndex === filteredSeries.length - 1}
                  onMove={activeTab === "queued" ? handleMove : undefined}
                />
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
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
            <p className="text-xs text-slate-500 mt-0.5">
              {formatCreatedAt(series.created_at)}
            </p>
            {series.quality_score != null && (
              <p className="hidden sm:block text-xs text-slate-500 mt-0.5">
                スコア: <span className="font-medium text-slate-600">{series.quality_score}</span>
              </p>
            )}
            {isQueued && index !== undefined && (
              <p
                data-testid="scheduled-time"
                className="hidden sm:block text-xs text-slate-500 mt-0.5"
              >
                予定: {new Date(Date.now() + (index + 1) * 2 * 3600 * 1000).toLocaleString("ja-JP", { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" })}頃
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
              <p className="text-xs text-slate-500 italic">投稿なし</p>
            )}
            {childCount > 0 && (
              <p className="text-xs text-slate-500 mt-0.5">子投稿 {childCount}件</p>
            )}
          </div>
        </Link>

        {/* 投稿済みの外部リンク */}
        {series.is_posted && (series as unknown as { posted_url?: string }).posted_url && (
          <a
            href={(series as unknown as { posted_url: string }).posted_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute right-2 top-2 p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
            aria-label="投稿を開く"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
          </a>
        )}

        {/* 削除ボタン */}
        {!series.is_posted && (
          <button
            onClick={(e) => { e.preventDefault(); onDelete(series.id); }}
            className="absolute right-2 top-2 p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
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
