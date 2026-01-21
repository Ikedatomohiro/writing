export type ArticleStatus = "draft" | "published" | "archived";

export interface Article {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface ArticleCreateInput {
  title: string;
  content: string;
  keywords?: string[];
  status?: ArticleStatus;
}

export interface ArticleUpdateInput {
  title?: string;
  content?: string;
  keywords?: string[];
  status?: ArticleStatus;
}

export interface ArticleListOptions {
  status?: ArticleStatus;
  sortBy?: "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
}
