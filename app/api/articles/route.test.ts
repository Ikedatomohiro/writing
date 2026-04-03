import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import type { Article } from "@/lib/content/types";

const mockGetAllArticlesForAdmin = vi.fn();
const mockCreateArticle = vi.fn();
const mockRequireAuth = vi.fn();

vi.mock("@/lib/content/repository", () => ({
  getAllArticlesForAdmin: (...args: unknown[]) => mockGetAllArticlesForAdmin(...args),
  createArticle: (...args: unknown[]) => mockCreateArticle(...args),
}));

vi.mock("@/lib/auth/api-auth", () => ({
  requireAuth: () => mockRequireAuth(),
}));

const mockArticles: Article[] = [
  {
    slug: "test-1",
    title: "Test Article 1",
    description: "Description 1",
    content: "Content 1",
    category: "tech",
    tags: ["test"],
    published: true,
    date: "2024-01-01T00:00:00.000Z",
  },
  {
    slug: "test-2",
    title: "Test Article 2",
    description: "Description 2",
    content: "Content 2",
    category: "asset",
    tags: [],
    published: false,
    date: "2024-01-02T00:00:00.000Z",
  },
];

describe("GET /api/articles", () => {
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

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
    expect(mockGetAllArticlesForAdmin).not.toHaveBeenCalled();
  });

  it("記事一覧を取得する", async () => {
    mockGetAllArticlesForAdmin.mockResolvedValue(mockArticles);
    const { GET } = await import("./route");

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockArticles);
  });
});

describe("POST /api/articles", () => {
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
    const { POST } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/articles", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Test", description: "Desc", category: "tech" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
    expect(mockCreateArticle).not.toHaveBeenCalled();
  });

  it("記事を作成する", async () => {
    const newArticle: Article = {
      slug: "new-slug",
      title: "New Article",
      description: "New Description",
      content: "New Content",
      category: "tech",
      tags: ["new"],
      published: false,
      date: "2024-01-03T00:00:00.000Z",
    };
    mockCreateArticle.mockResolvedValue(newArticle);
    const { POST } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/articles", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "New Article",
        description: "New Description",
        content: "New Content",
        category: "tech",
        tags: ["new"],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual(newArticle);
  });

  it("タイトルが必須", async () => {
    const { POST } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/articles", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        description: "Desc",
        category: "tech",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("タイトルが空文字の場合はエラー", async () => {
    const { POST } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/articles", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "",
        description: "Desc",
        category: "tech",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Title is required");
  });
});
