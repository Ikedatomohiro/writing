import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
} from "./storage";
import type { Article } from "@/lib/content/types";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function createMockArticle(overrides: Partial<Article> = {}): Article {
  return {
    slug: "test-slug",
    title: "テスト記事",
    description: "テストの説明",
    content: "本文",
    category: "tech",
    tags: [],
    published: false,
    date: "2024-01-01T00:00:00.000Z",
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

    it("エラー時に例外を投げる", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });

      await expect(getArticles()).rejects.toThrow("Failed to fetch articles");
    });
  });

  describe("getArticle", () => {
    it("slugで記事を取得できる", async () => {
      const mockArticle = createMockArticle();
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockArticle),
      });

      const article = await getArticle("test-slug");
      expect(article).not.toBeNull();
      expect(article?.title).toBe("テスト記事");
      expect(mockFetch).toHaveBeenCalledWith("/api/articles/test-slug");
    });

    it("存在しないslugの場合はnullを返す", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 404 });

      const article = await getArticle("non-existent");
      expect(article).toBeNull();
    });

    it("エラー時に例外を投げる", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });

      await expect(getArticle("test-slug")).rejects.toThrow(
        "Failed to fetch article"
      );
    });
  });

  describe("createArticle", () => {
    it("新しい記事を作成できる", async () => {
      const mockArticle = createMockArticle({
        slug: "new-uuid",
        title: "新規記事",
        description: "新規説明",
        content: "本文内容",
      });
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockArticle),
      });

      const article = await createArticle({
        title: "新規記事",
        description: "新規説明",
        content: "本文内容",
        category: "tech",
      });

      expect(article.title).toBe("新規記事");
      expect(article.content).toBe("本文内容");
      expect(mockFetch).toHaveBeenCalledWith("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "新規記事",
          description: "新規説明",
          content: "本文内容",
          category: "tech",
        }),
      });
    });

    it("タグを指定して作成できる", async () => {
      const mockArticle = createMockArticle({
        tags: ["tag1", "tag2"],
      });
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockArticle),
      });

      const article = await createArticle({
        title: "記事",
        description: "説明",
        category: "tech",
        tags: ["tag1", "tag2"],
      });

      expect(article.tags).toEqual(["tag1", "tag2"]);
    });

    it("エラー時に例外を投げる", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 400 });

      await expect(
        createArticle({
          title: "記事",
          description: "説明",
          category: "tech",
        })
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

      const updated = await updateArticle("test-slug", {
        title: "新しいタイトル",
      });

      expect(updated).not.toBeNull();
      expect(updated?.title).toBe("新しいタイトル");
      expect(mockFetch).toHaveBeenCalledWith("/api/articles/test-slug", {
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
        updateArticle("test-slug", { title: "新タイトル" })
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

      await expect(deleteArticle("test-slug")).rejects.toThrow(
        "Failed to delete article"
      );
    });
  });
});
