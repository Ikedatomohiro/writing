"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { XPostEditor } from "@/components/x/XPostEditor";
import type { XSeriesWithPosts, XPost } from "@/lib/types/x";

interface Props {
  seriesId: string;
  onClose?: () => void;
  onAfterDelete?: () => void;
}

export function XSeriesEditor({ seriesId, onClose, onAfterDelete }: Props) {
  const router = useRouter();
  const [series, setSeries] = useState<XSeriesWithPosts | null>(null);
  const [posts, setPosts] = useState<XPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/x/series/${seriesId}`);
      if (!res.ok) throw new Error("Not found");
      const json = await res.json();
      setSeries(json.data);
      const sorted = [...(json.data.posts ?? [])].sort(
        (a: XPost, b: XPost) => a.position - b.position
      );
      setPosts(sorted);
    } catch {
      setError("シリーズの読み込みに失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [seriesId]);

  useEffect(() => {
    load();
  }, [load]);

  const isDisabled = series?.is_posted ?? false;

  const handleTextChange = (postId: string, text: string) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, text } : p)));
  };

  const handleSavePost = async (post: XPost) => {
    if (isDisabled) return;
    setIsSaving(true);
    try {
      await fetch(`/api/x/series/${seriesId}/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: post.text }),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSeries = async () => {
    if (!confirm("このシリーズを削除しますか？")) return;
    const res = await fetch(`/api/x/series/${seriesId}`, { method: "DELETE" });
    if (res.ok) {
      if (onAfterDelete) onAfterDelete();
      else router.push("/x");
    }
  };

  const handleEnqueue = async () => {
    const res = await fetch("/api/x/queue/enqueue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ series_id: seriesId }),
    });
    if (res.ok) load();
  };

  const handleDequeue = async () => {
    const res = await fetch(`/api/x/series/${seriesId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "draft" }),
    });
    if (res.ok) load();
  };

  if (isLoading) return <p className="text-slate-500">読み込み中...</p>;
  if (error || !series) return <p className="text-red-600">{error ?? "Not found"}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onClose ?? (() => router.push("/x"))}
          className="px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-100"
        >
          {onClose ? "閉じる" : "← 一覧に戻る"}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-headline text-on-surface">
            {series.theme ?? "（テーマなし）"}
          </h2>
          {series.category && (
            <p className="text-sm text-slate-500 mt-1">カテゴリ: {series.category}</p>
          )}
          <p className="text-sm text-slate-500 mt-1">アカウント: {series.account}</p>
        </div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          series.is_posted
            ? "bg-green-100 text-green-700"
            : series.status === "queued"
            ? "bg-orange-100 text-orange-700"
            : "bg-slate-100 text-slate-600"
        }`}>
          {series.is_posted ? "posted" : series.status}
        </span>
      </div>

      {isDisabled && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
          この投稿は投稿済みです。編集できません。
        </div>
      )}

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">投稿</h3>
        {posts.map((post, index) => (
          <div key={post.id} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-mono">#{index + 1}</span>
            </div>
            <XPostEditor
              value={post.text}
              onChange={(text) => handleTextChange(post.id, text)}
              disabled={isDisabled}
            />
            {!isDisabled && (
              <button
                onClick={() => handleSavePost(post)}
                disabled={isSaving}
                className="mt-3 px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                保存
              </button>
            )}
          </div>
        ))}
        {posts.length === 0 && (
          <p className="text-slate-400 text-sm">投稿がありません</p>
        )}
      </section>

      {!isDisabled && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="flex gap-3">
            {series.status === "draft" && (
              <button
                onClick={handleEnqueue}
                className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600"
              >
                キューに追加
              </button>
            )}
            {series.status === "queued" && (
              <button
                onClick={handleDequeue}
                className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-300 active:bg-slate-400"
              >
                下書きに戻す
              </button>
            )}
          </div>
          <button
            onClick={handleDeleteSeries}
            className="px-4 py-2 rounded-lg text-red-500 text-sm font-medium hover:bg-red-50 active:bg-red-100 transition-colors"
          >
            削除
          </button>
        </div>
      )}
    </div>
  );
}
