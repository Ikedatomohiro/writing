import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
} from "./storage";

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

vi.stubGlobal("crypto", {
  randomUUID: vi.fn(() => "test-uuid-123"),
});

describe("storage", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  describe("getArticles", () => {
    it("空の配列を返す（ストレージが空の場合）", () => {
      const articles = getArticles();
      expect(articles).toEqual([]);
    });

    it("保存された記事を返す", () => {
      const stored = [
        {
          id: "1",
          title: "テスト記事",
          content: "本文",
          keywords: [],
          status: "draft",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
          publishedAt: null,
        },
      ];
      mockLocalStorage.setItem("articles", JSON.stringify(stored));

      const articles = getArticles();
      expect(articles).toHaveLength(1);
      expect(articles[0].title).toBe("テスト記事");
    });

    it("ステータスでフィルタリングできる", () => {
      const stored = [
        {
          id: "1",
          title: "下書き",
          content: "",
          keywords: [],
          status: "draft",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
          publishedAt: null,
        },
        {
          id: "2",
          title: "公開済み",
          content: "",
          keywords: [],
          status: "published",
          createdAt: "2024-01-02T00:00:00.000Z",
          updatedAt: "2024-01-02T00:00:00.000Z",
          publishedAt: "2024-01-02T00:00:00.000Z",
        },
      ];
      mockLocalStorage.setItem("articles", JSON.stringify(stored));

      const drafts = getArticles({ status: "draft" });
      expect(drafts).toHaveLength(1);
      expect(drafts[0].title).toBe("下書き");

      const published = getArticles({ status: "published" });
      expect(published).toHaveLength(1);
      expect(published[0].title).toBe("公開済み");
    });

    it("作成日時でソートできる（降順がデフォルト）", () => {
      const stored = [
        {
          id: "1",
          title: "古い記事",
          content: "",
          keywords: [],
          status: "draft",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
          publishedAt: null,
        },
        {
          id: "2",
          title: "新しい記事",
          content: "",
          keywords: [],
          status: "draft",
          createdAt: "2024-01-02T00:00:00.000Z",
          updatedAt: "2024-01-02T00:00:00.000Z",
          publishedAt: null,
        },
      ];
      mockLocalStorage.setItem("articles", JSON.stringify(stored));

      const articles = getArticles();
      expect(articles[0].title).toBe("新しい記事");
      expect(articles[1].title).toBe("古い記事");
    });

    it("昇順でソートできる", () => {
      const stored = [
        {
          id: "1",
          title: "古い記事",
          content: "",
          keywords: [],
          status: "draft",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
          publishedAt: null,
        },
        {
          id: "2",
          title: "新しい記事",
          content: "",
          keywords: [],
          status: "draft",
          createdAt: "2024-01-02T00:00:00.000Z",
          updatedAt: "2024-01-02T00:00:00.000Z",
          publishedAt: null,
        },
      ];
      mockLocalStorage.setItem("articles", JSON.stringify(stored));

      const articles = getArticles({ sortOrder: "asc" });
      expect(articles[0].title).toBe("古い記事");
      expect(articles[1].title).toBe("新しい記事");
    });

    describe("検索機能", () => {
      const searchTestData = [
        {
          id: "1",
          title: "TypeScript入門",
          content: "TypeScriptは静的型付け言語です",
          keywords: ["programming", "typescript"],
          status: "published",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
          publishedAt: "2024-01-01T00:00:00.000Z",
        },
        {
          id: "2",
          title: "React実践ガイド",
          content: "Reactはコンポーネントベースのライブラリです",
          keywords: ["frontend", "react"],
          status: "draft",
          createdAt: "2024-01-02T00:00:00.000Z",
          updatedAt: "2024-01-02T00:00:00.000Z",
          publishedAt: null,
        },
        {
          id: "3",
          title: "Next.js完全ガイド",
          content: "Next.jsはReactフレームワークです",
          keywords: ["frontend", "nextjs"],
          status: "published",
          createdAt: "2024-01-03T00:00:00.000Z",
          updatedAt: "2024-01-03T00:00:00.000Z",
          publishedAt: "2024-01-03T00:00:00.000Z",
        },
      ];

      beforeEach(() => {
        mockLocalStorage.setItem("articles", JSON.stringify(searchTestData));
      });

      it("タイトルで検索できる", () => {
        const articles = getArticles({ searchQuery: "TypeScript" });
        expect(articles).toHaveLength(1);
        expect(articles[0].id).toBe("1");
      });

      it("本文で検索できる", () => {
        const articles = getArticles({ searchQuery: "コンポーネント" });
        expect(articles).toHaveLength(1);
        expect(articles[0].id).toBe("2");
      });

      it("キーワードで検索できる", () => {
        const articles = getArticles({ searchQuery: "frontend" });
        expect(articles).toHaveLength(2);
        expect(articles.map((a) => a.id)).toContain("2");
        expect(articles.map((a) => a.id)).toContain("3");
      });

      it("大文字小文字を区別しない", () => {
        const articles = getArticles({ searchQuery: "typescript" });
        expect(articles).toHaveLength(1);
        expect(articles[0].id).toBe("1");

        const articlesUpper = getArticles({ searchQuery: "TYPESCRIPT" });
        expect(articlesUpper).toHaveLength(1);
        expect(articlesUpper[0].id).toBe("1");
      });

      it("空のクエリは全件を返す", () => {
        const articles = getArticles({ searchQuery: "" });
        expect(articles).toHaveLength(3);
      });

      it("検索とステータスフィルタを併用できる", () => {
        const articles = getArticles({
          searchQuery: "ガイド",
          status: "published",
        });
        expect(articles).toHaveLength(1);
        expect(articles[0].id).toBe("3");
      });

      it("検索結果がない場合は空配列を返す", () => {
        const articles = getArticles({ searchQuery: "存在しないキーワード" });
        expect(articles).toHaveLength(0);
      });
    });
  });

  describe("getArticle", () => {
    it("IDで記事を取得できる", () => {
      const stored = [
        {
          id: "test-id",
          title: "テスト記事",
          content: "本文",
          keywords: [],
          status: "draft",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
          publishedAt: null,
        },
      ];
      mockLocalStorage.setItem("articles", JSON.stringify(stored));

      const article = getArticle("test-id");
      expect(article).not.toBeNull();
      expect(article?.title).toBe("テスト記事");
    });

    it("存在しないIDの場合はnullを返す", () => {
      const article = getArticle("non-existent");
      expect(article).toBeNull();
    });
  });

  describe("createArticle", () => {
    it("新しい記事を作成できる", () => {
      const article = createArticle({
        title: "新規記事",
        content: "本文内容",
      });

      expect(article.id).toBe("test-uuid-123");
      expect(article.title).toBe("新規記事");
      expect(article.content).toBe("本文内容");
      expect(article.keywords).toEqual([]);
      expect(article.status).toBe("draft");
      expect(article.publishedAt).toBeNull();
    });

    it("キーワードを指定して作成できる", () => {
      const article = createArticle({
        title: "記事",
        content: "本文",
        keywords: ["keyword1", "keyword2"],
      });

      expect(article.keywords).toEqual(["keyword1", "keyword2"]);
    });

    it("ステータスを指定して作成できる", () => {
      const article = createArticle({
        title: "記事",
        content: "本文",
        status: "published",
      });

      expect(article.status).toBe("published");
    });
  });

  describe("updateArticle", () => {
    beforeEach(() => {
      const stored = [
        {
          id: "update-test",
          title: "元のタイトル",
          content: "元の本文",
          keywords: ["old"],
          status: "draft",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
          publishedAt: null,
        },
      ];
      mockLocalStorage.setItem("articles", JSON.stringify(stored));
    });

    it("タイトルを更新できる", () => {
      const updated = updateArticle("update-test", { title: "新しいタイトル" });

      expect(updated).not.toBeNull();
      expect(updated?.title).toBe("新しいタイトル");
      expect(updated?.content).toBe("元の本文");
    });

    it("公開ステータスに変更するとpublishedAtが設定される", () => {
      const updated = updateArticle("update-test", { status: "published" });

      expect(updated?.status).toBe("published");
      expect(updated?.publishedAt).not.toBeNull();
    });

    it("存在しない記事を更新するとnullを返す", () => {
      const updated = updateArticle("non-existent", { title: "新タイトル" });

      expect(updated).toBeNull();
    });
  });

  describe("deleteArticle", () => {
    beforeEach(() => {
      const stored = [
        {
          id: "delete-test",
          title: "削除対象",
          content: "",
          keywords: [],
          status: "draft",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
          publishedAt: null,
        },
      ];
      mockLocalStorage.setItem("articles", JSON.stringify(stored));
    });

    it("記事を削除できる", () => {
      const result = deleteArticle("delete-test");

      expect(result).toBe(true);
      expect(getArticle("delete-test")).toBeNull();
    });

    it("存在しない記事を削除するとfalseを返す", () => {
      const result = deleteArticle("non-existent");

      expect(result).toBe(false);
    });
  });
});
