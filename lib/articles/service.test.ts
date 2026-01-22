import { describe, it, expect, beforeEach, vi } from "vitest";
import { ArticleService } from "./service";
import type { StorageBackend, ArticlesData } from "./backend";
import type { Article } from "./types";

function createMockBackend(): StorageBackend & {
  _data: ArticlesData;
  load: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
} {
  const data: ArticlesData = {
    version: "1.0",
    updatedAt: new Date().toISOString(),
    articles: [],
  };

  return {
    _data: data,
    load: vi.fn(() => Promise.resolve(data)),
    save: vi.fn((newData: ArticlesData) => {
      data.articles = newData.articles;
      data.updatedAt = newData.updatedAt;
      return Promise.resolve();
    }),
  };
}

function createMockArticle(overrides: Partial<Article> = {}): Article {
  return {
    id: "test-id",
    title: "テスト記事",
    content: "本文",
    keywords: [],
    status: "draft",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    publishedAt: null,
    ...overrides,
  };
}

vi.stubGlobal("crypto", {
  randomUUID: vi.fn(() => "generated-uuid"),
});

describe("ArticleService", () => {
  let backend: ReturnType<typeof createMockBackend>;
  let service: ArticleService;

  beforeEach(() => {
    vi.clearAllMocks();
    backend = createMockBackend();
    service = new ArticleService(backend);
  });

  describe("getArticles", () => {
    it("空の配列を返す（データがない場合）", async () => {
      const articles = await service.getArticles();
      expect(articles).toEqual([]);
    });

    it("保存された記事を返す", async () => {
      backend._data.articles = [createMockArticle()];

      const articles = await service.getArticles();
      expect(articles).toHaveLength(1);
      expect(articles[0].title).toBe("テスト記事");
    });

    it("ステータスでフィルタリングできる", async () => {
      backend._data.articles = [
        createMockArticle({ id: "1", status: "draft", title: "下書き" }),
        createMockArticle({ id: "2", status: "published", title: "公開済み" }),
      ];

      const drafts = await service.getArticles({ status: "draft" });
      expect(drafts).toHaveLength(1);
      expect(drafts[0].title).toBe("下書き");

      const published = await service.getArticles({ status: "published" });
      expect(published).toHaveLength(1);
      expect(published[0].title).toBe("公開済み");
    });

    it("検索クエリでフィルタリングできる", async () => {
      backend._data.articles = [
        createMockArticle({ id: "1", title: "TypeScript入門" }),
        createMockArticle({ id: "2", title: "React入門" }),
        createMockArticle({
          id: "3",
          title: "その他",
          keywords: ["TypeScript"],
        }),
      ];

      const results = await service.getArticles({ searchQuery: "TypeScript" });
      expect(results).toHaveLength(2);
    });

    it("作成日時でソートできる（降順がデフォルト）", async () => {
      backend._data.articles = [
        createMockArticle({
          id: "1",
          title: "古い記事",
          createdAt: "2024-01-01T00:00:00.000Z",
        }),
        createMockArticle({
          id: "2",
          title: "新しい記事",
          createdAt: "2024-01-02T00:00:00.000Z",
        }),
      ];

      const articles = await service.getArticles();
      expect(articles[0].title).toBe("新しい記事");
      expect(articles[1].title).toBe("古い記事");
    });
  });

  describe("getArticle", () => {
    it("IDで記事を取得できる", async () => {
      backend._data.articles = [createMockArticle({ id: "target-id" })];

      const article = await service.getArticle("target-id");
      expect(article).not.toBeNull();
      expect(article?.id).toBe("target-id");
    });

    it("存在しないIDの場合はnullを返す", async () => {
      const article = await service.getArticle("non-existent");
      expect(article).toBeNull();
    });
  });

  describe("createArticle", () => {
    it("新しい記事を作成できる", async () => {
      const article = await service.createArticle({
        title: "新規記事",
        content: "本文内容",
      });

      expect(article.id).toBe("generated-uuid");
      expect(article.title).toBe("新規記事");
      expect(article.content).toBe("本文内容");
      expect(article.status).toBe("draft");
      expect(backend.save).toHaveBeenCalled();
    });

    it("キーワードを指定して作成できる", async () => {
      const article = await service.createArticle({
        title: "記事",
        content: "本文",
        keywords: ["key1", "key2"],
      });

      expect(article.keywords).toEqual(["key1", "key2"]);
    });
  });

  describe("updateArticle", () => {
    beforeEach(() => {
      backend._data.articles = [
        createMockArticle({
          id: "update-id",
          title: "元のタイトル",
          status: "draft",
        }),
      ];
    });

    it("タイトルを更新できる", async () => {
      const updated = await service.updateArticle("update-id", {
        title: "新しいタイトル",
      });

      expect(updated?.title).toBe("新しいタイトル");
      expect(backend.save).toHaveBeenCalled();
    });

    it("公開ステータスに変更するとpublishedAtが設定される", async () => {
      const updated = await service.updateArticle("update-id", {
        status: "published",
      });

      expect(updated?.status).toBe("published");
      expect(updated?.publishedAt).not.toBeNull();
    });

    it("存在しない記事を更新するとnullを返す", async () => {
      const updated = await service.updateArticle("non-existent", {
        title: "タイトル",
      });

      expect(updated).toBeNull();
      expect(backend.save).not.toHaveBeenCalled();
    });
  });

  describe("deleteArticle", () => {
    beforeEach(() => {
      backend._data.articles = [createMockArticle({ id: "delete-id" })];
    });

    it("記事を削除できる", async () => {
      const result = await service.deleteArticle("delete-id");

      expect(result).toBe(true);
      expect(backend._data.articles).toHaveLength(0);
      expect(backend.save).toHaveBeenCalled();
    });

    it("存在しない記事を削除するとfalseを返す", async () => {
      const result = await service.deleteArticle("non-existent");

      expect(result).toBe(false);
      expect(backend.save).not.toHaveBeenCalled();
    });
  });
});
