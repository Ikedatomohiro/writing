import type { Article } from "../types";

export interface ArticlesData {
  version: string;
  updatedAt: string;
  articles: Article[];
}

export interface StorageBackend {
  load(): Promise<ArticlesData>;
  save(data: ArticlesData): Promise<void>;
}

export function createEmptyArticlesData(): ArticlesData {
  return {
    version: "1.0",
    updatedAt: new Date().toISOString(),
    articles: [],
  };
}
