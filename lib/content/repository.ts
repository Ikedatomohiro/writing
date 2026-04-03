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
 * 記事作成の入力型
 */
export interface ArticleCreateInput {
  title: string;
  description: string;
  content?: string;
  category: Category;
  tags?: string[];
  thumbnail?: string;
  published?: boolean;
}

/**
 * 記事更新の入力型
 */
export interface ArticleUpdateInput {
  title?: string;
  description?: string;
  content?: string;
  category?: Category;
  tags?: string[];
  thumbnail?: string;
  published?: boolean;
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
 * 管理画面用: 全記事を取得（下書き含む）
 */
export async function getAllArticlesForAdmin(): Promise<Article[]> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("date", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as ArticleRow[]).map(toArticle);
}

/**
 * slug指定で記事を1件取得
 */
export async function getArticleBySlug(
  slug: string
): Promise<Article | null> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  return toArticle(data as ArticleRow);
}

/**
 * 新規記事を作成
 */
export async function createArticle(
  input: ArticleCreateInput
): Promise<Article | null> {
  const now = new Date().toISOString();
  const slug = crypto.randomUUID();

  const row = {
    slug,
    title: input.title,
    description: input.description,
    content: input.content ?? "",
    category: input.category,
    tags: input.tags ?? [],
    thumbnail: input.thumbnail ?? null,
    published: input.published ?? false,
    date: now,
  };

  const { data, error } = await supabase
    .from("articles")
    .insert(row)
    .select("*")
    .single();

  if (error || !data) {
    return null;
  }

  return toArticle(data as ArticleRow);
}

/**
 * 記事を更新
 */
export async function updateArticle(
  slug: string,
  input: ArticleUpdateInput
): Promise<Article | null> {
  const updateData: Record<string, unknown> = {};
  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.content !== undefined) updateData.content = input.content;
  if (input.category !== undefined) updateData.category = input.category;
  if (input.tags !== undefined) updateData.tags = input.tags;
  if (input.thumbnail !== undefined) updateData.thumbnail = input.thumbnail;
  if (input.published !== undefined) updateData.published = input.published;

  const { data, error } = await supabase
    .from("articles")
    .update(updateData)
    .eq("slug", slug)
    .select("*")
    .single();

  if (error || !data) {
    return null;
  }

  return toArticle(data as ArticleRow);
}

/**
 * 記事を削除
 */
export async function deleteArticle(slug: string): Promise<boolean> {
  const { error } = await supabase
    .from("articles")
    .delete()
    .eq("slug", slug);

  return !error;
}
