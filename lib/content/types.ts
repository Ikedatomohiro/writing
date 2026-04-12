import { HIDDEN_CATEGORIES } from "@/lib/constants/site";

/**
 * 記事カテゴリ
 */
export type Category = "asset" | "tech" | "health";

/**
 * フロントマター（MDXファイルのメタデータ）
 */
export interface Frontmatter {
  title: string;
  description: string;
  date: string;
  updatedAt?: string;
  category: Category;
  tags?: string[];
  thumbnail?: string;
  published?: boolean;
}

/**
 * 記事メタ情報（一覧表示用）
 */
export interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  updatedAt?: string;
  registeredAt?: string;
  category: Category;
  tags: string[];
  thumbnail?: string;
  published: boolean;
}

/**
 * 記事（詳細表示用）
 */
export interface Article extends ArticleMeta {
  content: string;
}

/**
 * 有効なカテゴリかどうかを判定（管理画面・内部用）
 */
export function isValidCategory(value: string): value is Category {
  return ["asset", "tech", "health"].includes(value);
}

/**
 * 公開中のカテゴリかどうかを判定（公開サイト用）
 * HIDDEN_CATEGORIESに含まれるカテゴリはfalseを返す
 */
export function isPublicCategory(value: string): value is Category {
  return isValidCategory(value) && !HIDDEN_CATEGORIES.has(value);
}
