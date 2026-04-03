"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getArticle, deleteArticle } from "@/lib/articles/storage";
import type { Article } from "@/lib/content/types";

const CATEGORY_LABELS: Record<string, string> = {
  tech: "プログラミング",
  asset: "資産形成",
  health: "健康",
};

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const slug = params.slug as string;

  const loadArticle = useCallback(async () => {
    try {
      const data = await getArticle(slug);
      setArticle(data);
    } catch (error) {
      console.error("Failed to load article:", error);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadArticle();
  }, [loadArticle]);

  const handleDelete = async () => {
    if (!confirm("この記事を削除しますか？")) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteArticle(slug);
      router.push("/articles");
    } catch (error) {
      console.error("Failed to delete article:", error);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-on-surface-variant">読み込み中...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-4">
        <h1 className="text-2xl font-bold font-headline text-on-surface">
          記事が見つかりません
        </h1>
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container transition-colors text-sm font-medium"
        >
          <span className="material-symbols-outlined text-lg">
            arrow_back
          </span>
          記事一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <Link
          href="/articles"
          className="inline-flex items-center gap-1 text-on-surface-variant hover:text-on-surface transition-colors text-sm font-medium"
        >
          <span className="material-symbols-outlined text-lg">
            arrow_back
          </span>
          記事一覧に戻る
        </Link>
      </div>

      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant text-xs font-medium">
              {CATEGORY_LABELS[article.category] ?? article.category}
            </span>
            <span
              className={
                article.published
                  ? "px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase"
                  : "px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase"
              }
            >
              {article.published ? "公開" : "下書き"}
            </span>
          </div>
          <h1 className="text-3xl font-bold font-headline text-on-surface mb-2">
            {article.title || "無題"}
          </h1>
          {article.description && (
            <p className="text-on-surface-variant text-sm mb-4">
              {article.description}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/articles/${article.slug}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
            編集
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-4 py-2 border border-error/30 rounded-lg text-error hover:bg-error-container transition-colors text-sm font-medium disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
            {isDeleting ? "削除中..." : "削除"}
          </button>
        </div>
      </div>

      {article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="border border-outline-variant/20 rounded-xl p-6 mb-6 min-h-[300px] whitespace-pre-wrap bg-surface-container-lowest text-on-surface font-mono text-sm">
        {article.content || (
          <span className="text-on-surface-variant italic">本文なし</span>
        )}
      </div>

      <div className="flex gap-4 text-on-surface-variant text-sm">
        <span>
          日付: {new Date(article.date).toLocaleDateString("ja-JP")}
        </span>
      </div>
    </div>
  );
}
