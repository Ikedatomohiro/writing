"use client";

import Link from "next/link";
import type { Article } from "@/lib/content/types";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="block no-underline"
    >
      <div className="border border-outline-variant/20 rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all duration-200 bg-surface-container-lowest">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-bold text-on-surface line-clamp-1 flex-1 mr-2">
            {article.title || "無題"}
          </h3>
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
        <p className="text-on-surface-variant text-sm line-clamp-2 mb-3">
          {article.description || "説明なし"}
        </p>
        <div className="flex flex-wrap gap-2 mb-2">
          {article.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant text-xs"
            >
              {tag}
            </span>
          ))}
          {article.tags.length > 3 && (
            <span className="text-xs text-on-surface-variant">
              +{article.tags.length - 3}
            </span>
          )}
        </div>
        <p className="text-on-surface-variant text-xs">
          {new Date(article.date).toLocaleDateString("ja-JP")}
        </p>
      </div>
    </Link>
  );
}
