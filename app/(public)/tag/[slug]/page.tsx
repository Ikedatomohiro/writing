import type { Metadata } from "next";
import Link from "next/link";
import { getArticlesByTag } from "@/lib/content/api";
import { BlogArticleCard } from "@/components/blog/BlogArticleCard/BlogArticleCard";
import { SITE_CONFIG } from "@/lib/constants/site";

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

/**
 * URLスラッグ（percent-encoded UTF-8）を元のタグ名に戻す
 */
function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = decodeSlug(slug);
  const title = `${tag} の記事一覧`;
  const description = `「${tag}」タグが付いた記事の一覧です。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `/tag/${encodeURIComponent(tag)}`,
    },
    alternates: {
      canonical: `/tag/${encodeURIComponent(tag)}`,
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const tag = decodeSlug(slug);
  const articles = await getArticlesByTag(tag);

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-12 pt-8 pb-16">
      <nav
        className="flex items-center gap-2 mb-8 font-label text-on-surface-variant font-medium tracking-wide uppercase text-sm"
        aria-label="breadcrumb"
      >
        <Link href="/" className="hover:text-primary transition-colors">
          ホーム
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span>タグ</span>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-on-surface">{tag}</span>
      </nav>

      <header className="mb-12">
        <p className="text-primary font-label text-xs font-bold tracking-widest uppercase mb-2">
          Tag
        </p>
        <h1 className="font-headline text-4xl md:text-6xl font-extrabold text-on-surface tracking-tighter leading-none mb-4">
          # {tag}
        </h1>
        <p className="text-on-surface-variant text-base leading-relaxed max-w-2xl">
          「{tag}」タグが付いた記事の一覧です（全 {articles.length} 件）。
        </p>
        <div className="mt-6 h-px bg-outline-variant" />
      </header>

      {articles.length === 0 ? (
        <div
          className="py-16 text-center bg-surface-container-low rounded-xl"
          data-testid="tag-empty-state"
        >
          <p className="text-on-surface-variant">
            該当する記事がありません。{" "}
            <Link href="/" className="text-primary hover:underline">
              トップに戻る
            </Link>
          </p>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          data-testid="tag-article-grid"
        >
          {articles.map((article) => (
            <BlogArticleCard
              key={`${article.category}-${article.slug}`}
              article={article}
            />
          ))}
        </div>
      )}

      <p className="sr-only">
        {SITE_CONFIG.name} の {tag} 関連記事
      </p>
    </main>
  );
}
