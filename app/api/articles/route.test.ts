import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import type { Article } from "@/lib/articles/types";

// モック関数の定義
const mockGetArticles = vi.fn();
const mockCreateArticle = vi.fn();

// モジュールのモック - vi.hoisted を使用
vi.mock("@/lib/articles/backend", () => ({
  VercelBlobBackend: vi.fn(),
}));

vi.mock("@/lib/articles/service", async () => {
  return {
    ArticleService: class {
      getArticles = mockGetArticles;
      getArticle = vi.fn();
      createArticle = mockCreateArticle;
      updateArticle = vi.fn();
      deleteArticle = vi.fn();
    },
  };
});

const mockArticles: Article[] = [
  {
    id: "1",
    title: "Test Article 1",
    content: "Content 1",
    keywords: ["test"],
    status: "published",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    publishedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    title: "Test Article 2",
    content: "Content 2",
    keywords: [],
    status: "draft",
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
    publishedAt: null,
  },
];

describe("GET /api/articles", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("記事一覧を取得する", async () => {
    mockGetArticles.mockResolvedValue(mockArticles);
    const { GET } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/articles");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockArticles);
    expect(mockGetArticles).toHaveBeenCalledWith({});
  });

  it("ステータスでフィルタリングできる", async () => {
    mockGetArticles.mockResolvedValue([mockArticles[0]]);
    const { GET } = await import("./route");

    const request = new NextRequest(
      "http://localhost:3000/api/articles?status=published"
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockGetArticles).toHaveBeenCalledWith({ status: "published" });
  });

  it("ソート順を指定できる", async () => {
    mockGetArticles.mockResolvedValue(mockArticles);
    const { GET } = await import("./route");

    const request = new NextRequest(
      "http://localhost:3000/api/articles?sortBy=createdAt&sortOrder=desc"
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockGetArticles).toHaveBeenCalledWith({
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  });

  it("検索クエリを指定できる", async () => {
    mockGetArticles.mockResolvedValue([mockArticles[0]]);
    const { GET } = await import("./route");

    const request = new NextRequest(
      "http://localhost:3000/api/articles?searchQuery=Test"
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockGetArticles).toHaveBeenCalledWith({ searchQuery: "Test" });
  });
});

describe("POST /api/articles", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("記事を作成する", async () => {
    const newArticle: Article = {
      id: "new-1",
      title: "New Article",
      content: "New Content",
      keywords: ["new"],
      status: "draft",
      createdAt: "2024-01-03T00:00:00.000Z",
      updatedAt: "2024-01-03T00:00:00.000Z",
      publishedAt: null,
    };
    mockCreateArticle.mockResolvedValue(newArticle);
    const { POST } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/articles", {
      method: "POST",
      body: JSON.stringify({
        title: "New Article",
        content: "New Content",
        keywords: ["new"],
        status: "draft",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual(newArticle);
    expect(mockCreateArticle).toHaveBeenCalledWith({
      title: "New Article",
      content: "New Content",
      keywords: ["new"],
      status: "draft",
    });
  });

  it("タイトルが必須", async () => {
    const { POST } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/articles", {
      method: "POST",
      body: JSON.stringify({
        content: "Content without title",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Title is required");
  });

  it("タイトルが空文字の場合はエラー", async () => {
    const { POST } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/articles", {
      method: "POST",
      body: JSON.stringify({
        title: "",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Title is required");
  });

  it("contentが文字列でない場合はエラー", async () => {
    const { POST } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/articles", {
      method: "POST",
      body: JSON.stringify({
        title: "Test",
        content: 123,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Content must be a string");
  });

  it("contentが未指定の場合はデフォルト値を使用", async () => {
    const newArticle: Article = {
      id: "new-2",
      title: "Title Only",
      content: "",
      keywords: [],
      status: "draft",
      createdAt: "2024-01-03T00:00:00.000Z",
      updatedAt: "2024-01-03T00:00:00.000Z",
      publishedAt: null,
    };
    mockCreateArticle.mockResolvedValue(newArticle);
    const { POST } = await import("./route");

    const request = new NextRequest("http://localhost:3000/api/articles", {
      method: "POST",
      body: JSON.stringify({
        title: "Title Only",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(mockCreateArticle).toHaveBeenCalledWith({
      title: "Title Only",
      content: "",
      keywords: [],
      status: "draft",
    });
  });
});
