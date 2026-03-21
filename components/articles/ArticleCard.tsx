"use client";

import Link from "next/link";
import type { Article } from "@/lib/articles/types";

interface ArticleCardProps {
  article: Article;
}

const STATUS_STYLES = {
  draft:
    "px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold uppercase",
  published:
    "px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase",
  archived:
    "px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase",
} as const;

const STATUS_LABELS = {
  draft: "下書き",
  published: "公開",
  archived: "アーカイブ",
} as const;

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link
      href={`/articles/${article.id}`}
      className="block no-underline"
    >
      <div className="border border-outline-variant/20 rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all duration-200 bg-surface-container-lowest">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-bold text-on-surface line-clamp-1 flex-1 mr-2">
            {article.title || "無題"}
          </h3>
          <span className={STATUS_STYLES[article.status]}>
            {STATUS_LABELS[article.status]}
          </span>
        </div>
        <p className="text-on-surface-variant text-sm line-clamp-2 mb-3">
          {article.content.slice(0, 100) || "本文なし"}
        </p>
        <div className="flex flex-wrap gap-2 mb-2">
          {article.keywords.slice(0, 3).map((keyword) => (
            <span
              key={keyword}
              className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant text-xs"
            >
              {keyword}
            </span>
          ))}
          {article.keywords.length > 3 && (
            <span className="text-xs text-on-surface-variant">
              +{article.keywords.length - 3}
            </span>
          )}
        </div>
        <p className="text-on-surface-variant text-xs">
          更新: {new Date(article.updatedAt).toLocaleDateString("ja-JP")}
        </p>
      </div>
    </Link>
  );
}
