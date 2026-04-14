"use client";

import Link from "next/link";
import type { Article } from "@/lib/content/types";

interface ArticleTableProps {
  articles: Article[];
  onDelete?: (slug: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  tech: "プログラミング",
  asset: "資産形成",
  health: "健康",
};

export function ArticleTable({ articles, onDelete }: ArticleTableProps) {
  if (articles.length === 0) {
    return (
      <div className="py-10 text-center text-on-surface-variant">
        記事がありません
      </div>
    );
  }

  return (
    <>
      {/* デスクトップ: テーブル表示 */}
      <div className="hidden sm:block bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 font-label text-[11px] uppercase tracking-wider border-b border-outline-variant/10">
              <th className="px-6 py-4 font-semibold">タイトル</th>
              <th className="px-6 py-4 font-semibold">カテゴリ</th>
              <th className="px-6 py-4 font-semibold">状態</th>
              <th className="px-6 py-4 font-semibold">日付</th>
              <th className="px-6 py-4 font-semibold text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10 text-sm">
            {articles.map((article) => (
              <ArticleRow
                key={article.slug}
                article={article}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* モバイル: カード表示 */}
      <div className="sm:hidden flex flex-col gap-3">
        {articles.map((article) => (
          <ArticleMobileCard
            key={article.slug}
            article={article}
            onDelete={onDelete}
          />
        ))}
      </div>
    </>
  );
}

function ArticleMobileCard({
  article,
  onDelete,
}: {
  article: Article;
  onDelete?: (slug: string) => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Link
            href={`/articles/${article.slug}`}
            className="font-bold text-on-surface hover:text-primary transition-colors text-sm leading-snug line-clamp-2"
          >
            {article.title || "無題"}
          </Link>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant text-[11px] font-medium">
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
            <span className="text-[11px] text-slate-400">
              {new Date(article.date).toLocaleDateString("ja-JP")}
            </span>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <Link
            href={`/articles/${article.slug}/edit`}
            className="p-2 hover:bg-surface-container rounded-lg text-slate-600"
          >
            <span className="material-symbols-outlined text-base">edit</span>
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(article.slug)}
              className="p-2 hover:bg-error-container hover:text-error rounded-lg text-slate-600"
            >
              <span className="material-symbols-outlined text-base">delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ArticleRow({
  article,
  onDelete,
}: {
  article: Article;
  onDelete?: (slug: string) => void;
}) {
  const tagsPreview = article.tags.slice(0, 2).join(", ");

  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-6 py-5">
        <Link
          href={`/articles/${article.slug}`}
          className="font-bold text-on-surface hover:text-primary transition-colors"
        >
          {article.title || "無題"}
        </Link>
        {tagsPreview && (
          <div className="text-xs text-slate-400 mt-0.5">{tagsPreview}</div>
        )}
      </td>
      <td className="px-6 py-5">
        <span className="px-2 py-1 rounded-md bg-surface-container text-on-surface-variant text-xs font-medium">
          {CATEGORY_LABELS[article.category] ?? article.category}
        </span>
      </td>
      <td className="px-6 py-5">
        <span
          className={
            article.published
              ? "px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-tight"
              : "px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-tight"
          }
        >
          {article.published ? "公開" : "下書き"}
        </span>
      </td>
      <td className="px-6 py-5 text-slate-500">
        {new Date(article.date).toLocaleDateString("ja-JP")}
      </td>
      <td className="px-6 py-5 text-right">
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            href={`/articles/${article.slug}/edit`}
            className="p-1.5 hover:bg-surface-container rounded-lg text-slate-600"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(article.slug)}
              className="p-1.5 hover:bg-error-container hover:text-error rounded-lg text-slate-600"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
