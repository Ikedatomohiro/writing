"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { StatusBadge } from "@/components/common/StatusBadge";
import { getAccountLabel } from "@/lib/constants/labels";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingIndicator } from "@/components/common/LoadingIndicator";
import { ErrorState } from "@/components/common/ErrorState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import type { XSeriesWithPosts, XPost, XSeriesStatus } from "@/lib/types/x";

const ACCOUNTS = ["pao-pao-cho", "matsumoto_sho", "morita_rin"] as const;
type Account = typeof ACCOUNTS[number];

function isAccount(value: string | null | undefined): value is Account {
  return !!value && (ACCOUNTS as readonly string[]).includes(value);
}

function formatCreatedAt(iso: string): string {
  return new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tokyo",
  });
}

const TABS: Array<{ label: string; value: XSeriesStatus | "all" | "posted" }> = [
  { label: "すべて", value: "all" },
  { label: "下書き", value: "draft" },
  { label: "予約中", value: "queued" },
  { label: "投稿済み", value: "posted" },
];

export default function XPage() {
  return (
    <Suspense>
      <XPageContent />
    </Suspense>
  );
}

function XPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlAccount = searchParams.get("account");

  const [series, setSeries] = useState<XSeriesWithPosts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<Account>(() =>
    isAccount(urlAccount) ? urlAccount : "pao-pao-cho"
  );
  const [activeTab, setActiveTab] = useState<XSeriesStatus | "all" | "posted">("draft");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const buildUrl = useCallback(
    (nextAccount: Account) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("account", nextAccount);
      return `${pathname}?${params.toString()}`;
    },
    [pathname, searchParams]
  );

  useEffect(() => {
    if (isAccount(urlAccount)) {
      if (urlAccount !== account) setAccount(urlAccount);
      sessionStorage.setItem("x_active_account", urlAccount);
      return;
    }
    const stored = sessionStorage.getItem("x_active_account");
    const fallback: Account = isAccount(stored) ? stored : "pao-pao-cho";
    if (fallback !== account) setAccount(fallback);
    router.replace(buildUrl(fallback), { scroll: false });
  }, [urlAccount, account, router, buildUrl]);

  useEffect(() => {
    const storedTab = sessionStorage.getItem("x_active_tab");
    if (storedTab) {
      setActiveTab(storedTab as XSeriesStatus | "all" | "posted");
    }
  }, []);

  const handleAccountChange = (newAccount: Account) => {
    setAccount(newAccount);
    sessionStorage.setItem("x_active_account", newAccount);
    router.replace(buildUrl(newAccount), { scroll: false });
  };

  const handleTabChange = (tab: XSeriesStatus | "all" | "posted") => {
    setActiveTab(tab);
    sessionStorage.setItem("x_active_tab", tab);
  };

  const loadSeries = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setIsLoading(true);
        setError(null);
        const params = new URLSearchParams({ account });
        const res = await fetch(`/api/x/series?${params.toString()}`, { signal });
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        if (!signal?.aborted) setSeries(json.data ?? []);
      } catch (e) {
        if ((e as { name?: string }).name === "AbortError") return;
        setError("シリーズの読み込みに失敗しました");
      } finally {
        if (!signal?.aborted) setIsLoading(false);
      }
    },
    [account]
  );

  useEffect(() => {
    const controller = new AbortController();
    loadSeries(controller.signal);
    return () => controller.abort();
  }, [loadSeries]);

  useEffect(() => {
    const revalidate = () => {
      if (document.visibilityState === "visible") loadSeries();
    };
    document.addEventListener("visibilitychange", revalidate);
    window.addEventListener("focus", revalidate);
    return () => {
      document.removeEventListener("visibilitychange", revalidate);
      window.removeEventListener("focus", revalidate);
    };
  }, [loadSeries]);

  const baseFiltered =
    activeTab === "all"
      ? series
      : activeTab === "posted"
      ? series.filter((s) => s.is_posted)
      : series.filter((s) => s.status === activeTab && !s.is_posted);

  const filteredSeries =
    activeTab === "queued"
      ? [...baseFiltered].sort((a, b) => (a.queue_order ?? 0) - (b.queue_order ?? 0))
      : activeTab === "posted"
      ? [...baseFiltered].sort(
          (a, b) => (b.posted_at ?? "").localeCompare(a.posted_at ?? "")
        )
      : baseFiltered;

  const handleDelete = (id: string) => {
    setDeleteTarget(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setDeleteTarget(null);
    const prevSeries = series;
    setSeries((prev) => prev.filter((s) => s.id !== id));
    try {
      const res = await fetch(`/api/x/series/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      setSeries(prevSeries);
    }
  };

  const handleEnqueue = async (id: string) => {
    const prevSeries = series;
    const maxOrder = series
      .filter((s) => s.status === "queued" && !s.is_posted)
      .reduce((m, s) => Math.max(m, s.queue_order ?? 0), 0);
    setSeries((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: "queued", queue_order: maxOrder + 1 } : s
      )
    );
    try {
      const res = await fetch("/api/x/queue/enqueue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ series_id: id }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setSeries(prevSeries);
    }
  };

  const handleDequeue = async (id: string) => {
    const prevSeries = series;
    setSeries((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: "draft", queue_order: null } : s
      )
    );
    try {
      const res = await fetch(`/api/x/series/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "draft" }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setSeries(prevSeries);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filteredSeries.findIndex((s) => s.id === active.id);
    const newIndex = filteredSeries.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const prevSeries = series;
    const reorderedQueued = arrayMove(filteredSeries, oldIndex, newIndex).map(
      (s, i) => ({ ...s, queue_order: i + 1 })
    );

    setSeries((prev) => {
      const nonQueued = prev.filter((s) => s.status !== "queued" || s.is_posted);
      return [...nonQueued, ...reorderedQueued];
    });

    try {
      const res = await fetch("/api/x/queue/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ series_ids: reorderedQueued.map((s) => s.id) }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setSeries(prevSeries);
    }
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <ErrorState message={error} onRetry={loadSeries} />
      </div>
    );
  }

  const isQueuedTab = activeTab === "queued";

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
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-2xl font-bold font-headline text-on-surface">X管理</h2>
        <div className="flex items-center gap-3">
          <label htmlFor="x-account-select" className="sr-only">アカウント</label>
          <select
            id="x-account-select"
            value={account}
            onChange={(e) => handleAccountChange(e.target.value as Account)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {ACCOUNTS.map((a) => (
              <option key={a} value={a}>
                {getAccountLabel(a)}
              </option>
            ))}
          </select>
          <Link
            href="/x/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">新規作成</span>
          </Link>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
        {TABS.map((tab) => (
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
          description="新しいシリーズを作成してXに投稿しましょう"
          ctaHref="/x/new"
          ctaLabel="最初の投稿を作成"
        />
      ) : isQueuedTab ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredSeries.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-3">
              {filteredSeries.map((s) => (
                <SortableXSeriesCard
                  key={s.id}
                  series={s}
                  onDelete={handleDelete}
                  onEnqueue={handleEnqueue}
                  onDequeue={handleDequeue}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredSeries.map((s) => (
            <XSeriesCard
              key={s.id}
              series={s}
              onDelete={handleDelete}
              onEnqueue={handleEnqueue}
              onDequeue={handleDequeue}
            />
          ))}
        </div>
      )}
    </>
  );
}

interface XCardProps {
  series: XSeriesWithPosts;
  onDelete: (id: string) => void;
  onEnqueue?: (id: string) => void;
  onDequeue?: (id: string) => void;
  dragHandleProps?: {
    attributes?: React.HTMLAttributes<HTMLButtonElement>;
    listeners?: React.DOMAttributes<HTMLButtonElement>;
  };
}

function SortableXSeriesCard(props: {
  series: XSeriesWithPosts;
  onDelete: (id: string) => void;
  onEnqueue?: (id: string) => void;
  onDequeue?: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: props.series.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <XSeriesCard
        {...props}
        dragHandleProps={{
          attributes: attributes as React.HTMLAttributes<HTMLButtonElement>,
          listeners: listeners as React.DOMAttributes<HTMLButtonElement>,
        }}
      />
    </div>
  );
}

function XSeriesCard({
  series,
  onDelete,
  onEnqueue,
  onDequeue,
  dragHandleProps,
}: XCardProps) {
  const sortedPosts = (series.posts ?? [])
    .slice()
    .sort((a: XPost, b: XPost) => a.position - b.position);

  return (
    <div className="relative flex items-stretch gap-2">
      {dragHandleProps && (
        <button
          type="button"
          {...dragHandleProps.attributes}
          {...dragHandleProps.listeners}
          className="flex flex-col justify-center items-center px-1 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing touch-none"
          aria-label="ドラッグして並び替え"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 4a1 1 0 100 2 1 1 0 000-2zM7 9a1 1 0 100 2 1 1 0 000-2zM7 14a1 1 0 100 2 1 1 0 000-2zM13 4a1 1 0 100 2 1 1 0 000-2zM13 9a1 1 0 100 2 1 1 0 000-2zM13 14a1 1 0 100 2 1 1 0 000-2z" />
          </svg>
        </button>
      )}

      <div className="relative flex-1 min-w-0">
        <Link
          href={`/x/${series.id}`}
          scroll={false}
          className="block bg-white border border-slate-200 rounded-xl px-4 py-3 sm:px-5 sm:py-4 pr-[150px] sm:pr-[180px] hover:shadow-sm hover:border-blue-200 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <StatusBadge status={series.status} isPosted={series.is_posted} />
            <h3 className="font-semibold text-slate-900 text-sm leading-snug flex-1 min-w-0">
              {series.theme?.startsWith("[テストデータ]") ? (
                <>
                  <span className="mr-1 px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 text-[10px] font-medium tracking-tight">テスト</span>
                  {series.theme.replace("[テストデータ]", "").trim() || "（テーマなし）"}
                </>
              ) : (
                series.theme ?? "（テーマなし）"
              )}
            </h3>
            <span className="text-xs text-slate-500 shrink-0">
              {formatCreatedAt(series.created_at)}
            </span>
          </div>

          {sortedPosts.length === 0 ? (
            <p className="text-xs text-slate-500 italic">投稿なし</p>
          ) : (
            <div className="space-y-3">
              {sortedPosts.map((p, i) => (
                <div
                  key={p.id}
                  className={`text-sm text-slate-700 whitespace-pre-wrap leading-relaxed break-words${
                    i > 0 ? " pt-3 border-t border-slate-100" : ""
                  }`}
                >
                  {sortedPosts.length > 1 && (
                    <span className="text-xs text-slate-400 font-mono mr-2">#{i + 1}</span>
                  )}
                  {p.text || <span className="italic text-slate-400">（空）</span>}
                </div>
              ))}
            </div>
          )}
        </Link>

        {!series.is_posted && (
          <div className="absolute right-2 top-2 flex gap-1 items-center">
            {series.status === "draft" && onEnqueue && (
              <button
                onClick={(e) => { e.preventDefault(); onEnqueue(series.id); }}
                className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-medium hover:bg-orange-600 active:bg-orange-700 shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
              >
                キューに追加
              </button>
            )}
            {series.status === "queued" && onDequeue && (
              <button
                onClick={(e) => { e.preventDefault(); onDequeue(series.id); }}
                className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-300 active:bg-slate-400 shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                下書きに戻す
              </button>
            )}
            <button
              onClick={(e) => { e.preventDefault(); onDelete(series.id); }}
              className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              aria-label="削除"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
