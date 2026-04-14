"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XPostEditor } from "@/components/x/XPostEditor";
import { X_CATEGORIES, X_CHAR_LIMIT, countXChars } from "@/lib/types/x";
import type { XCategory } from "@/lib/types/x";

const ACCOUNTS = ["pao-pao-cho", "matsumoto_sho"] as const;
type Account = typeof ACCOUNTS[number];

interface PostDraft {
  text: string;
}

function isOverLimit(text: string): boolean {
  return countXChars(text) > X_CHAR_LIMIT;
}

export default function XNewPage() {
  const router = useRouter();
  const [account, setAccount] = useState<Account>("pao-pao-cho");
  const [theme, setTheme] = useState("");
  const [category, setCategory] = useState<XCategory | "">("");
  const [posts, setPosts] = useState<PostDraft[]>([{ text: "" }]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddPost = () => {
    setPosts((prev) => [...prev, { text: "" }]);
  };

  const handlePostChange = (index: number, text: string) => {
    setPosts((prev) => prev.map((p, i) => (i === index ? { text } : p)));
  };

  const handleRemovePost = (index: number) => {
    if (posts.length <= 1) return;
    setPosts((prev) => prev.filter((_, i) => i !== index));
  };

  const hasOverLimit = posts.some((p) => isOverLimit(p.text));
  const hasEmptyPost = posts.some((p) => p.text.trim() === "");

  const handleSave = async () => {
    if (!account) {
      setError("アカウントを選択してください");
      return;
    }
    if (hasOverLimit) {
      setError("280文字を超える投稿があります");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const body = {
        account,
        theme: theme || undefined,
        category: category || undefined,
        posts: posts.map((p, i) => ({ position: i, text: p.text })),
      };
      const res = await fetch("/api/x/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create");
      const json = await res.json();
      router.push(`/x/${json.data.id}`);
    } catch {
      setError("シリーズの作成に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold font-headline text-on-surface">新規X投稿作成</h2>

      {error && <p className="text-red-600 text-sm">{error}</p>}

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
          <label className="block text-sm font-medium text-slate-700 mb-1">カテゴリ</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as XCategory | "")}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">選択なし</option>
            {X_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">投稿</h3>
          <button
            onClick={handleAddPost}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            投稿を追加
          </button>
        </div>
        <div className="space-y-3">
          {posts.map((post, index) => (
            <div key={index} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-600 px-2 py-0.5 rounded-full bg-slate-100">#{index + 1}</span>
                {posts.length > 1 && (
                  <button
                    onClick={() => handleRemovePost(index)}
                    className="p-1 rounded text-red-500 hover:bg-red-50"
                    aria-label="削除"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                )}
              </div>
              <XPostEditor
                value={post.text}
                onChange={(text) => handlePostChange(index, text)}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <button
          onClick={handleSave}
          disabled={isSaving || hasOverLimit || hasEmptyPost}
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
