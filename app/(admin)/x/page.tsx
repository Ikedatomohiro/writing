"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingIndicator } from "@/components/common/LoadingIndicator";
import { ErrorState } from "@/components/common/ErrorState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import type { XSeriesWithPosts, XSeriesStatus } from "@/lib/types/x";

const ACCOUNTS = ["pao-pao-cho", "matsumoto_sho"] as const;
type Account = typeof ACCOUNTS[number];

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
  const [series, setSeries] = useState<XSeriesWithPosts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<Account>("pao-pao-cho");
  const [activeTab, setActiveTab] = useState<XSeriesStatus | "all" | "posted">("draft");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    const storedAccount = sessionStorage.getItem("x_active_account");
    const storedTab = sessionStorage.getItem("x_active_tab");
    if (storedAccount && ACCOUNTS.includes(storedAccount as Account)) {
      setAccount(storedAccount as Account);
    }
    if (storedTab) {
      setActiveTab(storedTab as XSeriesStatus | "all" | "posted");
    }
  }, []);

  const handleAccountChange = (newAccount: Account) => {
    setAccount(newAccount);
    sessionStorage.setItem("x_active_account", newAccount);
  };

  const handleTabChange = (tab: XSeriesStatus | "all" | "posted") => {
    setActiveTab(tab);
    sessionStorage.setItem("x_active_tab", tab);
  };

  const loadSeries = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams({ account });
      if (activeTab !== "all" && activeTab !== "posted") {
        params.set("status", activeTab);
      }
      const res = await fetch(`/api/x/series?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      const data: XSeriesWithPosts[] = json.data ?? [];
      const filtered =
        activeTab === "posted"
          ? data.filter((s) => s.is_posted)
          : activeTab === "all"
          ? data
          : data.filter((s) => !s.is_posted);
      setSeries(filtered);
    } catch {
      setError("シリーズの読み込みに失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [account, activeTab]);

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
      await fetch(`/api/x/series/${id}`, { method: "DELETE" });
      setSeries((prev) => prev.filter((s) => s.id !== id));
    } catch {
      loadSeries();
    }
  };

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
                {a}
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
      ) : series.length === 0 ? (
        <EmptyState
          title="まだ投稿はありません"
          description="新しいシリーズを作成してXに投稿しましょう"
          ctaHref="/x/new"
          ctaLabel="最初の投稿を作成"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {series.map((s) => (
            <XSeriesCard key={s.id} series={s} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </>
  );
}

function XSeriesCard({
  series,
  onDelete,
}: {
  series: XSeriesWithPosts;
  onDelete: (id: string) => void;
}) {
  const firstPost = series.posts?.find((p) => p.position === 0);
  const postCount = series.posts?.length ?? 0;

  return (
    <div className="relative flex-1 min-w-0">
      <Link
        href={`/x/${series.id}`}
        className="bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-4 sm:px-5 sm:py-4 hover:shadow-sm hover:border-blue-200 transition-all cursor-pointer overflow-hidden"
      >
        <div className="flex items-center gap-2 sm:w-44 sm:shrink-0 sm:flex-col sm:items-start sm:gap-0">
          <StatusBadge status={series.status} isPosted={series.is_posted} />
          <h3 className="font-semibold text-slate-900 text-sm leading-snug truncate min-w-0 flex-1 sm:flex-none sm:line-clamp-2 sm:whitespace-normal sm:mt-1">
            {series.theme?.startsWith("[テストデータ]") ? (
              <>
                <span className="mr-1 px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 text-[10px] font-medium tracking-tight">テスト</span>
                {series.theme.replace("[テストデータ]", "").trim() || "（テーマなし）"}
              </>
            ) : (
              series.theme ?? "（テーマなし）"
            )}
          </h3>
          <p className="hidden sm:block text-xs text-slate-500 mt-0.5">
            {formatCreatedAt(series.created_at)}
          </p>
        </div>
        <div className="flex-1 min-w-0">
          {firstPost?.text ? (
            <p className="text-sm text-slate-600 truncate leading-relaxed">
              {firstPost.text.split("\n").find((l) => l.trim()) ?? ""}
            </p>
          ) : (
            <p className="text-xs text-slate-500 italic">投稿なし</p>
          )}
          {postCount > 1 && (
            <p className="text-xs text-slate-500 mt-0.5">ツイート {postCount}件</p>
          )}
        </div>
      </Link>
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
  );
}
