"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { XPostEditor } from "@/components/x/XPostEditor";
import { X_CHAR_LIMIT, countXChars } from "@/lib/types/x";
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
  const [savingPostId, setSavingPostId] = useState<string | null>(null);
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<{
    postId: string;
    kind: "success" | "error";
    text: string;
  } | null>(null);

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
    if (saveMessage?.postId === postId) setSaveMessage(null);
  };

  const handleSavePost = async (post: XPost) => {
    if (isDisabled) return;
    if (countXChars(post.text) > X_CHAR_LIMIT) {
      setSaveMessage({
        postId: post.id,
        kind: "error",
        text: `本文は${X_CHAR_LIMIT}文字以内にしてください`,
      });
      return;
    }
    setSavingPostId(post.id);
    setSaveMessage(null);
    try {
      const res = await fetch(
        `/api/x/series/${seriesId}/posts/${post.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: post.text }),
        }
      );
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error ?? `HTTP ${res.status}`);
      }
      setSaveMessage({ postId: post.id, kind: "success", text: "保存しました" });
    } catch (e) {
      setSaveMessage({
        postId: post.id,
        kind: "error",
        text: `保存に失敗しました: ${(e as Error).message}`,
      });
    } finally {
      setSavingPostId(null);
    }
  };

  const handleAddPost = async () => {
    if (isDisabled) return;
    setIsAddingPost(true);
    setError(null);
    try {
      const res = await fetch(`/api/x/series/${seriesId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "（新しい子投稿）" }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error ?? `HTTP ${res.status}`);
      }
      const json = await res.json();
      setPosts((prev) => [...prev, json.data as XPost]);
    } catch (e) {
      setError(`子投稿の追加に失敗しました: ${(e as Error).message}`);
    } finally {
      setIsAddingPost(false);
    }
  };

  const handleDeletePost = async (post: XPost) => {
    if (isDisabled) return;
    if (post.position === 0) return;
    if (!confirm("この子投稿を削除しますか？")) return;
    const prev = posts;
    setPosts((curr) => curr.filter((p) => p.id !== post.id));
    try {
      const res = await fetch(
        `/api/x/series/${seriesId}/posts/${post.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error ?? `HTTP ${res.status}`);
      }
    } catch (e) {
      setPosts(prev);
      setError(`削除に失敗しました: ${(e as Error).message}`);
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
    if (!series) return;
    const prev = series;
    setSeries({ ...series, status: "queued" });
    try {
      const res = await fetch("/api/x/queue/enqueue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ series_id: seriesId }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setSeries(prev);
    }
  };

  const handleDequeue = async () => {
    if (!series) return;
    const prev = series;
    setSeries({ ...series, status: "draft", queue_order: null });
    try {
      const res = await fetch(`/api/x/series/${seriesId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "draft" }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setSeries(prev);
    }
  };

  if (isLoading) return <p className="text-slate-500">読み込み中...</p>;
  if (error && !series) return <p className="text-red-600">{error}</p>;
  if (!series) return <p className="text-red-600">Not found</p>;

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

      {error && series && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">投稿</h3>
        {posts.map((post, index) => {
          const isSaving = savingPostId === post.id;
          const msg = saveMessage?.postId === post.id ? saveMessage : null;
          const over = countXChars(post.text) > X_CHAR_LIMIT;
          return (
            <div key={post.id} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-mono">#{index + 1}</span>
                {!isDisabled && post.position !== 0 && (
                  <button
                    onClick={() => handleDeletePost(post)}
                    className="text-xs text-slate-400 hover:text-red-600"
                    aria-label="子投稿を削除"
                  >
                    削除
                  </button>
                )}
              </div>
              <XPostEditor
                value={post.text}
                onChange={(text) => handleTextChange(post.id, text)}
                disabled={isDisabled}
              />
              {!isDisabled && (
                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={() => handleSavePost(post)}
                    disabled={isSaving || over}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSaving ? "保存中..." : "保存"}
                  </button>
                  {msg && (
                    <span
                      role={msg.kind === "error" ? "alert" : undefined}
                      aria-live="polite"
                      className={`text-xs ${msg.kind === "success" ? "text-green-600" : "text-red-600"}`}
                    >
                      {msg.text}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {posts.length === 0 && (
          <p className="text-slate-400 text-sm">投稿がありません</p>
        )}
        {!isDisabled && (
          <button
            onClick={handleAddPost}
            disabled={isAddingPost}
            className="w-full py-2 rounded-lg border border-dashed border-slate-300 text-slate-500 text-sm hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50"
          >
            {isAddingPost ? "追加中..." : "+ 子投稿を追加"}
          </button>
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
