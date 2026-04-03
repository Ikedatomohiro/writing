"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArticleForm } from "@/components/articles";
import { getArticle, updateArticle } from "@/lib/articles/storage";
import type { Article } from "@/lib/content/types";
import type { ArticleCreateInput } from "@/lib/content/repository";

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (data: ArticleCreateInput) => {
    setIsSubmitting(true);
    try {
      await updateArticle(slug, data);
      router.push(`/articles/${slug}`);
    } catch (error) {
      console.error("Failed to update article:", error);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/articles/${slug}`);
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
      <ArticleForm
        article={article}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
