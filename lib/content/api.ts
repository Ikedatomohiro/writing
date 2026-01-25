import type { Category, Article, ArticleMeta } from "./types";
import { listArticleFiles, readArticleFile } from "./reader";

/**
 * 記事取得オプション
 */
export interface GetArticlesOptions {
  includeDrafts?: boolean;
}

/**
 * 記事を日付の降順でソートする
 */
function sortByDateDesc<T extends { date: string }>(articles: T[]): T[] {
  return [...articles].sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * 指定カテゴリの記事一覧を取得
 */
export async function getArticlesByCategory(
  category: Category,
  options: GetArticlesOptions = {}
): Promise<ArticleMeta[]> {
  const { includeDrafts = false } = options;

  const files = await listArticleFiles(category);
  const articles: ArticleMeta[] = [];

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, "");
    const article = await readArticleFile(category, slug);

    if (article && (includeDrafts || article.published)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { content, ...meta } = article;
      articles.push(meta);
    }
  }

  return sortByDateDesc(articles);
}

/**
 * 全カテゴリの記事一覧を取得
 * 注: 各カテゴリで既にソートされた配列を結合後、全体で1回だけソートする
 */
export async function getAllArticles(
  options: GetArticlesOptions = {}
): Promise<ArticleMeta[]> {
  const { includeDrafts = false } = options;
  const categories: Category[] = ["asset", "tech", "health"];
  const allArticles: ArticleMeta[] = [];

  // 各カテゴリからソートなしで記事を取得
  for (const category of categories) {
    const files = await listArticleFiles(category);
    for (const file of files) {
      const slug = file.replace(/\.mdx$/, "");
      const article = await readArticleFile(category, slug);
      if (article && (includeDrafts || article.published)) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { content, ...meta } = article;
        allArticles.push(meta);
      }
    }
  }

  // 全体で1回だけソート
  return sortByDateDesc(allArticles);
}

/**
 * 最新記事を指定件数取得
 */
export async function getLatestArticles(limit: number): Promise<ArticleMeta[]> {
  const articles = await getAllArticles();
  return articles.slice(0, limit);
}

/**
 * スラッグで記事を取得
 */
export async function getArticleBySlug(
  category: Category,
  slug: string
): Promise<Article | null> {
  return readArticleFile(category, slug);
}

/**
 * 関連記事を取得（同じカテゴリから現在の記事を除外）
 */
export async function getRelatedArticles(
  category: Category,
  currentSlug: string,
  limit: number
): Promise<ArticleMeta[]> {
  const articles = await getArticlesByCategory(category);
  const related = articles.filter((a) => a.slug !== currentSlug);
  return related.slice(0, limit);
}
