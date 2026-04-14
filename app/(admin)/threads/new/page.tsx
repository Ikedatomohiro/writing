"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PostEditor } from "@/components/sns/PostEditor";
import type { SnsPostType } from "@/lib/types/sns";

const ACCOUNTS = ["pao-pao-cho", "matsumoto_sho"] as const;
type Account = typeof ACCOUNTS[number];

interface PostDraft {
  text: string;
  type: SnsPostType;
}

export default function SnsNewPage() {
  const router = useRouter();
  const [account, setAccount] = useState<Account>("pao-pao-cho");
  const [theme, setTheme] = useState("");
  const [pattern, setPattern] = useState("");
  const [parentPost, setParentPost] = useState<PostDraft>({ text: "", type: "normal" });
  const [childPosts, setChildPosts] = useState<PostDraft[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddChild = () => {
    setChildPosts((prev) => [...prev, { text: "", type: "normal" }]);
  };

  const handleChildChange = (index: number, text: string) => {
    setChildPosts((prev) => prev.map((p, i) => (i === index ? { ...p, text } : p)));
  };

  const handleChildTypeChange = (index: number, type: SnsPostType) => {
    setChildPosts((prev) => prev.map((p, i) => (i === index ? { ...p, type } : p)));
  };

  const handleRemoveChild = (index: number) => {
    setChildPosts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const posts = [
        { position: 0, text: parentPost.text, type: parentPost.type },
        ...childPosts.map((p, i) => ({ position: i + 1, text: p.text, type: p.type })),
      ];

      const res = await fetch("/api/threads/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account, theme: theme || undefined, pattern: pattern || undefined, posts }),
      });

      if (!res.ok) throw new Error("Failed to create");
      const json = await res.json();
      router.push(`/threads/${json.data.id}`);
    } catch {
      setError("シリーズの作成に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold font-headline text-on-surface">新規シリーズ作成</h2>

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}

      <div className="space-y-4 bg-white border border-slate-200 rounded-xl p-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            アカウント <span className="text-red-500">*</span>
          </label>
          <select
            value={account}
            onChange={(e) => setAccount(e.target.value as Account)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ACCOUNTS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">テーマ</label>
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="テーマを入力..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">パターン</label>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="パターンを入力..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <section>
        <h3 className="text-lg font-semibold mb-3">親投稿</h3>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <PostEditor
            value={parentPost.text}
            onChange={(text) => setParentPost((p) => ({ ...p, text }))}
            type={parentPost.type}
            onTypeChange={(type) => setParentPost((p) => ({ ...p, type }))}
          />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">子投稿</h3>
          <button
            onClick={handleAddChild}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            子投稿を追加
          </button>
        </div>

        <div className="space-y-3">
          {childPosts.map((post, index) => (
            <div key={index} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-600 px-2 py-0.5 rounded-full bg-slate-100">#{index + 1}</span>
                <button
                  onClick={() => handleRemoveChild(index)}
                  className="p-1 rounded text-red-500 hover:bg-red-50"
                  aria-label="削除"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
              <PostEditor
                value={post.text}
                onChange={(text) => handleChildChange(index, text)}
                type={post.type}
                onTypeChange={(type) => handleChildTypeChange(index, type)}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? "保存中..." : "保存"}
        </button>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
