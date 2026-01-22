import { put, head } from "@vercel/blob";
import type { StorageBackend, ArticlesData } from "./types";
import { createEmptyArticlesData } from "./types";

const BLOB_PATH = "articles/articles.json";

export class VercelBlobBackend implements StorageBackend {
  async load(): Promise<ArticlesData> {
    try {
      const blobInfo = await head(BLOB_PATH);
      const response = await fetch(blobInfo.url);
      if (!response.ok) {
        return createEmptyArticlesData();
      }
      return (await response.json()) as ArticlesData;
    } catch {
      return createEmptyArticlesData();
    }
  }

  async save(data: ArticlesData): Promise<void> {
    const updatedData: ArticlesData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await put(BLOB_PATH, JSON.stringify(updatedData, null, 2), {
      access: "public",
      addRandomSuffix: false,
    });
  }
}
