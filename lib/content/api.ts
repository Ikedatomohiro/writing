import type { Category, Article, ArticleMeta } from "./types";
import { listArticleFiles, readArticleFile } from "./reader";
import { CATEGORIES } from "@/lib/constants/site";

/**
 * 記事取得オプション
 */
export interface GetArticlesOptions {
  includeDrafts?: boolean;
}

/**
 * 記事を日付の降順でソートする
 */
function sortByDateDesc<T extends { date: string; registeredAt?: string }>(articles: T[]): T[] {
  return [...articles].sort((a, b) => {
    const aTime = a.registeredAt ?? a.date;
    const bTime = b.registeredAt ?? b.date;
    return bTime.localeCompare(aTime);
  });
}

/**
 * 指定カテゴリの記事一覧を取得
 */
export async function getArticlesByCategory(
  category: Category,
  options: GetArticlesOptions = {}
): Promise<ArticleMeta[]> {
  const { includeDrafts = false } = options;

  const slugs = await listArticleFiles(category);
  const results = await Promise.all(
    slugs.map((slug) => readArticleFile(category, slug))
  );

  const articles: ArticleMeta[] = [];
  for (const article of results) {
    if (!article) continue;
    if (!includeDrafts && !article.published) continue;
    // 公開記事でも、タイトルか説明が空のものはAdSense審査対策で公開リストから除外する
    if (!includeDrafts && (!article.title?.trim() || !article.description?.trim())) continue;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { content, ...meta } = article;
    articles.push(meta);
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
  const categories: Category[] = CATEGORIES.map((c) => c.slug as Category);

  // 全カテゴリを並列で取得
  const categoryResults = await Promise.all(
    categories.map((category) => getArticlesByCategory(category, { includeDrafts }))
  );

  return sortByDateDesc(categoryResults.flat());
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

/**
 * タグでマッチする公開記事を取得（全カテゴリ横断・大文字小文字を区別しない）
 */
export async function getArticlesByTag(tag: string): Promise<ArticleMeta[]> {
  const normalized = tag.toLowerCase();
  const articles = await getAllArticles();
  return articles.filter((article) =>
    article.tags.some((t) => t.toLowerCase() === normalized)
  );
}

/**
 * 集計タグ情報
 */
export interface TagAggregation {
  tag: string;
  count: number;
}

/**
 * 全公開記事に出現するタグの一覧を集計し、出現数降順 → 名前昇順で返す
 */
export async function getAllTags(): Promise<TagAggregation[]> {
  const articles = await getAllArticles();
  const counts = new Map<string, number>();

  for (const article of articles) {
    for (const tag of article.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.tag.localeCompare(b.tag);
    });
}
