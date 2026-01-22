import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
} from "./storage";
import type { Article } from "./types";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

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

describe("storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getArticles", () => {
    it("空の配列を返す", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      const articles = await getArticles();
      expect(articles).toEqual([]);
      expect(mockFetch).toHaveBeenCalledWith("/api/articles");
    });

    it("保存された記事を返す", async () => {
      const mockArticles = [createMockArticle()];
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockArticles),
      });

      const articles = await getArticles();
      expect(articles).toHaveLength(1);
      expect(articles[0].title).toBe("テスト記事");
    });

    it("ステータスでフィルタリングできる", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([createMockArticle({ status: "draft" })]),
      });

      await getArticles({ status: "draft" });
      expect(mockFetch).toHaveBeenCalledWith("/api/articles?status=draft");
    });

    it("検索クエリを送信できる", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await getArticles({ searchQuery: "test" });
      expect(mockFetch).toHaveBeenCalledWith("/api/articles?searchQuery=test");
    });

    it("ソート順を指定できる", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await getArticles({ sortBy: "title", sortOrder: "asc" });
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/articles?sortBy=title&sortOrder=asc"
      );
    });

    it("エラー時に例外を投げる", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });

      await expect(getArticles()).rejects.toThrow("Failed to fetch articles");
    });
  });

  describe("getArticle", () => {
    it("IDで記事を取得できる", async () => {
      const mockArticle = createMockArticle();
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockArticle),
      });

      const article = await getArticle("test-id");
      expect(article).not.toBeNull();
      expect(article?.title).toBe("テスト記事");
      expect(mockFetch).toHaveBeenCalledWith("/api/articles/test-id");
    });

    it("存在しないIDの場合はnullを返す", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 404 });

      const article = await getArticle("non-existent");
      expect(article).toBeNull();
    });

    it("エラー時に例外を投げる", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });

      await expect(getArticle("test-id")).rejects.toThrow(
        "Failed to fetch article"
      );
    });
  });

  describe("createArticle", () => {
    it("新しい記事を作成できる", async () => {
      const mockArticle = createMockArticle({
        id: "new-uuid",
        title: "新規記事",
        content: "本文内容",
      });
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockArticle),
      });

      const article = await createArticle({
        title: "新規記事",
        content: "本文内容",
      });

      expect(article.title).toBe("新規記事");
      expect(article.content).toBe("本文内容");
      expect(mockFetch).toHaveBeenCalledWith("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "新規記事", content: "本文内容" }),
      });
    });

    it("キーワードを指定して作成できる", async () => {
      const mockArticle = createMockArticle({
        keywords: ["keyword1", "keyword2"],
      });
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockArticle),
      });

      const article = await createArticle({
        title: "記事",
        content: "本文",
        keywords: ["keyword1", "keyword2"],
      });

      expect(article.keywords).toEqual(["keyword1", "keyword2"]);
    });

    it("エラー時に例外を投げる", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 400 });

      await expect(
        createArticle({ title: "記事", content: "本文" })
      ).rejects.toThrow("Failed to create article");
    });
  });

  describe("updateArticle", () => {
    it("タイトルを更新できる", async () => {
      const mockArticle = createMockArticle({ title: "新しいタイトル" });
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockArticle),
      });

      const updated = await updateArticle("test-id", { title: "新しいタイトル" });

      expect(updated).not.toBeNull();
      expect(updated?.title).toBe("新しいタイトル");
      expect(mockFetch).toHaveBeenCalledWith("/api/articles/test-id", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "新しいタイトル" }),
      });
    });

    it("存在しない記事を更新するとnullを返す", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 404 });

      const updated = await updateArticle("non-existent", {
        title: "新タイトル",
      });

      expect(updated).toBeNull();
    });

    it("エラー時に例外を投げる", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });

      await expect(
        updateArticle("test-id", { title: "新タイトル" })
      ).rejects.toThrow("Failed to update article");
    });
  });

  describe("deleteArticle", () => {
    it("記事を削除できる", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await deleteArticle("delete-test");

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith("/api/articles/delete-test", {
        method: "DELETE",
      });
    });

    it("存在しない記事を削除するとfalseを返す", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 404 });

      const result = await deleteArticle("non-existent");

      expect(result).toBe(false);
    });

    it("エラー時に例外を投げる", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });

      await expect(deleteArticle("test-id")).rejects.toThrow(
        "Failed to delete article"
      );
    });
  });
});
