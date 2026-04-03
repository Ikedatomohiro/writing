import { describe, it, expect, vi, beforeEach } from "vitest";

// Supabase のモック
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockSingle = vi.fn();
const mockIlike = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    })),
  },
}));

import {
  getAllArticlesForAdmin,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
} from "./repository";

function setupChain(finalResult: { data: unknown; error: unknown }) {
  // Chainable mock: each method returns the chain object
  const chain = {
    select: mockSelect,
    eq: mockEq,
    order: mockOrder,
    single: mockSingle,
    ilike: mockIlike,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
  };

  mockSelect.mockReturnValue(chain);
  mockEq.mockReturnValue(chain);
  mockOrder.mockReturnValue(chain);
  mockIlike.mockReturnValue(chain);
  mockInsert.mockReturnValue(chain);
  mockUpdate.mockReturnValue(chain);
  mockDelete.mockReturnValue(chain);
  mockSingle.mockResolvedValue(finalResult);

  // For queries that don't end with .single()
  // The chain itself acts as a thenable
  Object.assign(chain, {
    then: (resolve: (value: unknown) => void) =>
      resolve(finalResult),
  });

  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getAllArticlesForAdmin", () => {
  it("returns all articles ordered by date desc", async () => {
    const mockArticles = [
      {
        slug: "test-article",
        category: "tech",
        title: "Test Article",
        description: "A test",
        content: "Content here",
        date: "2026-01-01T00:00:00.000Z",
        tags: ["test"],
        thumbnail: null,
        published: true,
      },
    ];

    setupChain({ data: mockArticles, error: null });

    const result = await getAllArticlesForAdmin();

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("test-article");
    expect(result[0].title).toBe("Test Article");
    expect(result[0].category).toBe("tech");
  });

  it("returns empty array on error", async () => {
    setupChain({ data: null, error: new Error("DB error") });

    const result = await getAllArticlesForAdmin();
    expect(result).toEqual([]);
  });
});

describe("getArticleBySlug", () => {
  it("returns article when found", async () => {
    const mockArticle = {
      slug: "test-slug",
      category: "tech",
      title: "Test",
      description: "Desc",
      content: "Content",
      date: "2026-01-01T00:00:00.000Z",
      tags: ["tag1"],
      thumbnail: "https://example.com/img.jpg",
      published: true,
    };

    setupChain({ data: mockArticle, error: null });

    const result = await getArticleBySlug("test-slug");

    expect(result).not.toBeNull();
    expect(result!.slug).toBe("test-slug");
    expect(result!.thumbnail).toBe("https://example.com/img.jpg");
  });

  it("returns null when not found", async () => {
    setupChain({ data: null, error: { code: "PGRST116" } });

    const result = await getArticleBySlug("nonexistent");
    expect(result).toBeNull();
  });
});

describe("createArticle", () => {
  it("creates article and returns it", async () => {
    const input = {
      title: "New Article",
      description: "New description",
      content: "New content",
      category: "tech" as const,
      tags: ["new"],
      published: false,
    };

    const mockCreated = {
      slug: "generated-uuid",
      ...input,
      date: "2026-04-03T00:00:00.000Z",
      thumbnail: null,
    };

    setupChain({ data: mockCreated, error: null });

    const result = await createArticle(input);

    expect(result).not.toBeNull();
    expect(result!.title).toBe("New Article");
    expect(mockInsert).toHaveBeenCalled();
  });

  it("returns null on error", async () => {
    setupChain({ data: null, error: new Error("Insert failed") });

    const result = await createArticle({
      title: "Fail",
      description: "Fail",
      category: "tech",
    });

    expect(result).toBeNull();
  });
});

describe("updateArticle", () => {
  it("updates article and returns it", async () => {
    const mockUpdated = {
      slug: "existing-slug",
      category: "tech",
      title: "Updated Title",
      description: "Desc",
      content: "Content",
      date: "2026-01-01T00:00:00.000Z",
      tags: [],
      thumbnail: null,
      published: true,
    };

    setupChain({ data: mockUpdated, error: null });

    const result = await updateArticle("existing-slug", {
      title: "Updated Title",
      published: true,
    });

    expect(result).not.toBeNull();
    expect(result!.title).toBe("Updated Title");
    expect(mockUpdate).toHaveBeenCalled();
  });

  it("returns null on error", async () => {
    setupChain({ data: null, error: new Error("Update failed") });

    const result = await updateArticle("bad-slug", { title: "X" });
    expect(result).toBeNull();
  });
});

describe("deleteArticle", () => {
  it("deletes article and returns true", async () => {
    // delete doesn't need .single(), just resolves
    setupChain({ data: null, error: null });

    const result = await deleteArticle("to-delete");

    expect(result).toBe(true);
    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith("slug", "to-delete");
  });

  it("returns false on error", async () => {
    setupChain({ data: null, error: new Error("Delete failed") });

    const result = await deleteArticle("bad-slug");
    expect(result).toBe(false);
  });
});
