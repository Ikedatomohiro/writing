"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArticleTable } from "@/components/articles/ArticleTable";
import { SearchInput } from "@/components/articles";
import { getArticles, deleteArticle } from "@/lib/articles/storage";
import type { Article } from "@/lib/content/types";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadArticles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getArticles();
      setArticles(data);
    } catch (err) {
      setError("記事の読み込みに失敗しました");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const handleDelete = async (slug: string) => {
    if (!confirm("この記事を削除しますか？")) return;
    try {
      await deleteArticle(slug);
      setArticles((prev) => prev.filter((a) => a.slug !== slug));
    } catch (err) {
      console.error("Failed to delete article:", err);
    }
  };

  const filteredArticles = searchQuery
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.tags.some((t) =>
            t.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : articles;

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <div className="text-error">{error}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <div className="text-on-surface-variant">読み込み中...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-headline text-on-surface">
          記事管理
        </h2>
        <Link
          href="/articles/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          新規作成
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="全記事" value={articles.length} />
        <StatCard
          label="公開中"
          value={articles.filter((a) => a.published).length}
        />
        <StatCard
          label="下書き"
          value={articles.filter((a) => !a.published).length}
        />
      </div>

      <div className="mb-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="タイトル、説明、タグで検索..."
        />
      </div>

      {filteredArticles.length === 0 && searchQuery ? (
        <p className="text-on-surface-variant">
          検索結果が見つかりませんでした
        </p>
      ) : (
        <ArticleTable articles={filteredArticles} onDelete={handleDelete} />
      )}
    </>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 shadow-sm">
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <h3 className="text-2xl font-bold font-headline">{value}</h3>
    </div>
  );
}
