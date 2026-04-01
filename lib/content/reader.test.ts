import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the supabase module before importing reader
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

import { readArticleFile, listArticleFiles } from "./reader";

describe("listArticleFiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up chain: from().select().eq().eq()
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
  });

  it("returns slugs for published articles in a category", async () => {
    const mockSecondEq = vi.fn().mockResolvedValue({
      data: [{ slug: "article-one" }, { slug: "article-two" }],
      error: null,
    });
    mockEq.mockReturnValue({ eq: mockSecondEq });

    const slugs = await listArticleFiles("tech");

    expect(mockFrom).toHaveBeenCalledWith("articles");
    expect(mockSelect).toHaveBeenCalledWith("slug");
    expect(mockEq).toHaveBeenCalledWith("category", "tech");
    expect(mockSecondEq).toHaveBeenCalledWith("published", true);
    expect(slugs).toEqual(["article-one", "article-two"]);
  });

  it("returns empty array when no articles exist", async () => {
    const mockSecondEq = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    });
    mockEq.mockReturnValue({ eq: mockSecondEq });

    const slugs = await listArticleFiles("health");

    expect(slugs).toEqual([]);
  });

  it("returns empty array on supabase error", async () => {
    const mockSecondEq = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "connection failed" },
    });
    mockEq.mockReturnValue({ eq: mockSecondEq });

    const slugs = await listArticleFiles("asset");

    expect(slugs).toEqual([]);
  });
});

describe("readArticleFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up chain: from().select().eq().eq().single()
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
  });

  it("reads an article by category and slug", async () => {
    const mockSecondEq = vi.fn().mockReturnValue({ single: mockSingle });
    mockEq.mockReturnValue({ eq: mockSecondEq });
    mockSingle.mockResolvedValue({
      data: {
        slug: "sample",
        category: "tech",
        title: "Sample Article",
        description: "A sample",
        content: "# Sample content",
        date: "2026-01-25T00:00:00Z",
        tags: ["TypeScript", "React"],
        thumbnail: null,
        published: true,
      },
      error: null,
    });

    const article = await readArticleFile("tech", "sample");

    expect(article).not.toBeNull();
    expect(article?.title).toBe("Sample Article");
    expect(article?.slug).toBe("sample");
    expect(article?.category).toBe("tech");
    expect(article?.tags).toEqual(["TypeScript", "React"]);
    expect(article?.content).toBe("# Sample content");
    expect(article?.published).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith("articles");
    expect(mockSelect).toHaveBeenCalledWith("*");
    expect(mockEq).toHaveBeenCalledWith("category", "tech");
    expect(mockSecondEq).toHaveBeenCalledWith("slug", "sample");
  });

  it("returns null when article not found", async () => {
    const mockSecondEq = vi.fn().mockReturnValue({ single: mockSingle });
    mockEq.mockReturnValue({ eq: mockSecondEq });
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: "not found", code: "PGRST116" },
    });

    const article = await readArticleFile("tech", "nonexistent");

    expect(article).toBeNull();
  });

  it("returns null on supabase error", async () => {
    const mockSecondEq = vi.fn().mockReturnValue({ single: mockSingle });
    mockEq.mockReturnValue({ eq: mockSecondEq });
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: "connection error" },
    });

    const article = await readArticleFile("asset", "some-article");

    expect(article).toBeNull();
  });

  it("maps date field correctly", async () => {
    const mockSecondEq = vi.fn().mockReturnValue({ single: mockSingle });
    mockEq.mockReturnValue({ eq: mockSecondEq });
    mockSingle.mockResolvedValue({
      data: {
        slug: "dated",
        category: "asset",
        title: "Dated Article",
        description: "Has a date",
        content: "body",
        date: "2026-03-15T09:30:00Z",
        tags: [],
        thumbnail: "https://example.com/thumb.jpg",
        published: true,
      },
      error: null,
    });

    const article = await readArticleFile("asset", "dated");

    expect(article?.date).toBe("2026-03-15T09:30:00Z");
    expect(article?.thumbnail).toBe("https://example.com/thumb.jpg");
  });
});
