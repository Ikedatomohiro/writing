import Link from "next/link";
import type { ArticleMeta, Category } from "@/lib/content/types";
import { SITE_CONFIG } from "@/lib/constants/site";

export interface BlogArticleCardProps {
  article: ArticleMeta;
  readingTime?: string;
  /** "large" spans 2 columns with 16:9 image, "square" uses aspect-square, default is standard 4:3 */
  variant?: "default" | "large" | "square";
}

const CATEGORY_LABELS: Record<Category, string> = {
  asset: "投資",
  tech: "プログラミング",
  health: "健康",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

function getAspectClass(variant: "default" | "large" | "square"): string {
  switch (variant) {
    case "large":
      return "aspect-[16/9]";
    case "square":
      return "aspect-square";
    default:
      return "aspect-[4/3]";
  }
}

function getTitleClass(variant: "default" | "large" | "square"): string {
  switch (variant) {
    case "large":
      return "text-2xl md:text-3xl font-headline font-extrabold text-on-surface leading-tight mb-4 group-hover:text-primary transition-colors";
    case "square":
      return "text-xl font-headline font-extrabold text-on-surface leading-snug mb-4 group-hover:text-primary transition-colors";
    default:
      return "text-lg font-headline font-extrabold text-on-surface leading-tight mb-2 group-hover:text-primary transition-colors";
  }
}

function getPaddingClass(variant: "default" | "large" | "square"): string {
  return variant === "default" ? "p-6" : "p-8";
}

export function BlogArticleCard({
  article,
  readingTime,
  variant = "default",
}: BlogArticleCardProps) {
  const categoryLabel = CATEGORY_LABELS[article.category];
  const href = `/${article.category}/${article.slug}`;
  const thumbnailSrc = article.thumbnail || SITE_CONFIG.defaultOgImage;
  const aspectClass = getAspectClass(variant);
  const titleClass = getTitleClass(variant);
  const paddingClass = getPaddingClass(variant);
  const isCompact = variant === "default";

  return (
    <Link href={href} className="block group h-full">
      <article
        className="bg-surface-container-low rounded-xl overflow-hidden h-full flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-on-surface/5"
        data-testid="article-card"
      >
        {/* Thumbnail */}
        <div className={`${aspectClass} overflow-hidden bg-surface-container`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailSrc}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className={`${paddingClass} flex-1`}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-primary font-label text-xs font-bold tracking-widest uppercase">
              {categoryLabel}
            </span>
            {readingTime && (
              <span className="text-on-surface-variant font-label text-xs">
                {readingTime}
              </span>
            )}
          </div>

          <h3 className={titleClass}>{article.title}</h3>

          {!isCompact && article.description && (
            <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-2">
              {article.description}
            </p>
          )}
          {isCompact && article.description && (
            <p className="text-on-surface-variant text-sm line-clamp-2">
              {article.description}
            </p>
          )}

          <div className="mt-auto pt-4">
            <span className="text-on-surface-variant font-label text-xs">
              {formatDate(article.date)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
