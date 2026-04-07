"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/sns/StatusBadge";
import { PostEditor } from "@/components/sns/PostEditor";
import type { SnsSeries, SnsSeriesWithPosts, SnsPost, SnsPostType } from "@/lib/types/sns";

export default function SnsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [series, setSeries] = useState<SnsSeriesWithPosts | null>(null);
  const [allSeries, setAllSeries] = useState<SnsSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<SnsPost[]>([]);

  const loadAllSeries = useCallback(async () => {
    const res = await fetch("/api/sns/series");
    if (res.ok) {
      const json = await res.json();
      setAllSeries(json.data ?? []);
    }
  }, []);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/sns/series/${id}`);
      if (!res.ok) throw new Error("Not found");
      const json = await res.json();
      setSeries(json.data);
      const sorted = [...(json.data.posts ?? [])].sort(
        (a: SnsPost, b: SnsPost) => a.position - b.position
      );
      setPosts(sorted);
    } catch {
      setError("シリーズの読み込みに失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    loadAllSeries();
  }, [load, loadAllSeries]);

  const currentIndex = allSeries.findIndex((s) => s.id === id);
  const prevId = currentIndex > 0 ? allSeries[currentIndex - 1].id : null;
  const nextId = currentIndex >= 0 && currentIndex < allSeries.length - 1
    ? allSeries[currentIndex + 1].id
    : null;
  const nextDraftId = allSeries
    .slice(currentIndex + 1)
    .find((s) => s.status === "draft")?.id ?? null;

  const isDisabled = series?.is_posted ?? false;

  const handleTextChange = (postId: string, text: string) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, text } : p)));
  };

  const handleTypeChange = (postId: string, type: SnsPostType) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, type } : p)));
  };

  const handleSavePost = async (post: SnsPost) => {
    if (isDisabled) return;
    setIsSaving(true);
    try {
      await fetch(`/api/sns/series/${id}/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: post.text, type: post.type }),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPost = async () => {
    if (isDisabled) return;
    const newPosition = posts.length;
    const res = await fetch(`/api/sns/series/${id}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ position: newPosition, text: "", type: "normal" }),
    });
    if (res.ok) {
      const json = await res.json();
      setPosts((prev) => [...prev, json.data]);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (isDisabled) return;
    if (!confirm("この投稿を削除しますか？")) return;
    await fetch(`/api/sns/series/${id}/posts/${postId}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleMovePost = async (index: number, direction: "up" | "down") => {
    if (isDisabled) return;
    const childPosts = posts.filter((p) => p.position > 0);
    const childIndex = childPosts.findIndex((p) => p.id === posts[index].id);
    if (direction === "up" && childIndex <= 0) return;
    if (direction === "down" && childIndex >= childPosts.length - 1) return;

    const newChildPosts = [...childPosts];
    const swapIndex = direction === "up" ? childIndex - 1 : childIndex + 1;
    [newChildPosts[childIndex], newChildPosts[swapIndex]] = [
      newChildPosts[swapIndex],
      newChildPosts[childIndex],
    ];

    const parent = posts.filter((p) => p.position === 0);
    const reordered = [
      ...parent,
      ...newChildPosts.map((p, i) => ({ ...p, position: i + 1 })),
    ];
    setPosts(reordered);

    await fetch(`/api/sns/series/${id}/posts/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_ids: reordered.map((p) => p.id) }),
    });
  };

  const handleEnqueue = async () => {
    const res = await fetch("/api/sns/queue/enqueue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ series_id: id }),
    });
    if (res.ok) {
      if (nextDraftId) {
        router.push(`/sns/${nextDraftId}`);
      } else {
        load();
      }
    }
  };

  if (isLoading) return <p className="text-slate-500">読み込み中...</p>;
  if (error || !series) return <p className="text-red-600">{error ?? "Not found"}</p>;

  const parentPost = posts.find((p) => p.position === 0);
  const childPosts = posts.filter((p) => p.position > 0);

  return (
    <div className="max-w-3xl space-y-6">
      {/* ナビゲーションバー */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => prevId && router.push(`/sns/${prevId}`)}
          disabled={!prevId}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-sm">chevron_left</span>
          前へ
        </button>
        <Link
          href="/sns"
          className="px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-100"
        >
          一覧に戻る
        </Link>
        <button
          onClick={() => nextId && router.push(`/sns/${nextId}`)}
          disabled={!nextId}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          次へ
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-headline text-on-surface">
            {series.theme ?? "（テーマなし）"}
          </h2>
          {series.pattern && (
            <p className="text-sm text-slate-500 mt-1">パターン: {series.pattern}</p>
          )}
        </div>
        <StatusBadge status={series.status} isPosted={series.is_posted} />
      </div>

      {isDisabled && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
          この投稿は投稿済みです。編集できません。
        </div>
      )}

      <section>
        <h3 className="text-lg font-semibold mb-3">親投稿</h3>
        {parentPost ? (
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <PostEditor
              value={parentPost.text}
              onChange={(text) => handleTextChange(parentPost.id, text)}
              type={parentPost.type}
              onTypeChange={(type) => handleTypeChange(parentPost.id, type)}
              disabled={isDisabled}
            />
            {!isDisabled && (
              <button
                onClick={() => handleSavePost(parentPost)}
                disabled={isSaving}
                className="mt-3 px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                保存
              </button>
            )}
          </div>
        ) : (
          <p className="text-slate-400 text-sm">親投稿がありません</p>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">子投稿</h3>
          {!isDisabled && (
            <button
              onClick={handleAddPost}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              子投稿を追加
            </button>
          )}
        </div>

        <div className="space-y-3">
          {childPosts.map((post, index) => (
            <div key={post.id} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-mono">#{index + 1}</span>
                {!isDisabled && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleMovePost(posts.indexOf(post), "up")}
                      disabled={index === 0}
                      className="p-1 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                      aria-label="上に移動"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_upward</span>
                    </button>
                    <button
                      onClick={() => handleMovePost(posts.indexOf(post), "down")}
                      disabled={index === childPosts.length - 1}
                      className="p-1 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                      aria-label="下に移動"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_downward</span>
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1 rounded text-red-500 hover:bg-red-50"
                      aria-label="削除"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                )}
              </div>
              <PostEditor
                value={post.text}
                onChange={(text) => handleTextChange(post.id, text)}
                type={post.type}
                onTypeChange={(type) => handleTypeChange(post.id, type)}
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
        </div>
      </section>

      {!isDisabled && (
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          {series.status === "draft" && (
            <button
              onClick={handleEnqueue}
              className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600"
            >
              キューに追加
            </button>
          )}
        </div>
      )}
    </div>
  );
}
