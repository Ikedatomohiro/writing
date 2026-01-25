import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import type { Article } from "@/lib/articles/types";

// モック関数の定義
const mockGetArticle = vi.fn();
const mockUpdateArticle = vi.fn();
const mockDeleteArticle = vi.fn();

// モジュールのモック
vi.mock("@/lib/articles/backend", () => ({
  VercelBlobBackend: vi.fn(),
}));

vi.mock("@/lib/articles/service", async () => {
  return {
    ArticleService: class {
      getArticles = vi.fn();
      getArticle = mockGetArticle;
      createArticle = vi.fn();
      updateArticle = mockUpdateArticle;
      deleteArticle = mockDeleteArticle;
    },
  };
});

const mockArticle: Article = {
  id: "1",
  title: "Test Article",
  content: "Content",
  keywords: ["test"],
  status: "published",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  publishedAt: "2024-01-01T00:00:00.000Z",
};

describe("GET /api/articles/[id]", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("記事を取得する", async () => {
    mockGetArticle.mockResolvedValue(mockArticle);
    const { GET } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/articles/1");
    const params = { params: Promise.resolve({ id: "1" }) };
    const response = await GET(request, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockArticle);
    expect(mockGetArticle).toHaveBeenCalledWith("1");
  });

  it("記事が見つからない場合は404を返す", async () => {
    mockGetArticle.mockResolvedValue(null);
    const { GET } = await import("./route");

    const request = new NextRequest(
      "http://localhost:3000/api/articles/not-found"
    );
    const params = { params: Promise.resolve({ id: "not-found" }) };
    const response = await GET(request, params);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Article not found");
  });
});

describe("PUT /api/articles/[id]", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("記事を更新する", async () => {
    const updatedArticle: Article = {
      ...mockArticle,
      title: "Updated Title",
    };
    mockUpdateArticle.mockResolvedValue(updatedArticle);
    const { PUT } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/articles/1", {
      method: "PUT",
      body: JSON.stringify({
        title: "Updated Title",
        content: "Updated Content",
        keywords: ["updated"],
        status: "published",
      }),
    });
    const params = { params: Promise.resolve({ id: "1" }) };
    const response = await PUT(request, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(updatedArticle);
    expect(mockUpdateArticle).toHaveBeenCalledWith("1", {
      title: "Updated Title",
      content: "Updated Content",
      keywords: ["updated"],
      status: "published",
    });
  });

  it("記事が見つからない場合は404を返す", async () => {
    mockUpdateArticle.mockResolvedValue(null);
    const { PUT } = await import("./route");

    const request = new NextRequest(
      "http://localhost:3000/api/articles/not-found",
      {
        method: "PUT",
        body: JSON.stringify({
          title: "Updated Title",
        }),
      }
    );
    const params = { params: Promise.resolve({ id: "not-found" }) };
    const response = await PUT(request, params);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Article not found");
  });
});

describe("DELETE /api/articles/[id]", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("記事を削除する", async () => {
    mockDeleteArticle.mockResolvedValue(true);
    const { DELETE } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/articles/1", {
      method: "DELETE",
    });
    const params = { params: Promise.resolve({ id: "1" }) };
    const response = await DELETE(request, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDeleteArticle).toHaveBeenCalledWith("1");
  });

  it("記事が見つからない場合は404を返す", async () => {
    mockDeleteArticle.mockResolvedValue(false);
    const { DELETE } = await import("./route");

    const request = new NextRequest(
      "http://localhost:3000/api/articles/not-found",
      {
        method: "DELETE",
      }
    );
    const params = { params: Promise.resolve({ id: "not-found" }) };
    const response = await DELETE(request, params);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Article not found");
  });
});
