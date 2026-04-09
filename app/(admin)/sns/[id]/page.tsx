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

  const handleDeleteSeries = async () => {
    if (!confirm("このシリーズを削除しますか？")) return;
    const res = await fetch(`/api/sns/series/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/sns");
    }
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
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
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
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 active:bg-blue-800 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
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
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                      aria-label="上に移動"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 17a1 1 0 01-1-1V6.414L5.707 9.707a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L11 6.414V16a1 1 0 01-1 1z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleMovePost(posts.indexOf(post), "down")}
                      disabled={index === childPosts.length - 1}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                      aria-label="下に移動"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v9.586l3.293-3.293a1 1 0 011.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 011.414-1.414L9 13.586V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-red-500 hover:bg-red-50 active:bg-red-100 text-xs font-medium"
                      aria-label="削除"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      削除
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
