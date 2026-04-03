import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import type { Article } from "@/lib/content/types";

const mockGetArticleBySlug = vi.fn();
const mockUpdateArticle = vi.fn();
const mockDeleteArticle = vi.fn();
const mockRequireAuth = vi.fn();

vi.mock("@/lib/content/repository", () => ({
  getArticleBySlug: (...args: unknown[]) => mockGetArticleBySlug(...args),
  updateArticle: (...args: unknown[]) => mockUpdateArticle(...args),
  deleteArticle: (...args: unknown[]) => mockDeleteArticle(...args),
}));

vi.mock("@/lib/auth/api-auth", () => ({
  requireAuth: () => mockRequireAuth(),
}));

const mockArticle: Article = {
  slug: "test-slug",
  title: "Test Article",
  description: "Test Description",
  content: "Content",
  category: "tech",
  tags: ["test"],
  published: true,
  date: "2024-01-01T00:00:00.000Z",
};

describe("GET /api/articles/[slug]", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    mockRequireAuth.mockResolvedValue(null);
  });

  it("未認証の場合は401を返す", async () => {
    const { NextResponse } = await import("next/server");
    mockRequireAuth.mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );
    const { GET } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/articles/test-slug");
    const params = { params: Promise.resolve({ slug: "test-slug" }) };
    const response = await GET(request, params);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
    expect(mockGetArticleBySlug).not.toHaveBeenCalled();
  });

  it("記事を取得する", async () => {
    mockGetArticleBySlug.mockResolvedValue(mockArticle);
    const { GET } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/articles/test-slug");
    const params = { params: Promise.resolve({ slug: "test-slug" }) };
    const response = await GET(request, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockArticle);
    expect(mockGetArticleBySlug).toHaveBeenCalledWith("test-slug");
  });

  it("記事が見つからない場合は404を返す", async () => {
    mockGetArticleBySlug.mockResolvedValue(null);
    const { GET } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/articles/not-found");
    const params = { params: Promise.resolve({ slug: "not-found" }) };
    const response = await GET(request, params);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Article not found");
  });
});

describe("PUT /api/articles/[slug]", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    mockRequireAuth.mockResolvedValue(null);
  });

  it("未認証の場合は401を返す", async () => {
    const { NextResponse } = await import("next/server");
    mockRequireAuth.mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );
    const { PUT } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/articles/test-slug", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Updated" }),
    });
    const params = { params: Promise.resolve({ slug: "test-slug" }) };
    const response = await PUT(request, params);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("記事を更新する", async () => {
    const updatedArticle: Article = { ...mockArticle, title: "Updated Title" };
    mockUpdateArticle.mockResolvedValue(updatedArticle);
    const { PUT } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/articles/test-slug", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "Updated Title",
        published: true,
      }),
    });
    const params = { params: Promise.resolve({ slug: "test-slug" }) };
    const response = await PUT(request, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(updatedArticle);
    expect(mockUpdateArticle).toHaveBeenCalledWith("test-slug", {
      title: "Updated Title",
      published: true,
    });
  });

  it("記事が見つからない場合は404を返す", async () => {
    mockUpdateArticle.mockResolvedValue(null);
    const { PUT } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/articles/not-found", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Updated Title" }),
    });
    const params = { params: Promise.resolve({ slug: "not-found" }) };
    const response = await PUT(request, params);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Article not found");
  });
});

describe("DELETE /api/articles/[slug]", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    mockRequireAuth.mockResolvedValue(null);
  });

  it("未認証の場合は401を返す", async () => {
    const { NextResponse } = await import("next/server");
    mockRequireAuth.mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );
    const { DELETE } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/articles/test-slug", {
      method: "DELETE",
    });
    const params = { params: Promise.resolve({ slug: "test-slug" }) };
    const response = await DELETE(request, params);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("記事を削除する", async () => {
    mockDeleteArticle.mockResolvedValue(true);
    const { DELETE } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/articles/test-slug", {
      method: "DELETE",
    });
    const params = { params: Promise.resolve({ slug: "test-slug" }) };
    const response = await DELETE(request, params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDeleteArticle).toHaveBeenCalledWith("test-slug");
  });

  it("記事が見つからない場合は404を返す", async () => {
    mockDeleteArticle.mockResolvedValue(false);
    const { DELETE } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/articles/not-found", {
      method: "DELETE",
    });
    const params = { params: Promise.resolve({ slug: "not-found" }) };
    const response = await DELETE(request, params);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Article not found");
  });
});
