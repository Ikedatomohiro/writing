import matter from "gray-matter";
import type { Frontmatter, Article } from "./types";

/**
 * フロントマターとコンテンツのパース結果
 */
export interface ParseResult {
  frontmatter: Frontmatter;
  content: string;
}

/**
 * 日付を文字列に変換する
 */
function formatDate(date: Date | string | undefined): string | undefined {
  if (date === undefined) return undefined;
  if (date instanceof Date) {
    return date.toISOString().split("T")[0];
  }
  return String(date);
}

/**
 * MDXファイルのコンテンツからフロントマターとコンテンツを抽出する
 */
export function parseFrontmatter(fileContent: string): ParseResult {
  const { data, content } = matter(fileContent);

  const frontmatter: Frontmatter = {
    title: data.title,
    description: data.description,
    date: formatDate(data.date) ?? "",
    updatedAt: formatDate(data.updatedAt),
    category: data.category,
    tags: data.tags,
    thumbnail: data.thumbnail,
    published: data.published,
  };

  return {
    frontmatter,
    content: content.trim(),
  };
}

/**
 * MDXファイルのコンテンツとスラッグからArticleオブジェクトを作成する
 */
export function parseArticle(fileContent: string, slug: string): Article {
  const { frontmatter, content } = parseFrontmatter(fileContent);

  return {
    slug,
    title: frontmatter.title,
    description: frontmatter.description,
    date: frontmatter.date,
    updatedAt: frontmatter.updatedAt,
    category: frontmatter.category,
    tags: frontmatter.tags ?? [],
    thumbnail: frontmatter.thumbnail,
    published: frontmatter.published ?? true,
    content,
  };
}
