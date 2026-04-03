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
      description: "A test description",
      content: "Some content",
      category: "tech",
      tags: ["test"],
      published: false,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Test Article");
    }
  });

  it("applies defaults for optional fields", () => {
    const result = CreateArticleSchema.safeParse({
      title: "Title Only",
      description: "Description",
      category: "tech",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe("");
      expect(result.data.tags).toEqual([]);
      expect(result.data.published).toBe(false);
    }
  });

  it("rejects missing title", () => {
    const result = CreateArticleSchema.safeParse({
      description: "No title here",
      category: "tech",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty title", () => {
    const result = CreateArticleSchema.safeParse({
      title: "",
      description: "Desc",
      category: "tech",
    });
    expect(result.success).toBe(false);
  });

  it("rejects title exceeding max length", () => {
    const result = CreateArticleSchema.safeParse({
      title: "a".repeat(501),
      description: "Desc",
      category: "tech",
    });
    expect(result.success).toBe(false);
  });

  it("rejects content exceeding max length", () => {
    const result = CreateArticleSchema.safeParse({
      title: "Valid",
      description: "Desc",
      category: "tech",
      content: "a".repeat(200001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid category", () => {
    const result = CreateArticleSchema.safeParse({
      title: "Valid",
      description: "Desc",
      category: "unknown",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-string tags", () => {
    const result = CreateArticleSchema.safeParse({
      title: "Valid",
      description: "Desc",
      category: "tech",
      tags: [123],
    });
    expect(result.success).toBe(false);
  });

  it("rejects too many tags", () => {
    const result = CreateArticleSchema.safeParse({
      title: "Valid",
      description: "Desc",
      category: "tech",
      tags: Array.from({ length: 21 }, (_, i) => `tag${i}`),
    });
    expect(result.success).toBe(false);
  });

  it("rejects tag exceeding max length", () => {
    const result = CreateArticleSchema.safeParse({
      title: "Valid",
      description: "Desc",
      category: "tech",
      tags: ["a".repeat(51)],
    });
    expect(result.success).toBe(false);
  });
});

describe("UpdateArticleSchema", () => {
  it("validates a valid update request", () => {
    const result = UpdateArticleSchema.safeParse({
      title: "Updated Title",
      published: true,
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

  it("rejects invalid category", () => {
    const result = UpdateArticleSchema.safeParse({
      category: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects content exceeding max length", () => {
    const result = UpdateArticleSchema.safeParse({
      content: "a".repeat(200001),
    });
    expect(result.success).toBe(false);
  });
});

describe("ArticleQuerySchema", () => {
  it("allows empty params", () => {
    const result = ArticleQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("validates searchQuery", () => {
    const result = ArticleQuerySchema.safeParse({
      searchQuery: "test",
    });
    expect(result.success).toBe(true);
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
