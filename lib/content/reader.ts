import * as fs from "fs/promises";
import * as path from "path";
import { list, head } from "@vercel/blob";
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
 * ファイルシステムとVercel Blobの両方から取得し、重複を除去する
 */
export async function listArticleFiles(category: Category): Promise<string[]> {
  const filesSet = new Set<string>();

  // 1. ファイルシステムから取得
  const dir = path.join(getContentDirectory(), category);
  try {
    const files = await fs.readdir(dir);
    for (const file of files) {
      if (file.endsWith(".mdx")) {
        filesSet.add(file);
      }
    }
  } catch {
    // ディレクトリが存在しない場合はスキップ
  }

  // 2. Vercel Blobから取得
  try {
    const prefix = `content/${category}/`;
    const result = await list({ prefix });
    for (const blob of result.blobs) {
      const fileName = blob.pathname.replace(prefix, "");
      if (fileName.endsWith(".mdx") && !fileName.includes("/")) {
        filesSet.add(fileName);
      }
    }
  } catch {
    // Blob未設定やエラー時はスキップ
  }

  return Array.from(filesSet);
}

/**
 * MDXファイルを読み込んでArticleオブジェクトを返す
 * ファイルシステム → Vercel Blob の順で試行する
 */
export async function readArticleFile(
  category: Category,
  slug: string
): Promise<Article | null> {
  // 1. ファイルシステムから読み込み
  const filePath = path.join(getContentDirectory(), category, `${slug}.mdx`);
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return parseArticle(content, slug);
  } catch {
    // ファイルシステムにない場合はBlobを試行
  }

  // 2. Vercel Blobから読み込み
  try {
    const blobPath = `content/${category}/${slug}.mdx`;
    const blobInfo = await head(blobPath);
    const response = await fetch(blobInfo.url);
    if (response.ok) {
      const content = await response.text();
      return parseArticle(content, slug);
    }
  } catch {
    // Blobにもない場合はnullを返す
  }

  return null;
}
