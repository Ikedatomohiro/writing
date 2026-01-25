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
 * カテゴリパスのマッピング
 */
export const CATEGORY_PATHS: Record<Category, string> = {
  asset: "asset",
  tech: "tech",
  health: "health",
};

/**
 * 有効なカテゴリかどうかを判定
 */
export function isValidCategory(value: string): value is Category {
  return ["asset", "tech", "health"].includes(value);
}
