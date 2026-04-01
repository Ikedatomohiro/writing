import { supabase } from "@/lib/supabase";
import type { Category, Article } from "./types";

/**
 * Supabaseのarticlesテーブルの行の型
 */
interface ArticleRow {
  slug: string;
  category: string;
  title: string;
  description: string;
  content: string;
  date: string;
  tags: string[];
  thumbnail: string | null;
  published: boolean;
}

/**
 * Supabaseの行データからArticleオブジェクトに変換する
 */
function toArticle(row: ArticleRow): Article {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    date: row.date,
    category: row.category as Category,
    tags: row.tags ?? [],
    thumbnail: row.thumbnail ?? undefined,
    published: row.published,
    content: row.content,
  };
}

/**
 * カテゴリに属する公開済み記事のslug一覧を取得する
 */
export async function listArticleFiles(
  category: Category
): Promise<string[]> {
  const { data, error } = await supabase
    .from("articles")
    .select("slug")
    .eq("category", category)
    .eq("published", true);

  if (error || !data) {
    return [];
  }

  return data.map((row: { slug: string }) => row.slug);
}

/**
 * カテゴリとslugで記事を1件取得する
 */
export async function readArticleFile(
  category: Category,
  slug: string
): Promise<Article | null> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("category", category)
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  return toArticle(data as ArticleRow);
}
