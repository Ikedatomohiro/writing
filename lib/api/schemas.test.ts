import { describe, it, expect } from "vitest";
import {
  CreateArticleSchema,
  UpdateArticleSchema,
  ArticleQuerySchema,
  PublishArticleSchema,
} from "./schemas";

describe("CreateArticleSchema", () => {
  it("validates a valid create article request", () => {
    const result = CreateArticleSchema.safeParse({
      title: "Test Article",
      content: "Some content",
      keywords: ["test"],
      status: "draft",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Test Article");
    }
  });

  it("applies defaults for optional fields", () => {
    const result = CreateArticleSchema.safeParse({
      title: "Title Only",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe("");
      expect(result.data.keywords).toEqual([]);
      expect(result.data.status).toBe("draft");
    }
  });

  it("rejects missing title", () => {
    const result = CreateArticleSchema.safeParse({
      content: "No title here",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty title", () => {
    const result = CreateArticleSchema.safeParse({
      title: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects title exceeding max length", () => {
    const result = CreateArticleSchema.safeParse({
      title: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("rejects content exceeding max length", () => {
    const result = CreateArticleSchema.safeParse({
      title: "Valid",
      content: "a".repeat(100001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = CreateArticleSchema.safeParse({
      title: "Valid",
      status: "unknown",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-string keywords", () => {
    const result = CreateArticleSchema.safeParse({
      title: "Valid",
      keywords: [123],
    });
    expect(result.success).toBe(false);
  });

  it("rejects too many keywords", () => {
    const result = CreateArticleSchema.safeParse({
      title: "Valid",
      keywords: Array.from({ length: 21 }, (_, i) => `tag${i}`),
    });
    expect(result.success).toBe(false);
  });

  it("rejects keyword exceeding max length", () => {
    const result = CreateArticleSchema.safeParse({
      title: "Valid",
      keywords: ["a".repeat(51)],
    });
    expect(result.success).toBe(false);
  });
});

describe("UpdateArticleSchema", () => {
  it("validates a valid update request", () => {
    const result = UpdateArticleSchema.safeParse({
      title: "Updated Title",
      status: "published",
    });
    expect(result.success).toBe(true);
  });

  it("allows empty body (all fields optional)", () => {
    const result = UpdateArticleSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects empty title when provided", () => {
    const result = UpdateArticleSchema.safeParse({
      title: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = UpdateArticleSchema.safeParse({
      status: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects content exceeding max length", () => {
    const result = UpdateArticleSchema.safeParse({
      content: "a".repeat(100001),
    });
    expect(result.success).toBe(false);
  });
});

describe("ArticleQuerySchema", () => {
  it("validates valid query params", () => {
    const result = ArticleQuerySchema.safeParse({
      status: "published",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    expect(result.success).toBe(true);
  });

  it("allows empty params", () => {
    const result = ArticleQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = ArticleQuerySchema.safeParse({
      status: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid sortBy", () => {
    const result = ArticleQuerySchema.safeParse({
      sortBy: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid sortOrder", () => {
    const result = ArticleQuerySchema.safeParse({
      sortOrder: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects searchQuery exceeding max length", () => {
    const result = ArticleQuerySchema.safeParse({
      searchQuery: "a".repeat(201),
    });
    expect(result.success).toBe(false);
  });
});

describe("PublishArticleSchema", () => {
  const validPublish = {
    title: "Test Article",
    content: "Some content",
    category: "tech",
    slug: "test-article",
    tags: ["TypeScript"],
    description: "A test article",
  };

  it("validates a valid publish request", () => {
    const result = PublishArticleSchema.safeParse(validPublish);
    expect(result.success).toBe(true);
  });

  it("applies defaults for optional fields", () => {
    const result = PublishArticleSchema.safeParse({
      title: "Title",
      content: "Content",
      category: "asset",
      slug: "my-slug",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
      expect(result.data.description).toBe("");
    }
  });

  it("rejects missing required fields", () => {
    const result = PublishArticleSchema.safeParse({
      title: "Only title",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty title", () => {
    const result = PublishArticleSchema.safeParse({
      ...validPublish,
      title: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty content", () => {
    const result = PublishArticleSchema.safeParse({
      ...validPublish,
      content: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid category", () => {
    const result = PublishArticleSchema.safeParse({
      ...validPublish,
      category: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid slug format", () => {
    const result = PublishArticleSchema.safeParse({
      ...validPublish,
      slug: "Invalid Slug!",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid slug formats", () => {
    const validSlugs = ["my-article", "test", "a-b-c", "hello123"];
    for (const slug of validSlugs) {
      const result = PublishArticleSchema.safeParse({
        ...validPublish,
        slug,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects slug with uppercase", () => {
    const result = PublishArticleSchema.safeParse({
      ...validPublish,
      slug: "My-Article",
    });
    expect(result.success).toBe(false);
  });

  it("validates thumbnail as URL when provided", () => {
    const result = PublishArticleSchema.safeParse({
      ...validPublish,
      thumbnail: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid thumbnail URL", () => {
    const result = PublishArticleSchema.safeParse({
      ...validPublish,
      thumbnail: "https://example.com/image.png",
    });
    expect(result.success).toBe(true);
  });

  it("rejects content exceeding max length", () => {
    const result = PublishArticleSchema.safeParse({
      ...validPublish,
      content: "a".repeat(200001),
    });
    expect(result.success).toBe(false);
  });
});
