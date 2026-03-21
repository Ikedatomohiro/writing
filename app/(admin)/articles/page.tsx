"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArticleTable } from "@/components/articles/ArticleTable";
import { SearchInput } from "@/components/articles";
import { getArticles } from "@/lib/articles/storage";
import type { Article } from "@/lib/articles/types";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadArticles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getArticles({ searchQuery: searchQuery || undefined });
      setArticles(data);
    } catch (err) {
      setError("記事の読み込みに失敗しました");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

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
      <StatsGrid articleCount={articles.length} />

      <section className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold font-headline">Recent Posts</h3>
          <Link
            href="/articles"
            className="text-sm font-semibold text-primary hover:underline"
          >
            View all posts
          </Link>
        </div>

        <div className="mb-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="タイトル、本文、キーワードで検索..."
          />
        </div>

        {articles.length === 0 && searchQuery ? (
          <p className="text-on-surface-variant">
            検索結果が見つかりませんでした
          </p>
        ) : (
          <ArticleTable articles={articles} />
        )}
      </section>
    </>
  );
}

function StatsGrid({ articleCount }: { articleCount: number }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-2 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm flex flex-col justify-between">
        <div>
          <p className="text-xs font-label uppercase tracking-widest text-slate-500 mb-1">
            Total Audience Reach
          </p>
          <h3 className="text-4xl font-black font-headline text-primary tracking-tighter">
            142.8k
          </h3>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md">
          <span className="material-symbols-outlined text-sm">
            trending_up
          </span>
          +12.5% vs last month
        </div>
      </div>

      <StatCard icon="article" iconBg="bg-blue-50" iconColor="text-blue-600" label="Total Posts" value={articleCount.toLocaleString()} />
      <StatCard icon="group" iconBg="bg-orange-50" iconColor="text-orange-600" label="Active Users" value="856" />
    </section>
  );
}

function StatCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm">
      <div
        className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center ${iconColor} mb-4`}
      >
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <h3 className="text-2xl font-bold font-headline">{value}</h3>
    </div>
  );
}
