import type { Category } from "@/lib/content/types";
import { getRelatedArticles } from "@/lib/content/api";
import { BlogArticleCard } from "../BlogArticleCard/BlogArticleCard";

export interface RelatedArticlesProps {
  category: Category;
  currentSlug: string;
  limit?: number;
}

export async function RelatedArticles({
  category,
  currentSlug,
  limit = 3,
}: RelatedArticlesProps) {
  const articles = await getRelatedArticles(category, currentSlug, limit);

  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="mt-20 pt-12 border-t border-outline-variant/20" aria-labelledby="related-articles-heading">
      <h2
        id="related-articles-heading"
        className="text-3xl font-headline font-bold mb-10 tracking-tight text-on-surface"
      >
        関連記事
      </h2>
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        data-testid="related-articles-scroll"
      >
        {articles.map((article) => (
          <BlogArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}
