import * as fs from "fs/promises";
import * as path from "path";
import type { Category, Article } from "./types";
import { parseArticle } from "./parser";

/**
 * コンテンツディレクトリのパスを取得
 * テスト時は CONTENT_DIR 環境変数で別ディレクトリを指定可能
 */
export function getContentDirectory(): string {
  const contentDir = process.env.CONTENT_DIR;
  if (contentDir) {
    return path.isAbsolute(contentDir)
      ? contentDir
      : path.join(process.cwd(), contentDir);
  }
  return path.join(process.cwd(), "content");
}

/**
 * カテゴリディレクトリ内のMDXファイル一覧を取得
 */
export async function listArticleFiles(category: Category): Promise<string[]> {
  const dir = path.join(getContentDirectory(), category);

  try {
    const files = await fs.readdir(dir);
    return files.filter((file) => file.endsWith(".mdx"));
  } catch (error) {
    // ディレクトリが存在しない場合は空配列を返す
    if (process.env.NODE_ENV === "development") {
      console.debug(`[reader] listArticleFiles: ${dir} not found`, error);
    }
    return [];
  }
}

/**
 * MDXファイルを読み込んでArticleオブジェクトを返す
 */
export async function readArticleFile(
  category: Category,
  slug: string
): Promise<Article | null> {
  const filePath = path.join(getContentDirectory(), category, `${slug}.mdx`);

  try {
    const content = await fs.readFile(filePath, "utf-8");
    return parseArticle(content, slug);
  } catch (error) {
    // ファイルが存在しない場合はnullを返す
    if (process.env.NODE_ENV === "development") {
      console.debug(`[reader] readArticleFile: ${filePath} not found`, error);
    }
    return null;
  }
}
