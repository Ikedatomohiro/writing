"use client";

import Link from "next/link";
import type { Article } from "@/lib/articles/types";

interface ArticleTableProps {
  articles: Article[];
}

const STATUS_STYLES = {
  published:
    "px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-tight",
  draft:
    "px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-tight",
  archived:
    "px-2 py-1 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-tight",
} as const;

const STATUS_LABELS = {
  published: "Published",
  draft: "Draft",
  archived: "Archived",
} as const;

export function ArticleTable({ articles }: ArticleTableProps) {
  if (articles.length === 0) {
    return (
      <div className="py-10 text-center text-on-surface-variant">
        記事がありません
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 text-slate-500 font-label text-[11px] uppercase tracking-wider border-b border-outline-variant/10">
            <th className="px-6 py-4 font-semibold">
              Post Title &amp; Category
            </th>
            <th className="px-6 py-4 font-semibold">Status</th>
            <th className="px-6 py-4 font-semibold">Updated</th>
            <th className="px-6 py-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10 text-sm">
          {articles.map((article) => (
            <ArticleRow key={article.id} article={article} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ArticleRow({ article }: { article: Article }) {
  const timeAgo = formatTimeAgo(article.updatedAt);
  const keywords = article.keywords.slice(0, 2).join(" / ");

  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-6 py-5">
        <div className="font-bold text-on-surface mb-0.5">
          {article.title || "無題"}
        </div>
        <div className="text-xs text-slate-400">
          {keywords && `${keywords} \u2022 `}
          {timeAgo}
        </div>
      </td>
      <td className="px-6 py-5">
        <span className={STATUS_STYLES[article.status]}>
          {STATUS_LABELS[article.status]}
        </span>
      </td>
      <td className="px-6 py-5 text-slate-500">
        {new Date(article.updatedAt).toLocaleDateString("ja-JP")}
      </td>
      <td className="px-6 py-5 text-right">
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            href={`/articles/${article.id}`}
            className="p-1.5 hover:bg-surface-container rounded-lg text-slate-600"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </Link>
          <button className="p-1.5 hover:bg-error-container hover:text-error rounded-lg text-slate-600">
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "just now";
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}
